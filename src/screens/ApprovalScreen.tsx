import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  Check,
  CheckCircle2,
  Clock,
  Repeat,
  ShieldCheck,
  X,
  XCircle,
} from 'lucide-react';
import { DamagedStatusBadge, TransferStatusBadge } from '../components/CommonBadges';
import { StatCard } from '../components/StatCard';
import { useTgp } from '../context/TgpContext';
import { normalizeUserRole } from '../security/authorizationEngine';
import { DamagedStatus, TransferStatus, UserRole } from '../types';

function formatRupiah(amount: number): string {
  return 'Rp ' + Math.round(amount).toLocaleString('id-ID');
}

export const ApprovalScreen: React.FC = () => {
  const {
    currentSession,
    pendingTransfersForOwner,
    pendingDamagedForOwner,
    approveTransfer,
    rejectTransfer,
    approveDamagedGoods,
    rejectDamagedGoods,
  } = useTgp();

  const [activeTab, setActiveTab] = useState<'TRANSFERS' | 'DAMAGED'>('TRANSFERS');
  const [rejectReason, setRejectReason] = useState<string>('');
  const [activeRejectId, setActiveRejectId] = useState<string | null>(null);

  const role = currentSession?.user ? normalizeUserRole(currentSession.user.role) : null;
  const isAuthorized = role === UserRole.OWNER || role === UserRole.MASTER;

  const totalPending = pendingTransfersForOwner.length + pendingDamagedForOwner.length;

  const handleRejectTransfer = (transferId: string) => {
    rejectTransfer(transferId, rejectReason);
    setActiveRejectId(null);
    setRejectReason('');
  };

  const handleRejectDamaged = (reportId: string) => {
    rejectDamagedGoods(reportId, rejectReason);
    setActiveRejectId(null);
    setRejectReason('');
  };

  if (!isAuthorized) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
        <XCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h3 className="text-base font-bold text-slate-800">Akses Dibatasi</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Hanya akun OWNER yang berwenang menyetujui mutasi persediaan dan penghapusan buku barang rusak.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-16">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 flex items-center justify-center text-white shrink-0 shadow-md shadow-amber-500/20">
            <BadgeCheck className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
                Pusat Persetujuan OWNER
              </span>
            </div>
            <h2 className="text-lg font-extrabold text-slate-900 truncate">
              Otorisasi Mutasi & Laporan Kerugian
            </h2>
          </div>
        </div>

        <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-900 border border-amber-300">
          {totalPending} Menunggu Approval
        </span>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setActiveTab('TRANSFERS')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'TRANSFERS'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Repeat className="w-4 h-4" />
          <span>Transfer Barang ({pendingTransfersForOwner.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('DAMAGED')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'DAMAGED'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Barang Rusak / Kadaluarsa ({pendingDamagedForOwner.length})</span>
        </button>
      </div>

      {/* TAB 1: TRANSFERS APPROVAL */}
      {activeTab === 'TRANSFERS' && (
        <div className="space-y-3">
          {pendingTransfersForOwner.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
              <h4 className="text-sm font-bold text-slate-800">Semua Transfer Bersih</h4>
              <p className="text-xs text-slate-400">Tidak ada pengajuan transfer barang yang menunggu persetujuan.</p>
            </div>
          ) : (
            pendingTransfersForOwner.map((tr) => (
              <div
                key={tr.transferId}
                className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900">{tr.transferReference}</span>
                      <TransferStatusBadge status={tr.status} />
                    </div>
                    <p className="text-xs text-slate-500 mt-1">Diajukan oleh: {tr.requestedBy}</p>
                  </div>
                  <span className="text-sm font-black text-emerald-600">
                    {formatRupiah(tr.totalValue)}
                  </span>
                </div>

                {/* Transfer route */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">DARI (SUMBER):</span>
                    <span className="font-bold text-slate-900">{tr.sourceBusinessName}</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block font-semibold">KE (TUJUAN):</span>
                    <span className="font-bold text-slate-900">{tr.destBusinessName}</span>
                  </div>
                </div>

                {/* Item & Notes */}
                <div className="text-xs text-slate-600 space-y-1">
                  <p>
                    Barang: <strong>{tr.itemName}</strong> &bull; Jumlah: <strong>{tr.quantity} Unit</strong>
                  </p>
                  {tr.notes && <p className="italic text-slate-500">"{tr.notes}"</p>}
                </div>

                {/* Actions */}
                {activeRejectId === tr.transferId ? (
                  <div className="p-3 bg-rose-50 rounded-2xl border border-rose-200 space-y-2 text-xs">
                    <label className="block font-bold text-rose-900">Alasan Penolakan:</label>
                    <input
                      type="text"
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="Masukkan alasan penolakan transfer..."
                      className="w-full px-3 py-1.5 rounded-xl bg-white border border-rose-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setActiveRejectId(null)}
                        className="px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                      >
                        Batal
                      </button>
                      <button
                        onClick={() => handleRejectTransfer(tr.transferId)}
                        className="px-3 py-1 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs"
                      >
                        Konfirmasi Tolak
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                    <button
                      onClick={() => setActiveRejectId(tr.transferId)}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 transition"
                    >
                      Tolak
                    </button>
                    <button
                      onClick={() => approveTransfer(tr.transferId)}
                      data-testid={`btn_approve_trf_${tr.transferReference}`}
                      className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs flex items-center gap-1.5 transition"
                    >
                      <Check className="w-4 h-4" />
                      <span>Setujui & Eksekusi Atomic</span>
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 2: DAMAGED GOODS APPROVAL */}
      {activeTab === 'DAMAGED' && (
        <div className="space-y-3">
          {pendingDamagedForOwner.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
              <h4 className="text-sm font-bold text-slate-800">Tidak Ada Laporan Kerusakan</h4>
              <p className="text-xs text-slate-400">Tidak ada pengajuan barang rusak yang menunggu review Anda.</p>
            </div>
          ) : (
            pendingDamagedForOwner.map((dmg) => (
              <div
                key={dmg.reportId}
                className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-extrabold text-slate-900">{dmg.itemName}</h4>
                      <DamagedStatusBadge status={dmg.status} />
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">Dilaporkan oleh: {dmg.reportedBy}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-black text-rose-600 block">
                      {formatRupiah(dmg.lossValue)}
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold">Taksiran Kerugian</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-rose-50/50 border border-rose-100 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Kuantitas Rusak:</span>
                    <span className="font-bold text-slate-900">{dmg.quantity} Unit</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Lokasi Ditemukan:</span>
                    <span className="font-bold text-slate-900">{dmg.location}</span>
                  </div>
                  <div className="pt-1 border-t border-rose-100/60">
                    <span className="text-slate-500 font-semibold block mb-0.5">Alasan / Kerusakan:</span>
                    <p className="text-slate-800 font-medium italic">"{dmg.reason}"</p>
                  </div>
                </div>

                {/* Actions */}
                {activeRejectId === dmg.reportId ? (
                  <div className="p-3 bg-rose-50 rounded-2xl border border-rose-200 space-y-2 text-xs">
                    <label className="block font-bold text-rose-900">Alasan Penolakan Laporan:</label>
                    <input
                      type="text"
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="Masukkan catatan penolakan..."
                      className="w-full px-3 py-1.5 rounded-xl bg-white border border-rose-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setActiveRejectId(null)}
                        className="px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                      >
                        Batal
                      </button>
                      <button
                        onClick={() => handleRejectDamaged(dmg.reportId)}
                        className="px-3 py-1 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs"
                      >
                        Konfirmasi Tolak
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                    <button
                      onClick={() => setActiveRejectId(dmg.reportId)}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 border border-slate-200 transition"
                    >
                      Tolak
                    </button>
                    <button
                      onClick={() => approveDamagedGoods(dmg.reportId)}
                      className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-xs flex items-center gap-1.5 transition"
                    >
                      <Check className="w-4 h-4" />
                      <span>Setujui & Hapus Buku Stok</span>
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
