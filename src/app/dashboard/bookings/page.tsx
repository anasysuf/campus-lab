'use client';

import React, { useState, useEffect } from 'react';
import DashboardShell from '@/components/layout/DashboardShell';
import Modal from '@/components/ui/Modal';
import { StatusBadge } from '@/components/ui/Badge';
import { formatDate, formatDateTime } from '@/lib/utils';
import {
  DoorOpen,
  Plus,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Users,
  Monitor,
  Cpu,
  Tv,
  Wifi,
  Bot,
  XCircle,
} from 'lucide-react';

interface RoomBookingItem {
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
}

const LAB_ROOMS_CATALOG = [
  {
    name: 'Lab Komputer & AI (Gedung B Lt. 3)',
    capacity: '40 Kursi / Workstation',
    specs: 'Intel Core i7 13th Gen, 32GB RAM, RTX 4070, Gigabit LAN, Projector 4K',
    icon: Monitor,
    color: 'from-blue-500 to-indigo-600',
  },
  {
    name: 'Lab Elektronika & IoT (Gedung A Lt. 1)',
    capacity: '30 Meja Praktikum',
    specs: 'Digital Oscilloscope, Soldering Stations, Bench Power Supply DC, Sensor Kits',
    icon: Cpu,
    color: 'from-amber-500 to-orange-600',
  },
  {
    name: 'Lab Multimedia & VR (Gedung B Lt. 2)',
    capacity: '25 Unit Riset',
    specs: 'Meta Quest 3, Sound Booth Recording, iMac Pro 27", Studio Lighting LED',
    icon: Tv,
    color: 'from-purple-500 to-pink-600',
  },
  {
    name: 'Lab Jaringan & Cloud Server (Gedung B Lt. 3)',
    capacity: '35 Workstation',
    specs: 'Cisco Enterprise Switches, Mikrotik Routers, Server Rack Dell PowerEdge',
    icon: Wifi,
    color: 'from-emerald-500 to-teal-600',
  },
  {
    name: 'Lab Robotika & Fabrikasi (Gedung C Lt. 1)',
    capacity: '20 Meja Kerja',
    specs: 'Creality 3D Printers, CNC Milling, NVIDIA Jetson Nano, Laser Cutter',
    icon: Bot,
    color: 'from-rose-500 to-red-600',
  },
];

export default function LabBookingsPage() {
  const [bookings, setBookings] = useState<RoomBookingItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Form modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    roomName: LAB_ROOMS_CATALOG[0].name,
    date: new Date().toISOString().slice(0, 10),
    startTime: '09:00',
    endTime: '12:00',
    purpose: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/bookings?myOnly=true');
      if (res.ok) {
        const data = await res.json();
        setBookings(data);
      }
    } catch (err) {
      console.error(err);
      setToast({ type: 'error', message: 'Gagal memuat jadwal reservasi lab.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleOpenModal = (roomName?: string) => {
    setFormData({
      roomName: roomName || LAB_ROOMS_CATALOG[0].name,
      date: new Date().toISOString().slice(0, 10),
      startTime: '09:00',
      endTime: '12:00',
      purpose: '',
    });
    setIsModalOpen(true);
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setToast(null);

    const startDateTime = new Date(`${formData.date}T${formData.startTime}:00`);
    const endDateTime = new Date(`${formData.date}T${formData.endTime}:00`);

    if (endDateTime <= startDateTime) {
      setToast({
        type: 'error',
        message: 'Waktu selesai harus setelah waktu mulai.',
      });
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomName: formData.roomName,
          startTime: startDateTime.toISOString(),
          endTime: endDateTime.toISOString(),
          purpose: formData.purpose,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setToast({ type: 'error', message: data.error || 'Gagal mengajukan reservasi lab.' });
      } else {
        setToast({
          type: 'success',
          message: 'Pengajuan reservasi ruangan berhasil dikirim! Menunggu konfirmasi admin lab.',
        });
        setIsModalOpen(false);
        fetchBookings();
      }
    } catch (err) {
      setToast({ type: 'error', message: 'Terjadi kesalahan sistem.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardShell
      title="Reservasi Ruangan Laboratorium"
      subtitle="Pilih laboratorium fisik, tentukan jadwal praktikum/riset, dan pantau status persetujuan ruangan"
    >
      <div className="space-y-8">
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

        {/* Section 1: Laboratory Rooms Cards Catalog */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Pilih Laboratorium Fisik Kampus
              </h3>
              <p className="text-xs text-slate-500">
                Klik pada ruangan lab untuk langsung mengajukan jadwal pemesanan
              </p>
            </div>
            <button
              onClick={() => handleOpenModal()}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 shadow-md shadow-sky-500/25 active:scale-95 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Reservasi Lab Baru</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {LAB_ROOMS_CATALOG.map((room) => {
              const Icon = room.icon;
              return (
                <div
                  key={room.name}
                  className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md hover:border-sky-300 transition group flex flex-col justify-between card-hover"
                >
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className={`w-10 h-10 rounded-2xl bg-gradient-to-tr ${room.color} text-white flex items-center justify-center shadow-md`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 leading-tight">
                          {room.name}
                        </h4>
                        <span className="text-[11px] font-semibold text-slate-500">
                          {room.capacity}
                        </span>
                      </div>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-600 mt-2 leading-relaxed">
                      <strong className="text-slate-800">Fasilitas Utama:</strong> {room.specs}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <button
                      onClick={() => handleOpenModal(room.name)}
                      className="w-full py-2 px-3 rounded-xl text-xs font-bold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 transition"
                    >
                      Pilih & Reservasi Ruang Ini
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 2: My Bookings Schedule List */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <DoorOpen className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Daftar Reservasi Ruangan Saya
                </h3>
                <p className="text-xs text-slate-500">
                  Status persetujuan jadwal penggunaan laboratorium oleh Koordinator Lab
                </p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="py-16 text-center text-slate-400">
              <div className="w-7 h-7 border-2 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <span className="text-xs font-medium">Memuat jadwal...</span>
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <DoorOpen className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="font-bold text-slate-700">Belum ada permohonan reservasi</p>
              <p className="text-xs text-slate-400 mt-1">
                Pilih salah satu laboratorium di atas untuk mengajukan pemesanan ruangan.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 mt-2">
              {bookings.map((b) => (
                <div
                  key={b.id}
                  className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-bold text-slate-900">{b.roomName}</h4>
                      <StatusBadge status={b.status} />
                    </div>
                    <p className="text-xs text-slate-600 mt-1 italic">
                      &ldquo;{b.purpose}&rdquo;
                    </p>
                    {b.adminNote && (
                      <div className="mt-1.5 p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700">
                        <strong className="text-slate-900">Catatan Admin:</strong> {b.adminNote}
                      </div>
                    )}
                  </div>

                  <div className="text-left sm:text-right flex-shrink-0 text-xs text-slate-600 space-y-1">
                    <div className="flex items-center sm:justify-end gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{formatDate(b.startTime)}</span>
                    </div>
                    <div className="flex items-center sm:justify-end gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-semibold text-slate-800 font-mono">
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
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* NEW ROOM BOOKING MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Formulir Reservasi Ruangan Lab"
        subtitle="Ajukan jadwal pemakaian fasilitas laboratorium kampus"
        maxWidth="lg"
      >
        <form onSubmit={handleBookingSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Pilihan Ruang Laboratorium *
            </label>
            <select
              value={formData.roomName}
              onChange={(e) => setFormData({ ...formData, roomName: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-sky-500 outline-none"
            >
              {LAB_ROOMS_CATALOG.map((r) => (
                <option key={r.name} value={r.name}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Tanggal Reservasi *
            </label>
            <input
              type="date"
              value={formData.date}
              min={new Date().toISOString().slice(0, 10)}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-sky-500 outline-none font-mono"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Jam Mulai *
              </label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-sky-500 outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Jam Selesai *
              </label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-sky-500 outline-none font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Tujuan & Kegiatan Penggunaan Lab *
            </label>
            <textarea
              rows={3}
              value={formData.purpose}
              onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
              required
              placeholder="Contoh: Praktikum mandiri mata kuliah Jaringan Komputer / Pengujian model AI tugas akhir..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-sky-500 outline-none resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 shadow-md transition disabled:opacity-50"
            >
              {submitting ? 'Mengirim Pengajuan...' : 'Kirim Reservasi'}
            </button>
          </div>
        </form>
      </Modal>
    </DashboardShell>
  );
}
