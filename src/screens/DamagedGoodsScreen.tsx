import React, { useState } from 'react';
import {
  AlertTriangle,
  FileText,
  Plus,
  ShieldCheck,
  TrendingDown,
} from 'lucide-react';
import { DamagedStatusBadge } from '../components/CommonBadges';
import { ReportDamagedGoodsDialog } from '../components/Dialogs';
import { StatCard } from '../components/StatCard';
import { useTgp } from '../context/TgpContext';
import { normalizeUserRole } from '../security/authorizationEngine';
import { DamagedStatus, UserRole } from '../types';

function formatRupiah(amount: number): string {
  return 'Rp ' + Math.round(amount).toLocaleString('id-ID');
}

export const DamagedGoodsScreen: React.FC = () => {
  const {
    currentSession,
    activeBusiness,
    activeDamagedReports,
    navigateTo,
  } = useTgp();

  const [showReportModal, setShowReportModal] = useState(false);

  const role = currentSession?.user ? normalizeUserRole(currentSession.user.role) : null;
  const isOwner = role === UserRole.OWNER;

  const totalLoss = activeDamagedReports
    .filter((d) => d.status === DamagedStatus.APPROVED)
    .reduce((sum, d) => sum + d.lossValue, 0);

  const pendingCount = activeDamagedReports.filter((d) => d.status === DamagedStatus.PENDING).length;

  return (
    <div className="space-y-5 pb-16">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-12 h-12 rounded-2xl bg-rose-600 flex items-center justify-center text-white shrink-0 shadow-md shadow-rose-500/20">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">
                Pengendalian Kerugian
              </span>
            </div>
            <h2 className="text-lg font-extrabold text-slate-900 truncate">
              Barang Rusak & Kadaluarsa ({activeBusiness?.name})
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isOwner && (
            <button
              onClick={() => navigateTo('APPROVAL_MODULE')}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition shadow-xs"
            >
              <span>Review ({pendingCount})</span>
            </button>
          )}
          <button
            onClick={() => setShowReportModal(true)}
            data-testid="btn_report_damaged_open"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>+ Lapor Kerusakan</span>
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          title="Total Kerugian Terverifikasi"
          value={formatRupiah(totalLoss)}
          subtitle="Telah Dihapus Buku ke Ledger"
          icon={<TrendingDown className="w-5 h-5" />}
          accentBg="bg-rose-50 border-rose-200"
          accentColor="text-rose-600"
        />
        <StatCard
          title="Laporan Menunggu Approval"
          value={`${pendingCount} Kasus`}
          subtitle="Memerlukan Persetujuan OWNER"
          icon={<AlertTriangle className="w-5 h-5" />}
          accentBg="bg-amber-50 border-amber-200"
          accentColor="text-amber-600"
        />
      </div>

      {/* Reports List */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-slate-900 tracking-wide uppercase">
            Daftar Laporan Barang Rusak
          </h3>
          <span className="text-xs text-slate-400 font-semibold">
            {activeDamagedReports.length} Laporan
          </span>
        </div>

        <div className="space-y-2.5">
          {activeDamagedReports.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-8 text-center">
              Belum ada laporan barang rusak atau kadaluarsa di divisi ini.
            </p>
          ) : (
            activeDamagedReports.map((dmg) => (
              <div
                key={dmg.reportId}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{dmg.itemName}</span>
                    <DamagedStatusBadge status={dmg.status} />
                  </div>
                  <span className="font-black text-rose-600">
                    {formatRupiah(dmg.lossValue)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>
                    Jumlah: <strong>{dmg.quantity} Unit</strong> &bull; Lokasi: {dmg.location}
                  </span>
                  <span>Dilaporkan: {dmg.reportedBy}</span>
                </div>

                <p className="text-[11px] text-slate-600 italic pt-1 border-t border-slate-100">
                  "{dmg.reason}"
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      <ReportDamagedGoodsDialog
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
      />
    </div>
  );
};
