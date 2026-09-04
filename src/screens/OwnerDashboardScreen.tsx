import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  Building2,
  CalendarCheck,
  CheckCircle2,
  ChevronRight,
  Coins,
  FileSpreadsheet,
  Layers,
  LogOut,
  Plus,
  Receipt,
  Repeat,
  Shield,
  ShieldCheck,
  ShoppingCart,
  Store,
  TrendingDown,
  TrendingUp,
  User,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import { RoleBadge } from '../components/CommonBadges';
import { AddUserDialog, CreateBusinessDialog } from '../components/Dialogs';
import { useTgp } from '../context/TgpContext';
import { normalizeUserRole } from '../security/authorizationEngine';
import { AppScreen, BusinessEntity, BusinessTemplate, LedgerType, UserRole } from '../types';

function formatRupiah(amount: number): string {
  return 'Rp ' + Math.round(amount).toLocaleString('id-ID');
}

export const OwnerDashboardScreen: React.FC = () => {
  const {
    currentSession,
    authorizedBusinesses,
    activeBusinessId,
    setActiveBusiness,
    globalOwnerLedger,
    globalOwnerSales,
    globalOwnerItems,
    pendingTransfersForOwner,
    pendingDamagedForOwner,
    navigateTo,
    logout,
    allUsers,
  } = useTgp();

  const [showCreateBizModal, setShowCreateBizModal] = useState(false);
  const [showAddAdminModal, setShowAddAdminModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [pickerActionScreen, setPickerActionScreen] = useState<AppScreen | null>(null);

  const activeBiz = authorizedBusinesses.find((b) => b.businessId === activeBusinessId);
  const totalPendingApproval = pendingTransfersForOwner.length + pendingDamagedForOwner.length;

  const ownerAdmins = allUsers.filter((u) => {
    const r = normalizeUserRole(u.role);
    if (r !== UserRole.ADMIN_OWNER && r !== UserRole.ADMIN_DIVISI) return false;
    if (u.ownerId && u.ownerId === currentSession?.user.userId) return true;
    const ownerBizIds = authorizedBusinesses.map((b) => b.businessId);
    return (
      (u.assignedBusinessIds || []).some((id) => ownerBizIds.includes(id)) ||
      (u.businessId && ownerBizIds.includes(u.businessId))
    );
  });

  // -------------------------------------------------------------
  // GLOBAL CONSOLIDATED METRICS
  // -------------------------------------------------------------
  const totalPenjualanGlobal = globalOwnerLedger
    .filter(
      (l) =>
        l.type === LedgerType.PEMASUKAN &&
        (l.category.toUpperCase().includes('PENJUALAN') || l.referenceId.toUpperCase().includes('REV'))
    )
    .reduce((sum, l) => sum + l.amount, 0) || globalOwnerSales.reduce((sum, s) => sum + s.totalAmount, 0);

  const totalTransaksiGlobal = globalOwnerSales.length;

  const totalPemasukanGlobal = globalOwnerLedger
    .filter((l) => l.type === LedgerType.PEMASUKAN)
    .reduce((sum, l) => sum + l.amount, 0);

  const totalPengeluaranGlobal = globalOwnerLedger
    .filter((l) => l.type === LedgerType.PENGELUARAN)
    .reduce((sum, l) => sum + l.amount, 0);

  const saldoGlobal = totalPemasukanGlobal - totalPengeluaranGlobal;
  const labaRugiGlobal = saldoGlobal;

  const handleQuickAction = (screen: AppScreen) => {
    if (activeBusinessId) {
      navigateTo(screen);
    } else {
      setPickerActionScreen(screen);
    }
  };

  return (
    <div className="space-y-5 pb-16">
      {/* 1. OWNER WELCOME HEADER */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center text-white shrink-0 shadow-md shadow-blue-500/20">
            <Building2 className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Selamat Datang, OWNER</span>
              <RoleBadge role={UserRole.OWNER} />
            </div>
            <h2 className="text-lg font-extrabold text-slate-900 truncate">
              {currentSession?.user.fullName || 'Owner'}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Tombol Pendaftaran Admin */}
          <button
            onClick={() => setShowAddAdminModal(true)}
            data-testid="btn_header_add_admin"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-xs"
          >
            <UserPlus className="w-4 h-4" />
            <span className="hidden sm:inline">Pendaftaran Admin</span>
          </button>
          {/* Notification Button */}
          <button
            onClick={() => setShowNotificationModal(true)}
            data-testid="btn_owner_notifications"
            className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center relative transition"
          >
            <Shield className="w-5 h-5" />
            {totalPendingApproval > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white rounded-full text-[10px] font-extrabold flex items-center justify-center">
                {totalPendingApproval}
              </span>
            )}
          </button>
          {/* Profile Button */}
          <button
            onClick={() => setShowProfileModal(true)}
            data-testid="btn_owner_profile"
            className="w-10 h-10 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 flex items-center justify-center transition"
          >
            <User className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 2. BUSINESS SWITCHER BAR */}
      <div
        data-testid="business_switcher_container"
        className={`rounded-3xl p-4 border transition-all ${
          activeBiz
            ? 'bg-blue-50/50 border-blue-200/80 shadow-xs'
            : 'bg-white border-slate-200/80 shadow-xs'
        }`}
      >
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2">
            <Repeat className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-extrabold tracking-wider text-blue-700 uppercase">
              Business Switcher
            </span>
          </div>
          <span
            className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
              activeBiz
                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                : 'bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            {activeBiz ? `Terisolasi: ${activeBiz.name}` : 'Mode: Konsolidasi Global'}
          </span>
        </div>
        <p className="text-xs text-slate-500 mb-3">
          Pilih Business untuk mengunci seluruh modul operasional (POS, stok, laporan & kas):
        </p>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {/* Global Option */}
          <button
            onClick={() => setActiveBusiness(null)}
            data-testid="chip_global_summary"
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition border ${
              activeBusinessId === null
                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            Konsolidasi Global
          </button>

          {/* Business Pills */}
          {authorizedBusinesses.map((b) => {
            const isSelected = b.businessId === activeBusinessId;
            return (
              <button
                key={b.businessId}
                onClick={() => setActiveBusiness(b.businessId)}
                data-testid={`chip_biz_${b.name.replace(/\s+/g, '_')}`}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition border ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Store className="w-3.5 h-3.5" />
                <span>{b.name}</span>
                <span className="text-[10px] opacity-75 font-normal">({b.templateType})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. GLOBAL SUMMARY (6 Metrics) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 tracking-wide uppercase">Global Summary</h3>
            <p className="text-xs text-slate-500">Konsolidasi performa dari {authorizedBusinesses.length} business milik Anda</p>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
            {authorizedBusinesses.length} Bisnis
          </span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {/* Total Penjualan */}
          <div data-testid="metric_total_penjualan" className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-medium">Total Penjualan</span>
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <ShoppingCart className="w-3.5 h-3.5" />
              </div>
            </div>
            <p className="text-base sm:text-lg font-extrabold text-slate-900 truncate">{formatRupiah(totalPenjualanGlobal)}</p>
          </div>

          {/* Total Transaksi */}
          <div data-testid="metric_total_transaksi" className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-medium">Total Transaksi</span>
              <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                <Receipt className="w-3.5 h-3.5" />
              </div>
            </div>
            <p className="text-base sm:text-lg font-extrabold text-slate-900 truncate">{totalTransaksiGlobal} Trx</p>
          </div>

          {/* Total Pemasukan */}
          <div data-testid="metric_total_pemasukan" className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-medium">Total Pemasukan</span>
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <TrendingUp className="w-3.5 h-3.5" />
              </div>
            </div>
            <p className="text-base sm:text-lg font-extrabold text-emerald-600 truncate">{formatRupiah(totalPemasukanGlobal)}</p>
          </div>

          {/* Total Pengeluaran */}
          <div data-testid="metric_total_pengeluaran" className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-medium">Total Pengeluaran</span>
              <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                <TrendingDown className="w-3.5 h-3.5" />
              </div>
            </div>
            <p className="text-base sm:text-lg font-extrabold text-rose-600 truncate">{formatRupiah(totalPengeluaranGlobal)}</p>
          </div>

          {/* Saldo Kas */}
          <div data-testid="metric_saldo" className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-medium">Saldo Kas</span>
              <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
                <Coins className="w-3.5 h-3.5" />
              </div>
            </div>
            <p className="text-base sm:text-lg font-extrabold text-slate-900 truncate">{formatRupiah(saldoGlobal)}</p>
          </div>

          {/* Laba / Rugi */}
          <div data-testid="metric_laba_rugi" className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-medium">Laba/Rugi</span>
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${labaRugiGlobal >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
            </div>
            <p className={`text-base sm:text-lg font-extrabold truncate ${labaRugiGlobal >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {labaRugiGlobal >= 0 ? '+' : ''}{formatRupiah(labaRugiGlobal)}
            </p>
          </div>
        </div>
      </div>

      {/* 4. BUSINESS SAYA (Separate Cards for Business A, B, C) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 tracking-wide uppercase">Business Saya</h3>
            <p className="text-xs text-slate-500">Data terisolasi untuk masing-masing unit bisnis</p>
          </div>
          <button
            onClick={() => setShowCreateBizModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-blue-600 hover:bg-blue-50 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah</span>
          </button>
        </div>

        <div className="space-y-3">
          {authorizedBusinesses.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-3xl border border-dashed border-slate-300">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
                <Store className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-800">Belum Ada Unit Bisnis Terdaftar</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                Anda belum memiliki unit bisnis. Mulai daftarkan unit bisnis pertama Anda (Retail, F&B, atau Service).
              </p>
              <button
                onClick={() => setShowCreateBizModal(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Unit Bisnis Pertama</span>
              </button>
            </div>
          ) : (
            authorizedBusinesses.map((b) => {
              const isActive = b.businessId === activeBusinessId;
              const bLedger = globalOwnerLedger.filter((l) => l.businessId === b.businessId);
              const bSales = globalOwnerSales.filter((s) => s.businessId === b.businessId);
              const bItems = globalOwnerItems.filter((i) => i.businessId === b.businessId);

              const bPenjualan = bLedger
                .filter(
                  (l) =>
                    l.type === LedgerType.PEMASUKAN &&
                    (l.category.toUpperCase().includes('PENJUALAN') || l.referenceId.toUpperCase().includes('REV'))
                )
                .reduce((sum, l) => sum + l.amount, 0) || bSales.reduce((sum, s) => sum + s.totalAmount, 0);

              const bTransaksi = bSales.length;
              const bStok = bItems.reduce((sum, i) => sum + i.stockQuantity, 0);
              const bIn = bLedger.filter((l) => l.type === LedgerType.PEMASUKAN).reduce((sum, l) => sum + l.amount, 0);
              const bOut = bLedger.filter((l) => l.type === LedgerType.PENGELUARAN).reduce((sum, l) => sum + l.amount, 0);
              const bLabaRugi = bIn - bOut;

              return (
                <div
                  key={b.businessId}
                  data-testid={`card_business_${b.name.replace(/\s+/g, '_')}`}
                  className={`bg-white rounded-3xl p-5 border transition shadow-xs ${
                    isActive ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-slate-200/80 hover:border-slate-300'
                  }`}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-base ${
                          b.templateType === BusinessTemplate.RETAIL
                            ? 'bg-blue-100 text-blue-700'
                            : b.templateType === BusinessTemplate.FNB
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        <Store className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-base font-extrabold text-slate-900">{b.name}</h4>
                        <p className="text-xs text-slate-500">Template: {b.templateType}</p>
                      </div>
                    </div>
                    {isActive && (
                      <span className="px-3 py-1 rounded-full text-[11px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                        AKTIF
                      </span>
                    )}
                  </div>

                  {/* 4 Isolated Metrics */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <span className="text-[11px] text-slate-500 block">Penjualan</span>
                      <span className="text-xs sm:text-sm font-extrabold text-blue-600 truncate block">
                        {formatRupiah(bPenjualan)}
                      </span>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <span className="text-[11px] text-slate-500 block">Transaksi</span>
                      <span className="text-xs sm:text-sm font-extrabold text-slate-800 block">
                        {bTransaksi} Trx
                      </span>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <span className="text-[11px] text-slate-500 block">Stok</span>
                      <span className="text-xs sm:text-sm font-extrabold text-slate-800 block">
                        {Math.round(bStok)} unit
                      </span>
                    </div>
                    <div className={`p-2.5 rounded-xl border ${bLabaRugi >= 0 ? 'bg-emerald-50/60 border-emerald-200' : 'bg-rose-50/60 border-rose-200'}`}>
                      <span className="text-[11px] text-slate-500 block">Laba/Rugi</span>
                      <span className={`text-xs sm:text-sm font-extrabold truncate block ${bLabaRugi >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                        {bLabaRugi >= 0 ? '+' : ''}{formatRupiah(bLabaRugi)}
                      </span>
                    </div>
                  </div>

                  {/* Footer Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {b.activeModules.slice(0, 3).map((mod) => (
                        <span key={mod} className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-slate-100 text-slate-600">
                          {mod}
                        </span>
                      ))}
                      {b.activeModules.length > 3 && (
                        <span className="text-[10px] text-slate-400 font-semibold">
                          +{b.activeModules.length - 3}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        setActiveBusiness(b.businessId);
                        navigateTo('BUSINESS_HOME');
                      }}
                      data-testid={`btn_open_${b.name.replace(/\s+/g, '_')}`}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition shadow-xs ${
                        isActive
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-slate-900 text-white hover:bg-slate-800'
                      }`}
                    >
                      <span>Buka Business</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 5. QUICK ACTIONS */}
      <div className="space-y-3">
        <div>
          <h3 className="text-sm font-extrabold text-slate-900 tracking-wide uppercase">Quick Action</h3>
          <p className="text-xs text-slate-500">Pintasan cepat modul operasional</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          <button
            onClick={() => setShowAddAdminModal(true)}
            data-testid="qa_add_admin"
            className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-blue-300 hover:bg-blue-50/40 flex flex-col items-center justify-center text-center transition"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-1.5">
              <UserPlus className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800">Daftar Admin</span>
          </button>

          <button
            onClick={() => setShowCreateBizModal(true)}
            data-testid="qa_add_business"
            className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-purple-300 hover:bg-purple-50/40 flex flex-col items-center justify-center text-center transition"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-1.5">
              <Plus className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800">+ Tambah Business</span>
          </button>

          <button
            onClick={() => handleQuickAction('POS_MODULE')}
            data-testid="qa_pos"
            className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-blue-300 hover:bg-blue-50/40 flex flex-col items-center justify-center text-center transition"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-1.5">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800">POS</span>
          </button>

          <button
            onClick={() => handleQuickAction('STAN_OUTLET_MODULE')}
            data-testid="qa_stan_outlet"
            className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-amber-300 hover:bg-amber-50/40 flex flex-col items-center justify-center text-center transition"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center mb-1.5">
              <Store className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800">STAN / Cabang</span>
          </button>

          <button
            onClick={() => navigateTo('TRANSFER_MODULE')}
            data-testid="qa_transfer"
            className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-emerald-300 hover:bg-emerald-50/40 flex flex-col items-center justify-center text-center transition"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-1.5">
              <Repeat className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800">Transfer Barang</span>
          </button>

          <button
            onClick={() => navigateTo('APPROVAL_MODULE')}
            data-testid="qa_approval"
            className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-amber-300 hover:bg-amber-50/40 flex flex-col items-center justify-center text-center transition relative"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center mb-1.5">
              <BadgeCheck className="w-5 h-5" />
            </div>
            {totalPendingApproval > 0 && (
              <span className="absolute top-3 right-4 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                {totalPendingApproval}
              </span>
            )}
            <span className="text-xs font-bold text-slate-800">Approval</span>
          </button>

          <button
            onClick={() => handleQuickAction('FINANCE_MODULE')}
            data-testid="qa_keuangan"
            className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-sky-300 hover:bg-sky-50/40 flex flex-col items-center justify-center text-center transition"
          >
            <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center mb-1.5">
              <Coins className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800">Keuangan</span>
          </button>

          <button
            onClick={() => navigateTo('REPORTS_MODULE')}
            data-testid="qa_laporan"
            className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-pink-300 hover:bg-pink-50/40 flex flex-col items-center justify-center text-center transition"
          >
            <div className="w-10 h-10 rounded-xl bg-pink-100 text-pink-700 flex items-center justify-center mb-1.5">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800">Laporan</span>
          </button>

          <button
            onClick={() => handleQuickAction('ATTENDANCE_MODULE')}
            data-testid="qa_absensi"
            className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-orange-300 hover:bg-orange-50/40 flex flex-col items-center justify-center text-center transition"
          >
            <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center mb-1.5">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800">Absensi</span>
          </button>
        </div>
      </div>

      {/* 6. DELEGASI & DAFTAR AKUN ADMIN RESMI */}
      <div data-testid="section_admin_management" className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 tracking-wide uppercase">
              Delegasi & Akun Admin
            </h3>
            <p className="text-xs text-slate-500">
              Kelola dan daftarkan ADMIN OWNER (multi-bisnis) serta ADMIN DIVISI (1 divisi)
            </p>
          </div>
          <button
            onClick={() => setShowAddAdminModal(true)}
            data-testid="btn_register_admin"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition shadow-xs"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>+ Daftar Admin Baru</span>
          </button>
        </div>

        {ownerAdmins.length === 0 ? (
          <div className="p-6 text-center bg-white rounded-3xl border border-dashed border-slate-300">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-800">Belum Ada Akun Admin Ditugaskan</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
              Sebagai OWNER, Anda dapat mendelegasikan wewenang operasional unit bisnis kepada <strong>ADMIN OWNER</strong> atau <strong>ADMIN DIVISI</strong> tanpa memberikan akses penuh ke keuangan sensitif Anda.
            </p>
            <button
              onClick={() => setShowAddAdminModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition shadow-xs"
            >
              <UserPlus className="w-4 h-4" />
              <span>Daftarkan Akun Admin Pertama</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {ownerAdmins.map((admin) => {
              const assignedBizNames = authorizedBusinesses
                .filter(
                  (b) =>
                    (admin.assignedBusinessIds || []).includes(b.businessId) ||
                    admin.businessId === b.businessId
                )
                .map((b) => b.name);

              return (
                <div
                  key={admin.userId}
                  data-testid={`card_admin_${admin.username}`}
                  className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs hover:border-slate-300 transition space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 font-bold flex items-center justify-center shrink-0">
                        {admin.fullName.slice(0, 1).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-bold text-slate-900 truncate">{admin.fullName}</p>
                          <RoleBadge role={admin.role} />
                        </div>
                        <p className="text-xs text-slate-500 font-medium">@{admin.username}</p>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                      {new Date(admin.createdAt).toLocaleDateString('id-ID')}
                    </span>
                  </div>

                  {/* Business assignments */}
                  <div className="pt-2 border-t border-slate-100 text-xs">
                    <span className="text-[11px] font-semibold text-slate-500 block mb-1">
                      Unit Bisnis Ditugaskan ({assignedBizNames.length}):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {assignedBizNames.length > 0 ? (
                        assignedBizNames.map((name, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100"
                          >
                            {name}
                          </span>
                        ))
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">Belum ada bisnis spesifik</span>
                      )}
                    </div>
                  </div>

                  {/* Permissions pills */}
                  {admin.permissions && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {admin.permissions.canManageRawWarehouse && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-slate-100 text-slate-600">
                          Gudang Bahan
                        </span>
                      )}
                      {admin.permissions.canManageFinishedWarehouse && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-slate-100 text-slate-600">
                          Gudang Stok
                        </span>
                      )}
                      {admin.permissions.canProduceGoods && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-slate-100 text-slate-600">
                          Produksi BOM
                        </span>
                      )}
                      {admin.permissions.canTransferToStan && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-slate-100 text-slate-600">
                          Transfer STAN
                        </span>
                      )}
                      {admin.permissions.canViewFinance ? (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-emerald-50 text-emerald-700">
                          Kas Operasional
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-amber-50 text-amber-700">
                          Keuangan Sensitif Dibatasi
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 7. ANALYTICS SECTION */}
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-extrabold text-slate-900 tracking-wide uppercase">Analytics</h3>
          <p className="text-xs text-slate-500">Visualisasi performa keuangan dan tren penjualan</p>
        </div>

        {/* Chart 1: Grafik Tren Penjualan 7 Hari */}
        <div data-testid="chart_sales_trend" className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-bold text-slate-900">Grafik Tren Penjualan</h4>
              <p className="text-xs text-slate-500">Pergerakan omset 7 hari terakhir</p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
              +18.4%
            </span>
          </div>

          {/* SVG Sales Trend Line */}
          <div className="w-full h-36">
            <svg viewBox="0 0 500 120" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563eb" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path
                d="M 10 90 Q 90 70 170 55 T 330 30 T 490 15 L 490 110 L 10 110 Z"
                fill="url(#salesGrad)"
              />
              <path
                d="M 10 90 Q 90 70 170 55 T 330 30 T 490 15"
                fill="none"
                stroke="#2563eb"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
              {[
                { x: 10, y: 90 },
                { x: 90, y: 72 },
                { x: 170, y: 55 },
                { x: 250, y: 62 },
                { x: 330, y: 30 },
                { x: 410, y: 22 },
                { x: 490, y: 15 },
              ].map((pt, i) => (
                <circle key={i} cx={pt.x} cy={pt.y} r="4" fill="#ffffff" stroke="#2563eb" strokeWidth="2.5" />
              ))}
            </svg>
          </div>
          <div className="flex justify-between text-[11px] text-slate-400 mt-2 font-medium">
            <span>Sen</span>
            <span>Sel</span>
            <span>Rab</span>
            <span>Kam</span>
            <span>Jum</span>
            <span>Sab</span>
            <span>Min</span>
          </div>
        </div>

        {/* Chart 2: Pemasukan vs Pengeluaran & Laba/Rugi */}
        <div data-testid="chart_income_vs_expense" className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs">
          <h4 className="text-sm font-bold text-slate-900 mb-1">Pemasukan vs Pengeluaran & Laba/Rugi</h4>
          <p className="text-xs text-slate-500 mb-4">Komparasi arus kas konsolidasi</p>

          {/* Progress split bar */}
          {(() => {
            const total = totalPemasukanGlobal + totalPengeluaranGlobal || 1;
            const inPct = Math.round((totalPemasukanGlobal / total) * 100);
            const outPct = 100 - inPct;
            return (
              <div>
                <div className="h-4 w-full rounded-full overflow-hidden flex bg-slate-100">
                  <div style={{ width: `${inPct}%` }} className="bg-emerald-500 transition-all" />
                  <div style={{ width: `${outPct}%` }} className="bg-rose-500 transition-all" />
                </div>
                <div className="flex justify-between items-center text-xs mt-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <div>
                      <p className="text-[11px] text-slate-500">Pemasukan ({inPct}%)</p>
                      <p className="font-bold text-emerald-600">{formatRupiah(totalPemasukanGlobal)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-right">
                    <div>
                      <p className="text-[11px] text-slate-500">Pengeluaran ({outPct}%)</p>
                      <p className="font-bold text-rose-600">{formatRupiah(totalPengeluaranGlobal)}</p>
                    </div>
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Laba Bersih Konsolidasi:</span>
                  </div>
                  <span className="text-sm font-black text-emerald-600">
                    +{formatRupiah(labaRugiGlobal)}
                  </span>
                </div>
              </div>
            );
          })()}
        </div>

        {/* Chart 3: Performa Masing-masing Business */}
        <div data-testid="chart_per_business_performance" className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-3">
          <div>
            <h4 className="text-sm font-bold text-slate-900">Performa Masing-masing Business</h4>
            <p className="text-xs text-slate-500">Pangsa omset & kontribusi laba antar Business</p>
          </div>

          <div className="space-y-3">
            {authorizedBusinesses.map((b) => {
              const bLedger = globalOwnerLedger.filter((l) => l.businessId === b.businessId);
              const bRev = bLedger.filter((l) => l.type === LedgerType.PEMASUKAN).reduce((sum, l) => sum + l.amount, 0);
              const pct = totalPemasukanGlobal > 0 ? Math.round((bRev / totalPemasukanGlobal) * 100) : 33;
              return (
                <div key={b.businessId} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-800">{b.name} ({b.templateType})</span>
                    <span className="text-blue-600">{formatRupiah(bRev)} ({pct}%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      style={{ width: `${Math.max(5, pct)}%` }}
                      className={`h-full rounded-full ${
                        b.name.includes('A') ? 'bg-blue-600' : b.name.includes('B') ? 'bg-amber-500' : 'bg-emerald-600'
                      }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* MODALS */}
      <CreateBusinessDialog
        isOpen={showCreateBizModal}
        onClose={() => setShowCreateBizModal(false)}
      />
      <AddUserDialog
        isOpen={showAddAdminModal}
        onClose={() => setShowAddAdminModal(false)}
        targetRole={UserRole.ADMIN_OWNER}
      />

      {/* Business Picker for Action Modal */}
      {pickerActionScreen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100">
            <h3 className="text-base font-extrabold text-slate-900 mb-1">Pilih Business</h3>
            <p className="text-xs text-slate-500 mb-4">
              Modul {pickerActionScreen} memerlukan konteks Business aktif. Silakan pilih business:
            </p>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {authorizedBusinesses.map((b) => (
                <div
                  key={b.businessId}
                  onClick={() => {
                    setActiveBusiness(b.businessId);
                    navigateTo(pickerActionScreen);
                    setPickerActionScreen(null);
                  }}
                  className="p-3 rounded-2xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 cursor-pointer flex items-center justify-between"
                >
                  <div>
                    <p className="text-xs font-bold text-slate-900">{b.name}</p>
                    <p className="text-[10px] text-slate-500">Template: {b.templateType}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-blue-600" />
                </div>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setPickerActionScreen(null)}
                className="px-4 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                  <User className="w-5 h-5" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900">Profil OWNER</h3>
              </div>
              <button onClick={() => setShowProfileModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2 text-xs text-slate-700 bg-slate-50 p-4 rounded-2xl">
              <p><strong>Nama:</strong> {currentSession?.user.fullName}</p>
              <p><strong>Username:</strong> @{currentSession?.user.username}</p>
              <p><strong>Role:</strong> OWNER (Pemilik Bisnis)</p>
              <p><strong>Unit Bisnis Terdaftar:</strong> {authorizedBusinesses.length} Unit</p>
            </div>
            <div className="pt-2 flex justify-between gap-2">
              <button
                onClick={() => {
                  setShowProfileModal(false);
                  logout();
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl flex items-center gap-1.5 shadow-xs"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
              <button
                onClick={() => setShowProfileModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification Modal */}
      {showNotificationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                  <Shield className="w-5 h-5" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900">Pusat Notifikasi</h3>
              </div>
              <button onClick={() => setShowNotificationModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2.5">
              {totalPendingApproval === 0 ? (
                <p className="text-xs text-slate-500 py-4 text-center">
                  Tidak ada notifikasi pending saat ini. Semua operasional berjalan normal.
                </p>
              ) : (
                <>
                  {pendingTransfersForOwner.length > 0 && (
                    <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2.5">
                      <Repeat className="w-4 h-4 text-amber-600 shrink-0" />
                      <span><strong>{pendingTransfersForOwner.length} Transfer Barang</strong> butuh persetujuan Anda.</span>
                    </div>
                  )}
                  {pendingDamagedForOwner.length > 0 && (
                    <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-center gap-2.5">
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span><strong>{pendingDamagedForOwner.length} Laporan Barang Rusak</strong> butuh review Anda.</span>
                    </div>
                  )}
                </>
              )}
            </div>
            <div className="pt-2 flex justify-end gap-2">
              {totalPendingApproval > 0 && (
                <button
                  onClick={() => {
                    setShowNotificationModal(false);
                    navigateTo('APPROVAL_MODULE');
                  }}
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs"
                >
                  Buka Pusat Approval
                </button>
              )}
              <button
                onClick={() => setShowNotificationModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
