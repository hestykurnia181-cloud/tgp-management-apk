import React, { useState } from 'react';
import {
  AlertTriangle,
  BookOpen,
  ChefHat,
  Eye,
  History,
  Layers,
  Package,
  Plus,
  Search,
  Settings,
  Sparkles,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import {
  ConfigureRecipeBomDialog,
  ProduceGoodsDialog,
  RestockRawMaterialDialog,
} from '../components/Dialogs';
import { StatCard } from '../components/StatCard';
import { useTgp } from '../context/TgpContext';
import { normalizeUserRole } from '../security/authorizationEngine';
import { ItemEntity, MutationType, UserRole } from '../types';

function formatRupiah(amount: number): string {
  return 'Rp ' + Math.round(amount).toLocaleString('id-ID');
}

export const InventoryScreen: React.FC = () => {
  const {
    currentSession,
    activeBusiness,
    activeItems,
    activeStockMutations,
    addItem,
  } = useTgp();

  const [activeTab, setActiveTab] = useState<'FINISHED' | 'RAW' | 'RECIPES' | 'MUTATIONS'>('FINISHED');
  const [searchQuery, setSearchQuery] = useState('');

  // Dialog states
  const [showProduceModal, setShowProduceModal] = useState(false);
  const [showRestockModal, setShowRestockModal] = useState(false);
  const [selectedRecipeItem, setSelectedRecipeItem] = useState<ItemEntity | null>(null);

  const role = currentSession?.user ? normalizeUserRole(currentSession.user.role) : null;
  const isKasir = role === UserRole.KASIR;
  const canProduce =
    role === UserRole.OWNER ||
    role === UserRole.ADMIN_OWNER ||
    role === UserRole.ADMIN_DIVISI ||
    role === UserRole.WAREHOUSE ||
    role === UserRole.MANAGER ||
    role === UserRole.MASTER;

  // Filtered lists
  const finishedGoods = activeItems.filter(
    (i) => i.type === 'FINISHED_GOODS' || i.type === 'SERVICE'
  );
  const rawMaterials = activeItems.filter((i) => i.type === 'RAW_MATERIAL');

  const filteredFinished = finishedGoods.filter((i) =>
    i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredRaw = rawMaterials.filter((i) =>
    i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalFinishedStock = finishedGoods.reduce((sum, i) => sum + i.stockQuantity, 0);
  const totalRawStock = rawMaterials.reduce((sum, i) => sum + i.stockQuantity, 0);

  return (
    <div className="space-y-5 pb-16">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-12 h-12 rounded-2xl bg-purple-600 flex items-center justify-center text-white shrink-0 shadow-md shadow-purple-500/20">
            <Package className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">
                Gudang & Inventaris
              </span>
            </div>
            <h2 className="text-lg font-extrabold text-slate-900 truncate">
              Manajemen Persediaan ({activeBusiness?.name})
            </h2>
          </div>
        </div>

        {canProduce && (
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowRestockModal(true)}
              data-testid="btn_restock_raw_open"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>+ Bahan Mentah</span>
            </button>
            <button
              onClick={() => setShowProduceModal(true)}
              data-testid="btn_produce_open"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition shadow-xs"
            >
              <ChefHat className="w-4 h-4" />
              <span>+ Produksi Barang</span>
            </button>
          </div>
        )}
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          title="Gudang Stok (Bahan Jadi)"
          value={`${Math.round(totalFinishedStock)} Unit`}
          subtitle={`${finishedGoods.length} Macam Produk Jual`}
          icon={<Package className="w-5 h-5" />}
          accentBg="bg-purple-50 border-purple-200"
          accentColor="text-purple-600"
        />
        <StatCard
          title="Gudang Bahan Baku (Mentah)"
          value={`${Math.round(totalRawStock)} Unit`}
          subtitle={`${rawMaterials.length} Komponen Resep`}
          icon={<Layers className="w-5 h-5" />}
          accentBg="bg-blue-50 border-blue-200"
          accentColor="text-blue-600"
        />
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setActiveTab('FINISHED')}
            data-testid="tab_finished_goods"
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
              activeTab === 'FINISHED'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Gudang Stok ({finishedGoods.length})
          </button>
          <button
            onClick={() => setActiveTab('RAW')}
            data-testid="tab_raw_materials"
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
              activeTab === 'RAW'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Gudang Bahan Baku ({rawMaterials.length})
          </button>
          <button
            onClick={() => setActiveTab('RECIPES')}
            data-testid="tab_recipes_bom"
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
              activeTab === 'RECIPES'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Resep & Formula BOM
          </button>
          <button
            onClick={() => setActiveTab('MUTATIONS')}
            data-testid="tab_mutations"
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
              activeTab === 'MUTATIONS'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Mutasi Stok ({activeStockMutations.length})
          </button>
        </div>

        {/* Search */}
        {(activeTab === 'FINISHED' || activeTab === 'RAW') && (
          <div className="relative pt-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama barang atau kode SKU..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
          </div>
        )}
      </div>

      {/* TAB 1: FINISHED GOODS */}
      {activeTab === 'FINISHED' && (
        <div className="space-y-3">
          {filteredFinished.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-3xl border border-slate-200">
              <Package className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-700">Belum ada barang di Gudang Stok</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredFinished.map((item) => (
                <div
                  key={item.itemId}
                  className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                          {item.sku}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700">
                          {item.category}
                        </span>
                      </div>
                      <h4 className="text-sm font-extrabold text-slate-900 mt-0.5">{item.name}</h4>
                      <p className="text-xs text-slate-500">Lokasi: {item.location}</p>
                    </div>

                    <div className="text-right">
                      <span className="text-base font-black text-purple-600 block">
                        {item.stockQuantity} {item.unit}
                      </span>
                      <span className="text-[11px] text-slate-400 font-semibold">Tersedia di Gudang</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[11px] text-slate-400 block">Harga Jual POS:</span>
                      <span className="font-bold text-slate-900">{formatRupiah(item.sellingPrice)}</span>
                    </div>
                    {canProduce && (
                      <button
                        onClick={() => setSelectedRecipeItem(item)}
                        className="inline-flex items-center gap-1 text-xs font-bold text-purple-600 hover:underline"
                      >
                        <Settings className="w-3.5 h-3.5" />
                        <span>Konfigurasi BOM</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: RAW MATERIALS */}
      {activeTab === 'RAW' && (
        <div className="space-y-3">
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-900 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Gudang Bahan Baku:</strong> Stok bahan baku mentah terisolasi secara ketat dan tidak dapat dijual di kasir POS. Stok hanya berkurang secara otomatis ketika proses produksi barang jadi dilakukan.
            </span>
          </div>

          {filteredRaw.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-3xl border border-slate-200">
              <Layers className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-700">Belum ada bahan mentah di Gudang Bahan Baku</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredRaw.map((raw) => (
                <div
                  key={raw.itemId}
                  className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                          {raw.sku}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                          Bahan Baku Mentah
                        </span>
                      </div>
                      <h4 className="text-sm font-extrabold text-slate-900 mt-0.5">{raw.name}</h4>
                      <p className="text-xs text-slate-500">Lokasi: {raw.location}</p>
                    </div>

                    <div className="text-right">
                      <span className="text-base font-black text-amber-600 block">
                        {raw.stockQuantity} {raw.unit}
                      </span>
                      <span className="text-[11px] text-slate-400 font-semibold">Tersedia Mentah</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[11px] text-slate-400 block">Harga Pokok (HPP):</span>
                      <span className="font-bold text-slate-700">{formatRupiah(raw.costPrice)} / {raw.unit}</span>
                    </div>
                    {canProduce && (
                      <button
                        onClick={() => setShowRestockModal(true)}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 shadow-xs"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Restock</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: RECIPES & BOM */}
      {activeTab === 'RECIPES' && (
        <div className="space-y-3">
          {finishedGoods.map((fg) => {
            const ingredients = fg.bomIngredients || [];
            return (
              <div
                key={fg.itemId}
                className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                      <ChefHat className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900">{fg.name}</h4>
                      <p className="text-xs text-slate-500">SKU: {fg.sku}</p>
                    </div>
                  </div>
                  {canProduce && (
                    <button
                      onClick={() => setSelectedRecipeItem(fg)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-purple-600 hover:bg-purple-50 transition"
                    >
                      <Settings className="w-3.5 h-3.5" />
                      <span>Edit Formula Resep</span>
                    </button>
                  )}
                </div>

                {/* Formula Text */}
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
                  <span className="font-bold text-slate-700 block mb-1">Formula BOM:</span>
                  <p className="text-slate-600 font-mono text-[11px]">
                    {fg.recipeBom || 'Belum ada formula resep BOM terkonfigurasi.'}
                  </p>
                </div>

                {/* Ingredients table */}
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-500 block">
                    Bahan Mentah yang Terpotong per 1 {fg.unit} Jadi:
                  </span>
                  {ingredients.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">Belum ada bahan baku dikaitkan.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {ingredients.map((ing, idx) => (
                        <div
                          key={idx}
                          className="p-2 rounded-xl bg-purple-50/50 border border-purple-100 flex justify-between items-center text-xs"
                        >
                          <span className="font-medium text-slate-800">{ing.rawItemName}</span>
                          <span className="font-bold text-purple-700">
                            {ing.quantityNeeded} {ing.unit}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 4: STOCK MUTATIONS */}
      {activeTab === 'MUTATIONS' && (
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-900 tracking-wide uppercase">
              Log Mutasi Stok Terakhir
            </h3>
            <span className="text-xs text-slate-400 font-semibold">
              {activeStockMutations.length} Mutasi
            </span>
          </div>

          <div className="space-y-2">
            {activeStockMutations.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-6 text-center">
                Belum ada pergerakan mutasi stok di divisi ini.
              </p>
            ) : (
              activeStockMutations.slice(0, 15).map((mut) => {
                const isPositive = mut.changeQty > 0;
                return (
                  <div
                    key={mut.mutationId}
                    className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                          isPositive ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                        }`}
                      >
                        {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 truncate">
                          {mut.itemName} ({mut.type})
                        </p>
                        <p className="text-[11px] text-slate-500">{mut.note}</p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span
                        className={`font-black text-xs block ${
                          isPositive ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {isPositive ? '+' : ''}{mut.changeQty}
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        Sisa: {mut.finalQty}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* DIALOGS */}
      <ProduceGoodsDialog
        isOpen={showProduceModal}
        onClose={() => setShowProduceModal(false)}
      />
      <RestockRawMaterialDialog
        isOpen={showRestockModal}
        onClose={() => setShowRestockModal(false)}
      />
      {selectedRecipeItem && (
        <ConfigureRecipeBomDialog
          isOpen={!!selectedRecipeItem}
          onClose={() => setSelectedRecipeItem(null)}
          item={selectedRecipeItem}
        />
      )}
    </div>
  );
};
