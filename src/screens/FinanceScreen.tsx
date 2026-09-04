import React, { useState } from 'react';
import {
  ArrowDownRight,
  ArrowUpRight,
  Coins,
  CreditCard,
  FileSpreadsheet,
  Filter,
  Plus,
  Receipt,
  Search,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { AddLedgerDialog } from '../components/Dialogs';
import { StatCard } from '../components/StatCard';
import { useTgp } from '../context/TgpContext';
import { normalizeUserRole } from '../security/authorizationEngine';
import { LedgerType, UserRole } from '../types';

function formatRupiah(amount: number): string {
  return 'Rp ' + Math.round(amount).toLocaleString('id-ID');
}

export const FinanceScreen: React.FC = () => {
  const {
    currentSession,
    activeBusiness,
    activeLedger,
    globalOwnerLedger,
    activeBusinessId,
  } = useTgp();

  const [showAddLedgerModal, setShowAddLedgerModal] = useState(false);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const role = currentSession?.user ? normalizeUserRole(currentSession.user.role) : null;
  const canAddLedger =
    role === UserRole.OWNER ||
    role === UserRole.ADMIN_OWNER ||
    role === UserRole.ADMIN_DIVISI ||
    role === UserRole.MANAGER ||
    role === UserRole.MASTER;

  const currentLedger = activeBusinessId ? activeLedger : (role === UserRole.OWNER ? globalOwnerLedger : activeLedger);

  const totalIn = currentLedger
    .filter((l) => l.type === LedgerType.PEMASUKAN)
    .reduce((sum, l) => sum + l.amount, 0);

  const totalOut = currentLedger
    .filter((l) => l.type === LedgerType.PENGELUARAN)
    .reduce((sum, l) => sum + l.amount, 0);

  const saldoKas = totalIn - totalOut;

  const filteredEntries = currentLedger.filter((entry) => {
    const matchesType =
      filterType === 'ALL' ||
      (filterType === 'IN' && entry.type === LedgerType.PEMASUKAN) ||
      (filterType === 'OUT' && entry.type === LedgerType.PENGELUARAN);

    const matchesSearch =
      entry.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.referenceId.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesType && matchesSearch;
  });

  return (
    <div className="space-y-5 pb-16">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-12 h-12 rounded-2xl bg-sky-600 flex items-center justify-center text-white shrink-0 shadow-md shadow-sky-500/20">
            <Coins className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-sky-600 uppercase tracking-wider">
                Buku Kas & Ledger
              </span>
            </div>
            <h2 className="text-lg font-extrabold text-slate-900 truncate">
              {activeBusiness ? activeBusiness.name : 'Konsolidasi Kas Seluruh Bisnis'}
            </h2>
          </div>
        </div>

        {canAddLedger && activeBusinessId && (
          <button
            onClick={() => setShowAddLedgerModal(true)}
            data-testid="btn_add_ledger_entry"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>+ Catat Transaksi Kas</span>
          </button>
        )}
      </div>

      {/* 3 Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <StatCard
          title="Total Pemasukan"
          value={formatRupiah(totalIn)}
          subtitle="Arus Kas Masuk"
          icon={<TrendingUp className="w-5 h-5" />}
          accentBg="bg-emerald-50 border-emerald-200"
          accentColor="text-emerald-600"
        />
        <StatCard
          title="Total Pengeluaran"
          value={formatRupiah(totalOut)}
          subtitle="Biaya & Pembelian"
          icon={<TrendingDown className="w-5 h-5" />}
          accentBg="bg-rose-50 border-rose-200"
          accentColor="text-rose-600"
        />
        <StatCard
          title="Saldo Kas Bersih"
          value={formatRupiah(saldoKas)}
          subtitle={saldoKas >= 0 ? 'Surplus Operasional' : 'Defisit Operasional'}
          icon={<Coins className="w-5 h-5" />}
          accentBg={saldoKas >= 0 ? 'bg-sky-50 border-sky-200' : 'bg-amber-50 border-amber-200'}
          accentColor={saldoKas >= 0 ? 'text-sky-600' : 'text-amber-600'}
        />
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
              filterType === 'ALL'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Semua Mutasi
          </button>
          <button
            onClick={() => setFilterType('IN')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
              filterType === 'IN'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Pemasukan Saja
          </button>
          <button
            onClick={() => setFilterType('OUT')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
              filterType === 'OUT'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Pengeluaran Saja
          </button>
        </div>

        <div className="relative flex-1 min-w-[180px]">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari transaksi / referensi..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Ledger Transactions List */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-slate-900 tracking-wide uppercase">
            Catatan Jurnal Kas
          </h3>
          <span className="text-xs text-slate-400 font-semibold">
            {filteredEntries.length} Baris
          </span>
        </div>

        <div className="space-y-2">
          {filteredEntries.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-8 text-center">
              Belum ada transaksi jurnal kas sesuai filter.
            </p>
          ) : (
            filteredEntries.map((l) => {
              const isIncome = l.type === LedgerType.PEMASUKAN;
              return (
                <div
                  key={l.transactionId}
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isIncome ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      {isIncome ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-slate-900 truncate">{l.description}</p>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-200/80 text-slate-700">
                          {l.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                        <span className="font-mono">{l.referenceId}</span>
                        <span>&bull;</span>
                        <span>{new Date(l.timestamp).toLocaleDateString('id-ID')}</span>
                        <span>&bull;</span>
                        <span>{l.createdBy}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={`text-sm font-black block ${
                        isIncome ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {isIncome ? '+' : '-'}{formatRupiah(l.amount)}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <AddLedgerDialog
        isOpen={showAddLedgerModal}
        onClose={() => setShowAddLedgerModal(false)}
      />
    </div>
  );
};
