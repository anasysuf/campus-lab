'use client';

import React, { useState, useEffect } from 'react';
import DashboardShell from '@/components/layout/DashboardShell';
import Modal from '@/components/ui/Modal';
import { StatusBadge } from '@/components/ui/Badge';
import { formatDate, formatDateTime } from '@/lib/utils';
import {
  CalendarDays,
  Plus,
  Search,
  Filter,
  Check,
  X,
  Trash2,
  DoorOpen,
  Wrench,
  GraduationCap,
  Clock,
  User,
  AlertTriangle,
  CheckCircle2,
  Calendar,
} from 'lucide-react';

interface Booking {
  id: string;
  userId: string;
  roomName: string;
  startTime: string;
  endTime: string;
  purpose: string;
  status: string;
  isMaintenance: boolean;
  adminNote: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    nim: string | null;
    department: string | null;
    phone: string | null;
    avatar: string | null;
    role: string;
  };
}

const LAB_ROOMS = [
  'Lab Komputer & AI (Gedung B Lt. 3)',
  'Lab Elektronika & IoT (Gedung A Lt. 1)',
  'Lab Multimedia & VR (Gedung B Lt. 2)',
  'Lab Jaringan & Cloud Server (Gedung B Lt. 3)',
  'Lab Robotika & Fabrikasi (Gedung C Lt. 1)',
];

export default function AdminSchedulesPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedRoom, setSelectedRoom] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedDate, setSelectedDate] = useState('');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeActionModal, setActiveActionModal] = useState<'APPROVE' | 'REJECT' | 'DELETE' | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [adminNote, setAdminNote] = useState('');

  // Add Block Form
  const [formData, setFormData] = useState({
    roomName: LAB_ROOMS[0],
    startTime: '',
    endTime: '',
    purpose: '',
    isMaintenance: true,
  });

  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedRoom !== 'ALL') params.set('roomName', selectedRoom);
      if (selectedStatus !== 'ALL') params.set('status', selectedStatus);
      if (selectedDate) params.set('date', selectedDate);

      const res = await fetch(`/api/bookings?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setBookings(data);
      }
    } catch (err) {
      console.error(err);
      setToast({ type: 'error', message: 'Gagal memuat jadwal laboratorium.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [selectedRoom, selectedStatus, selectedDate]);

  const handleOpenCreateBlock = () => {
    const now = new Date();
    const startIso = new Date(now.getTime() + 60 * 60 * 1000).toISOString().slice(0, 16);
    const endIso = new Date(now.getTime() + 4 * 60 * 60 * 1000).toISOString().slice(0, 16);

    setFormData({
      roomName: LAB_ROOMS[0],
      startTime: startIso,
      endTime: endIso,
      purpose: 'Pemeliharaan instrumen berkala & kalibrasi perangkat lab.',
      isMaintenance: true,
    });
    setIsAddModalOpen(true);
  };

  const handleCreateBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setToast(null);

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (!res.ok) {
        setToast({ type: 'error', message: data.error || 'Gagal menambahkan jadwal blokir.' });
      } else {
        setToast({ type: 'success', message: 'Jadwal ruangan / pemeliharaan berhasil ditetapkan!' });
        setIsAddModalOpen(false);
        fetchBookings();
      }
    } catch (err) {
      setToast({ type: 'error', message: 'Terjadi kesalahan sistem.' });
    } finally {
      setSaving(false);
    }
  };

  const handleOpenAction = (booking: Booking, action: 'APPROVE' | 'REJECT' | 'DELETE') => {
    setSelectedBooking(booking);
    setActiveActionModal(action);
    if (action === 'APPROVE') {
      setAdminNote('Disetujui. Silakan mengambil kunci ruangan sebelum sesi dimulai.');
    } else if (action === 'REJECT') {
      setAdminNote('Ditolak karena ruangan telah dialokasikan untuk kegiatan lain.');
    }
  };

  const handleProcessAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking || !activeActionModal) return;

    setSaving(true);
    setToast(null);

    try {
      if (activeActionModal === 'DELETE') {
        const res = await fetch(`/api/bookings/${selectedBooking.id}`, {
          method: 'DELETE',
        });
        const data = await res.json();
        if (!res.ok) {
          setToast({ type: 'error', message: data.error || 'Gagal menghapus jadwal.' });
        } else {
          setToast({ type: 'success', message: 'Jadwal berhasil dihapus.' });
          setActiveActionModal(null);
          fetchBookings();
        }
      } else {
        const res = await fetch(`/api/bookings/${selectedBooking.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: activeActionModal,
            adminNote: adminNote.trim(),
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          setToast({ type: 'error', message: data.error || 'Gagal memproses permohonan.' });
        } else {
          setToast({
            type: 'success',
            message:
              activeActionModal === 'APPROVE'
                ? 'Pemesanan ruangan berhasil disetujui!'
                : 'Pemesanan ruangan berhasil ditolak.',
          });
          setActiveActionModal(null);
          fetchBookings();
        }
      }
    } catch (err) {
      setToast({ type: 'error', message: 'Terjadi kesalahan sistem.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardShell
      title="Jadwal & Pemeliharaan Laboratorium"
      subtitle="Kelola alokasi ruangan praktikum, reservasi mahasiswa, dan jadwal blokir pemeliharaan alat"
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

        {/* Filters and New Schedule Block Action */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-wrap flex-1">
            {/* Room Filter */}
            <select
              value={selectedRoom}
              onChange={(e) => setSelectedRoom(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 outline-none focus:border-sky-500 transition"
            >
              <option value="ALL">Semua Ruangan Laboratorium</option>
              {LAB_ROOMS.map((room) => (
                <option key={room} value={room}>
                  {room}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 outline-none focus:border-sky-500 transition"
            >
              <option value="ALL">Semua Status</option>
              <option value="APPROVED">Disetujui</option>
              <option value="PENDING">Menunggu Persetujuan</option>
              <option value="REJECTED">Ditolak</option>
              <option value="CANCELLED">Dibatalkan</option>
            </select>

            {/* Date filter */}
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 outline-none focus:border-sky-500 transition"
            />
            {selectedDate && (
              <button
                onClick={() => setSelectedDate('')}
                className="text-xs text-rose-600 font-bold hover:underline"
              >
                Reset Tanggal
              </button>
            )}
          </div>

          <button
            onClick={handleOpenCreateBlock}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 shadow-md shadow-sky-500/25 active:scale-95 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Blokir Jadwal / Servis</span>
          </button>
        </div>

        {/* Bookings & Schedules List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {loading ? (
            <div className="col-span-full py-16 text-center text-slate-400">
              <div className="w-7 h-7 border-2 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <span className="text-xs font-medium">Memuat jadwal lab...</span>
            </div>
          ) : bookings.length === 0 ? (
            <div className="col-span-full bg-white rounded-3xl p-12 border border-slate-200/80 text-center text-slate-400">
              <CalendarDays className="w-12 h-12 mx-auto text-slate-300 mb-2" />
              <p className="font-bold text-slate-700">Tidak ada jadwal ditemukan.</p>
              <p className="text-xs text-slate-400 mt-1">
                Gunakan tombol &quot;Blokir Jadwal / Servis&quot; untuk menambahkan agenda baru.
              </p>
            </div>
          ) : (
            bookings.map((booking) => {
              const isMaintenance = booking.isMaintenance;
              const isPending = booking.status === 'PENDING';

              return (
                <div
                  key={booking.id}
                  className={`bg-white rounded-3xl p-5 border shadow-sm transition card-hover flex flex-col justify-between ${
                    isMaintenance
                      ? 'border-amber-200/90 bg-amber-50/20'
                      : 'border-slate-200/80'
                  }`}
                >
                  <div>
                    {/* Header: Room Name & Status */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                            isMaintenance
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-sky-100 text-sky-700'
                          }`}
                        >
                          {isMaintenance ? (
                            <Wrench className="w-4 h-4" />
                          ) : (
                            <DoorOpen className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 leading-tight">
                            {booking.roomName}
                          </h4>
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                            {isMaintenance ? 'Pemeliharaan / Servis' : 'Reservasi Mahasiswa'}
                          </span>
                        </div>
                      </div>
                      <StatusBadge status={booking.status} />
                    </div>

                    {/* Date & Time Window */}
                    <div className="mt-4 p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5 text-xs text-slate-600">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-slate-500">Tanggal:</span>
                        <strong className="text-slate-800">
                          {formatDate(booking.startTime)}
                        </strong>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-slate-500">Waktu:</span>
                        <strong className="text-slate-900 font-mono">
                          {new Date(booking.startTime).toLocaleTimeString('id-ID', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}{' '}
                          -{' '}
                          {new Date(booking.endTime).toLocaleTimeString('id-ID', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </strong>
                      </div>
                    </div>

                    {/* Purpose / Detail */}
                    <div className="mt-3">
                      <p className="text-xs text-slate-700 line-clamp-3">
                        {booking.purpose}
                      </p>
                    </div>

                    {/* User Info */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2.5">
                      <img
                        src={
                          booking.user?.avatar ||
                          `https://api.dicebear.com/7.x/bottts/svg?seed=${booking.user?.email}`
                        }
                        alt={booking.user?.name}
                        className="w-7 h-7 rounded-full object-cover border border-slate-200"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-800 truncate">
                          {booking.user?.name}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate">
                          {booking.user?.department || 'Laboratorium Kampus'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    {isPending ? (
                      <div className="flex items-center gap-2 w-full">
                        <button
                          onClick={() => handleOpenAction(booking, 'APPROVE')}
                          className="flex-1 inline-flex items-center justify-center gap-1 py-1.5 px-3 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Setujui
                        </button>
                        <button
                          onClick={() => handleOpenAction(booking, 'REJECT')}
                          className="flex-1 inline-flex items-center justify-center gap-1 py-1.5 px-3 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition"
                        >
                          <X className="w-3.5 h-3.5" />
                          Tolak
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleOpenAction(booking, 'DELETE')}
                        className="ml-auto inline-flex items-center gap-1 py-1.5 px-2.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                        title="Hapus Jadwal"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Hapus</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* CREATE MAINTENANCE / BLOCK MODAL */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Blokir Jadwal Lab / Pemeliharaan"
        subtitle="Tetapkan jadwal perawatan instrumen atau jadwal khusus kelas"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateBlock} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Ruangan Laboratorium *
            </label>
            <select
              value={formData.roomName}
              onChange={(e) => setFormData({ ...formData, roomName: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-sky-500 outline-none"
            >
              {LAB_ROOMS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Waktu Mulai *
              </label>
              <input
                type="datetime-local"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-sky-500 outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Waktu Selesai *
              </label>
              <input
                type="datetime-local"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-sky-500 outline-none font-mono"
              />
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isMaintenance}
                onChange={(e) =>
                  setFormData({ ...formData, isMaintenance: e.target.checked })
                }
                className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500"
              />
              <span className="text-xs font-bold text-slate-800">
                Tandai sebagai Pemeliharaan / Perawatan Rutin (Maintenance)
              </span>
            </label>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Keperluan & Keterangan *
            </label>
            <textarea
              rows={3}
              value={formData.purpose}
              onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
              required
              placeholder="Jelaskan detail pemeliharaan atau praktikum terjadwal..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-sky-500 outline-none resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 shadow-md transition disabled:opacity-50"
            >
              {saving ? 'Menyimpan...' : 'Simpan Jadwal'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ACTION APPROVE / REJECT / DELETE MODAL */}
      <Modal
        isOpen={activeActionModal !== null}
        onClose={() => setActiveActionModal(null)}
        title={
          activeActionModal === 'APPROVE'
            ? 'Setujui Reservasi Ruangan'
            : activeActionModal === 'REJECT'
            ? 'Tolak Reservasi Ruangan'
            : 'Hapus Jadwal Ruangan'
        }
        subtitle={selectedBooking?.roomName}
        maxWidth="md"
      >
        <form onSubmit={handleProcessAction} className="space-y-4">
          {activeActionModal === 'DELETE' ? (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
              <p className="font-bold text-sm text-rose-900 mb-1">Konfirmasi Hapus</p>
              Apakah Anda yakin ingin menghapus jadwal untuk{' '}
              <strong>{selectedBooking?.roomName}</strong> pada tanggal{' '}
              {formatDate(selectedBooking?.startTime)}?
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Catatan Koordinator Lab
              </label>
              <textarea
                rows={3}
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder="Berikan instruksi atau alasan penolakan..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-sky-500 outline-none resize-none"
              />
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setActiveActionModal(null)}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-md transition disabled:opacity-50 ${
                activeActionModal === 'APPROVE'
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : activeActionModal === 'REJECT'
                  ? 'bg-rose-600 hover:bg-rose-700'
                  : 'bg-rose-600 hover:bg-rose-700'
              }`}
            >
              {saving
                ? 'Memproses...'
                : activeActionModal === 'APPROVE'
                ? 'Setujui Reservasi'
                : activeActionModal === 'REJECT'
                ? 'Tolak Reservasi'
                : 'Ya, Hapus Jadwal'}
            </button>
          </div>
        </form>
      </Modal>
    </DashboardShell>
  );
}
