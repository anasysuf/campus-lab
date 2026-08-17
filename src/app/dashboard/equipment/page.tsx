'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import DashboardShell from '@/components/layout/DashboardShell';
import Modal from '@/components/ui/Modal';
import { ConditionBadge } from '@/components/ui/Badge';
import {
  FlaskConical,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Calendar,
  Layers,
  Sparkles,
  Info,
  Clock,
  ArrowRight,
  Package,
} from 'lucide-react';

interface EquipmentItem {
  id: string;
  name: string;
  code: string;
  category: string;
  description: string | null;
  totalQuantity: number;
  availableQuantity: number;
  condition: string;
  location: string | null;
  imageUrl: string | null;
}

function EquipmentCatalog() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const borrowParam = searchParams.get('borrow');

  const [equipment, setEquipment] = useState<EquipmentItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [availableOnly, setAvailableOnly] = useState(false);

  // Borrow Modal states
  const [isBorrowModalOpen, setIsBorrowModalOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentItem | null>(null);
  const [borrowForm, setBorrowForm] = useState({
    quantity: 1,
    requestDate: new Date().toISOString().slice(0, 10),
    returnDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    purpose: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchEquipment = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (selectedCategory !== 'ALL') params.set('category', selectedCategory);
      if (availableOnly) params.set('availableOnly', 'true');

      const res = await fetch(`/api/equipment?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        const eqList: EquipmentItem[] = data.equipment || [];
        setEquipment(eqList);
        setCategories(data.categories || []);

        // Auto open borrow modal if param exists
        if (borrowParam) {
          const found = eqList.find((e) => e.id === borrowParam);
          if (found) {
            handleOpenBorrow(found);
          }
        }
      }
    } catch (err) {
      console.error(err);
      setToast({ type: 'error', message: 'Gagal memuat katalog peralatan.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchEquipment();
    }, 200);
    return () => clearTimeout(timeout);
  }, [search, selectedCategory, availableOnly]);

  const handleOpenBorrow = (item: EquipmentItem) => {
    setSelectedEquipment(item);
    setBorrowForm({
      quantity: 1,
      requestDate: new Date().toISOString().slice(0, 10),
      returnDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      purpose: '',
    });
    setIsBorrowModalOpen(true);
  };

  const handleBorrowSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEquipment) return;

    if (borrowForm.quantity < 1 || borrowForm.quantity > selectedEquipment.availableQuantity) {
      setToast({
        type: 'error',
        message: `Jumlah peminjaman harus antara 1 dan ${selectedEquipment.availableQuantity} unit.`,
      });
      return;
    }

    if (new Date(borrowForm.returnDate) <= new Date(borrowForm.requestDate)) {
      setToast({
        type: 'error',
        message: 'Tanggal pengembalian harus setelah tanggal mulai peminjaman.',
      });
      return;
    }

    setSubmitting(true);
    setToast(null);

    try {
      const res = await fetch('/api/loans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          equipmentId: selectedEquipment.id,
          quantity: borrowForm.quantity,
          requestDate: borrowForm.requestDate,
          returnDate: borrowForm.returnDate,
          purpose: borrowForm.purpose,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setToast({ type: 'error', message: data.error || 'Gagal mengajukan peminjaman.' });
      } else {
        setToast({
          type: 'success',
          message: 'Permohonan peminjaman berhasil diajukan! Mengalihkan ke halaman status...',
        });
        setIsBorrowModalOpen(false);
        setTimeout(() => {
          router.push('/dashboard/loans');
        }, 1200);
      }
    } catch (err) {
      setToast({ type: 'error', message: 'Terjadi kesalahan sistem.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardShell
      title="Katalog Peralatan Laboratorium"
      subtitle="Cari instrumen praktikum, modul sensor, komputer riset, dan ajukan peminjaman secara online"
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

        {/* Search and Filters Bar */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari berdasarkan nama modul, merk, kode alat, atau lokasi..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 text-sm outline-none transition"
              />
            </div>

            {/* Toggle Available Only */}
            <label className="flex items-center gap-2.5 cursor-pointer select-none text-xs font-bold text-slate-700 bg-slate-50 px-3.5 py-2.5 rounded-xl border border-slate-200">
              <input
                type="checkbox"
                checked={availableOnly}
                onChange={(e) => setAvailableOnly(e.target.checked)}
                className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500"
              />
              <span>Hanya Alat Siap Dipinjam</span>
            </label>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setSelectedCategory('ALL')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                selectedCategory === 'ALL'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Semua Kategori
            </button>
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setSelectedCategory(c)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                  selectedCategory === c
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Equipment Grid Cards */}
        {loading ? (
          <div className="py-20 text-center text-slate-400">
            <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <span className="text-xs font-medium">Memuat katalog alat...</span>
          </div>
        ) : equipment.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 border border-slate-200/80 text-center text-slate-400">
            <Package className="w-12 h-12 mx-auto text-slate-300 mb-2" />
            <p className="font-bold text-slate-700">Tidak ada peralatan ditemukan</p>
            <p className="text-xs text-slate-400 mt-1">
              Coba sesuaikan kata kunci pencarian atau pilih kategori lain.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {equipment.map((item) => {
              const isAvailable = item.availableQuantity > 0;

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-lg hover:border-sky-300 transition group card-hover"
                >
                  <div>
                    {/* Image Header with Availability Badge */}
                    <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
                      <img
                        src={
                          item.imageUrl ||
                          'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500'
                        }
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      />
                      <div className="absolute top-3 left-3">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-900/80 backdrop-blur-md text-white border border-white/20">
                          {item.category}
                        </span>
                      </div>
                      <div className="absolute top-3 right-3">
                        {isAvailable ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500 text-white shadow-md">
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                            {item.availableQuantity} / {item.totalQuantity} Tersedia
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500 text-white shadow-md">
                            Stok Habis
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Body Content */}
                    <div className="p-5">
                      <div className="flex items-center justify-between text-xs text-slate-400 font-mono font-bold mb-1">
                        <span>{item.code}</span>
                        <ConditionBadge condition={item.condition} />
                      </div>

                      <h3 className="text-base font-bold text-slate-900 leading-snug line-clamp-2 mt-1">
                        {item.name}
                      </h3>

                      {item.description && (
                        <p className="text-xs text-slate-500 line-clamp-2 mt-2 leading-relaxed">
                          {item.description}
                        </p>
                      )}

                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs text-slate-500">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span className="truncate">{item.location || 'Laboratorium Terpadu'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Footer Action Button */}
                  <div className="p-5 pt-0">
                    <button
                      onClick={() => handleOpenBorrow(item)}
                      disabled={!isAvailable}
                      className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition active:scale-95 shadow-sm ${
                        isAvailable
                          ? 'bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white shadow-sky-500/20'
                          : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      <FlaskConical className="w-3.5 h-3.5" />
                      <span>{isAvailable ? 'Ajukan Peminjaman' : 'Stok Sedang Kosong'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* BORROW REQUEST MODAL */}
      <Modal
        isOpen={isBorrowModalOpen}
        onClose={() => setIsBorrowModalOpen(false)}
        title="Formulir Peminjaman Peralatan Lab"
        subtitle="Lengkapi tanggal dan keperluan peminjaman alat praktikum"
        maxWidth="lg"
      >
        {selectedEquipment && (
          <form onSubmit={handleBorrowSubmit} className="space-y-4">
            {/* Equipment Summary Chip */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-3">
              <img
                src={
                  selectedEquipment.imageUrl ||
                  'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=200'
                }
                alt={selectedEquipment.name}
                className="w-12 h-12 rounded-xl object-cover border border-slate-200 flex-shrink-0"
              />
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-bold text-slate-900 leading-tight truncate">
                  {selectedEquipment.name}
                </h4>
                <p className="text-[11px] font-mono text-sky-600 font-bold mt-0.5">
                  {selectedEquipment.code} &bull; {selectedEquipment.location}
                </p>
                <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">
                  Stok Tersedia: {selectedEquipment.availableQuantity} unit
                </p>
              </div>
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Jumlah Unit Yang Dipinjam *
              </label>
              <input
                type="number"
                min="1"
                max={selectedEquipment.availableQuantity}
                value={borrowForm.quantity}
                onChange={(e) =>
                  setBorrowForm({
                    ...borrowForm,
                    quantity: parseInt(e.target.value, 10) || 1,
                  })
                }
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-sky-500 outline-none"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Maksimal peminjaman: {selectedEquipment.availableQuantity} unit
              </p>
            </div>

            {/* Dates Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Tanggal Mulai Pinjam *
                </label>
                <input
                  type="date"
                  value={borrowForm.requestDate}
                  onChange={(e) =>
                    setBorrowForm({ ...borrowForm, requestDate: e.target.value })
                  }
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-sky-500 outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Tanggal Pengembalian *
                </label>
                <input
                  type="date"
                  value={borrowForm.returnDate}
                  onChange={(e) =>
                    setBorrowForm({ ...borrowForm, returnDate: e.target.value })
                  }
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-sky-500 outline-none font-mono"
                />
              </div>
            </div>

            {/* Purpose */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Tujuan & Keperluan Peminjaman *
              </label>
              <textarea
                rows={3}
                value={borrowForm.purpose}
                onChange={(e) =>
                  setBorrowForm({ ...borrowForm, purpose: e.target.value })
                }
                required
                placeholder="Sebutkan nama mata kuliah, topik tugas akhir / praktikum, atau riset..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-sky-500 outline-none resize-none"
              />
            </div>

            {/* Disclaimer */}
            <div className="p-3 rounded-xl bg-sky-50 border border-sky-100 text-xs text-sky-800 flex items-start gap-2">
              <Info className="w-4 h-4 text-sky-600 flex-shrink-0 mt-0.5" />
              <span>
                Dengan mengajukan, Anda setuju menjaga keutuhan alat dan mengembalikan tepat
                waktu sesuai jadwal yang diajukan.
              </span>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsBorrowModalOpen(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 shadow-md transition disabled:opacity-50"
              >
                {submitting ? 'Mengirim...' : 'Kirim Pengajuan Peminjaman'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </DashboardShell>
  );
}

export default function AvailableEquipmentPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-500">Memuat katalog...</div>}>
      <EquipmentCatalog />
    </Suspense>
  );
}
