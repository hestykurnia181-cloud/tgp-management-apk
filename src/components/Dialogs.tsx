import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  ArrowDownToLine,
  ArrowRightLeft,
  Building2,
  Check,
  CheckCircle2,
  ChefHat,
  Crown,
  Factory,
  Layers,
  Lock,
  MapPin,
  Package,
  Phone,
  Plus,
  RefreshCw,
  Send,
  Shield,
  ShieldCheck,
  Store,
  Tag,
  Trash2,
  UserCheck,
  Users,
  X,
} from 'lucide-react';
import { useTgp } from '../context/TgpContext';
import { normalizeUserRole } from '../security/authorizationEngine';
import {
  BomIngredient,
  BusinessEntity,
  BusinessModule,
  BusinessModuleInfo,
  BusinessTemplate,
  BusinessTemplateInfo,
  ItemEntity,
  LedgerType,
  OutletEntity,
  StaffDepartment,
  UserPermissions,
  UserRole,
} from '../types';

export const CreateBusinessDialog: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const { createBusiness } = useTgp();
  const [name, setName] = useState('');
  const [template, setTemplate] = useState<BusinessTemplate>(BusinessTemplate.RETAIL);
  const [selectedModules, setSelectedModules] = useState<BusinessModule[]>([
    BusinessModule.POS,
    BusinessModule.INVENTORY,
    BusinessModule.FINANCE,
  ]);

  if (!isOpen) return null;

  const allModules = Object.values(BusinessModule);

  const handleTemplateChange = (tmpl: BusinessTemplate) => {
    setTemplate(tmpl);
    if (tmpl === BusinessTemplate.RETAIL) {
      setSelectedModules([BusinessModule.POS, BusinessModule.INVENTORY, BusinessModule.FINANCE, BusinessModule.TRANSFER, BusinessModule.REPORTS]);
    } else if (tmpl === BusinessTemplate.SERVICE) {
      setSelectedModules([BusinessModule.POS, BusinessModule.ATTENDANCE, BusinessModule.FINANCE, BusinessModule.REPORTS]);
    } else if (tmpl === BusinessTemplate.FNB) {
      setSelectedModules([BusinessModule.POS, BusinessModule.INVENTORY, BusinessModule.DAMAGED_GOODS, BusinessModule.TRANSFER, BusinessModule.FINANCE]);
    } else {
      setSelectedModules([...allModules]);
    }
  };

  const toggleModule = (mod: BusinessModule) => {
    if (selectedModules.includes(mod)) {
      if (selectedModules.length > 1) {
        setSelectedModules(selectedModules.filter((m) => m !== mod));
      }
    } else {
      setSelectedModules([...selectedModules, mod]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const success = createBusiness(name, template, selectedModules);
    if (success) {
      setName('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 my-8">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-extrabold text-slate-900">Tambah Business Baru</h3>
            <p className="text-xs text-slate-500">Konfigurasi template & modul bisnis terisolasi</p>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Nama Business</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Kopi Nusantara / Toko Maju"
              data-testid="input_business_name"
              required
              className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Pilih Template Bisnis</label>
            <div className="space-y-2">
              {Object.values(BusinessTemplate).map((tmpl) => {
                const info = BusinessTemplateInfo[tmpl];
                const isSelected = template === tmpl;
                return (
                  <div
                    key={tmpl}
                    onClick={() => handleTemplateChange(tmpl)}
                    className={`p-3 rounded-xl border cursor-pointer transition ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/70 text-blue-950 ring-1 ring-blue-600'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold">{info.displayName}</span>
                      {isSelected && <Check className="w-4 h-4 text-blue-600" />}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">{info.description}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700">Pilih Modul Aktif</label>
              <button
                type="button"
                onClick={() => {
                  if (selectedModules.length === allModules.length) {
                    setSelectedModules([BusinessModule.POS]);
                  } else {
                    setSelectedModules([...allModules]);
                  }
                }}
                className="text-[11px] font-bold text-blue-600 hover:underline"
              >
                {selectedModules.length === allModules.length ? 'Pilih 1' : 'Pilih Semua'}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
              {allModules.map((mod) => {
                const info = BusinessModuleInfo[mod];
                const isChecked = selectedModules.includes(mod);
                return (
                  <label
                    key={mod}
                    className={`flex items-start gap-2 p-2.5 rounded-xl border text-xs cursor-pointer transition ${
                      isChecked ? 'bg-blue-50/60 border-blue-300 text-blue-900 font-semibold' : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleModule(mod)}
                      className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
                    />
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{info.title}</p>
                      <p className="text-[10px] text-slate-400 line-clamp-1">{info.description}</p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Batal
            </button>
            <button
              type="submit"
              data-testid="btn_save_business"
              disabled={!name.trim() || selectedModules.length === 0}
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl shadow-xs"
            >
              Simpan Business
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const SwitchBusinessDialog: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const { authorizedBusinesses, activeBusinessId, setActiveBusiness, navigateTo } = useTgp();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
              <Store className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Pilih Business Aktif</h3>
              <p className="text-xs text-slate-500">Kunci konteks data & stok terisolasi</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 space-y-2 max-h-80 overflow-y-auto pr-1">
          {authorizedBusinesses.length === 0 ? (
            <p className="text-center py-6 text-xs text-slate-400">Belum ada business terdaftar.</p>
          ) : (
            authorizedBusinesses.map((b) => {
              const isSelected = b.businessId === activeBusinessId;
              return (
                <div
                  key={b.businessId}
                  onClick={() => {
                    setActiveBusiness(b.businessId);
                    navigateTo('BUSINESS_HOME');
                    onClose();
                  }}
                  data-testid={`item_business_${b.name.replace(/\s+/g, '_')}`}
                  className={`p-3.5 rounded-2xl border cursor-pointer flex items-center justify-between transition ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/80 ring-1 ring-blue-500 text-blue-950'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold ${
                        isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {b.name.slice(0, 1)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{b.name}</p>
                      <p className="text-[11px] text-slate-500">Template: {b.templateType} &bull; {b.activeModules.length} Modul</p>
                    </div>
                  </div>
                  {isSelected && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-600 text-white">
                      AKTIF
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

export const CreateTransferDialog: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const { authorizedBusinesses, activeBusinessId, activeItems, requestTransfer } = useTgp();
  const validDest = authorizedBusinesses.filter((b) => b.businessId !== activeBusinessId);
  const [destId, setDestId] = useState(validDest[0]?.businessId || '');
  const [itemId, setItemId] = useState(activeItems[0]?.itemId || '');
  const [qty, setQty] = useState('1');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const currentItem = activeItems.find((i) => i.itemId === itemId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeBusinessId || !destId || !itemId) return;
    const numQty = parseFloat(qty);
    if (isNaN(numQty) || numQty <= 0) return;
    const ok = requestTransfer(activeBusinessId, destId, itemId, numQty, notes);
    if (ok) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">Buat Permintaan Transfer</h3>
            <p className="text-xs text-slate-500">Hanya diizinkan antar business dalam 1 OWNER</p>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {validDest.length === 0 ? (
          <div className="py-6 text-center">
            <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
            <p className="text-xs text-slate-600">
              Anda memerlukan minimal 2 Business yang dimiliki OWNER untuk melakukan transfer barang.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Pilih Bisnis Tujuan</label>
              <select
                value={destId}
                onChange={(e) => setDestId(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {validDest.map((b) => (
                  <option key={b.businessId} value={b.businessId}>
                    {b.name} ({b.templateType})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Pilih Item dari Bisnis Asal</label>
              <select
                value={itemId}
                onChange={(e) => setItemId(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {activeItems.map((item) => (
                  <option key={item.itemId} value={item.itemId}>
                    {item.name} (Tersedia: {item.stockQuantity} {item.unit})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Jumlah Transfer</label>
              <input
                type="number"
                min="1"
                max={currentItem ? currentItem.stockQuantity : undefined}
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                required
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Catatan</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Alasan pemindahan / nomor surat jalan"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs"
              >
                Kirim Request Transfer
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export const AddItemDialog: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  isFnb?: boolean;
  initialType?: 'PRODUCT' | 'SERVICE' | 'RAW_MATERIAL' | 'MENU_DISH';
  initialLocation?: string;
}> = ({ isOpen, onClose, isFnb = false, initialType, initialLocation }) => {
  const { addItem } = useTgp();
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState('Makanan');
  const [type, setType] = useState<'PRODUCT' | 'SERVICE' | 'RAW_MATERIAL' | 'MENU_DISH'>(
    initialType || (isFnb ? 'MENU_DISH' : 'PRODUCT')
  );
  const [costPrice, setCostPrice] = useState('10000');
  const [sellingPrice, setSellingPrice] = useState('15000');
  const [stockQuantity, setStockQuantity] = useState('50');
  const [unit, setUnit] = useState('pcs');
  const [location, setLocation] = useState(
    initialLocation || (initialType === 'RAW_MATERIAL' ? 'Gudang Bahan Baku' : 'Gudang Stok')
  );
  const [recipeBom, setRecipeBom] = useState('');

  const handleTypeSelect = (selectedType: 'PRODUCT' | 'SERVICE' | 'RAW_MATERIAL' | 'MENU_DISH') => {
    setType(selectedType);
    if (selectedType === 'RAW_MATERIAL') {
      setLocation('Gudang Bahan Baku');
      setCategory('Bahan Baku');
      setUnit('kg');
    } else if (selectedType === 'MENU_DISH') {
      setLocation('Gudang Stok');
      setCategory('Menu Olahan');
      setUnit('porsi');
    } else {
      setLocation('Gudang Stok');
      setCategory('Produk Dagang');
      setUnit('pcs');
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const ok = addItem({
      name: name.trim(),
      sku: sku.trim() || `SKU-${Date.now().toString().slice(-6)}`,
      category: category.trim() || 'Umum',
      type,
      costPrice: parseFloat(costPrice) || 0,
      sellingPrice: type === 'RAW_MATERIAL' ? 0 : parseFloat(sellingPrice) || 0,
      stockQuantity: parseFloat(stockQuantity) || 0,
      unit: unit.trim() || 'pcs',
      location: location.trim() || (type === 'RAW_MATERIAL' ? 'Gudang Bahan Baku' : 'Gudang Stok'),
      recipeBom: (isFnb || type === 'MENU_DISH') && recipeBom.trim() ? recipeBom.trim() : null,
    });
    if (ok) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 my-8">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">
              {type === 'RAW_MATERIAL' ? 'Tambah Bahan Baku Mentah' : 'Tambah Item Baru'}
            </h3>
            <p className="text-xs text-slate-500">
              {type === 'RAW_MATERIAL'
                ? 'Penyimpanan Gudang Bahan Baku (Bahan Mentah Produksi)'
                : 'Penyimpanan Gudang Stok & Katalog Produk'}
            </p>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3 text-xs">
          {/* Item Type Selector */}
          <div>
            <label className="block font-bold text-slate-700 mb-1.5">Jenis Barang / Komoditas</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleTypeSelect('RAW_MATERIAL')}
                className={`p-2.5 rounded-xl border text-left transition ${
                  type === 'RAW_MATERIAL'
                    ? 'border-amber-500 bg-amber-50/80 text-amber-900 ring-2 ring-amber-500/20'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="font-extrabold text-[11px] flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-amber-600" />
                  <span>Bahan Baku Mentah</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">
                  Gudang Bahan Baku (tidak dijual di POS)
                </p>
              </button>
              <button
                type="button"
                onClick={() => handleTypeSelect('MENU_DISH')}
                className={`p-2.5 rounded-xl border text-left transition ${
                  type === 'MENU_DISH'
                    ? 'border-blue-500 bg-blue-50/80 text-blue-900 ring-2 ring-blue-500/20'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="font-extrabold text-[11px] flex items-center gap-1.5">
                  <ChefHat className="w-3.5 h-3.5 text-blue-600" />
                  <span>Bahan Jadi (BOM)</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">
                  Gudang Stok (dibuat dari resep BOM)
                </p>
              </button>
            </div>
          </div>

          {type === 'RAW_MATERIAL' && (
            <div className="p-2.5 bg-amber-50 border border-amber-200/80 rounded-xl text-[11px] text-amber-900">
              <strong>Gudang Bahan Baku:</strong> Item ini hanya untuk bahan mentah olahan produksi BOM. Stok tidak akan muncul di menu kasir POS dan penjualan tidak memotong stok bahan baku ini.
            </div>
          )}

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              {type === 'RAW_MATERIAL' ? 'Nama Bahan Mentah' : 'Nama Item / Produk'}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={type === 'RAW_MATERIAL' ? 'Contoh: Biji Kopi Robusta / Daging Ayam' : 'Contoh: Kopi Susu Aren / Nasi Goreng'}
              required
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-bold text-slate-700 mb-1">SKU / Barcode</label>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="Auto-generate jika kosong"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Kategori</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Harga Beli / Modal (HPP)</label>
              <input
                type="number"
                value={costPrice}
                onChange={(e) => setCostPrice(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {type === 'RAW_MATERIAL' ? 'Harga Jual (Non-aktif)' : 'Harga Jual'}
              </label>
              <input
                type="number"
                disabled={type === 'RAW_MATERIAL'}
                value={type === 'RAW_MATERIAL' ? '0' : sellingPrice}
                onChange={(e) => setSellingPrice(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100 disabled:text-slate-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Stok Awal</label>
              <input
                type="number"
                value={stockQuantity}
                onChange={(e) => setStockQuantity(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Satuan</label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="kg / gr / liter / ml / pcs"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Lokasi Penyimpanan</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Gudang Bahan Baku / Gudang Stok"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {type === 'MENU_DISH' && (
            <div>
              <label className="block font-bold text-slate-700 mb-1">Resep / BOM (Catatan Komposisi)</label>
              <input
                type="text"
                value={recipeBom}
                onChange={(e) => setRecipeBom(e.target.value)}
                placeholder="Contoh: Kopi Robusta 18gr, Susu Cair 120ml"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Batal
            </button>
            <button
              type="submit"
              data-testid="btn_save_item"
              className="px-5 py-2 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs"
            >
              Simpan Item
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const AddUserDialog: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  targetRole?: UserRole;
  businessId?: string;
}> = ({ isOpen, onClose, targetRole, businessId }) => {
  const {
    currentSession,
    createOwner,
    createAdminOwner,
    createStaff,
    authorizedBusinesses,
    outlets,
  } = useTgp();

  const actorRole = currentSession?.user ? normalizeUserRole(currentSession.user.role) : null;
  const isMaster = actorRole === UserRole.MASTER;
  const isOwner = actorRole === UserRole.OWNER;

  const computeDefaultRole = (): UserRole => {
    if (targetRole) return targetRole;
    if (isMaster) return UserRole.OWNER;
    if (isOwner) return UserRole.ADMIN_OWNER;
    return UserRole.STAFF;
  };

  const [selectedRole, setSelectedRole] = useState<UserRole>(computeDefaultRole);
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [selectedBizIds, setSelectedBizIds] = useState<string[]>(
    businessId ? [businessId] : (authorizedBusinesses[0] ? [authorizedBusinesses[0].businessId] : [])
  );
  const [department, setDepartment] = useState<StaffDepartment>('OPERASIONAL_UMUM');

  const [canManageRaw, setCanManageRaw] = useState(false);
  const [canManageFinished, setCanManageFinished] = useState(true);
  const [canProduce, setCanProduce] = useState(false);
  const [canTransferStan, setCanTransferStan] = useState(false);
  const [canViewFinance, setCanViewFinance] = useState(false);
  const [canViewCostPrice, setCanViewCostPrice] = useState(true);

  useEffect(() => {
    if (isOpen) {
      const initialRole = targetRole
        ? targetRole
        : isMaster
        ? UserRole.OWNER
        : isOwner
        ? UserRole.ADMIN_OWNER
        : UserRole.STAFF;
      setSelectedRole(initialRole);
      setUsername('');
      setFullName('');
      setPassword('');
      setSelectedBizIds(
        businessId ? [businessId] : (authorizedBusinesses[0] ? [authorizedBusinesses[0].businessId] : [])
      );
    }
  }, [isOpen, targetRole, isMaster, isOwner, businessId, authorizedBusinesses]);

  const isCreatingOwner = selectedRole === UserRole.OWNER;
  const activeTargetBizId = businessId || selectedBizIds[0] || '';
  const targetBiz = authorizedBusinesses.find((b) => b.businessId === activeTargetBizId);
  const hasStanModule = targetBiz?.activeModules.includes(BusinessModule.STAN_OUTLET);
  const bizOutlets = outlets.filter((o) => o.businessId === activeTargetBizId && o.status === 'ACTIVE');
  const [selectedOutletId, setSelectedOutletId] = useState<string>(bizOutlets[0]?.outletId || '');

  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role);
    if (role === UserRole.KASIR) {
      setDepartment('KASIR_STAN');
      setCanManageRaw(false);
      setCanManageFinished(false);
      setCanProduce(false);
      setCanTransferStan(false);
      setCanViewFinance(false);
      setCanViewCostPrice(false);
    } else if (role === UserRole.WAREHOUSE) {
      setDepartment('GUDANG_STOK');
      setCanManageRaw(true);
      setCanManageFinished(true);
      setCanProduce(true);
      setCanTransferStan(true);
      setCanViewFinance(false);
      setCanViewCostPrice(true);
    } else if (role === UserRole.MANAGER) {
      setDepartment('OPERASIONAL_UMUM');
      setCanManageRaw(false);
      setCanManageFinished(true);
      setCanProduce(false);
      setCanTransferStan(true);
      setCanViewFinance(false);
      setCanViewCostPrice(true);
    } else if (role === UserRole.ADMIN_DIVISI) {
      setDepartment('OPERASIONAL_UMUM');
      setCanManageRaw(true);
      setCanManageFinished(true);
      setCanProduce(true);
      setCanTransferStan(true);
      setCanViewFinance(true);
      setCanViewCostPrice(true);
    } else if (role === UserRole.ADMIN_OWNER) {
      setDepartment('OPERASIONAL_UMUM');
      setCanManageRaw(true);
      setCanManageFinished(true);
      setCanProduce(true);
      setCanTransferStan(true);
      setCanViewFinance(false);
      setCanViewCostPrice(true);
    } else {
      setDepartment('OPERASIONAL_UMUM');
      setCanManageRaw(false);
      setCanManageFinished(true);
      setCanProduce(false);
      setCanTransferStan(false);
      setCanViewFinance(false);
      setCanViewCostPrice(true);
    }
  };

  const handleDepartmentChange = (dept: StaffDepartment) => {
    setDepartment(dept);
    if (dept === 'GUDANG_BAHAN_BAKU') {
      setCanManageRaw(true);
      setCanManageFinished(false);
      setCanProduce(false);
      setCanTransferStan(false);
    } else if (dept === 'GUDANG_STOK') {
      setCanManageRaw(false);
      setCanManageFinished(true);
      setCanProduce(true);
      setCanTransferStan(true);
    } else if (dept === 'PRODUKSI') {
      setCanManageRaw(true);
      setCanManageFinished(true);
      setCanProduce(true);
      setCanTransferStan(false);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !fullName.trim() || password.length < 6) return;
    let ok = false;

    if (selectedRole === UserRole.OWNER) {
      ok = createOwner(username, password, fullName);
    } else if (
      isOwner ||
      selectedRole === UserRole.ADMIN_OWNER ||
      selectedRole === UserRole.ADMIN_DIVISI
    ) {
      const bizIdsToAssign =
        selectedBizIds.length > 0
          ? selectedBizIds
          : activeTargetBizId
          ? [activeTargetBizId]
          : authorizedBusinesses[0]
          ? [authorizedBusinesses[0].businessId]
          : [];
      ok = createAdminOwner(
        username,
        password,
        fullName,
        bizIdsToAssign,
        selectedRole,
        {
          canManageRawWarehouse: canManageRaw,
          canManageFinishedWarehouse: canManageFinished,
          canProduceGoods: canProduce,
          canTransferToStan: canTransferStan,
          canViewFinance: selectedRole === UserRole.ADMIN_DIVISI ? canViewFinance : false,
          canViewCostPrice: canViewCostPrice,
        }
      );
    } else if (activeTargetBizId) {
      const perms: UserPermissions = {
        canManageRawWarehouse: canManageRaw,
        canManageFinishedWarehouse: canManageFinished,
        canProduceGoods: canProduce,
        canTransferToStan: canTransferStan,
        canViewFinance: selectedRole === UserRole.KASIR || selectedRole === UserRole.WAREHOUSE ? false : canViewFinance,
        canViewCostPrice: selectedRole === UserRole.KASIR ? false : canViewCostPrice,
      };
      ok = createStaff(
        activeTargetBizId,
        username,
        password,
        fullName,
        selectedRole,
        selectedRole === UserRole.KASIR && hasStanModule ? selectedOutletId || null : null,
        department,
        perms
      );
    }

    if (ok) {
      setUsername('');
      setFullName('');
      setPassword('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 my-8">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${
                isCreatingOwner
                  ? 'bg-purple-100 text-purple-700'
                  : isOwner
                  ? 'bg-blue-50 text-blue-600'
                  : 'bg-indigo-50 text-indigo-600'
              }`}
            >
              {isCreatingOwner ? (
                <Crown className="w-5 h-5" />
              ) : isOwner ? (
                <ShieldCheck className="w-5 h-5" />
              ) : (
                <Users className="w-5 h-5" />
              )}
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                {isCreatingOwner
                  ? 'Buat Akun OWNER Baru'
                  : isOwner
                  ? 'Delegasi Akun ADMIN'
                  : `Tambah Karyawan (${selectedRole})`}
              </h3>
              <p className="text-xs text-slate-500">
                {isCreatingOwner
                  ? 'Pendaftaran akun pemilik bisnis (tenant) pada platform TGP'
                  : isOwner
                  ? 'Pembuatan akun ADMIN OWNER / ADMIN DIVISI'
                  : 'Pemberian tugas & hak akses operasional'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {isCreatingOwner && (
          <div className="mt-3 p-3 bg-purple-50 border border-purple-200 rounded-2xl text-[11px] text-purple-950 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-purple-800">
              <Crown className="w-4 h-4 text-purple-600 shrink-0" />
              <span>Hierarki Hak Akses Pemilik (OWNER)</span>
            </div>
            <p className="text-purple-800 leading-relaxed">
              Akun <strong>OWNER</strong> memiliki kendali tertinggi atas seluruh unit bisnis yang dibangunnya (Business Builder), laporan laba bersih, persetujuan mutasi stok & write-off barang rusak, serta wewenang menunjuk <strong>ADMIN OWNER</strong> dan <strong>ADMIN DIVISI</strong>.
            </p>
          </div>
        )}

        {isOwner && !isCreatingOwner && (
          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-2xl text-[11px] text-blue-900 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-blue-800">
              <Shield className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Hierarki Hak Akses OWNER</span>
            </div>
            <p className="text-blue-700">
              Akun <strong>OWNER</strong> mendelegasikan wewenang dengan membuat akun <strong>ADMIN OWNER</strong> atau <strong>ADMIN DIVISI</strong>. Pembuatan staf operasional (MANAGER, KASIR, WAREHOUSE, STAFF) dikelola oleh Admin masing-masing.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
          {isOwner && !isCreatingOwner && (
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">Pilih Tingkat Admin</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { r: UserRole.ADMIN_OWNER, label: 'ADMIN OWNER', desc: 'Operasional multi-bisnis' },
                  { r: UserRole.ADMIN_DIVISI, label: 'ADMIN DIVISI', desc: '1 divisi terisolasi' },
                ].map(({ r, label, desc }) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => handleRoleChange(r)}
                    className={`p-2.5 rounded-xl border text-left transition ${
                      selectedRole === r
                        ? 'border-blue-600 bg-blue-50/80 text-blue-700 font-extrabold shadow-2xs'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="font-bold text-xs">{label}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {!isOwner && !isCreatingOwner && (
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">Pilih Peran Karyawan (Role)</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { r: UserRole.MANAGER, label: 'MANAGER', desc: 'Pengawas operasional' },
                  { r: UserRole.KASIR, label: 'KASIR', desc: 'POS & Transaksi' },
                  { r: UserRole.WAREHOUSE, label: 'WAREHOUSE', desc: 'Gudang & Mutasi' },
                  { r: UserRole.STAFF, label: 'STAFF', desc: 'Operasional umum' },
                ].map(({ r, label, desc }) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => handleRoleChange(r)}
                    className={`p-2 rounded-xl border text-left transition ${
                      selectedRole === r
                        ? 'border-blue-600 bg-blue-50/80 text-blue-700 font-extrabold shadow-2xs'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="font-bold">{label}</div>
                    <div className="text-[10px] text-slate-500">{desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {!isOwner && !isCreatingOwner && selectedRole === UserRole.STAFF && (
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
              <label className="block font-bold text-slate-800">
                Divisi / Penugasan Gudang & Produksi
              </label>
              <select
                value={department}
                onChange={(e) => handleDepartmentChange(e.target.value as StaffDepartment)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500"
              >
                <option value="GUDANG_BAHAN_BAKU">Gudang Bahan Baku (Inbound & Stok Mentah)</option>
                <option value="GUDANG_STOK">Gudang Stok (Bahan Jadi & Suplai STAN)</option>
                <option value="PRODUKSI">Divisi Produksi (Olah Bahan Mentah via BOM)</option>
                <option value="OPERASIONAL_UMUM">Operasional Umum</option>
              </select>
              <p className="text-[10px] text-slate-500 italic">
                {department === 'GUDANG_BAHAN_BAKU' &&
                  '  Menyimpan bahan mentah. Tidak terpengaruh dan tidak dijual di stok kasir.'}
                {department === 'GUDANG_STOK' &&
                  '  Menyimpan bahan jadi hasil produksi resep BOM. Siap transfer ke STAN.'}
                {department === 'PRODUKSI' &&
                  '  Bertugas memproduksi bahan jadi dari resep BOM yang otomatis memotong stok bahan mentah.'}
              </p>
            </div>
          )}

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              {isCreatingOwner ? 'Username Akun OWNER' : 'Username Akun'}
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={
                isCreatingOwner
                  ? 'Contoh: owner_jaya'
                  : isOwner
                  ? 'Contoh: admin_bunga'
                  : 'Contoh: kasir_stan_a1'
              }
              required
              data-testid="input_user_username"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              {isCreatingOwner ? 'Nama Lengkap Pemilik (Owner)' : 'Nama Lengkap Petugas'}
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder={isCreatingOwner ? 'Contoh: H. Budi Santoso' : 'Contoh: Rian Pratama'}
              required
              data-testid="input_user_fullname"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Password (Min. 6 Karakter)</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              data-testid="input_user_password"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {!isOwner && !isCreatingOwner && selectedRole === UserRole.KASIR && hasStanModule && (
            <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-2xl space-y-2">
              <div className="flex items-center gap-2">
                <Store className="w-4 h-4 text-amber-700 shrink-0" />
                <label className="block font-bold text-amber-950">
                  Tugaskan Langsung ke STAN / Cabang (Wajib)
                </label>
              </div>
              <p className="text-[11px] text-amber-800">
                Bisnis ini menggunakan modul STAN/Outlet. Kasir akan langsung ditugaskan melayani transaksi STAN yang dipilih. Penjualan hanya memotong stok jual STAN tersebut.
              </p>
              {bizOutlets.length === 0 ? (
                <div className="text-[11px] text-rose-600 font-semibold mt-1">
                  Belum ada STAN/Outlet terdaftar di unit bisnis ini. Buat STAN terlebih dahulu di modul STAN/Outlet.
                </div>
              ) : (
                <select
                  value={selectedOutletId}
                  onChange={(e) => setSelectedOutletId(e.target.value)}
                  required
                  className="w-full mt-1 px-3 py-2 border border-amber-300 bg-white rounded-xl text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="">-- Pilih STAN/Outlet Penugasan --</option>
                  {bizOutlets.map((o) => (
                    <option key={o.outletId} value={o.outletId}>
                      {o.name} ({o.code}) - {o.location}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          {!isCreatingOwner && (isOwner || selectedRole === UserRole.ADMIN_OWNER || selectedRole === UserRole.ADMIN_DIVISI) && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <label className="block font-bold text-slate-700">Tugaskan Kelola Unit Bisnis</label>
              <div className="space-y-1.5 max-h-32 overflow-y-auto">
                {authorizedBusinesses.map((b) => (
                  <label
                    key={b.businessId}
                    className="flex items-center gap-2 p-2 rounded-xl bg-white border border-slate-200 text-xs cursor-pointer hover:border-blue-400"
                  >
                    <input
                      type="checkbox"
                      checked={selectedBizIds.includes(b.businessId)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedBizIds([...selectedBizIds, b.businessId]);
                        } else {
                          setSelectedBizIds(selectedBizIds.filter((id) => id !== b.businessId));
                        }
                      }}
                      className="rounded text-blue-600"
                    />
                    <span className="font-semibold text-slate-800">{b.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {!isCreatingOwner && selectedRole !== UserRole.KASIR && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <label className="block font-bold text-slate-800">
                Hak Akses & Otorisasi Gudang / Sistem
              </label>
              <div className="space-y-1.5">
                <label className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-100 text-[11px] cursor-pointer">
                  <span className="text-slate-700 font-medium">Akses Gudang Bahan Baku (Bahan Mentah)</span>
                  <input
                    type="checkbox"
                    checked={canManageRaw}
                    onChange={(e) => setCanManageRaw(e.target.checked)}
                    className="rounded text-blue-600"
                  />
                </label>
                <label className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-100 text-[11px] cursor-pointer">
                  <span className="text-slate-700 font-medium">Akses Gudang Stok (Bahan Jadi Siap Jual)</span>
                  <input
                    type="checkbox"
                    checked={canManageFinished}
                    onChange={(e) => setCanManageFinished(e.target.checked)}
                    className="rounded text-blue-600"
                  />
                </label>
                <label className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-100 text-[11px] cursor-pointer">
                  <span className="text-slate-700 font-medium">Eksekusi Produksi Resep BOM (+ Bahan Jadi)</span>
                  <input
                    type="checkbox"
                    checked={canProduce}
                    onChange={(e) => setCanProduce(e.target.checked)}
                    className="rounded text-blue-600"
                  />
                </label>
                <label className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-100 text-[11px] cursor-pointer">
                  <span className="text-slate-700 font-medium">Transfer Pasokan Bahan Jadi ke STAN</span>
                  <input
                    type="checkbox"
                    checked={canTransferStan}
                    onChange={(e) => setCanTransferStan(e.target.checked)}
                    className="rounded text-blue-600"
                  />
                </label>
                <label className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-100 text-[11px] cursor-pointer">
                  <span className="text-slate-700 font-medium">Akses Laporan Keuangan & Buku Kas</span>
                  <input
                    type="checkbox"
                    checked={canViewFinance}
                    onChange={(e) => setCanViewFinance(e.target.checked)}
                    className="rounded text-blue-600"
                  />
                </label>
                <label className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-100 text-[11px] cursor-pointer">
                  <span className="text-slate-700 font-medium">Lihat Harga Pokok Penjualan (HPP)</span>
                  <input
                    type="checkbox"
                    checked={canViewCostPrice}
                    onChange={(e) => setCanViewCostPrice(e.target.checked)}
                    className="rounded text-blue-600"
                  />
                </label>
              </div>
            </div>
          )}

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Batal
            </button>
            <button
              type="submit"
              data-testid="btn_save_user"
              disabled={
                !username.trim() ||
                !fullName.trim() ||
                password.length < 6 ||
                (!isCreatingOwner &&
                  !isOwner &&
                  selectedRole === UserRole.KASIR &&
                  hasStanModule &&
                  (!selectedOutletId || bizOutlets.length === 0)) ||
                (!isCreatingOwner &&
                  (isOwner || selectedRole === UserRole.ADMIN_OWNER || selectedRole === UserRole.ADMIN_DIVISI) &&
                  selectedBizIds.length === 0)
              }
              className={`px-5 py-2 font-bold text-white rounded-xl shadow-xs transition disabled:opacity-50 ${
                isCreatingOwner
                  ? 'bg-purple-600 hover:bg-purple-700'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isCreatingOwner
                ? 'Simpan Akun OWNER'
                : isOwner
                ? 'Buat Akun ADMIN'
                : `Simpan Akun ${selectedRole}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const CreateOutletDialog: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const { createOutlet, activeBusiness, activeOutlets } = useTgp();
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [location, setLocation] = useState('');
  const [phone, setPhone] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const ok = createOutlet(name, code, location, phone);
    if (ok) {
      setName('');
      setCode('');
      setLocation('');
      setPhone('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Tambah STAN / Outlet Baru</h3>
              <p className="text-xs text-slate-500">Cabang penjualan {activeBusiness?.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Nama STAN / Cabang</label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (!code) {
                  setCode(e.target.value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 4).toUpperCase() + '-' + (activeOutlets.length + 1));
                }
              }}
              placeholder="Contoh: STAN Food Court A, Stand Mall B"
              required
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Kode STAN</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Contoh: ST-01"
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm font-mono uppercase"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">No. HP / Telepon (Opsional)</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0812-xxxx-xxxx"
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Alamat / Titik Lokasi</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Contoh: Lantai LG Blok A No. 12, Mall Artha Gading"
              required
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
            />
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-[11px] text-slate-600 leading-relaxed">
            STAN/Outlet yang ditambahkan akan memiliki gudang stok jual mandiri, laporan omzet terpisah, dan kasir yang ditugaskan khusus.
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="px-5 py-2.5 font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs"
            >
              Simpan STAN
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const SupplyStanStockDialog: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  defaultOutletId?: string;
  defaultItemId?: string;
}> = ({ isOpen, onClose, defaultOutletId, defaultItemId }) => {
  const { activeOutlets, activeItems, transferStockToStan } = useTgp();
  const transferrableItems = activeItems.filter(
    (i) => i.type !== 'RAW_MATERIAL' && i.type !== 'SERVICE'
  );
  const [outletId, setOutletId] = useState(defaultOutletId || activeOutlets[0]?.outletId || '');
  const [itemId, setItemId] = useState(defaultItemId || transferrableItems[0]?.itemId || '');
  const [quantity, setQuantity] = useState('10');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const currentItem = transferrableItems.find((i) => i.itemId === itemId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!outletId || !itemId) return;
    const num = parseFloat(quantity);
    if (isNaN(num) || num <= 0) return;
    const ok = transferStockToStan(outletId, itemId, num, notes);
    if (ok) {
      setNotes('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Pasok Stok ke STAN</h3>
              <p className="text-xs text-slate-500">Transfer dari Gudang Produksi ke Gudang Jual STAN</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {activeOutlets.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-500">
            Belum ada STAN yang terdaftar. Tambahkan STAN terlebih dahulu.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Pilih STAN Tujuan</label>
              <select
                value={outletId}
                onChange={(e) => setOutletId(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              >
                {activeOutlets.map((o) => (
                  <option key={o.outletId} value={o.outletId}>
                    {o.name} ({o.code}) - {o.location}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Pilih Produk Bahan Jadi (Gudang Stok)</label>
              <select
                value={itemId}
                onChange={(e) => setItemId(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-semibold"
              >
                {transferrableItems.map((item) => (
                  <option key={item.itemId} value={item.itemId}>
                    {item.name} (Tersedia di Gudang Stok: {item.stockQuantity} {item.unit})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold text-slate-700">Jumlah Pasokan</label>
                {currentItem && (
                  <span className="text-[11px] text-slate-500">
                    Maksimal: {currentItem.stockQuantity} {currentItem.unit}
                  </span>
                )}
              </div>
              <input
                type="number"
                min="1"
                max={currentItem ? currentItem.stockQuantity : undefined}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-semibold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Catatan Pengiriman (Opsional)</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Contoh: Pengiriman pagi, batch #12"
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={!currentItem || currentItem.stockQuantity <= 0}
                className="px-5 py-2.5 font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-xl shadow-xs"
              >
                Kirim Pasokan Stok
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export const ReturnStanStockDialog: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  outlet: OutletEntity | null;
}> = ({ isOpen, onClose, outlet }) => {
  const { activeOutletStocks, returnStockFromStan } = useTgp();
  const stanStocks = outlet ? activeOutletStocks.filter((os) => os.outletId === outlet.outletId) : [];
  const [itemId, setItemId] = useState(stanStocks[0]?.itemId || '');
  const [quantity, setQuantity] = useState('1');
  const [notes, setNotes] = useState('');

  if (!isOpen || !outlet) return null;

  const currentStock = stanStocks.find((s) => s.itemId === itemId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemId) return;
    const num = parseFloat(quantity);
    if (isNaN(num) || num <= 0) return;
    const ok = returnStockFromStan(outlet.outletId, itemId, num, notes);
    if (ok) {
      setNotes('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Retur Stok ke Produksi</h3>
              <p className="text-xs text-slate-500">Dari {outlet.name} kembali ke Gudang Produksi</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {stanStocks.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-500">
            STAN ini belum memiliki stok jual.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Pilih Item di STAN</label>
              <select
                value={itemId}
                onChange={(e) => setItemId(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
              >
                {stanStocks.map((stk) => (
                  <option key={stk.itemId} value={stk.itemId}>
                    {stk.itemName} (Stok STAN: {stk.stockQuantity} {stk.unit})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold text-slate-700">Jumlah Retur</label>
                {currentStock && (
                  <span className="text-[11px] text-slate-500">
                    Maksimal: {currentStock.stockQuantity} {currentStock.unit}
                  </span>
                )}
              </div>
              <input
                type="number"
                min="1"
                max={currentStock ? currentStock.stockQuantity : undefined}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm font-semibold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Alasan Retur (Opsional)</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Contoh: Sisa tutup stand, recall batch"
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={!currentStock || currentStock.stockQuantity <= 0}
                className="px-5 py-2.5 font-bold text-white bg-orange-600 hover:bg-orange-700 disabled:opacity-50 rounded-xl shadow-xs"
              >
                Proses Retur Stok
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export const ProduceGoodsDialog: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  businessId: string;
  preselectedItemId?: string;
  onOpenRecipeModal?: (itemId: string) => void;
}> = ({ isOpen, onClose, businessId, preselectedItemId, onOpenRecipeModal }) => {
  const { activeItems, produceFinishedGoods } = useTgp();
  const finishedGoods = activeItems.filter(
    (i) => i.businessId === businessId && (i.type === 'MENU_DISH' || i.type === 'PRODUCT')
  );
  const rawMaterials = activeItems.filter(
    (i) => i.businessId === businessId && i.type === 'RAW_MATERIAL'
  );
  const [selectedItemId, setSelectedItemId] = useState<string>(
    preselectedItemId || finishedGoods[0]?.itemId || ''
  );
  const [quantity, setQuantity] = useState<string>('10');
  const [notes, setNotes] = useState<string>('');

  if (!isOpen) return null;

  const currentItem = finishedGoods.find((i) => i.itemId === selectedItemId);
  const ingredients = currentItem?.bomIngredients || [];
  const prodQty = parseFloat(quantity) || 0;

  const ingredientStatus = ingredients.map((ing) => {
    const raw = rawMaterials.find((r) => r.itemId === ing.rawItemId);
    const requiredTotal = ing.quantityNeeded * prodQty;
    const available = raw ? raw.stockQuantity : 0;
    const isSufficient = available >= requiredTotal;
    return {
      ...ing,
      rawItemName: raw?.name || ing.rawItemName,
      unit: raw?.unit || ing.unit,
      requiredTotal,
      available,
      isSufficient,
    };
  });

  const hasShortage = ingredientStatus.some((s) => !s.isSufficient);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemId || prodQty <= 0 || hasShortage) return;
    const ok = produceFinishedGoods(selectedItemId, prodQty, notes);
    if (ok) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 my-8">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Factory className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Produksi Bahan Jadi (BOM)</h3>
              <p className="text-xs text-slate-500">
                Olah bahan mentah Gudang Baku menjadi bahan siap jual Gudang Stok
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {finishedGoods.length === 0 ? (
          <div className="py-8 text-center text-slate-500">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold">Belum ada item bahan jadi / menu olahan.</p>
            <p className="text-xs text-slate-400 mt-1">
              Tambahkan item bertipe Bahan Jadi / Menu di Gudang Stok terlebih dahulu.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
            <div className="p-3 bg-indigo-50/70 border border-indigo-200/80 rounded-2xl text-[11px] text-indigo-900">
              <strong>Otomatisasi Resep BOM:</strong> Menambahkan stok bahan jadi ke{' '}
              <strong>Gudang Stok</strong> akan secara otomatis memotong stok bahan mentah terkait di{' '}
              <strong>Gudang Bahan Baku</strong> sesuai komposisi resep.
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Pilih Produk Bahan Jadi yang Diproduksi
              </label>
              <select
                value={selectedItemId}
                onChange={(e) => setSelectedItemId(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 font-semibold text-slate-800 text-sm"
              >
                {finishedGoods.map((item) => (
                  <option key={item.itemId} value={item.itemId}>
                    {item.name} ({item.unit}) &bull; Stok Saat Ini: {item.stockQuantity} {item.unit}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Jumlah Porsi / Unit Produksi ({currentItem?.unit || 'unit'})
              </label>
              <input
                type="number"
                min="1"
                step="any"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 font-extrabold text-slate-900 text-base"
              />
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <div className="font-bold text-slate-800 flex items-center gap-1.5">
                  <ChefHat className="w-4 h-4 text-indigo-600" />
                  <span>Kebutuhan Bahan Mentah (BOM Breakdown)</span>
                </div>
                {onOpenRecipeModal && currentItem && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenRecipeModal(currentItem.itemId);
                    }}
                    className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 underline"
                  >
                    Atur Resep BOM
                  </button>
                )}
              </div>

              {ingredients.length === 0 ? (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800">
                  <div className="font-bold flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Resep BOM Belum Dikonfigurasi</span>
                  </div>
                  <p className="mt-1 text-[11px]">
                    Item '{currentItem?.name}' belum memiliki takaran bahan baku. Silakan klik tombol{' '}
                    <strong>"Atur Resep BOM"</strong> untuk memetakan bahan mentahnya.
                  </p>
                </div>
              ) : (
                <div className="space-y-1.5 mt-1">
                  {ingredientStatus.map((ing) => (
                    <div
                      key={ing.rawItemId}
                      className={`p-2.5 rounded-xl border flex items-center justify-between text-[11px] ${
                        ing.isSufficient
                          ? 'bg-white border-slate-200 text-slate-700'
                          : 'bg-rose-50/80 border-rose-200 text-rose-800'
                      }`}
                    >
                      <div>
                        <span className="font-bold text-slate-900">{ing.rawItemName}</span>
                        <div className="text-[10px] text-slate-500">
                          Takaran: {ing.quantityNeeded} {ing.unit}/porsi &bull; x {prodQty} ={' '}
                          <span className="font-bold text-slate-800">
                            {ing.requiredTotal} {ing.unit}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] text-slate-500">
                          Stok Gudang: <span className="font-bold">{ing.available} {ing.unit}</span>
                        </div>
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                            ing.isSufficient
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {ing.isSufficient ? (
                            <>
                              <Check className="w-3 h-3" /> Cukup
                            </>
                          ) : (
                            <>
                              <X className="w-3 h-3" /> Kurang {ing.requiredTotal - ing.available} {ing.unit}
                            </>
                          )}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Catatan Produksi / No. Batch (Opsional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Contoh: Batch Pagi Shift 1 / Chef Dimas"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {hasShortage && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 font-semibold text-[11px] flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Stok bahan mentah tidak mencukupi untuk memproduksi kuantitas ini.</span>
              </div>
            )}

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={prodQty <= 0 || ingredients.length === 0 || hasShortage}
                className="px-5 py-2.5 font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl shadow-xs flex items-center gap-1.5"
              >
                <Factory className="w-4 h-4" />
                <span>Eksekusi Produksi Bahan Jadi</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export const RestockRawMaterialDialog: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  businessId: string;
  preselectedRawId?: string;
  onOpenCreateItemModal?: () => void;
}> = ({ isOpen, onClose, businessId, preselectedRawId, onOpenCreateItemModal }) => {
  const { activeItems, restockRawMaterial } = useTgp();
  const rawMaterials = activeItems.filter(
    (i) => i.businessId === businessId && i.type === 'RAW_MATERIAL'
  );
  const [selectedRawId, setSelectedRawId] = useState<string>(
    preselectedRawId || rawMaterials[0]?.itemId || ''
  );
  const [quantity, setQuantity] = useState<string>('50');
  const [unitCost, setUnitCost] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  if (!isOpen) return null;

  const currentRaw = rawMaterials.find((r) => r.itemId === selectedRawId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseFloat(quantity) || 0;
    if (!selectedRawId || qty <= 0) return;
    const cost = unitCost ? parseFloat(unitCost) : undefined;
    const ok = restockRawMaterial(selectedRawId, qty, cost, notes);
    if (ok) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 my-8">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <ArrowDownToLine className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Masuk Bahan Mentah (Restock)</h3>
              <p className="text-xs text-slate-500">Inbound pasokan ke Gudang Bahan Baku</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {rawMaterials.length === 0 ? (
          <div className="py-8 text-center text-slate-500">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold">Belum ada item bahan baku terdaftar.</p>
            <p className="text-xs text-slate-400 mt-1 mb-4">
              Buat item Bahan Baku Mentah terlebih dahulu di katalog Gudang Bahan Baku.
            </p>
            {onOpenCreateItemModal && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenCreateItemModal();
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs"
              >
                + Tambah Bahan Mentah Baru
              </button>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
            <div className="p-3 bg-amber-50 border border-amber-200/80 rounded-2xl text-[11px] text-amber-900">
              <strong>Gudang Bahan Baku:</strong> Penerimaan bahan mentah ini tersimpan di Gudang Bahan Baku untuk bahan olahan resep BOM. Tidak terpengaruh dan tidak dijual di stok kasir POS.
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Pilih Bahan Mentah
              </label>
              <select
                value={selectedRawId}
                onChange={(e) => {
                  setSelectedRawId(e.target.value);
                  const found = rawMaterials.find((r) => r.itemId === e.target.value);
                  if (found) setUnitCost(found.costPrice.toString());
                }}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 font-semibold text-slate-800 text-sm"
              >
                {rawMaterials.map((r) => (
                  <option key={r.itemId} value={r.itemId}>
                    {r.name} ({r.unit}) &bull; Stok Saat Ini: {r.stockQuantity} {r.unit}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Jumlah Masuk ({currentRaw?.unit || 'unit'})
                </label>
                <input
                  type="number"
                  min="0.01"
                  step="any"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 font-bold text-slate-900 text-sm"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Harga Beli / Satuan (HPP)
                </label>
                <input
                  type="number"
                  min="0"
                  value={unitCost}
                  onChange={(e) => setUnitCost(e.target.value)}
                  placeholder={currentRaw ? currentRaw.costPrice.toString() : 'Rp'}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 font-semibold text-slate-900 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                No. Faktur Supplier / Catatan Pembelian
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Contoh: Faktur Supplier Kopi Makmur #994"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={!selectedRawId || (parseFloat(quantity) || 0) <= 0}
                className="px-5 py-2.5 font-bold text-white bg-amber-600 hover:bg-amber-700 disabled:opacity-50 rounded-xl shadow-xs flex items-center gap-1.5"
              >
                <ArrowDownToLine className="w-4 h-4" />
                <span>Simpan Stok Masuk</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export const ConfigureRecipeBomDialog: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  businessId: string;
  itemId: string;
}> = ({ isOpen, onClose, businessId, itemId }) => {
  const { activeItems, updateItemRecipe } = useTgp();
  const targetItem = activeItems.find((i) => i.itemId === itemId && i.businessId === businessId);
  const rawMaterials = activeItems.filter(
    (i) => i.businessId === businessId && i.type === 'RAW_MATERIAL'
  );
  const [ingredients, setIngredients] = useState<BomIngredient[]>(
    targetItem?.bomIngredients || []
  );
  const [formulaNotes, setFormulaNotes] = useState<string>(
    targetItem?.recipeBom || ''
  );
  const [newRawId, setNewRawId] = useState<string>(rawMaterials[0]?.itemId || '');
  const [newQty, setNewQty] = useState<string>('1');

  if (!isOpen || !targetItem) return null;

  const handleAddIngredient = () => {
    const raw = rawMaterials.find((r) => r.itemId === newRawId);
    const qty = parseFloat(newQty) || 0;
    if (!raw || qty <= 0) return;
    if (ingredients.some((ing) => ing.rawItemId === raw.itemId)) {
      setIngredients((prev) =>
        prev.map((ing) =>
          ing.rawItemId === raw.itemId
            ? { ...ing, quantityNeeded: qty }
            : ing
        )
      );
    } else {
      setIngredients((prev) => [
        ...prev,
        {
          rawItemId: raw.itemId,
          rawItemName: raw.name,
          quantityNeeded: qty,
          unit: raw.unit,
        },
      ]);
    }
    setNewQty('1');
  };

  const handleRemoveIngredient = (rawId: string) => {
    setIngredients((prev) => prev.filter((ing) => ing.rawItemId !== rawId));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const ok = updateItemRecipe(itemId, formulaNotes, ingredients);
    if (ok) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 my-8">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <ChefHat className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Konfigurasi Resep BOM</h3>
              <p className="text-xs text-slate-500">{targetItem.name} ({targetItem.unit})</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="mt-4 space-y-4 text-xs">
          <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl text-[11px] text-slate-700">
            Tentukan takaran bahan baku mentah per 1 {targetItem.unit} produk jadi. Saat produksi dijalankan di Gudang Stok, bahan mentah ini akan otomatis berkurang dari Gudang Bahan Baku.
          </div>

          <div className="p-3.5 bg-indigo-50/50 border border-indigo-100 rounded-2xl space-y-2">
            <label className="block font-bold text-indigo-950">
              + Tambah Komposisi Bahan Mentah
            </label>
            {rawMaterials.length === 0 ? (
              <p className="text-[11px] text-amber-700">
                Belum ada bahan mentah di Gudang Bahan Baku. Buat item bahan baku terlebih dahulu.
              </p>
            ) : (
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <label className="block text-[10px] text-slate-500 mb-0.5">Bahan Mentah</label>
                  <select
                    value={newRawId}
                    onChange={(e) => setNewRawId(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-indigo-200 bg-white rounded-xl text-slate-800 font-semibold"
                  >
                    {rawMaterials.map((r) => (
                      <option key={r.itemId} value={r.itemId}>
                        {r.name} ({r.unit})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="w-24">
                  <label className="block text-[10px] text-slate-500 mb-0.5">
                    Takaran/{targetItem.unit}
                  </label>
                  <input
                    type="number"
                    min="0.001"
                    step="any"
                    value={newQty}
                    onChange={(e) => setNewQty(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-indigo-200 bg-white rounded-xl font-bold text-slate-800"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddIngredient}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-2xs"
                >
                  Tambahkan
                </button>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="block font-bold text-slate-800">
              Daftar Komposisi Resep ({ingredients.length} Bahan Mentah)
            </label>
            {ingredients.length === 0 ? (
              <div className="p-4 text-center border border-dashed border-slate-300 rounded-2xl text-slate-400">
                Belum ada bahan mentah yang ditambahkan ke resep ini.
              </div>
            ) : (
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {ingredients.map((ing) => (
                  <div
                    key={ing.rawItemId}
                    className="flex items-center justify-between p-2.5 bg-white border border-slate-200 rounded-xl"
                  >
                    <div>
                      <span className="font-bold text-slate-800">{ing.rawItemName}</span>
                      <div className="text-[11px] text-slate-500">
                        {ing.quantityNeeded} {ing.unit} per 1 {targetItem.unit}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveIngredient(ing.rawItemId)}
                      className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Catatan Rahasia Pembuatan / SOP Resep
            </label>
            <textarea
              rows={2}
              value={formulaNotes}
              onChange={(e) => setFormulaNotes(e.target.value)}
              placeholder="Contoh: Sangrai biji kopi level medium dark, suhu air 92 derajat celcius..."
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs"
            >
              Simpan Resep BOM
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const ProduceRecipeDialog: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  businessId?: string;
  preselectedItemId?: string;
  onOpenRecipeModal?: (itemId: string) => void;
}> = (props) => {
  const { activeBusinessId } = useTgp();
  return (
    <ProduceGoodsDialog
      {...props}
      businessId={props.businessId || activeBusinessId || ''}
    />
  );
};

export const AddOutletStockDialog: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  outletId?: string;
  defaultOutletId?: string;
  defaultItemId?: string;
}> = (props) => {
  return (
    <SupplyStanStockDialog
      isOpen={props.isOpen}
      onClose={props.onClose}
      defaultOutletId={props.outletId || props.defaultOutletId}
      defaultItemId={props.defaultItemId}
    />
  );
};

export const ReportDamagedGoodsDialog: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const { activeItems, reportDamagedGoods, activeBusiness } = useTgp();
  const [itemId, setItemId] = useState(activeItems[0]?.itemId || '');
  const [quantity, setQuantity] = useState('1');
  const [reason, setReason] = useState('Basi / Rusak Kualitas');
  const [customReason, setCustomReason] = useState('');
  const [location, setLocation] = useState('Gudang Stok');

  if (!isOpen) return null;

  const currentItem = activeItems.find((i) => i.itemId === itemId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemId) return;
    const qty = parseFloat(quantity);
    if (isNaN(qty) || qty <= 0) return;
    const finalReason = reason === 'Lainnya' ? (customReason.trim() || 'Barang Rusak') : reason;
    const ok = reportDamagedGoods(location, itemId, qty, finalReason);
    if (ok) {
      setQuantity('1');
      setCustomReason('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Laporkan Barang Rusak / Basi</h3>
              <p className="text-xs text-slate-500">Pengajuan write-off ke OWNER ({activeBusiness?.name})</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {activeItems.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-500">
            Belum ada item di unit bisnis ini.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Pilih Item</label>
              <select
                value={itemId}
                onChange={(e) => setItemId(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 text-sm font-semibold"
              >
                {activeItems.map((item) => (
                  <option key={item.itemId} value={item.itemId}>
                    {item.name} ({item.stockQuantity} {item.unit}) &bull; {item.location}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Jumlah Rusak ({currentItem?.unit || 'unit'})
                </label>
                <input
                  type="number"
                  min="1"
                  max={currentItem ? currentItem.stockQuantity : undefined}
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 text-sm font-bold"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Lokasi Kejadian</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                  placeholder="Gudang Stok / STAN"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Penyebab Kerusakan</label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 text-sm font-medium"
              >
                <option value="Basi / Rusak Kualitas">Basi / Penurunan Kualitas</option>
                <option value="Kemasan Rusak / Pecah">Kemasan Rusak / Pecah</option>
                <option value="Jatuh / Tumpah saat Operasional">Jatuh / Tumpah saat Operasional</option>
                <option value="Kadaluarsa (Expired)">Kadaluarsa (Expired)</option>
                <option value="Lainnya">Lainnya (Tuliskan di bawah)</option>
              </select>
            </div>

            {reason === 'Lainnya' && (
              <div>
                <label className="block font-bold text-slate-700 mb-1">Keterangan Tambahan</label>
                <input
                  type="text"
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  placeholder="Jelaskan detail kerusakan"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 text-sm"
                />
              </div>
            )}

            <div className="p-3 bg-rose-50/70 border border-rose-200/80 rounded-2xl text-[11px] text-rose-900 leading-relaxed">
              Laporan ini memerlukan approval OWNER sebelum stok dipotong dan kerugian dicatat di buku kas.
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={!currentItem || currentItem.stockQuantity <= 0}
                className="px-5 py-2.5 font-bold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 rounded-xl shadow-xs"
              >
                Kirim Laporan
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export const AddLedgerDialog: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const { addManualLedgerEntry, activeBusiness } = useTgp();
  const [type, setType] = useState<LedgerType>(LedgerType.PENGELUARAN);
  const [category, setCategory] = useState('Biaya Operasional');
  const [amount, setAmount] = useState('50000');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) return;
    const ok = addManualLedgerEntry(
      type,
      category.trim() || 'Lainnya',
      num,
      description.trim() || `${category} manual`
    );
    if (ok) {
      setDescription('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Catat Transaksi Kas Manual</h3>
              <p className="text-xs text-slate-500">Unit: {activeBusiness?.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Tipe Transaksi</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setType(LedgerType.PEMASUKAN);
                  setCategory('Pendapatan Lain-lain');
                }}
                className={`p-2.5 rounded-xl border text-center font-bold transition ${
                  type === LedgerType.PEMASUKAN
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800 ring-1 ring-emerald-600'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                + Pemasukan (Kredit)
              </button>
              <button
                type="button"
                onClick={() => {
                  setType(LedgerType.PENGELUARAN);
                  setCategory('Biaya Operasional');
                }}
                className={`p-2.5 rounded-xl border text-center font-bold transition ${
                  type === LedgerType.PENGELUARAN
                    ? 'border-rose-600 bg-rose-50 text-rose-800 ring-1 ring-rose-600'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                - Pengeluaran (Debit)
              </button>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Kategori Transaksi</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Contoh: Listrik, Gaji, Bahan Baku, Kas Masuk"
              required
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 text-sm font-semibold"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Jumlah Nominal (Rp)</label>
            <input
              type="number"
              min="100"
              step="any"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 text-base font-extrabold text-slate-900"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Keterangan / Deskripsi</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Contoh: Pembelian es batu 5 bal & kantong plastik"
              required
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 text-sm"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs"
            >
              Simpan Transaksi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
