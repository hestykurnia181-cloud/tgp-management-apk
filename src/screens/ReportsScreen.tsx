import React, { useState } from 'react';
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Calendar,
  CheckCircle2,
  Coins,
  Download,
  FileSpreadsheet,
  Package,
  Printer,
  Receipt,
  ShoppingCart,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { StatCard } from '../components/StatCard';
import { useTgp } from '../context/TgpContext';
import { normalizeUserRole } from '../security/authorizationEngine';
import { LedgerType, UserRole } from '../types';

function formatRupiah(amount: number): string {
  return 'Rp ' + Math.round(amount).toLocaleString('id-ID');
}

export const ReportsScreen: React.FC = () => {
  const {
    currentSession,
    activeBusiness,
    activeBusinessId,
    authorizedBusinesses,
    activeLedger,
    activeSales,
    activeItems,
    globalOwnerLedger,
    globalOwnerSales,
    globalOwnerItems,
  } = useTgp();

  const [reportType, setReportType] = useState<'PROFIT_LOSS' | 'SALES' | 'INVENTORY'>('PROFIT_LOSS');

  const role = currentSession?.user ? normalizeUserRole(currentSession.user.role) : null;
  const isOwner = role === UserRole.OWNER;

  // Determine whether showing isolated or global
  const targetLedger = activeBusinessId ? activeLedger : (isOwner ? globalOwnerLedger : activeLedger);
  const targetSales = activeBusinessId ? activeSales : (isOwner ? globalOwnerSales : activeSales);
  const targetItems = activeBusinessId ? activeItems : (isOwner ? globalOwnerItems : activeItems);

  // Financial aggregates
  const totalSales = targetLedger
    .filter((l) => l.type === LedgerType.PEMASUKAN && (l.category.toUpperCase().includes('PENJUALAN') || l.referenceId.toUpperCase().includes('REV')))
    .reduce((sum, l) => sum + l.amount, 0) || targetSales.reduce((sum, s) => sum + s.totalAmount, 0);

  const totalIncome = targetLedger
    .filter((l) => l.type === LedgerType.PEMASUKAN)
    .reduce((sum, l) => sum + l.amount, 0);

  const totalExpense = targetLedger
    .filter((l) => l.type === LedgerType.PENGELUARAN)
    .reduce((sum, l) => sum + l.amount, 0);

  const netProfit = totalIncome - totalExpense;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-5 pb-16">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-12 h-12 rounded-2xl bg-pink-600 flex items-center justify-center text-white shrink-0 shadow-md shadow-pink-500/20">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-pink-600 uppercase tracking-wider">
                Laporan & Analitika
              </span>
            </div>
            <h2 className="text-lg font-extrabold text-slate-900 truncate">
              {activeBusiness ? `Laporan: ${activeBusiness.name}` : 'Laporan Konsolidasian Seluruh Bisnis'}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-xs"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Laporan</span>
          </button>
        </div>
      </div>

      {/* Report Type Selector */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setReportType('PROFIT_LOSS')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition ${
            reportType === 'PROFIT_LOSS'
              ? 'bg-pink-600 text-white shadow-xs'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Laba / Rugi & Arus Kas
        </button>
        <button
          onClick={() => setReportType('SALES')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition ${
            reportType === 'SALES'
              ? 'bg-pink-600 text-white shadow-xs'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Riwayat Penjualan POS ({targetSales.length})
        </button>
        <button
          onClick={() => setReportType('INVENTORY')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition ${
            reportType === 'INVENTORY'
              ? 'bg-pink-600 text-white shadow-xs'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Valuasi Stok Persediaan
        </button>
      </div>

      {/* REPORT 1: PROFIT & LOSS */}
      {reportType === 'PROFIT_LOSS' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <StatCard
              title="Total Pendapatan"
              value={formatRupiah(totalIncome)}
              subtitle="Dari Penjualan & Lainnya"
              icon={<TrendingUp className="w-5 h-5" />}
              accentBg="bg-emerald-50 border-emerald-200"
              accentColor="text-emerald-600"
            />
            <StatCard
              title="Total Biaya & Pembelian"
              value={formatRupiah(totalExpense)}
              subtitle="Operasional & Bahan Mentah"
              icon={<TrendingDown className="w-5 h-5" />}
              accentBg="bg-rose-50 border-rose-200"
              accentColor="text-rose-600"
            />
            <StatCard
              title="Laba / Rugi Bersih"
              value={`${netProfit >= 0 ? '+' : ''}${formatRupiah(netProfit)}`}
              subtitle={netProfit >= 0 ? 'Surplus Operasional' : 'Defisit Operasional'}
              icon={<Coins className="w-5 h-5" />}
              accentBg={netProfit >= 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'}
              accentColor={netProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}
            />
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 tracking-wide uppercase">
              Rincian Laporan Laba Rugi
            </h3>

            <div className="space-y-2 text-xs divide-y divide-slate-100">
              <div className="pt-2 flex justify-between font-bold text-slate-800">
                <span>1. Pendapatan Penjualan POS & Layanan:</span>
                <span className="text-emerald-600">{formatRupiah(totalSales)}</span>
              </div>
              <div className="pt-2 flex justify-between font-bold text-slate-800">
                <span>2. Pendapatan Kas Lain-lain:</span>
                <span className="text-emerald-600">{formatRupiah(Math.max(0, totalIncome - totalSales))}</span>
              </div>
              <div className="pt-2 flex justify-between font-black text-slate-900 bg-emerald-50/50 p-2.5 rounded-xl">
                <span>TOTAL PENDAPATAN OPERASIONAL:</span>
                <span className="text-emerald-700">{formatRupiah(totalIncome)}</span>
              </div>

              <div className="pt-3 flex justify-between font-bold text-slate-800">
                <span>3. Pembelian Bahan Baku Mentah:</span>
                <span className="text-rose-600">
                  {formatRupiah(
                    targetLedger
                      .filter((l) => l.type === LedgerType.PENGELUARAN && l.category.toLowerCase().includes('bahan'))
                      .reduce((sum, l) => sum + l.amount, 0)
                  )}
                </span>
              </div>
              <div className="pt-2 flex justify-between font-bold text-slate-800">
                <span>4. Biaya Operasional & Kerugian Rusak:</span>
                <span className="text-rose-600">
                  {formatRupiah(
                    targetLedger
                      .filter((l) => l.type === LedgerType.PENGELUARAN && !l.category.toLowerCase().includes('bahan'))
                      .reduce((sum, l) => sum + l.amount, 0)
                  )}
                </span>
              </div>
              <div className="pt-2 flex justify-between font-black text-slate-900 bg-rose-50/50 p-2.5 rounded-xl">
                <span>TOTAL PENGELUARAN & BEBAN:</span>
                <span className="text-rose-700">{formatRupiah(totalExpense)}</span>
              </div>

              <div className="pt-4 flex justify-between font-black text-base text-slate-900 bg-slate-900 text-white p-4 rounded-2xl">
                <span>LABA BERSIH BERJALAN:</span>
                <span className={netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                  {netProfit >= 0 ? '+' : ''}{formatRupiah(netProfit)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REPORT 2: SALES ORDER HISTORY */}
      {reportType === 'SALES' && (
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-900 tracking-wide uppercase">
              Riwayat Seluruh Transaksi POS
            </h3>
            <span className="text-xs text-slate-400 font-semibold">{targetSales.length} Transaksi</span>
          </div>

          <div className="space-y-2">
            {targetSales.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-8 text-center">Belum ada transaksi penjualan kasir tercatat.</p>
            ) : (
              targetSales.map((s) => (
                <div
                  key={s.saleId}
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900">{s.receiptNumber}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                        {s.paymentMethod}
                      </span>
                      {s.outletName && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                          {s.outletName}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">{s.itemsSummary}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Kasir: {s.cashierName} &bull; {new Date(s.timestamp).toLocaleString('id-ID')}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-sm font-black text-slate-900 block">
                      {formatRupiah(s.totalAmount)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* REPORT 3: INVENTORY VALUATION */}
      {reportType === 'INVENTORY' && (
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-900 tracking-wide uppercase">
              Valuasi Persediaan Barang
            </h3>
            <span className="text-xs text-slate-400 font-semibold">{targetItems.length} Item</span>
          </div>

          <div className="space-y-2">
            {targetItems.map((item) => {
              const unitCost = item.costPrice > 0 ? item.costPrice : item.sellingPrice;
              const totalVal = unitCost * item.stockQuantity;

              return (
                <div
                  key={item.itemId}
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{item.name}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-200 text-slate-700">
                        {item.type}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Stok: {item.stockQuantity} {item.unit} &bull; HPP: {formatRupiah(unitCost)}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-sm font-black text-purple-700 block">
                      {formatRupiah(totalVal)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
