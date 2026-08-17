'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardShell from '@/components/layout/DashboardShell';
import Modal from '@/components/ui/Modal';
import { StatusBadge } from '@/components/ui/Badge';
import { formatDate, formatDateTime } from '@/lib/utils';
import {
  History,
  Search,
  Filter,
  Clock,
  Calendar,
  XCircle,
  AlertTriangle,
  CheckCircle2,
  Boxes,
  ArrowRight,
  Info,
  MapPin,
} from 'lucide-react';

interface Loan {
  id: string;
  userId: string;
  equipmentId: string;
  quantity: number;
  requestDate: string;
  returnDate: string;
  actualReturnDate: string | null;
  status: string;
  purpose: string;
  adminNote: string | null;
  createdAt: string;
  equipment: {
    id: string;
    name: string;
    code: string;
    category: string;
    imageUrl: string | null;
    condition: string;
    location: string | null;
  };
}

export default function MyLoansPage() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [search, setSearch] = useState('');

  // Cancel modal states
  const [selectedCancelLoan, setSelectedCancelLoan] = useState<Loan | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchLoans = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedStatus !== 'ALL') params.set('status', selectedStatus);
      if (search) params.set('search', search);

      const res = await fetch(`/api/loans?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setLoans(data);
      }
    } catch (err) {
      console.error(err);
      setToast({ type: 'error', message: 'Gagal memuat riwayat peminjaman.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchLoans();
    }, 200);
    return () => clearTimeout(timeout);
  }, [selectedStatus, search]);

  const handleCancelRequest = async () => {
    if (!selectedCancelLoan) return;
    setCancelling(true);
    setToast(null);

    try {
      const res = await fetch(`/api/loans/${selectedCancelLoan.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'CANCEL', adminNote: 'Dibatalkan oleh mahasiswa.' }),
      });

      const data = await res.json();

      if (!res.ok) {
        setToast({ type: 'error', message: data.error || 'Gagal membatalkan permohonan.' });
      } else {
        setToast({ type: 'success', message: 'Permohonan peminjaman berhasil dibatalkan.' });
        setSelectedCancelLoan(null);
        fetchLoans();
      }
    } catch (err) {
      setToast({ type: 'error', message: 'Terjadi kesalahan sistem.' });
    } finally {
      setCancelling(false);
    }
  };

  return (
    <DashboardShell
      title="Status & Riwayat Peminjaman Saya"
      subtitle="Pantau proses verifikasi permohonan peminjaman alat, jadwal jatuh tempo, dan riwayat transaksi"
    >
      <div className="space-y-6">
        {/* Toast Alert */}
        {toast && (
          <div
            className={`p-4 rounded-2xl border flex items-center justify-between animate-fadeIn ${
              toast.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}
          >
            <div className="flex items-center gap-3">
              {toast.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0" />
              )}
              <span className="text-sm font-semibold">{toast.message}</span>
            </div>
            <button
              onClick={() => setToast(null)}
              className="text-xs font-bold underline hover:opacity-75"
            >
              Tutup
            </button>
          </div>
        )}

        {/* Filter bar */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari berdasarkan nama alat, kode, atau tujuan peminjaman..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 text-sm outline-none transition"
            />
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl overflow-x-auto">
            {['ALL', 'PENDING', 'APPROVED', 'RETURNED', 'REJECTED'].map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  selectedStatus === st
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {st === 'ALL'
                  ? 'Semua'
                  : st === 'PENDING'
                  ? 'Menunggu'
                  : st === 'APPROVED'
                  ? 'Disetujui'
                  : st === 'RETURNED'
                  ? 'Kembali'
                  : 'Ditolak'}
              </button>
            ))}
          </div>
        </div>

        {/* Loans Cards / List */}
        {loading ? (
          <div className="py-20 text-center text-slate-400">
            <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <span className="text-xs font-medium">Memuat status peminjaman...</span>
          </div>
        ) : loans.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 border border-slate-200/80 text-center text-slate-400">
            <History className="w-12 h-12 mx-auto text-slate-300 mb-2" />
            <p className="font-bold text-slate-700">Belum ada data peminjaman</p>
            <p className="text-xs text-slate-400 mt-1">
              Anda belum mengajukan peminjaman alat praktikum untuk kategori filter ini.
            </p>
            <Link
              href="/dashboard/equipment"
              className="inline-flex items-center gap-2 px-4 py-2.5 mt-4 rounded-xl text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 shadow-md transition"
            >
              <Boxes className="w-4 h-4" />
              <span>Jelajahi Katalog Alat</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {loans.map((loan) => {
              const isOverdue =
                loan.status === 'APPROVED' &&
                new Date(loan.returnDate) < new Date();

              return (
                <div
                  key={loan.id}
                  className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition card-hover"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    {/* Left: Equipment details */}
                    <div className="flex items-start gap-4">
                      <img
                        src={
                          loan.equipment?.imageUrl ||
                          'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=200'
                        }
                        alt={loan.equipment?.name}
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border border-slate-200 flex-shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-bold uppercase text-sky-700 bg-sky-100 px-2 py-0.5 rounded">
                            {loan.equipment?.category}
                          </span>
                          <span className="text-xs font-mono font-bold text-slate-500">
                            {loan.equipment?.code}
                          </span>
                          <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                            {loan.quantity} unit
                          </span>
                        </div>

                        <h3 className="text-base font-extrabold text-slate-900 mt-1">
                          {loan.equipment?.name}
                        </h3>

                        <p className="text-xs text-slate-600 mt-1.5 italic">
                          &ldquo;{loan.purpose}&rdquo;
                        </p>

                        {loan.adminNote && (
                          <div className="mt-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700">
                            <strong className="text-slate-900">Catatan Admin Lab:</strong>{' '}
                            {loan.adminNote}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right: Status, Dates, & Action */}
                    <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end justify-between gap-4 border-t lg:border-t-0 pt-4 lg:pt-0 border-slate-100 flex-shrink-0">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={loan.status} />
                        {isOverdue && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-700 border border-rose-200">
                            Terlambat
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-slate-600 space-y-1 text-left lg:text-right">
                        <div className="flex items-center lg:justify-end gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>Mulai: <strong>{formatDate(loan.requestDate)}</strong></span>
                        </div>
                        <div className="flex items-center lg:justify-end gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span
                            className={
                              isOverdue
                                ? 'text-rose-600 font-bold'
                                : 'text-slate-700 font-semibold'
                            }
                          >
                            Kembali: {formatDate(loan.returnDate)}
                          </span>
                        </div>
                        {loan.actualReturnDate && (
                          <p className="text-[11px] text-emerald-600 font-medium">
                            Selesai dikembalikan: {formatDate(loan.actualReturnDate)}
                          </p>
                        )}
                      </div>

                      {loan.status === 'PENDING' && (
                        <button
                          onClick={() => setSelectedCancelLoan(loan)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Batalkan Pengajuan</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* CANCEL LOAN CONFIRMATION MODAL */}
      <Modal
        isOpen={selectedCancelLoan !== null}
        onClose={() => setSelectedCancelLoan(null)}
        title="Batalkan Permohonan Peminjaman"
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
            <p className="font-bold text-sm text-rose-900 mb-1">
              Konfirmasi Pembatalan
            </p>
            Apakah Anda yakin ingin membatalkan permohonan peminjaman untuk{' '}
            <strong>{selectedCancelLoan?.equipment.name}</strong> ({selectedCancelLoan?.quantity} unit)?
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setSelectedCancelLoan(null)}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
            >
              Kembali
            </button>
            <button
              type="button"
              onClick={handleCancelRequest}
              disabled={cancelling}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-md transition disabled:opacity-50"
            >
              {cancelling ? 'Membatalkan...' : 'Ya, Batalkan'}
            </button>
          </div>
        </div>
      </Modal>
    </DashboardShell>
  );
}
