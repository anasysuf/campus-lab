import React from 'react';
import Link from 'next/link';
import {
  FlaskConical,
  Boxes,
  ClipboardCheck,
  CalendarDays,
  ShieldCheck,
  GraduationCap,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Cpu,
  Monitor,
  Wifi,
  Bot,
  Tv,
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-sky-500 selection:text-white relative overflow-hidden">
      {/* Background glowing gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-sky-500/15 via-indigo-500/10 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/25 group-hover:scale-105 transition">
              <FlaskConical className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="font-extrabold text-lg tracking-tight text-white">
                SIMLAB <span className="text-sky-400">KAMPUS</span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                Integrated Campus Lab System
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition"
            >
              Masuk
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 shadow-md shadow-sky-500/20 active:scale-95 transition"
            >
              Daftar Mahasiswa
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col">
        <section className="relative px-6 pt-16 pb-20 max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/80 text-xs font-bold text-sky-400 mb-6 shadow-sm">
            <Sparkles className="w-4 h-4" />
            <span>Sistem Informasi Manajemen Laboratorium Kampus Modern</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white max-w-4xl mx-auto leading-tight sm:leading-tight">
            Digitalisasi Inventaris, Peminjaman Alat, &amp; Reservasi Ruang Lab
          </h1>

          <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto mt-6 leading-relaxed">
            Platform terpadu untuk koordinator lab dan mahasiswa. Kelola stok instrumen, verifikasi
            peminjaman secara instan, serta jadwalkan penggunaan ruangan praktikum dengan transparan.
          </p>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 shadow-xl shadow-sky-500/25 active:scale-95 transition flex items-center justify-center gap-2"
            >
              <span>Mulai Masuk ke Portal</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl font-bold text-sm text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 active:scale-95 transition flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Demo Cepat Admin &amp; Mahasiswa</span>
            </Link>
          </div>

          {/* Quick Demo Credentials Reminder Banner */}
          <div className="mt-12 max-w-3xl mx-auto p-5 rounded-3xl bg-slate-900/90 border border-slate-800/80 shadow-xl text-left">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-400 mb-3">
              <Sparkles className="w-4 h-4" />
              <span>Akun Demo Siap Pakai (1-Click Login di Halaman Masuk)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Admin / Koordinator Lab</span>
                </div>
                <p className="text-xs text-slate-300 font-mono mt-1">
                  Email: <strong className="text-white">admin@campus.ac.id</strong>
                </p>
                <p className="text-xs text-slate-300 font-mono">
                  Password: <strong className="text-white">admin123</strong>
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
                <div className="flex items-center gap-2 text-sky-400 font-bold text-xs">
                  <GraduationCap className="w-4 h-4" />
                  <span>Mahasiswa / Peminjam</span>
                </div>
                <p className="text-xs text-slate-300 font-mono mt-1">
                  Email: <strong className="text-white">student@campus.ac.id</strong>
                </p>
                <p className="text-xs text-slate-300 font-mono">
                  Password: <strong className="text-white">student123</strong>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Cards Grid */}
        <section className="px-6 py-16 bg-slate-900/50 border-t border-slate-800/80">
          <div className="max-w-6xl mx-auto">
            <div className="text-center max-w-xl mx-auto mb-12">
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                Fitur Utama Sistem SIMLAB
              </h2>
              <p className="text-slate-400 text-xs sm:text-sm mt-2">
                Dirancang khusus untuk mempermudah operasional lab perguruan tinggi
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Feature 1 */}
              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-sky-500/50 transition">
                <div className="w-12 h-12 rounded-2xl bg-sky-500/10 text-sky-400 flex items-center justify-center mb-4">
                  <Boxes className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white">Manajemen Inventaris Alat</h3>
                <p className="text-slate-400 text-xs leading-relaxed mt-2">
                  Katalog lengkap peralatan praktikum, pelacakan stok otomatis, penomoran kode unik,
                  kondisi fisik, dan rak penyimpanan terpadu.
                </p>
              </div>

              {/* Feature 2: Barcode Studio */}
              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 transition">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-4">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white">Studio Cetak Stiker Barcode</h3>
                <p className="text-slate-400 text-xs leading-relaxed mt-2">
                  Generator barcode Code-128 otomatis dan cetak label stiker fisik massal dalam
                  format A4 Grid 10, A4 Grid 21 Tom &amp; Jerry, dan printer thermal roll.
                </p>
              </div>

              {/* Feature 3: Semester Reports */}
              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 transition">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
                  <ClipboardCheck className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white">Rekap &amp; Laporan Semester</h3>
                <p className="text-slate-400 text-xs leading-relaxed mt-2">
                  Audit sirkulasi peminjaman, tingkat kepatuhan pengembalian on-time, cetak PDF resmi
                  ber-kop surat &amp; tanda tangan kepala lab, serta ekspor CSV.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 transition">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-4">
                  <CalendarDays className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white">Reservasi Ruang &amp; Kalender</h3>
                <p className="text-slate-400 text-xs leading-relaxed mt-2">
                  Booking timeslot ruang lab komputer, IoT, multimedia, dan penjadwalan
                  blokir pemeliharaan preventif secara teratur.
                </p>
              </div>

              {/* Feature 5 */}
              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-rose-500/50 transition">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center mb-4">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white">Verifikasi Identitas Resmi</h3>
                <p className="text-slate-400 text-xs leading-relaxed mt-2">
                  Pendaftaran mahasiswa dengan lampiran foto Kartu Identitas (KTM, KTP, atau SIM)
                  dengan modal zoom HD untuk verifikasi pengambilan alat fisik.
                </p>
              </div>

              {/* Feature 6 */}
              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-cyan-500/50 transition">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-4">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white">Portal &amp; Profil Mandiri</h3>
                <p className="text-slate-400 text-xs leading-relaxed mt-2">
                  Portal khusus mahasiswa untuk cek riwayat pinjaman, ajukan peminjaman alat secara mandiri,
                  dan kelola profil serta ganti password akun.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Lab Facilities Showcase */}
        <section className="px-6 py-16 max-w-6xl mx-auto w-full">
          <div className="text-center max-w-xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Fasilitas Laboratorium Terpadu
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm mt-2">
              Berbagai fasilitas lab yang dapat dipesan untuk kegiatan praktikum &amp; penelitian
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center">
              <Monitor className="w-6 h-6 text-sky-400 mx-auto mb-2" />
              <h4 className="text-xs font-bold text-white">Lab Komputer &amp; AI</h4>
              <p className="text-[10px] text-slate-400 mt-0.5">40 Workstation</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center">
              <Cpu className="w-6 h-6 text-amber-400 mx-auto mb-2" />
              <h4 className="text-xs font-bold text-white">Lab Elektronika &amp; IoT</h4>
              <p className="text-[10px] text-slate-400 mt-0.5">30 Meja Praktikum</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center">
              <Tv className="w-6 h-6 text-purple-400 mx-auto mb-2" />
              <h4 className="text-xs font-bold text-white">Lab Multimedia &amp; VR</h4>
              <p className="text-[10px] text-slate-400 mt-0.5">25 Unit Riset</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center">
              <Wifi className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
              <h4 className="text-xs font-bold text-white">Lab Jaringan Server</h4>
              <p className="text-[10px] text-slate-400 mt-0.5">35 Workstation</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center">
              <Bot className="w-6 h-6 text-rose-400 mx-auto mb-2" />
              <h4 className="text-xs font-bold text-white">Lab Robotika</h4>
              <p className="text-[10px] text-slate-400 mt-0.5">20 Meja Kerja</p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-8 px-6 text-center text-xs text-slate-500">
        <p>&copy; 2026 SIMLAB KAMPUS - Sistem Informasi Manajemen Laboratorium. All rights reserved.</p>
      </footer>
    </div>
  );
}
