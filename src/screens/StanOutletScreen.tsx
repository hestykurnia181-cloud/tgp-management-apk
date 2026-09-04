import React, { useState } from 'react';
import {
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  History,
  Layers,
  MapPin,
  Package,
  Phone,
  Plus,
  Repeat,
  Store,
  Trash2,
  TrendingUp,
} from 'lucide-react';
import { CreateOutletDialog, SupplyStanStockDialog } from '../components/Dialogs';
import { StatCard } from '../components/StatCard';
import { useTgp } from '../context/TgpContext';
import { normalizeUserRole } from '../security/authorizationEngine';
import { OutletEntity, UserRole } from '../types';

function formatRupiah(amount: number): string {
  return 'Rp ' + Math.round(amount).toLocaleString('id-ID');
}

export const StanOutletScreen: React.FC = () => {
  const {
    currentSession,
    activeBusiness,
    activeOutlets,
    activeOutletStocks,
    activeStanTransfers,
    deleteOutlet,
  } = useTgp();

  const [showAddOutletModal, setShowAddOutletModal] = useState(false);
  const [supplyDialogTarget, setSupplyDialogTarget] = useState<OutletEntity | null>(null);

  const role = currentSession?.user ? normalizeUserRole(currentSession.user.role) : null;
  const canManage =
    role === UserRole.OWNER ||
    role === UserRole.ADMIN_OWNER ||
    role === UserRole.ADMIN_DIVISI ||
    role === UserRole.MANAGER ||
    role === UserRole.MASTER;

  const totalOutlets = activeOutlets.length;
  const totalStockInStan = activeOutletStocks.reduce((sum, os) => sum + os.stockQuantity, 0);

  return (
    <div className="space-y-5 pb-16">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 flex items-center justify-center text-white shrink-0 shadow-md shadow-amber-500/20">
            <Store className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
                Manajemen Cabang & STAN
              </span>
            </div>
            <h2 className="text-lg font-extrabold text-slate-900 truncate">
              STAN Penjualan ({activeBusiness?.name})
            </h2>
          </div>
        </div>

        {canManage && (
          <button
            onClick={() => setShowAddOutletModal(true)}
            data-testid="btn_add_outlet_main"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>+ STAN Baru</span>
          </button>
        )}
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          title="Total STAN Aktif"
          value={totalOutlets.toString()}
          subtitle="Cabang Penjualan"
          icon={<Store className="w-5 h-5" />}
          accentBg="bg-amber-50 border-amber-200"
          accentColor="text-amber-600"
        />
        <StatCard
          title="Total Stok di STAN"
          value={`${Math.round(totalStockInStan)} Unit`}
          subtitle="Tersedia di Seluruh STAN"
          icon={<Package className="w-5 h-5" />}
          accentBg="bg-blue-50 border-blue-200"
          accentColor="text-blue-600"
        />
      </div>

      {/* STAN Outlets List */}
      <div className="space-y-3">
        <div>
          <h3 className="text-sm font-extrabold text-slate-900 tracking-wide uppercase">
            Daftar STAN / Cabang Penjualan
          </h3>
          <p className="text-xs text-slate-500">
            Pantau stok masing-masing stand dan pasok barang langsung dari Gudang Produksi
          </p>
        </div>

        {activeOutlets.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-3xl border border-dashed border-slate-300 space-y-3">
            <Store className="w-12 h-12 text-slate-400 mx-auto" />
            <h4 className="text-sm font-bold text-slate-800">Belum Ada STAN Terdaftar</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Tambahkan STAN cabang penjualan untuk mulai mendistribusikan stok dari Gudang Produksi.
            </p>
            {canManage && (
              <button
                onClick={() => setShowAddOutletModal(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah STAN Pertama</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {activeOutlets.map((outlet) => {
              const stocks = activeOutletStocks.filter((os) => os.outletId === outlet.outletId);
              const totalQty = stocks.reduce((sum, s) => sum + s.stockQuantity, 0);

              return (
                <div
                  key={outlet.outletId}
                  className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-extrabold text-slate-900">{outlet.name}</h4>
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                          {outlet.code}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{outlet.location}</span>
                      </div>
                      {outlet.phone && (
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>{outlet.phone}</span>
                        </div>
                      )}
                    </div>

                    {canManage && (
                      <button
                        onClick={() => deleteOutlet(outlet.outletId)}
                        className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50"
                        title="Hapus STAN"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Stock inventory in this STAN */}
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
                    <div className="flex items-center justify-between font-bold mb-1.5 text-slate-700">
                      <span>Stok di STAN Ini:</span>
                      <span className="text-blue-600">{totalQty} Unit ({stocks.length} Jenis Produk)</span>
                    </div>

                    {stocks.length === 0 ? (
                      <p className="text-[11px] text-slate-400 italic">Belum ada stok barang di stand ini.</p>
                    ) : (
                      <div className="space-y-1 max-h-28 overflow-y-auto pr-1">
                        {stocks.map((stk) => (
                          <div
                            key={stk.stockId}
                            className="flex justify-between items-center text-[11px] text-slate-600 py-0.5 border-b border-slate-100 last:border-none"
                          >
                            <span className="truncate pr-2 font-medium">{stk.itemName}</span>
                            <span className="font-bold text-slate-800 shrink-0">
                              {stk.stockQuantity} {stk.unit}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Pasok Stok Action */}
                  {canManage && (
                    <div className="pt-2 border-t border-slate-100 flex justify-end">
                      <button
                        onClick={() => setSupplyDialogTarget(outlet)}
                        data-testid={`btn_supply_stan_${outlet.code}`}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 shadow-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Pasok Stok dari Produksi</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Distribution History */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 tracking-wide uppercase">
              Riwayat Pasokan & Retur STAN
            </h3>
            <p className="text-xs text-slate-500">Log perpindahan stok antara Gudang Produksi dan STAN</p>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
            {activeStanTransfers.length} Catatan
          </span>
        </div>

        <div className="space-y-2">
          {activeStanTransfers.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-4 text-center">
              Belum ada riwayat distribusi stok ke STAN.
            </p>
          ) : (
            activeStanTransfers.slice(0, 8).map((st) => {
              const isSupply = st.direction === 'PRODUCTION_TO_STAN';
              return (
                <div
                  key={st.transferId}
                  className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        isSupply ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {isSupply ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 truncate">
                        {isSupply ? 'Pasokan ke' : 'Retur dari'} {st.outletName}: {st.itemName}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Jumlah: <span className="font-bold text-slate-800">{st.quantity}</span> &bull; Ref: {st.transferReference}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-slate-400 block">
                      {new Date(st.timestamp).toLocaleDateString('id-ID')}
                    </span>
                    <span className="text-[10px] text-slate-500 font-semibold">{st.performedBy}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <CreateOutletDialog
        isOpen={showAddOutletModal}
        onClose={() => setShowAddOutletModal(false)}
      />
      {supplyDialogTarget && (
        <SupplyStanStockDialog
          isOpen={!!supplyDialogTarget}
          onClose={() => setSupplyDialogTarget(null)}
          outlet={supplyDialogTarget}
        />
      )}
    </div>
  );
};
