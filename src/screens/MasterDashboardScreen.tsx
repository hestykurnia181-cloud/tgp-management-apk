import React, { useState } from 'react';
import {
  ArrowRight,
  Building2,
  History,
  Lock,
  Plus,
  Shield,
  Store,
  UserCheck,
  UserPlus,
  Users,
} from 'lucide-react';
import { RoleBadge } from '../components/CommonBadges';
import { AddUserDialog } from '../components/Dialogs';
import { StatCard } from '../components/StatCard';
import { useTgp } from '../context/TgpContext';
import { UserRole } from '../types';

export const MasterDashboardScreen: React.FC = () => {
  const { allOwners, allBusinesses, allAuditLogs, navigateTo } = useTgp();
  const [showAddOwnerModal, setShowAddOwnerModal] = useState(false);

  return (
    <div className="space-y-5 pb-16">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 rounded-3xl p-6 text-white shadow-md border border-slate-700/80">
        <div className="flex items-center gap-2 text-amber-400 text-xs font-black uppercase tracking-wider mb-2">
          <Shield className="w-4 h-4" />
          <span>MASTER Platform Controller</span>
        </div>
        <h2 className="text-xl font-extrabold">Kendali Pusat Multi-Tenant TGP</h2>
        <p className="text-xs text-slate-300 mt-1.5 max-w-xl leading-relaxed">
          Sebagai MASTER, Anda adalah pengelola tunggal platform. Akun MASTER tidak terikat pada bisnis individual, melainkan memegang otorisasi penuh untuk menerbitkan akun OWNER dan mengawasi jejak audit keamanan seluruh platform.
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          title="Total OWNER"
          value={allOwners.length.toString()}
          subtitle="Pemilik Bisnis Terdaftar"
          icon={<Users className="w-5 h-5" />}
          accentBg="bg-purple-50 border-purple-200"
          accentColor="text-purple-600"
        />
        <StatCard
          title="Total Business"
          value={allBusinesses.length.toString()}
          subtitle="Di Seluruh Platform"
          icon={<Store className="w-5 h-5" />}
          accentBg="bg-blue-50 border-blue-200"
          accentColor="text-blue-600"
        />
      </div>

      {/* Registered Owners List */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 tracking-wide uppercase">Daftar OWNER Resmi</h3>
            <p className="text-xs text-slate-500">Kelola akun pemilik multi-bisnis</p>
          </div>
          <button
            onClick={() => setShowAddOwnerModal(true)}
            data-testid="btn_add_owner"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition shadow-xs"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Buat OWNER</span>
          </button>
        </div>

        <div className="space-y-2.5">
          {allOwners.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-800">Belum Ada Akun OWNER Terdaftar</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                Sebagai MASTER tunggal, Anda dapat mendaftarkan akun OWNER baru untuk mengelola multi-bisnis mereka secara mandiri.
              </p>
              <button
                onClick={() => setShowAddOwnerModal(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition shadow-xs"
              >
                <UserPlus className="w-4 h-4" />
                <span>Buat Akun OWNER Pertama</span>
              </button>
            </div>
          ) : (
            allOwners.map((owner) => {
              const ownerBiz = allBusinesses.filter((b) => b.ownerId === owner.userId);
              return (
                <div
                  key={owner.userId}
                  className="p-4 rounded-2xl border border-slate-200/80 hover:border-slate-300 flex items-center justify-between gap-3 transition"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 font-bold flex items-center justify-center shrink-0">
                      {owner.fullName.slice(0, 1)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-slate-900 truncate">{owner.fullName}</p>
                        <RoleBadge role={UserRole.OWNER} />
                      </div>
                      <p className="text-xs text-slate-500">@{owner.username}</p>
                      <p className="text-xs font-semibold text-blue-600 mt-0.5">
                        Memiliki {ownerBiz.length} Business aktif
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[11px] text-slate-400 block font-medium">
                      {new Date(owner.createdAt).toLocaleDateString('id-ID')}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Audit Log Preview */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 tracking-wide uppercase">Audit Security Trail</h3>
            <p className="text-xs text-slate-500">Rekaman jejak transaksi & otorisasi platform</p>
          </div>
          <button
            onClick={() => navigateTo('AUDIT_LOG_VIEWER')}
            className="text-xs font-bold text-blue-600 hover:underline inline-flex items-center gap-1"
          >
            <span>Lihat Semua ({allAuditLogs.length})</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="space-y-2">
          {allAuditLogs.slice(0, 5).map((log) => (
            <div key={log.logId} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2.5 text-xs">
              <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
                <History className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-slate-900">{log.action}</span>
                  <span className="text-[10px] text-slate-400 shrink-0">
                    {new Date(log.timestamp).toLocaleTimeString('id-ID')}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">{log.details}</p>
                <p className="text-[10px] text-blue-600 font-semibold mt-0.5">Oleh: @{log.username} ({log.role})</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <AddUserDialog
        isOpen={showAddOwnerModal}
        onClose={() => setShowAddOwnerModal(false)}
        targetRole={UserRole.OWNER}
      />
    </div>
  );
};
