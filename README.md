# 🧪 SIMLAB KAMPUS - Sistem Informasi Manajemen Laboratorium

Aplikasi berbasis web modern untuk pengelolaan inventaris laboratorium kampus, penjadwalan ruang praktikum, peminjaman peralatan, penomoran aset otomatis, barcode generator, studio cetak stiker label fisik, dan rekapitulasi laporan per semester.

---

## 🚀 Fitur Utama
- **Autentikasi 2 Peran (Role)**: Admin (Koordinator Lab) dan Mahasiswa (Peminjam).
- **Pendaftaran Mahasiswa**: Dilengkapi upload foto Kartu Identitas resmi (KTM / KTP / SIM).
- **Pengaturan Profil Akun**: Setiap pengguna dapat mengelola profil pribadi, nomor WhatsApp, foto profil avatar, dan ganti password.
- **Manajemen Inventaris & Barcode**:
  - Penomoran kode unik aset otomatis (`LAB-{CAT}-{YEAR}-{SEQ}`).
  - Barcode Code-128 SVG generator otomatis tanpa dependensi eksternal.
  - Tracking stok fisik dan level ketersediaan *real-time*.
- **Studio Cetak Stiker Barcode Fisik (`/admin/barcodes`)**:
  - Pilihan format kertas stiker (A4 Grid 10, A4 Grid 21 Tom & Jerry, dan Printer Thermal Roll).
  - Kustomisasi header label dan informasi lokasi/kategori.
  - Cetak massal sesuai jumlah unit fisik barang.
- **Sistem Peminjaman & Persetujuan**:
  - Alur persetujuan: Pengajuan &rarr; Disetujui (stok otomatis berkurang) / Ditolak &rarr; Pengembalian (stok kembali).
- **Reservasi Ruang Laboratorium**:
  - Kalender jadwal kelas, praktikum mandiri, dan pemeliharaan (*maintenance*).
- **Rekap & Laporan Per Semester (`/admin/reports`)**:
  - Rekap sirkulasi peminjaman, audit kepatuhan pengembalian on-time, dan status kondisi fisik aset.
  - Cetak dokumen resmi format PDF ber-kop surat dan tanda tangan kepala lab.
  - Ekspor data laporan ke format CSV / Excel.

---

## 🛠️ Tech Stack
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS & Lucide Icons
- **Database ORM**: Prisma ORM (PostgreSQL / Neon DB / SQLite)
- **Authentication**: NextAuth.js (Credentials Provider)

---

## 🌐 Panduan Deploy ke Vercel + Database Neon (PostgreSQL)

### 1. Buat Database di Neon Serverless Postgres
1. Buka [neon.tech](https://neon.tech) dan login / buat akun gratis.
2. Klik **"Create Project"** (contoh nama project: `simlab-kampus`).
3. Salin **Connection String** yang diberikan (pilih format *Prisma* atau *Direct Connection*):
   ```text
   postgresql://username:password@ep-xyz-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```

### 2. Push Schema & Data Awal ke Neon DB
Di komputer lokal Anda, jalankan perintah berikut untuk menginisialisasi tabel dan data demo di Neon:
```bash
# Ubah DATABASE_URL di file .env lokal dengan Connection String Neon Anda, lalu jalankan:
npx prisma db push
npx ts-node prisma/seed.ts
```

### 3. Deploy ke Vercel
1. Buka [vercel.com](https://vercel.com) dan klik **"Add New" &rarr; "Project"**.
2. Hubungkan dengan repositori GitHub Anda (`campus-lab`).
3. Pada bagian **Environment Variables**, tambahkan 3 variabel berikut:
   - `DATABASE_URL`: Isi dengan Connection String Neon PostgreSQL Anda.
   - `NEXTAUTH_SECRET`: String acak aman (contoh: `super-secure-jwt-secret-key-simlab-2026`).
   - `NEXTAUTH_URL`: Domain Vercel Anda (contoh: `https://simlab-kampus.vercel.app` atau `https://your-domain.vercel.app`).
4. Klik tombol **"Deploy"**.
5. Tunggu proses build selesai dan aplikasi siap digunakan secara online! 🎉

---

## 🔑 Akun Demo Default
- **Admin Laboratorium**: `admin@campus.ac.id` / `admin123`
- **Mahasiswa**: `student@campus.ac.id` / `student123`
