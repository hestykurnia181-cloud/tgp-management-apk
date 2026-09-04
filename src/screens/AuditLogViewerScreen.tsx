import React, { useState } from 'react';
import {
  ArrowLeft,
  History,
  Lock,
  Search,
  Shield,
} from 'lucide-react';
import { RoleBadge } from '../components/CommonBadges';
import { useTgp } from '../context/TgpContext';

export const AuditLogViewerScreen: React.FC = () => {
  const { allAuditLogs, navigateTo } = useTgp();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLogs = allAuditLogs.filter((log) => {
    const q = searchQuery.toLowerCase();
    return (
      log.action.toLowerCase().includes(q) ||
      log.details.toLowerCase().includes(q) ||
      log.username.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-5 pb-16">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white shrink-0 shadow-md shadow-slate-900/20">
            <Shield className="w-6 h-6 text-amber-400" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Keamanan & Kepatuhan
              </span>
            </div>
            <h2 className="text-lg font-extrabold text-slate-900 truncate">
              Jejak Audit Seluruh Platform
            </h2>
          </div>
        </div>

        <button
          onClick={() => navigateTo('MASTER_DASHBOARD')}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari aksi audit, username, atau rincian transaksi..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        </div>
      </div>

      {/* Log List */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-slate-900 tracking-wide uppercase">
            Log Aktivitas Keamanan
          </h3>
          <span className="text-xs text-slate-400 font-semibold">{filteredLogs.length} Aktivitas</span>
        </div>

        <div className="space-y-2">
          {filteredLogs.map((log) => (
            <div
              key={log.logId}
              className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3 text-xs"
            >
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
                <History className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{log.action}</span>
                    <RoleBadge role={log.role} />
                  </div>
                  <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                    {new Date(log.timestamp).toLocaleString('id-ID')}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">{log.details}</p>
                <p className="text-[10px] text-blue-600 font-semibold mt-0.5">
                  Dilakukan oleh: @{log.username}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
