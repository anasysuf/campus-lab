'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import DashboardShell from '@/components/layout/DashboardShell';
import { StatusBadge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';
import {
  FlaskConical,
  Boxes,
  History,
  DoorOpen,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  BookOpen,
  ShieldCheck,
  Calendar,
  Layers,
} from 'lucide-react';

export default function StudentDashboardPage() {
  const { data: session } = useSession();
  const [loans, setLoans] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [featuredEquipment, setFeaturedEquipment] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resLoans, resBookings, resEq] = await Promise.all([
          fetch('/api/loans'),
          fetch('/api/bookings?myOnly=true'),
          fetch('/api/equipment?availableOnly=true'),
        ]);

        if (resLoans.ok) setLoans(await resLoans.json());
        if (resBookings.ok) setBookings(await resBookings.json());
        if (resEq.ok) {
          const eqData = await resEq.json();
          setFeaturedEquipment((eqData.equipment || []).slice(0, 4));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const activeLoans = loans.filter((l) => l.status === 'APPROVED');
  const pendingLoans = loans.filter((l) => l.status === 'PENDING');
  const upcomingBookings = bookings.filter(
    (b) => b.status === 'APPROVED' || b.status === 'PENDING'
  );

  return (
    <DashboardShell
      title="Portal Layanan Laboratorium Mahasiswa"
      subtitle={`Selamat datang kembali, ${session?.user?.name || 'Mahasiswa'}`}
    >
      <div className="space-y-8">
        {/* Hero Welcome Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-sky-600 via-indigo-600 to-slate-900 text-white p-6 sm:p-8 shadow-xl shadow-sky-600/10">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-sky-200 mb-3 border border-white/15">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Sistem Manajemen Praktikum Terintegrasi</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
              Akses Cepat Fasilitas & Peralatan Laboratorium
            </h2>
            <p className="text-slate-200 text-sm mt-2 leading-relaxed">
              Ajukan peminjaman modul praktikum, sensor IoT, mikrokontroler, serta reservasi
              ruang laboratorium untuk menunjang kegiatan belajar dan riset Anda.
            </p>

            <div className="mt-6 flex items-center gap-3 flex-wrap">
              <Link
                href="/dashboard/equipment"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-white text-slate-900 hover:bg-slate-100 shadow-md active:scale-95 transition"
              >
                <FlaskConical className="w-4 h-4 text-sky-600" />
                <span>Katalog Alat Tersedia</span>
              </Link>
              <Link
                href="/dashboard/bookings"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-white/15 hover:bg-white/25 text-white border border-white/20 active:scale-95 transition"
              >
                <DoorOpen className="w-4 h-4" />
                <span>Reservasi Ruangan Lab</span>
              </Link>
            </div>
          </div>

          {/* Decorative shapes */}
          <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-sky-400/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute top-0 right-1/4 w-40 h-40 bg-indigo-400/20 rounded-full blur-xl pointer-events-none" />
        </div>

        {/* 4 Summary Stat Widgets */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Pinjaman Aktif
              </p>
              <h3 className="text-2xl font-black text-indigo-600 mt-1">
                {activeLoans.length}
                <span className="text-xs font-normal text-slate-400 ml-1">alat</span>
              </h3>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Boxes className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Menunggu Konfirmasi
              </p>
              <h3 className="text-2xl font-black text-amber-600 mt-1">
                {pendingLoans.length}
                <span className="text-xs font-normal text-slate-400 ml-1">permohonan</span>
              </h3>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Reservasi Ruangan
              </p>
              <h3 className="text-2xl font-black text-emerald-600 mt-1">
                {upcomingBookings.length}
                <span className="text-xs font-normal text-slate-400 ml-1">sesi</span>
              </h3>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DoorOpen className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Riwayat Transaksi
              </p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">
                {loans.length}
                <span className="text-xs font-normal text-slate-400 ml-1">total</span>
              </h3>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center">
              <History className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* 2-Column Grid: Active Loans Tracker & Featured Equipment */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left 2 Cols: My Active Loans & Upcoming Bookings */}
          <div className="lg:col-span-2 space-y-6">
            {/* Active Loans Card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Boxes className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">
                      Peminjaman Alat Aktif Saya
                    </h3>
                    <p className="text-xs text-slate-500">
                      Status alat yang sedang Anda gunakan dan tenggat waktu pengembalian
                    </p>
                  </div>
                </div>
                <Link
                  href="/dashboard/loans"
                  className="text-xs font-bold text-sky-600 hover:underline flex items-center gap-1"
                >
                  Lihat Semua &rarr;
                </Link>
              </div>

              {activeLoans.length > 0 ? (
                <div className="divide-y divide-slate-100 mt-2">
                  {activeLoans.map((loan) => (
                    <div
                      key={loan.id}
                      className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-start gap-3.5">
                        <img
                          src={
                            loan.equipment?.imageUrl ||
                            'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=200'
                          }
                          alt={loan.equipment?.name}
                          className="w-12 h-12 rounded-xl object-cover border border-slate-200 flex-shrink-0"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-slate-900">
                              {loan.equipment?.name}
                            </h4>
                            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                              {loan.quantity} unit
                            </span>
                          </div>
                          <p className="text-xs font-mono text-sky-600 font-semibold mt-0.5">
                            {loan.equipment?.code} &bull; {loan.equipment?.location}
                          </p>
                          <p className="text-xs text-slate-500 italic mt-1">
                            &ldquo;{loan.purpose}&rdquo;
                          </p>
                        </div>
                      </div>

                      <div className="text-left sm:text-right flex-shrink-0">
                        <StatusBadge status={loan.status} />
                        <p className="text-xs text-slate-500 font-medium mt-1 flex items-center sm:justify-end gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          Kembali: <strong>{formatDate(loan.returnDate)}</strong>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-slate-400">
                  <Boxes className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                  <p className="text-sm font-semibold text-slate-600">
                    Tidak ada peminjaman aktif saat ini
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Jelajahi katalog alat untuk mengajukan pinjaman alat praktikum baru.
                  </p>
                  <Link
                    href="/dashboard/equipment"
                    className="inline-flex items-center gap-1.5 px-4 py-2 mt-4 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white shadow-sm transition"
                  >
                    Buka Katalog Alat
                  </Link>
                </div>
              )}
            </div>

            {/* Featured Available Equipment */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                    <FlaskConical className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">
                      Peralatan Siap Pakai di Lab
                    </h3>
                    <p className="text-xs text-slate-500">
                      Instrumen dan modul praktikum yang siap dipinjam hari ini
                    </p>
                  </div>
                </div>
                <Link
                  href="/dashboard/equipment"
                  className="text-xs font-bold text-sky-600 hover:underline flex items-center gap-1"
                >
                  Semua Alat &rarr;
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                {featuredEquipment.map((eq) => (
                  <div
                    key={eq.id}
                    className="p-3.5 rounded-2xl border border-slate-200/70 hover:border-sky-300 hover:shadow-md transition bg-slate-50/50 flex flex-col justify-between"
                  >
                    <div className="flex items-start gap-3">
                      <img
                        src={
                          eq.imageUrl ||
                          'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=200'
                        }
                        alt={eq.name}
                        className="w-14 h-14 rounded-xl object-cover border border-slate-200 flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold uppercase text-sky-700 bg-sky-100 px-1.5 py-0.5 rounded">
                          {eq.category}
                        </span>
                        <h4 className="text-xs font-bold text-slate-900 line-clamp-1 mt-1">
                          {eq.name}
                        </h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Tersedia:{' '}
                          <strong className="text-emerald-600">
                            {eq.availableQuantity} / {eq.totalQuantity} unit
                          </strong>
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400 font-mono">
                        {eq.code}
                      </span>
                      <Link
                        href={`/dashboard/equipment?borrow=${eq.id}`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-sky-600 hover:text-sky-700 hover:underline"
                      >
                        <span>Ajukan Pinjam</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right 1 Col: Upcoming Lab Bookings & Lab Guidelines */}
          <div className="space-y-6">
            {/* My Room Bookings */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <DoorOpen className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-sm font-extrabold text-slate-900">
                    Jadwal Booking Lab Saya
                  </h3>
                </div>
                <Link
                  href="/dashboard/bookings"
                  className="text-xs font-bold text-emerald-600 hover:underline"
                >
                  Booking Baru
                </Link>
              </div>

              {bookings.length > 0 ? (
                <div className="space-y-3 mt-4">
                  {bookings.slice(0, 3).map((b) => (
                    <div
                      key={b.id}
                      className="p-3 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-1.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-bold text-slate-900 line-clamp-1">
                          {b.roomName}
                        </h4>
                        <StatusBadge status={b.status} />
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center justify-between">
                        <span>{formatDate(b.startTime)}</span>
                        <span className="font-semibold text-slate-700">
                          {new Date(b.startTime).toLocaleTimeString('id-ID', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}{' '}
                          -{' '}
                          {new Date(b.endTime).toLocaleTimeString('id-ID', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 line-clamp-1 italic">
                        &ldquo;{b.purpose}&rdquo;
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-slate-400">
                  <p className="text-xs">Belum ada reservasi ruangan lab.</p>
                </div>
              )}
            </div>

            {/* SOP & Rules Info Box */}
            <div className="bg-slate-900 text-slate-100 rounded-3xl p-6 shadow-md">
              <div className="flex items-center gap-2 text-amber-400 mb-3">
                <ShieldCheck className="w-5 h-5" />
                <h4 className="text-sm font-bold tracking-tight">
                  Tata Tertib & SOP Laboratorium
                </h4>
              </div>
              <ul className="text-xs text-slate-300 space-y-2.5 list-disc list-inside leading-relaxed">
                <li>Wajib membawa KTM (Kartu Tanda Mahasiswa) saat serah terima alat di ruang staf lab.</li>
                <li>Pengecekan kondisi fisik dan kelengkapan modul wajib dilakukan di hadapan asisten lab.</li>
                <li>Dilarang membawa makanan dan minuman ke dalam area laboratorium komputer & elektronika.</li>
                <li>Keterlambatan pengembalian alat tanpa konfirmasi dapat dikenakan pembekuan hak pinjam.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
