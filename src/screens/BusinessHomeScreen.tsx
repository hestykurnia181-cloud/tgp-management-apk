import React, { useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  Building2,
  CalendarCheck,
  Coins,
  FileSpreadsheet,
  Layers,
  Package,
  Plus,
  Receipt,
  Repeat,
  Shield,
  ShoppingCart,
  Store,
  TrendingDown,
  TrendingUp,
  UserPlus,
  Users,
} from 'lucide-react';
import { RoleBadge } from '../components/CommonBadges';
import { AddUserDialog, CreateOutletDialog } from '../components/Dialogs';
import { StatCard } from '../components/StatCard';
import { useTgp } from '../context/TgpContext';
import { normalizeUserRole } from '../security/authorizationEngine';
import { BusinessModule, LedgerType, UserRole } from '../types';

function formatRupiah(amount: number): string {
  return 'Rp ' + Math.round(amount).toLocaleString('id-ID');
}

export const BusinessHomeScreen: React.FC = () => {
  const {
    currentSession,
    activeBusiness,
    activeItems,
    activeLedger,
    activeSales,
    activeOutlets,
    allStaffForActiveBusiness,
    navigateTo,
  } = useTgp();

  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [showAddOutletModal, setShowAddOutletModal] = useState(false);

  if (!activeBusiness) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 space-y-4">
        <Store className="w-12 h-12 text-slate-400 mx-auto" />
        <h3 className="text-base font-bold text-slate-800">Tidak Ada Business yang Dipilih</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Silakan kembali ke dashboard utama untuk memilih business yang ingin dikelola.
        </p>
      </div>
    );
  }

  const role = currentSession?.user ? normalizeUserRole(currentSession.user.role) : null;
  const isKasir = role === UserRole.KASIR;
  const isWarehouse = role === UserRole.WAREHOUSE;
  const canManageStaff =
    role === UserRole.ADMIN_OWNER ||
    role === UserRole.ADMIN_DIVISI ||
    role === UserRole.MASTER;

  // Calculate isolated metrics for this business
  const totalPenjualan = activeLedger
    .filter(
      (l) =>
        l.type === LedgerType.PEMASUKAN &&
        (l.category.toUpperCase().includes('PENJUALAN') || l.referenceId.toUpperCase().includes('REV'))
    )
    .reduce((sum, l) => sum + l.amount, 0) || activeSales.reduce((sum, s) => sum + s.totalAmount, 0);

  const totalPemasukan = activeLedger
    .filter((l) => l.type === LedgerType.PEMASUKAN)
    .reduce((sum, l) => sum + l.amount, 0);

  const totalPengeluaran = activeLedger
    .filter((l) => l.type === LedgerType.PENGELUARAN)
    .reduce((sum, l) => sum + l.amount, 0);

  const totalStok = activeItems.reduce((sum, i) => sum + i.stockQuantity, 0);
  const rawCount = activeItems.filter((i) => i.type === 'RAW_MATERIAL').length;
  const finishedCount = activeItems.filter((i) => i.type === 'FINISHED_GOODS').length;

  return (
    <div className="space-y-5 pb-16">
      {/* Business Header Banner */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-md shadow-blue-500/20">
            <Store className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                Unit Bisnis Terisolasi
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
                {activeBusiness.templateType}
              </span>
            </div>
            <h2 className="text-lg font-extrabold text-slate-900 truncate">
              {activeBusiness.name}
            </h2>
          </div>
        </div>

        {canManageStaff && (
          <div className="flex items-center gap-2 shrink-0">
            {activeBusiness.activeModules.includes(BusinessModule.STAN_OUTLET) && (
              <button
                onClick={() => setShowAddOutletModal(true)}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>+ STAN Baru</span>
              </button>
            )}
            <button
              onClick={() => setShowAddStaffModal(true)}
              data-testid="btn_add_business_staff"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-xs"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Tambah Staf</span>
            </button>
          </div>
        )}
      </div>

      {/* 4 Isolated Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          title="Omset Penjualan"
          value={formatRupiah(totalPenjualan)}
          subtitle={`${activeSales.length} Transaksi Selesai`}
          icon={<ShoppingCart className="w-5 h-5" />}
          accentBg="bg-blue-50 border-blue-200"
          accentColor="text-blue-600"
        />
        <StatCard
          title="Total Pemasukan"
          value={formatRupiah(totalPemasukan)}
          subtitle={`Kas Masuk Terverifikasi`}
          icon={<TrendingUp className="w-5 h-5" />}
          accentBg="bg-emerald-50 border-emerald-200"
          accentColor="text-emerald-600"
        />
        <StatCard
          title="Total Pengeluaran"
          value={formatRupiah(totalPengeluaran)}
          subtitle={`Biaya & Pembelian Stok`}
          icon={<TrendingDown className="w-5 h-5" />}
          accentBg="bg-rose-50 border-rose-200"
          accentColor="text-rose-600"
        />
        <StatCard
          title="Total Unit Stok"
          value={`${Math.round(totalStok)} Unit`}
          subtitle={`${finishedCount} Jadi | ${rawCount} Mentah`}
          icon={<Package className="w-5 h-5" />}
          accentBg="bg-purple-50 border-purple-200"
          accentColor="text-purple-600"
        />
      </div>

      {/* Active Modules Navigation Grid */}
      <div className="space-y-3">
        <div>
          <h3 className="text-sm font-extrabold text-slate-900 tracking-wide uppercase">
            Modul Operasional Aktif
          </h3>
          <p className="text-xs text-slate-500">
            Akses fitur dan manajemen divisi {activeBusiness.name}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {activeBusiness.activeModules.includes(BusinessModule.POS) && (
            <div
              onClick={() => navigateTo('POS_MODULE')}
              className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:border-blue-400 hover:shadow-md cursor-pointer transition flex flex-col justify-between"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Kasir POS</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Penjualan retail & kasir STAN</p>
              </div>
            </div>
          )}

          {activeBusiness.activeModules.includes(BusinessModule.STAN_OUTLET) && (
            <div
              onClick={() => navigateTo('STAN_OUTLET_MODULE')}
              className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:border-amber-400 hover:shadow-md cursor-pointer transition flex flex-col justify-between"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-3">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">STAN / Outlet</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">{activeOutlets.length} Cabang Penjualan</p>
              </div>
            </div>
          )}

          {activeBusiness.activeModules.includes(BusinessModule.INVENTORY) && (
            <div
              onClick={() => navigateTo('INVENTORY_MODULE')}
              className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:border-purple-400 hover:shadow-md cursor-pointer transition flex flex-col justify-between"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center mb-3">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Inventaris & Stok</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Gudang Bahan Baku & Stok</p>
              </div>
            </div>
          )}

          {activeBusiness.activeModules.includes(BusinessModule.TRANSFER) && (
            <div
              onClick={() => navigateTo('TRANSFER_MODULE')}
              className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:border-emerald-400 hover:shadow-md cursor-pointer transition flex flex-col justify-between"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3">
                <Repeat className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Transfer Stok</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Antar unit & cabang STAN</p>
              </div>
            </div>
          )}

          {activeBusiness.activeModules.includes(BusinessModule.FINANCE) && !isKasir && (
            <div
              onClick={() => navigateTo('FINANCE_MODULE')}
              className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:border-sky-400 hover:shadow-md cursor-pointer transition flex flex-col justify-between"
            >
              <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center mb-3">
                <Coins className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Buku Kas & Ledger</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Pencatatan kas operasional</p>
              </div>
            </div>
          )}

          {activeBusiness.activeModules.includes(BusinessModule.DAMAGED_GOODS) && (
            <div
              onClick={() => navigateTo('DAMAGED_GOODS_MODULE')}
              className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:border-rose-400 hover:shadow-md cursor-pointer transition flex flex-col justify-between"
            >
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center mb-3">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Barang Rusak / Kadaluarsa</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Lapor & hapus buku stok</p>
              </div>
            </div>
          )}

          {activeBusiness.activeModules.includes(BusinessModule.ATTENDANCE) && (
            <div
              onClick={() => navigateTo('ATTENDANCE_MODULE')}
              className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:border-orange-400 hover:shadow-md cursor-pointer transition flex flex-col justify-between"
            >
              <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-700 flex items-center justify-center mb-3">
                <CalendarCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Presensi & Kehadiran</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Absensi masuk & pulang</p>
              </div>
            </div>
          )}

          {activeBusiness.activeModules.includes(BusinessModule.REPORTS) && !isKasir && (
            <div
              onClick={() => navigateTo('REPORTS_MODULE')}
              className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:border-pink-400 hover:shadow-md cursor-pointer transition flex flex-col justify-between"
            >
              <div className="w-10 h-10 rounded-xl bg-pink-50 text-pink-700 flex items-center justify-center mb-3">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Laporan Komprehensif</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Laba rugi, mutasi & penjualan</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Staff List for this Business */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 tracking-wide uppercase">
              Daftar Staf & Penugasan
            </h3>
            <p className="text-xs text-slate-500">
              Personil aktif yang ditugaskan di {activeBusiness.name}
            </p>
          </div>
          {canManageStaff && (
            <button
              onClick={() => setShowAddStaffModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-blue-600 hover:bg-blue-50 transition"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Tambah Akun Staf</span>
            </button>
          )}
        </div>

        {allStaffForActiveBusiness.length === 0 ? (
          <p className="text-xs text-slate-400 italic py-3 text-center">
            Belum ada personil staf yang ditugaskan pada unit bisnis ini.
          </p>
        ) : (
          <div className="space-y-2">
            {allStaffForActiveBusiness.map((staff) => (
              <div
                key={staff.userId}
                className="p-3 rounded-2xl border border-slate-100 bg-slate-50 flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0">
                    {staff.fullName.slice(0, 1)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{staff.fullName}</span>
                      <RoleBadge role={staff.role} />
                    </div>
                    <span className="text-[11px] text-slate-500 font-medium">@{staff.username}</span>
                  </div>
                </div>
                {staff.outletId && (
                  <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                    STAN: {activeOutlets.find((o) => o.outletId === staff.outletId)?.name || 'STAN'}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <AddUserDialog
        isOpen={showAddStaffModal}
        onClose={() => setShowAddStaffModal(false)}
        targetRole={UserRole.STAFF}
      />
      <CreateOutletDialog
        isOpen={showAddOutletModal}
        onClose={() => setShowAddOutletModal(false)}
      />
    </div>
  );
};
