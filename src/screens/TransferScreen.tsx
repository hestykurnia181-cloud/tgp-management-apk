import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle,
  Clock,
  Plus,
  Repeat,
  ShieldAlert,
  Store,
  XCircle,
} from 'lucide-react';
import { TransferStatusBadge } from '../components/CommonBadges';
import { StatCard } from '../components/StatCard';
import { useTgp } from '../context/TgpContext';
import { normalizeUserRole } from '../security/authorizationEngine';
import { TransferStatus, UserRole } from '../types';

function formatRupiah(amount: number): string {
  return 'Rp ' + Math.round(amount).toLocaleString('id-ID');
}

export const TransferScreen: React.FC = () => {
  const {
    currentSession,
    authorizedBusinesses,
    activeBusinessId,
    activeItems,
    activeTransfers,
    requestTransfer,
    navigateTo,
  } = useTgp();

  const [sourceBizId, setSourceBizId] = useState<string>(activeBusinessId || (authorizedBusinesses[0]?.businessId || ''));
  const [destBizId, setDestBizId] = useState<string>('');
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [quantity, setQuantity] = useState<number | ''>('');
  const [notes, setNotes] = useState('');

  const role = currentSession?.user ? normalizeUserRole(currentSession.user.role) : null;
  const isOwner = role === UserRole.OWNER;

  // Source business
  const sourceBiz = authorizedBusinesses.find((b) => b.businessId === sourceBizId);
  // Available destination businesses (MUST belong to the SAME owner!)
  const availableDestBusinesses = authorizedBusinesses.filter(
    (b) => b.businessId !== sourceBizId && (!sourceBiz || b.ownerId === sourceBiz.ownerId)
  );

  // Available items in source business
  const availableItems = activeItems.filter((i) => i.businessId === sourceBizId && i.type !== 'SERVICE');
  const selectedItem = availableItems.find((i) => i.itemId === selectedItemId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceBizId || !destBizId || !selectedItemId || typeof quantity !== 'number' || quantity <= 0) return;
    const ok = requestTransfer(sourceBizId, destBizId, selectedItemId, quantity, notes);
    if (ok) {
      setSelectedItemId('');
      setQuantity('');
      setNotes('');
    }
  };

  return (
    <div className="space-y-5 pb-16">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shrink-0 shadow-md shadow-emerald-500/20">
            <Repeat className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                Atomic Inventory Transfer
              </span>
            </div>
            <h2 className="text-lg font-extrabold text-slate-900 truncate">
              Transfer Persediaan Antar Unit
            </h2>
          </div>
        </div>

        {isOwner && (
          <button
            onClick={() => navigateTo('APPROVAL_MODULE')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition shadow-xs"
          >
            <span>Pusat Approval</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Security Rule Info */}
      <div className="p-4 rounded-3xl bg-emerald-50/70 border border-emerald-200/80 text-emerald-950 text-xs flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold">Protokol Keamanan Mutasi TGP:</p>
          <p className="text-emerald-800 leading-relaxed">
            Transfer stok hanya diizinkan antar unit bisnis yang dimiliki oleh OWNER yang sama. Transaksi bersifat <strong>atomic</strong>: saat disetujui, stok asal berkurang, stok tujuan bertambah, dan nilai barang dicatat secara seimbang di ledger kedua bisnis secara otomatis.
          </p>
        </div>
      </div>

      {/* Request Form */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4">
        <div>
          <h3 className="text-sm font-extrabold text-slate-900 tracking-wide uppercase">
            Ajukan Transfer Barang
          </h3>
          <p className="text-xs text-slate-500">Isi formulir transfer untuk direview oleh OWNER</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Source Business */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Bisnis Asal (Sumber)</label>
              <select
                value={sourceBizId}
                onChange={(e) => {
                  setSourceBizId(e.target.value);
                  setDestBizId('');
                  setSelectedItemId('');
                }}
                required
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {authorizedBusinesses.map((b) => (
                  <option key={b.businessId} value={b.businessId}>
                    {b.name} ({b.templateType})
                  </option>
                ))}
              </select>
            </div>

            {/* Destination Business */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Bisnis Tujuan (Penerima)</label>
              <select
                value={destBizId}
                onChange={(e) => setDestBizId(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">-- Pilih Bisnis Tujuan --</option>
                {availableDestBusinesses.map((b) => (
                  <option key={b.businessId} value={b.businessId}>
                    {b.name} ({b.templateType})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Item Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Pilih Item dari Bisnis Asal</label>
              <select
                value={selectedItemId}
                onChange={(e) => setSelectedItemId(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">-- Pilih Item Persediaan --</option>
                {availableItems.map((item) => (
                  <option key={item.itemId} value={item.itemId}>
                    {item.name} (Tersedia: {item.stockQuantity} {item.unit})
                  </option>
                ))}
              </select>
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Kuantitas Transfer {selectedItem ? `(${selectedItem.unit})` : ''}
              </label>
              <input
                type="number"
                min="1"
                max={selectedItem?.stockQuantity || 9999}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="Jumlah unit dipindahkan"
                required
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Catatan / Alasan Transfer</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Pasokan stok akhir pekan cabang baru"
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={!sourceBizId || !destBizId || !selectedItemId || !quantity}
              data-testid="btn_submit_transfer"
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white text-xs font-bold transition shadow-xs flex items-center gap-1.5"
            >
              <Repeat className="w-4 h-4" />
              <span>Kirim Permintaan Transfer</span>
            </button>
          </div>
        </form>
      </div>

      {/* Transfers History Table */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 tracking-wide uppercase">
              Riwayat Mutasi Antar Bisnis
            </h3>
            <p className="text-xs text-slate-500">Status transfer dan riwayat persetujuan</p>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
            {activeTransfers.length} Transaksi
          </span>
        </div>

        <div className="space-y-2.5">
          {activeTransfers.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-6 text-center">
              Belum ada permohonan transfer barang tercatat.
            </p>
          ) : (
            activeTransfers.map((tr) => (
              <div
                key={tr.transferId}
                className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900">{tr.transferReference}</span>
                    <TransferStatusBadge status={tr.status} />
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium">
                    {new Date(tr.createdAt).toLocaleDateString('id-ID')}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-slate-700 font-medium">
                  <span className="font-bold text-slate-900">{tr.sourceBusinessName}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-bold text-slate-900">{tr.destBusinessName}</span>
                </div>

                <div className="flex items-center justify-between pt-1 text-[11px] text-slate-600">
                  <span>
                    Item: <strong>{tr.itemName}</strong> ({tr.quantity} unit)
                  </span>
                  <span className="font-bold text-emerald-700">
                    Nilai: {formatRupiah(tr.totalValue)}
                  </span>
                </div>

                {tr.notes && (
                  <p className="text-[11px] text-slate-500 italic pt-1 border-t border-slate-100">
                    "{tr.notes}"
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
