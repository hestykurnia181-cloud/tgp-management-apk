import React, { useState } from 'react';
import {
  AlertCircle,
  CreditCard,
  Minus,
  Plus,
  QrCode,
  Receipt,
  Search,
  ShoppingCart,
  Store,
  Trash2,
  Wallet,
} from 'lucide-react';
import { PosReceiptModal } from '../components/PosReceiptModal';
import { useTgp } from '../context/TgpContext';
import { normalizeUserRole } from '../security/authorizationEngine';
import { ItemEntity, PaymentMethod, SaleOrderEntity, UserRole } from '../types';

function formatRupiah(amount: number): string {
  return 'Rp ' + Math.round(amount).toLocaleString('id-ID');
}

export const PosScreen: React.FC = () => {
  const {
    currentSession,
    activeBusiness,
    activeItems,
    activeOutlets,
    outletStocks,
    posCart,
    addToCart,
    updateCartQty,
    removeFromCart,
    clearCart,
    checkoutPos,
  } = useTgp();

  const [selectedStanId, setSelectedStanId] = useState<string | null>(() => {
    if (currentSession?.user.outletId) return currentSession.user.outletId;
    return activeOutlets.length > 0 ? activeOutlets[0].outletId : null;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('SEMUA');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.TUNAI);
  const [cashGiven, setCashGiven] = useState<number | ''>('');
  const [recentSale, setRecentSale] = useState<SaleOrderEntity | null>(null);

  // Strict check: POS is only for sales items (Finished Goods & Services)
  // Raw materials in Gudang Bahan Baku cannot be sold in POS!
  const saleableItems = activeItems.filter((i) => i.type !== 'RAW_MATERIAL');

  // Categories list
  const categories = ['SEMUA', ...Array.from(new Set(saleableItems.map((i) => i.category)))];

  // Filter items by category & search
  const filteredItems = saleableItems.filter((item) => {
    const matchesCat = selectedCategory === 'SEMUA' || item.category === selectedCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  // Calculate items stock depending on whether STAN is selected
  const getItemAvailableStock = (item: ItemEntity): number => {
    if (item.type === 'SERVICE') return 9999;
    if (selectedStanId) {
      const oStock = outletStocks.find(
        (os) => os.outletId === selectedStanId && os.itemId === item.itemId
      );
      return oStock ? oStock.stockQuantity : 0;
    }
    return item.stockQuantity;
  };

  const totalAmount = posCart.reduce((sum, ci) => sum + ci.quantity * ci.item.sellingPrice, 0);
  const effectivePaid =
    paymentMethod === PaymentMethod.TUNAI
      ? typeof cashGiven === 'number' && cashGiven >= totalAmount
        ? cashGiven
        : totalAmount
      : totalAmount;
  const changeAmount = Math.max(0, effectivePaid - totalAmount);

  const handleCheckout = () => {
    if (posCart.length === 0) return;
    const sale = checkoutPos(paymentMethod, selectedStanId, effectivePaid);
    if (sale) {
      setRecentSale(sale);
      setCashGiven('');
    }
  };

  const currentRole = currentSession?.user ? normalizeUserRole(currentSession.user.role) : null;
  const isLockedToStan = !!currentSession?.user.outletId && currentRole === UserRole.KASIR;

  return (
    <div className="space-y-4 pb-20">
      {/* STAN / Outlet Selector Header */}
      {activeOutlets.length > 0 && (
        <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Store className="w-4 h-4 text-amber-600" />
            <span className="text-xs font-bold text-slate-800">
              {isLockedToStan ? 'STAN Penugasan Anda:' : 'Pilih Cabang / STAN Penjualan:'}
            </span>
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {!isLockedToStan && (
              <button
                onClick={() => setSelectedStanId(null)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  selectedStanId === null
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Gudang Pusat
              </button>
            )}
            {activeOutlets.map((outlet) => {
              const isSelected = selectedStanId === outlet.outletId;
              if (isLockedToStan && outlet.outletId !== currentSession?.user.outletId) {
                return null;
              }
              return (
                <button
                  key={outlet.outletId}
                  onClick={() => setSelectedStanId(outlet.outletId)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <Store className="w-3.5 h-3.5" />
                  <span>{outlet.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Grid: Catalog vs Cart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left 2 Cols: Catalog */}
        <div className="lg:col-span-2 space-y-3">
          {/* Search & Category Pills */}
          <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs space-y-3">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari item kasir / SKU..."
                data-testid="input_pos_search"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                    selectedCategory === cat
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Product Items Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {filteredItems.length === 0 ? (
              <div className="col-span-full p-8 text-center bg-white rounded-3xl border border-slate-200">
                <ShoppingCart className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-700">Tidak ada produk siap jual</p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Pastikan produk bahan jadi (FINISHED_GOODS) sudah diproduksi atau didistribusikan ke STAN ini.
                </p>
              </div>
            ) : (
              filteredItems.map((item) => {
                const stock = getItemAvailableStock(item);
                const isOutOfStock = stock <= 0 && item.type !== 'SERVICE';

                return (
                  <div
                    key={item.itemId}
                    onClick={() => !isOutOfStock && addToCart(item)}
                    data-testid={`btn_add_cart_${item.itemId}`}
                    className={`bg-white rounded-2xl p-3.5 border transition shadow-xs flex flex-col justify-between select-none ${
                      isOutOfStock
                        ? 'opacity-60 border-slate-200 bg-slate-50 cursor-not-allowed'
                        : 'border-slate-200 hover:border-blue-400 hover:shadow-md cursor-pointer active:scale-[0.98]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                          {item.sku}
                        </span>
                        <span
                          className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${
                            isOutOfStock
                              ? 'bg-rose-100 text-rose-700'
                              : 'bg-blue-50 text-blue-700'
                          }`}
                        >
                          {item.type === 'SERVICE' ? 'Jasa' : `${stock} ${item.unit}`}
                        </span>
                      </div>
                      <h4 className="text-xs font-extrabold text-slate-900 line-clamp-2 leading-tight">
                        {item.name}
                      </h4>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs font-black text-blue-600">
                        {formatRupiah(item.sellingPrice)}
                      </span>
                      <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                        <Plus className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right 1 Col: Cart & Payment */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-extrabold text-slate-900">Keranjang Kasir</h3>
              </div>
              {posCart.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-xs font-semibold text-rose-600 hover:underline"
                >
                  Reset
                </button>
              )}
            </div>

            {/* Cart Items List */}
            <div className="space-y-2.5 my-3 max-h-72 overflow-y-auto pr-1">
              {posCart.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-8 text-center">
                  Keranjang kosong. Ketuk item di katalog untuk menambahkan.
                </p>
              ) : (
                posCart.map((ci) => (
                  <div
                    key={ci.item.itemId}
                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-2 text-xs"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-slate-900 truncate">{ci.item.name}</p>
                      <p className="text-[11px] text-blue-600 font-semibold">
                        {formatRupiah(ci.item.sellingPrice)} x {ci.quantity}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => updateCartQty(ci.item.itemId, ci.quantity - 1)}
                        className="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-100"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center font-extrabold text-slate-900 text-xs">
                        {ci.quantity}
                      </span>
                      <button
                        onClick={() => updateCartQty(ci.item.itemId, ci.quantity + 1)}
                        className="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-100"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => removeFromCart(ci.item.itemId)}
                        className="w-6 h-6 rounded-lg text-rose-500 hover:bg-rose-50 flex items-center justify-center ml-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Payment Details */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            {/* Total */}
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-slate-500">Total Tagihan:</span>
              <span className="text-lg font-black text-slate-900">{formatRupiah(totalAmount)}</span>
            </div>

            {/* Payment Method Selector */}
            <div>
              <span className="text-[11px] font-bold text-slate-600 block mb-1.5">Metode Bayar:</span>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { id: PaymentMethod.TUNAI, label: 'Tunai', icon: <Wallet className="w-3.5 h-3.5" /> },
                  { id: PaymentMethod.QRIS, label: 'QRIS', icon: <QrCode className="w-3.5 h-3.5" /> },
                  { id: PaymentMethod.TRANSFER, label: 'Transfer', icon: <CreditCard className="w-3.5 h-3.5" /> },
                  { id: PaymentMethod.DEBIT, label: 'Debit', icon: <CreditCard className="w-3.5 h-3.5" /> },
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setPaymentMethod(m.id)}
                    className={`py-1.5 px-2 rounded-xl text-[11px] font-bold flex flex-col items-center justify-center gap-1 transition ${
                      paymentMethod === m.id
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {m.icon}
                    <span>{m.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Cash Given & Quick buttons for Tunai */}
            {paymentMethod === PaymentMethod.TUNAI && (
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-500">Nominal Diterima:</span>
                  <input
                    type="number"
                    value={cashGiven}
                    onChange={(e) => setCashGiven(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder={totalAmount.toString()}
                    className="w-32 px-2.5 py-1 text-right rounded-lg bg-slate-50 border border-slate-200 font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs"
                  />
                </div>

                {/* Quick Nominal Chips */}
                <div className="flex items-center gap-1 overflow-x-auto pb-1">
                  <button
                    onClick={() => setCashGiven(totalAmount)}
                    className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700"
                  >
                    Uang Pas
                  </button>
                  {[50000, 100000, 200000, 500000]
                    .filter((val) => val >= totalAmount)
                    .map((val) => (
                      <button
                        key={val}
                        onClick={() => setCashGiven(val)}
                        className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700"
                      >
                        {formatRupiah(val)}
                      </button>
                    ))}
                </div>

                {changeAmount > 0 && (
                  <div className="flex justify-between items-center text-xs pt-1">
                    <span className="font-semibold text-slate-500">Kembalian:</span>
                    <span className="font-bold text-emerald-600">{formatRupiah(changeAmount)}</span>
                  </div>
                )}
              </div>
            )}

            {/* Submit Checkout Button */}
            <button
              onClick={handleCheckout}
              disabled={posCart.length === 0}
              data-testid="btn_pos_checkout"
              className={`w-full py-3 px-4 rounded-2xl text-xs font-extrabold text-white flex items-center justify-center gap-2 shadow-lg transition active:scale-[0.99] ${
                posCart.length === 0
                  ? 'bg-slate-300 cursor-not-allowed shadow-none'
                  : 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/20'
              }`}
            >
              <Receipt className="w-4 h-4" />
              <span>Selesaikan Transaksi ({formatRupiah(totalAmount)})</span>
            </button>
          </div>
        </div>
      </div>

      {/* POS Receipt Modal */}
      {recentSale && (
        <PosReceiptModal
          sale={recentSale}
          onClose={() => setRecentSale(null)}
        />
      )}
    </div>
  );
};
