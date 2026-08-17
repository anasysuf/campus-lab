'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import DashboardShell from '@/components/layout/DashboardShell';
import {
  Boxes,
  ClipboardCheck,
  CalendarDays,
  CheckCircle,
  XCircle,
  ArrowRight,
  TrendingUp,
  Clock,
  Sparkles,
  AlertTriangle,
  DoorOpen,
  Eye,
  Check,
  X,
  Layers,
  Activity,
} from 'lucide-react';
import { formatDate, formatDateTime } from '@/lib/utils';
import { StatusBadge, ConditionBadge } from '@/components/ui/Badge';

interface StatsData {
  metrics: {
    totalEquipmentTypes: number;
    totalQuantity: number;
    availableQuantity: number;
    borrowedQuantity: number;
    pendingLoansCount: number;
    activeLoansCount: number;
    todayBookingsCount: number;
  };
  categories: Array<{
    category: string;
    _count: { id: number };
    _sum: { totalQuantity: number; availableQuantity: number };
  }>;
  recentLoans: Array<any>;
  recentBookings: Array<any>;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleQuickLoanAction = async (loanId: string, action: 'APPROVE' | 'REJECT') => {
    setActionLoading(loanId);
    setFeedback(null);
    try {
      const res = await fetch(`/api/loans/${loanId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFeedback({ type: 'error', message: data.error || 'Gagal memproses aksi.' });
      } else {
        setFeedback({
          type: 'success',
          message: action === 'APPROVE' ? 'Peminjaman berhasil disetujui!' : 'Peminjaman berhasil ditolak.',
        });
        fetchStats();
      }
    } catch (err) {
      setFeedback({ type: 'error', message: 'Terjadi kesalahan sistem.' });
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <DashboardShell title="Ikhtisar Laboratorium" subtitle="Memuat ringkasan sistem...">
        <div className="flex items-center justify-center py-24">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-sky-500/20 border-t-sky-600 rounded-full animate-spin" />
            <p className="text-sm font-medium text-slate-500">Memuat metrik & aktivitas lab...</p>
          </div>
        </div>
      </DashboardShell>
    );
  }

  const metrics = stats?.metrics || {
    totalEquipmentTypes: 0,
    totalQuantity: 0,
    availableQuantity: 0,
    borrowedQuantity: 0,
    pendingLoansCount: 0,
    activeLoansCount: 0,
    todayBookingsCount: 0,
  };

  return (
    <DashboardShell
      title="Ikhtisar Laboratorium Kampus"
      subtitle="Monitoring real-time inventaris, persetujuan peminjaman, & reservasi lab"
    >
      <div className="space-y-8">
        {/* Toast / Feedback Banner */}
        {feedback && (
          <div
            className={`p-4 rounded-2xl border flex items-center justify-between transition animate-fadeIn ${
              feedback.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}
          >
            <div className="flex items-center gap-3">
              {feedback.type === 'success' ? (
                <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0" />
              )}
              <span className="text-sm font-semibold">{feedback.message}</span>
            </div>
            <button
              onClick={() => setFeedback(null)}
              className="text-xs font-bold underline ml-4 hover:opacity-75"
            >
              Tutup
            </button>
          </div>
        )}

        {/* 4 Core Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Metric 1: Total Assets */}
          <div className="relative overflow-hidden rounded-3xl bg-white border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Total Peralatan
                </p>
                <h3 className="text-3xl font-black text-slate-900 mt-2">
                  {metrics.totalEquipmentTypes}
                  <span className="text-sm font-semibold text-slate-400 ml-1.5 font-normal">
                    jenis alat
                  </span>
                </h3>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center">
                <Boxes className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
              <span>Total Unit Fisik: <strong className="text-slate-900">{metrics.totalQuantity} unit</strong></span>
              <span className="text-emerald-600 font-bold">{metrics.availableQuantity} tersedia</span>
            </div>
          </div>

          {/* Metric 2: Pending Loan Requests */}
          <div className="relative overflow-hidden rounded-3xl bg-white border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Menunggu Persetujuan
                </p>
                <h3 className="text-3xl font-black text-amber-600 mt-2">
                  {metrics.pendingLoansCount}
                  <span className="text-sm font-semibold text-slate-400 ml-1.5 font-normal">
                    permohonan
                  </span>
                </h3>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <ClipboardCheck className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">Perlu tindakan verifikasi</span>
              <Link href="/admin/loans" className="text-amber-600 font-bold hover:underline">
                Buka Antrean &rarr;
              </Link>
            </div>
          </div>

          {/* Metric 3: Active Loans */}
          <div className="relative overflow-hidden rounded-3xl bg-white border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Sedang Dipinjam
                </p>
                <h3 className="text-3xl font-black text-indigo-600 mt-2">
                  {metrics.activeLoansCount}
                  <span className="text-sm font-semibold text-slate-400 ml-1.5 font-normal">
                    transaksi aktif
                  </span>
                </h3>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
              <span>Alat di luar lab: <strong className="text-slate-900">{metrics.borrowedQuantity} unit</strong></span>
              <span className="text-indigo-600 font-bold">Sedang Dipakai</span>
            </div>
          </div>

          {/* Metric 4: Today's Active Lab Sessions */}
          <div className="relative overflow-hidden rounded-3xl bg-white border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Sesi Lab Hari Ini
                </p>
                <h3 className="text-3xl font-black text-emerald-600 mt-2">
                  {metrics.todayBookingsCount}
                  <span className="text-sm font-semibold text-slate-400 ml-1.5 font-normal">
                    reservasi aktif
                  </span>
                </h3>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CalendarDays className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">Jadwal ruangan praktikum</span>
              <Link href="/admin/schedules" className="text-emerald-600 font-bold hover:underline">
                Cek Jadwal &rarr;
              </Link>
            </div>
          </div>
        </div>

        {/* Main Content Grid: Pending Requests Queue & Lab Schedule */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left 2 Cols: Pending Loan Approvals Action Center */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                    <ClipboardCheck className="w-5 h-5 text-amber-500" />
                    Antrean Permohonan Peminjaman Terbaru
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Permintaan peminjaman alat praktikum dari mahasiswa
                  </p>
                </div>
                <Link
                  href="/admin/loans"
                  className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1 hover:underline"
                >
                  Kelola Semua
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {stats?.recentLoans && stats.recentLoans.length > 0 ? (
                <div className="divide-y divide-slate-100 mt-2">
                  {stats.recentLoans.map((loan) => (
                    <div
                      key={loan.id}
                      className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
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
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-sm font-bold text-slate-900">
                              {loan.equipment?.name}
                            </h4>
                            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                              {loan.quantity} unit
                            </span>
                            <StatusBadge status={loan.status} />
                          </div>
                          <p className="text-xs text-slate-600 mt-1">
                            Peminjam: <strong className="text-slate-800">{loan.user?.name}</strong>{' '}
                            ({loan.user?.nim || 'Mahasiswa'}) &bull;{' '}
                            <span className="text-slate-500">{loan.user?.department}</span>
                          </p>
                          <p className="text-xs text-slate-500 italic mt-0.5">
                            &ldquo;{loan.purpose}&rdquo;
                          </p>
                          <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5">
                            <Clock className="w-3 h-3" />
                            Kembali:{' '}
                            <strong className="text-slate-600">
                              {formatDate(loan.returnDate)}
                            </strong>
                          </p>
                        </div>
                      </div>

                      {/* Action buttons if PENDING */}
                      {loan.status === 'PENDING' && (
                        <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-center">
                          <button
                            onClick={() => handleQuickLoanAction(loan.id, 'APPROVE')}
                            disabled={actionLoading === loan.id}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition active:scale-95 disabled:opacity-50"
                          >
                            <Check className="w-3.5 h-3.5" />
                            Setujui
                          </button>
                          <button
                            onClick={() => handleQuickLoanAction(loan.id, 'REJECT')}
                            disabled={actionLoading === loan.id}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-600 border border-slate-200 transition active:scale-95 disabled:opacity-50"
                          >
                            <X className="w-3.5 h-3.5" />
                            Tolak
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-slate-400">
                  <ClipboardCheck className="w-12 h-12 mx-auto text-slate-300 mb-2" />
                  <p className="text-sm font-semibold text-slate-600">Belum ada pengajuan peminjaman</p>
                </div>
              )}
            </div>

            {/* Inventory Distribution by Category */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-sky-500" />
                  Sebaran Kategori Peralatan
                </h3>
                <Link
                  href="/admin/inventory"
                  className="text-xs font-bold text-sky-600 hover:text-sky-700 hover:underline flex items-center gap-1"
                >
                  Kelola Inventaris &rarr;
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                {stats?.categories?.map((cat) => (
                  <div
                    key={cat.category}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 hover:bg-white hover:border-sky-200 transition"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-slate-800">
                        {cat.category}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-extrabold bg-sky-100 text-sky-700">
                        {cat._count.id} tipe
                      </span>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs text-slate-600">
                      <span>Total: <strong>{cat._sum.totalQuantity} unit</strong></span>
                      <span className="text-emerald-600 font-bold">
                        {cat._sum.availableQuantity} tersedia
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right 1 Col: Room Booking Schedule & Quick Actions */}
          <div className="space-y-6">
            {/* Quick Action Shortcuts */}
            <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-3xl p-6 shadow-lg shadow-indigo-950/20">
              <h3 className="text-base font-black flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-sky-400" />
                Aksi Cepat Admin
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                Jalan pintas pengelolaan laboratorium
              </p>

              <div className="space-y-2.5 mt-5">
                <Link
                  href="/admin/inventory?action=new"
                  className="w-full flex items-center justify-between p-3.5 rounded-xl bg-slate-800/80 hover:bg-sky-600 text-sm font-semibold transition group border border-slate-700/50"
                >
                  <div className="flex items-center gap-3">
                    <Boxes className="w-4 h-4 text-sky-400 group-hover:text-white" />
                    <span>Tambah Alat Baru</span>
                  </div>
                  <ArrowRight className="w-4 h-4 opacity-75 group-hover:translate-x-1 transition" />
                </Link>

                <Link
                  href="/admin/loans"
                  className="w-full flex items-center justify-between p-3.5 rounded-xl bg-slate-800/80 hover:bg-sky-600 text-sm font-semibold transition group border border-slate-700/50"
                >
                  <div className="flex items-center gap-3">
                    <ClipboardCheck className="w-4 h-4 text-amber-400 group-hover:text-white" />
                    <span>Verifikasi Peminjaman</span>
                  </div>
                  <ArrowRight className="w-4 h-4 opacity-75 group-hover:translate-x-1 transition" />
                </Link>

                <Link
                  href="/admin/schedules"
                  className="w-full flex items-center justify-between p-3.5 rounded-xl bg-slate-800/80 hover:bg-sky-600 text-sm font-semibold transition group border border-slate-700/50"
                >
                  <div className="flex items-center gap-3">
                    <CalendarDays className="w-4 h-4 text-emerald-400 group-hover:text-white" />
                    <span>Jadwal & Blokir Servis</span>
                  </div>
                  <ArrowRight className="w-4 h-4 opacity-75 group-hover:translate-x-1 transition" />
                </Link>
              </div>
            </div>

            {/* Recent / Upcoming Room Bookings */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <DoorOpen className="w-5 h-5 text-emerald-500" />
                  Jadwal Ruangan Lab
                </h3>
                <Link
                  href="/admin/schedules"
                  className="text-xs font-bold text-emerald-600 hover:underline"
                >
                  Kalender
                </Link>
              </div>

              {stats?.recentBookings && stats.recentBookings.length > 0 ? (
                <div className="space-y-3 mt-4">
                  {stats.recentBookings.map((b) => (
                    <div
                      key={b.id}
                      className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60 hover:bg-white transition"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="text-xs font-bold text-slate-900">
                            {b.roomName}
                          </h4>
                          <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                            Oleh: <strong className="text-slate-700">{b.user?.name}</strong>
                          </p>
                        </div>
                        <StatusBadge status={b.status} />
                      </div>
                      <p className="text-xs text-slate-600 mt-2 line-clamp-2">
                        {b.purpose}
                      </p>
                      <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
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
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 py-6 text-center">
                  Belum ada jadwal reservasi ruangan.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
