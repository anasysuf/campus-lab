'use client';

import React, { useState, useEffect } from 'react';
import DashboardShell from '@/components/layout/DashboardShell';
import Modal from '@/components/ui/Modal';
import { StatusBadge } from '@/components/ui/Badge';
import { formatDate, formatDateTime } from '@/lib/utils';
import {
  ClipboardCheck,
  Search,
  Filter,
  Check,
  X,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  User,
  Phone,
  Mail,
  Calendar,
  Layers,
  MessageSquare,
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
    availableQuantity: number;
  };
  user: {
    id: string;
    name: string;
    email: string;
    nim: string | null;
    department: string | null;
    phone: string | null;
    avatar: string | null;
  };
}

export default function AdminLoansPage() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Modal action states
  const [activeModal, setActiveModal] = useState<'APPROVE' | 'REJECT' | 'RETURN' | null>(null);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [adminNote, setAdminNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchLoans = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (selectedStatus !== 'ALL') params.set('status', selectedStatus);

      const res = await fetch(`/api/loans?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setLoans(data);
      }
    } catch (err) {
      console.error(err);
      setToast({ type: 'error', message: 'Gagal memuat data peminjaman.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchLoans();
    }, 250);
    return () => clearTimeout(timeout);
  }, [search, selectedStatus]);

  const handleOpenAction = (loan: Loan, action: 'APPROVE' | 'REJECT' | 'RETURN') => {
    setSelectedLoan(loan);
    setActiveModal(action);
    if (action === 'APPROVE') {
      setAdminNote('Disetujui. Harap menjaga kondisi dan kelengkapan alat selama pemakaian.');
    } else if (action === 'REJECT') {
      setAdminNote('Ditolak karena ketersediaan alat terbatas / keperluan di luar izin lab.');
    } else if (action === 'RETURN') {
      setAdminNote('Alat telah dikembalikan dalam kondisi baik dan lengkap.');
    }
  };

  const handleProcessAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLoan || !activeModal) return;

    setSubmitting(true);
    setToast(null);

    try {
      const res = await fetch(`/api/loans/${selectedLoan.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: activeModal,
          adminNote: adminNote.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setToast({ type: 'error', message: data.error || 'Gagal memproses permohonan.' });
      } else {
        const actionLabels = {
          APPROVE: 'Peminjaman berhasil disetujui!',
          REJECT: 'Permohonan peminjaman berhasil ditolak.',
          RETURN: 'Pengembalian alat berhasil diverifikasi & stok dipulihkan.',
        };
        setToast({ type: 'success', message: actionLabels[activeModal] });
        setActiveModal(null);
        fetchLoans();
      }
    } catch (err) {
      setToast({ type: 'error', message: 'Terjadi kesalahan sistem.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardShell
      title="Persetujuan & Manajemen Peminjaman"
      subtitle="Verifikasi permohonan peminjaman alat, monitoring pengembalian, dan riwayat sirkulasi alat"
    >
      <div className="space-y-6">
        {/* Feedback Alert */}
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
              placeholder="Cari nama mahasiswa, NIM, nama alat, kode, atau tujuan peminjaman..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 text-sm outline-none transition"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl overflow-x-auto">
              {['ALL', 'PENDING', 'APPROVED', 'RETURNED', 'REJECTED'].map((st) => (
                <button
                  key={st}
                  onClick={() => setSelectedStatus(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
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
        </div>

        {/* Loan Requests Table */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50/80 text-xs uppercase tracking-wider text-slate-500 border-b border-slate-200/80">
                <tr>
                  <th className="py-4 px-6 font-bold">Mahasiswa Peminjam</th>
                  <th className="py-4 px-4 font-bold">Peralatan Dipinjam</th>
                  <th className="py-4 px-4 font-bold">Jadwal & Durasi</th>
                  <th className="py-4 px-4 font-bold">Tujuan & Catatan</th>
                  <th className="py-4 px-4 font-bold">Status</th>
                  <th className="py-4 px-6 font-bold text-right">Tindakan Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-7 h-7 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
                        <span className="text-xs font-medium">Memuat data peminjaman...</span>
                      </div>
                    </td>
                  </tr>
                ) : loans.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      <ClipboardCheck className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                      <p className="font-semibold text-slate-600">Tidak ada data peminjaman ditemukan.</p>
                      <p className="text-xs text-slate-400 mt-1">
                        Coba sesuaikan filter atau kata kunci pencarian.
                      </p>
                    </td>
                  </tr>
                ) : (
                  loans.map((loan) => {
                    const isOverdue =
                      loan.status === 'APPROVED' &&
                      new Date(loan.returnDate) < new Date();

                    return (
                      <tr key={loan.id} className="hover:bg-slate-50/60 transition group">
                        {/* Student Info */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <img
                              src={
                                loan.user?.avatar ||
                                `https://api.dicebear.com/7.x/bottts/svg?seed=${loan.user?.email}`
                              }
                              alt={loan.user?.name}
                              className="w-10 h-10 rounded-full object-cover border border-slate-200"
                            />
                            <div>
                              <p className="font-bold text-slate-900">{loan.user?.name}</p>
                              <p className="text-xs text-slate-500">
                                NIM: <strong className="text-slate-700">{loan.user?.nim || '-'}</strong>
                              </p>
                              <p className="text-[11px] text-slate-400">{loan.user?.department}</p>
                              {loan.user?.phone && (
                                <p className="text-[11px] text-sky-600 flex items-center gap-1 mt-0.5 font-medium">
                                  <Phone className="w-2.5 h-2.5" />
                                  {loan.user.phone}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Equipment Info */}
                        <td className="py-4 px-4">
                          <div className="flex items-start gap-2.5">
                            <img
                              src={
                                loan.equipment?.imageUrl ||
                                'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=200'
                              }
                              alt={loan.equipment?.name}
                              className="w-10 h-10 rounded-lg object-cover border border-slate-200 flex-shrink-0"
                            />
                            <div>
                              <p className="font-bold text-slate-900 leading-tight">
                                {loan.equipment?.name}
                              </p>
                              <p className="text-xs font-mono text-sky-600 font-semibold mt-0.5">
                                {loan.equipment?.code}
                              </p>
                              <span className="inline-block mt-1 text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                                Jumlah: {loan.quantity} unit
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Dates */}
                        <td className="py-4 px-4 text-xs">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-slate-600">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" />
                              <span>Pinjam: <strong>{formatDate(loan.requestDate)}</strong></span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              <span
                                className={
                                  isOverdue
                                    ? 'text-rose-600 font-bold'
                                    : 'text-slate-600 font-semibold'
                                }
                              >
                                Kembali: {formatDate(loan.returnDate)}
                                {isOverdue && ' (Terlambat!)'}
                              </span>
                            </div>
                            {loan.actualReturnDate && (
                              <p className="text-[11px] text-emerald-600 font-medium">
                                Dikembalikan: {formatDate(loan.actualReturnDate)}
                              </p>
                            )}
                          </div>
                        </td>

                        {/* Purpose & Note */}
                        <td className="py-4 px-4 text-xs max-w-xs">
                          <p className="text-slate-700 italic line-clamp-2">
                            &ldquo;{loan.purpose}&rdquo;
                          </p>
                          {loan.adminNote && (
                            <div className="mt-1.5 p-2 rounded-lg bg-slate-100/90 text-slate-600 text-[11px] border border-slate-200">
                              <strong className="text-slate-800">Catatan Admin:</strong> {loan.adminNote}
                            </div>
                          )}
                        </td>

                        {/* Status */}
                        <td className="py-4 px-4">
                          <StatusBadge status={loan.status} />
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-6 text-right">
                          {loan.status === 'PENDING' && (
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleOpenAction(loan, 'APPROVE')}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition active:scale-95"
                              >
                                <Check className="w-3.5 h-3.5" />
                                Setujui
                              </button>
                              <button
                                onClick={() => handleOpenAction(loan, 'REJECT')}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition active:scale-95"
                              >
                                <X className="w-3.5 h-3.5" />
                                Tolak
                              </button>
                            </div>
                          )}

                          {loan.status === 'APPROVED' && (
                            <button
                              onClick={() => handleOpenAction(loan, 'RETURN')}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition active:scale-95"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              Verifikasi Kembali
                            </button>
                          )}

                          {(loan.status === 'RETURNED' || loan.status === 'REJECTED') && (
                            <span className="text-xs text-slate-400 font-medium">Selesai</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ACTION VERIFICATION MODAL */}
      <Modal
        isOpen={activeModal !== null}
        onClose={() => setActiveModal(null)}
        title={
          activeModal === 'APPROVE'
            ? 'Setujui Permohonan Peminjaman'
            : activeModal === 'REJECT'
            ? 'Tolak Permohonan Peminjaman'
            : 'Konfirmasi Pengembalian Alat'
        }
        subtitle={
          selectedLoan
            ? `${selectedLoan.equipment.name} (${selectedLoan.quantity} unit) oleh ${selectedLoan.user.name}`
            : ''
        }
        maxWidth="md"
      >
        <form onSubmit={handleProcessAction} className="space-y-4">
          {activeModal === 'APPROVE' && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
              <p className="font-bold text-sm text-emerald-900 mb-1">
                Konfirmasi Persetujuan
              </p>
              Menyetujui permohonan ini akan otomatis memotong stok fisik tersedia sebanyak{' '}
              <strong>{selectedLoan?.quantity} unit</strong> (Stok saat ini:{' '}
              {selectedLoan?.equipment.availableQuantity} unit).
            </div>
          )}

          {activeModal === 'RETURN' && (
            <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs">
              <p className="font-bold text-sm text-indigo-900 mb-1">
                Konfirmasi Pengembalian
              </p>
              Tindakan ini akan mengembalikan <strong>{selectedLoan?.quantity} unit</strong> ke stok
              alat yang siap dipinjam kembali.
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Catatan / Instruksi Koordinator Lab
            </label>
            <textarea
              rows={3}
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              placeholder="Berikan catatan, alasan penolakan, atau kondisi pengembalian alat..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 outline-none resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-md transition disabled:opacity-50 ${
                activeModal === 'APPROVE'
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : activeModal === 'REJECT'
                  ? 'bg-rose-600 hover:bg-rose-700'
                  : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              {submitting
                ? 'Memproses...'
                : activeModal === 'APPROVE'
                ? 'Konfirmasi Setujui'
                : activeModal === 'REJECT'
                ? 'Konfirmasi Tolak'
                : 'Verifikasi Pengembalian'}
            </button>
          </div>
        </form>
      </Modal>
    </DashboardShell>
  );
}
