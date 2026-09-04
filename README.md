# TGP Multi-Business Management Platform

Aplikasi manajemen operasional bisnis multi-cabang terpadu dengan sinkronisasi database cloud **Supabase Realtime**.

## 🚀 Fitur Utama
- **Multi-Business & Multi-Role**: Dukungan Master, Owner, Staff Cabang, dan Stan Outlet.
- **POS & Kasir Outlet**: Transaksi penjualan cepat, pemilihan kasir/outlet, cetak struk, dan pemotongan stok otomatis.
- **Manajemen Inventaris & BOM Produksi**: Formula Bill of Materials (BOM) barang jadi, mutasi stok, pasokan ke stan outlet, dan retur barang.
- **Transfer Antar-Bisnis (Atomic)**: Alokasi stok antar unit bisnis dengan approval owner dan pencatatan buku kas otomatis.
- **Pencatatan Barang Rusak (Damaged Goods)**: Laporan kerusakan barang dan write-off stok.
- **Keuangan & Buku Kas**: Jurnal kas masuk/keluar, ringkasan laba kotor, dan riwayat transaksi.
- **Presensi Karyawan**: Absensi masuk dan pulang staf per outlet.
- **Real-Time Synchronization**: Tersinkronisasi antar-perangkat secara instan dengan Supabase Realtime Channels.

---

## 🛠️ Panduan Instalasi Lokal

### 1. Prasyarat
- Node.js versi 18 atau lebih tinggi
- npm atau yarn

### 2. Instalasi Dependensi
```bash
npm install
```

### 3. Konfigurasi Lingkungan (.env)
Salin `.env.example` menjadi file `.env`:
```bash
cp .env.example .env
```
Isi kredensial Supabase Anda di `.env`:
```env
VITE_SUPABASE_URL=https://shcvlcrdjcaslqrapudx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNoY3ZsY3JkamNhc2xxcmFwdWR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg1MDk1NDUsImV4cCI6MjEwNDA4NTU0NX0.YILx2dwA9GtGl2oNsCXHbfgNxid7397fPVjaXFHt_JM
```

### 4. Menjalankan Server Pengembangan
```bash
npm run dev
```
Buka browser di `http://localhost:3000`.

### 5. Membangun untuk Produksi
```bash
npm run build
```

---

## 🗄️ Menjalankan Skrip Database di Supabase
Pastikan Anda menjalankan skrip skema SQL di Supabase SQL Editor:
1. Buka [Supabase Dashboard](https://supabase.com/dashboard)
2. Masuk ke menu **SQL Editor**
3. Tempelkan (*paste*) skrip skema tabel TGP dari aplikasi (tombol Realtime di navigasi atas) dan klik **Run**.
