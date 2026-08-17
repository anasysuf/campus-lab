'use client';

import React, { useState, useEffect } from 'react';
import DashboardShell from '@/components/layout/DashboardShell';
import Modal from '@/components/ui/Modal';
import BarcodeModal from '@/components/admin/BarcodeModal';
import { ConditionBadge } from '@/components/ui/Badge';
import { generateAutoAssetCode } from '@/lib/barcode';
import {
  Boxes,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Package,
  Layers,
  MapPin,
  Image as ImageIcon,
  BarChart2,
  RefreshCw,
  QrCode,
  Sparkles,
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
  createdAt: string;
  _count?: {
    loans: number;
  };
}

export default function AdminInventoryPage() {
  const [equipment, setEquipment] = useState<EquipmentItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Search and Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedCondition, setSelectedCondition] = useState('ALL');

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isBarcodeModalOpen, setIsBarcodeModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<EquipmentItem | null>(null);
  const [barcodeItem, setBarcodeItem] = useState<EquipmentItem | null>(null);

  // Form states
  const initialForm = {
    name: '',
    code: '',
    category: 'Electronics & IoT',
    description: '',
    totalQuantity: 1,
    availableQuantity: 1,
    condition: 'GOOD',
    location: '',
    imageUrl: '',
  };
  const [formData, setFormData] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchEquipment = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (selectedCategory !== 'ALL') params.set('category', selectedCategory);
      if (selectedCondition !== 'ALL') params.set('condition', selectedCondition);

      const res = await fetch(`/api/equipment?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setEquipment(data.equipment || []);
        setCategories(data.categories || []);
      }
    } catch (err) {
      console.error(err);
      setToast({ type: 'error', message: 'Gagal memuat data inventaris.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchEquipment();
    }, 250);
    return () => clearTimeout(timeout);
  }, [search, selectedCategory, selectedCondition]);

  const handleOpenAdd = () => {
    const autoCode = generateAutoAssetCode('Electronics & IoT', equipment.length);
    setFormData({
      ...initialForm,
      code: autoCode,
    });
    setIsAddModalOpen(true);
  };

  const handleGenerateCode = (cat: string) => {
    const autoCode = generateAutoAssetCode(cat || formData.category, equipment.length);
    setFormData((prev) => ({ ...prev, code: autoCode }));
  };

  const handleOpenBarcode = (item: EquipmentItem) => {
    setBarcodeItem(item);
    setIsBarcodeModalOpen(true);
  };

  const handleOpenEdit = (item: EquipmentItem) => {
    setSelectedItem(item);
    setFormData({
      name: item.name,
      code: item.code,
      category: item.category,
      description: item.description || '',
      totalQuantity: item.totalQuantity,
      availableQuantity: item.availableQuantity,
      condition: item.condition,
      location: item.location || '',
      imageUrl: item.imageUrl || '',
    });
    setIsEditModalOpen(true);
  };

  const handleOpenDelete = (item: EquipmentItem) => {
    setSelectedItem(item);
    setIsDeleteModalOpen(true);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setToast(null);

    try {
      const res = await fetch('/api/equipment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (!res.ok) {
        setToast({ type: 'error', message: data.error || 'Gagal menambahkan alat.' });
      } else {
        setToast({ type: 'success', message: 'Peralatan berhasil ditambahkan ke inventaris!' });
        setIsAddModalOpen(false);
        fetchEquipment();
      }
    } catch (err) {
      setToast({ type: 'error', message: 'Terjadi kesalahan sistem.' });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;
    setSaving(true);
    setToast(null);

    try {
      const res = await fetch(`/api/equipment/${selectedItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (!res.ok) {
        setToast({ type: 'error', message: data.error || 'Gagal memperbarui alat.' });
      } else {
        setToast({ type: 'success', message: 'Data peralatan berhasil diperbarui!' });
        setIsEditModalOpen(false);
        fetchEquipment();
      }
    } catch (err) {
      setToast({ type: 'error', message: 'Terjadi kesalahan sistem.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedItem) return;
    setSaving(true);
    setToast(null);

    try {
      const res = await fetch(`/api/equipment/${selectedItem.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (!res.ok) {
        setToast({ type: 'error', message: data.error || 'Gagal menghapus alat.' });
      } else {
        setToast({ type: 'success', message: 'Peralatan berhasil dihapus dari inventaris.' });
        setIsDeleteModalOpen(false);
        fetchEquipment();
      }
    } catch (err) {
      setToast({ type: 'error', message: 'Terjadi kesalahan sistem.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardShell
      title="Manajemen Inventaris Alat Lab"
      subtitle="Kelola data katalog, stok fisik, kondisi, dan lokasi penyimpanan peralatan praktikum"
    >
      <div className="space-y-6">
        {/* Toast alert */}
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
                <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
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

        {/* Action Header: Search, Filters, Add Button */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari berdasarkan nama alat, kode, lokasi, atau deskripsi..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 text-sm outline-none transition"
            />
          </div>

          {/* Filter dropdowns */}
          <div className="flex items-center gap-3 flex-wrap">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 outline-none focus:border-sky-500 transition"
            >
              <option value="ALL">Semua Kategori</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <select
              value={selectedCondition}
              onChange={(e) => setSelectedCondition(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 outline-none focus:border-sky-500 transition"
            >
              <option value="ALL">Semua Kondisi</option>
              <option value="GOOD">Kondisi Baik</option>
              <option value="FAIR">Cukup / Perlu Cek</option>
              <option value="MAINTENANCE">Dalam Perawatan</option>
              <option value="DAMAGED">Rusak</option>
            </select>

            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 shadow-md shadow-sky-500/25 active:scale-95 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Alat</span>
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50/80 text-xs uppercase tracking-wider text-slate-500 border-b border-slate-200/80">
                <tr>
                  <th className="py-4 px-6 font-bold">Peralatan & Kode</th>
                  <th className="py-4 px-4 font-bold">Kategori</th>
                  <th className="py-4 px-4 font-bold">Lokasi</th>
                  <th className="py-4 px-4 font-bold text-center">Ketersediaan Stok</th>
                  <th className="py-4 px-4 font-bold">Kondisi</th>
                  <th className="py-4 px-6 font-bold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-7 h-7 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
                        <span className="text-xs font-medium">Memuat inventaris...</span>
                      </div>
                    </td>
                  </tr>
                ) : equipment.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      <Package className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                      <p className="font-semibold text-slate-600">Tidak ada peralatan ditemukan.</p>
                      <p className="text-xs text-slate-400 mt-1">
                        Coba ubah kata kunci pencarian atau tambahkan peralatan baru.
                      </p>
                    </td>
                  </tr>
                ) : (
                  equipment.map((item) => {
                    const borrowed = item.totalQuantity - item.availableQuantity;
                    const percentAvailable =
                      item.totalQuantity > 0
                        ? Math.round((item.availableQuantity / item.totalQuantity) * 100)
                        : 0;

                    return (
                      <tr key={item.id} className="hover:bg-slate-50/60 transition group">
                        {/* Equipment & Code */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3.5">
                            <img
                              src={
                                item.imageUrl ||
                                'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=200'
                              }
                              alt={item.name}
                              className="w-12 h-12 rounded-xl object-cover border border-slate-200 flex-shrink-0"
                            />
                            <div>
                              <p className="font-bold text-slate-900 leading-tight">
                                {item.name}
                              </p>
                              <p className="text-xs font-mono font-bold text-sky-600 mt-0.5">
                                {item.code}
                              </p>
                              {item.description && (
                                <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                                  {item.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-4 px-4">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700">
                            {item.category}
                          </span>
                        </td>

                        {/* Location */}
                        <td className="py-4 px-4 text-xs font-medium text-slate-600">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                            <span>{item.location || 'Laboratorium Umum'}</span>
                          </div>
                        </td>

                        {/* Stock Level Bar */}
                        <td className="py-4 px-4">
                          <div className="w-36 mx-auto">
                            <div className="flex items-center justify-between text-xs font-bold mb-1">
                              <span className="text-emerald-600">
                                {item.availableQuantity} Ada
                              </span>
                              <span className="text-slate-400">
                                Total: {item.totalQuantity}
                              </span>
                            </div>
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden flex">
                              <div
                                style={{ width: `${percentAvailable}%` }}
                                className={`h-full ${
                                  percentAvailable > 50
                                    ? 'bg-emerald-500'
                                    : percentAvailable > 20
                                    ? 'bg-amber-500'
                                    : 'bg-rose-500'
                                }`}
                              />
                            </div>
                            {borrowed > 0 && (
                              <p className="text-[10px] text-indigo-600 text-center mt-1 font-semibold">
                                {borrowed} unit sedang dipinjam
                              </p>
                            )}
                          </div>
                        </td>

                        {/* Condition */}
                        <td className="py-4 px-4">
                          <ConditionBadge condition={item.condition} />
                        </td>

                        {/* Action buttons */}
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenBarcode(item)}
                              className="p-2 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition"
                              title="Lihat Barcode & Cetak Label Stiker"
                            >
                              <QrCode className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleOpenEdit(item)}
                              className="p-2 rounded-lg text-slate-500 hover:text-sky-600 hover:bg-sky-50 transition"
                              title="Edit Peralatan"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleOpenDelete(item)}
                              className="p-2 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition"
                              title="Hapus Peralatan"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
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

      {/* CREATE EQUIPMENT MODAL */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Tambah Peralatan Lab Baru"
        subtitle="Daftarkan instrumen atau modul praktikum ke database inventaris"
        maxWidth="2xl"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Nama Lengkap Alat *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="contoh: Digital Storage Oscilloscope 100MHz"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 outline-none"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Kode Inventaris / Barcode *
                </label>
                <button
                  type="button"
                  onClick={() => handleGenerateCode(formData.category)}
                  className="text-[11px] font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" />
                  Generate Kode
                </button>
              </div>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                required
                placeholder="LAB-EL-2026-001"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-mono focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 outline-none uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Kategori Peralatan *
              </label>
              <select
                value={formData.category}
                onChange={(e) => {
                  const newCat = e.target.value;
                  setFormData({ ...formData, category: newCat });
                  handleGenerateCode(newCat);
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-sky-500 outline-none"
              >
                <option value="Electronics & IoT">Electronics & IoT</option>
                <option value="Computer & Network">Computer & Network</option>
                <option value="Robotics & AI">Robotics & AI</option>
                <option value="Multimedia & VR">Multimedia & VR</option>
                <option value="Special Education Tools">Special Education Tools</option>
                <option value="General Lab Tools">General Lab Tools</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Total Jumlah Unit (Fisik) *
              </label>
              <input
                type="number"
                min="1"
                value={formData.totalQuantity}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10) || 1;
                  setFormData({ ...formData, totalQuantity: val, availableQuantity: val });
                }}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-sky-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Kondisi Fisik Alat
              </label>
              <select
                value={formData.condition}
                onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-sky-500 outline-none"
              >
                <option value="GOOD">Kondisi Baik / Siap Pakai</option>
                <option value="FAIR">Cukup / Perlu Pengecekan</option>
                <option value="MAINTENANCE">Dalam Perawatan (Maintenance)</option>
                <option value="DAMAGED">Rusak</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Lokasi / Rak Penyimpanan
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="contoh: Lab Elektronika - Rak A1"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-sky-500 outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                URL Foto Peralatan
              </label>
              <input
                type="url"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                placeholder="https://images.unsplash.com/photo-..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-sky-500 outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Deskripsi & Spesifikasi Singkat
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Spesifikasi modul, kelengkapan kabel, adaptor, dll..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-sky-500 outline-none resize-none"
              />
            </div>
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
              {saving ? 'Menyimpan...' : 'Simpan ke Inventaris'}
            </button>
          </div>
        </form>
      </Modal>

      {/* EDIT EQUIPMENT MODAL */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Ubah Data Peralatan"
        subtitle={`Perbarui informasi untuk ${selectedItem?.name}`}
        maxWidth="2xl"
      >
        <form onSubmit={handleUpdate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Nama Alat
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-sky-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Kode Inventaris
              </label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-mono focus:border-sky-500 outline-none uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Kategori
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-sky-500 outline-none"
              >
                <option value="Electronics & IoT">Electronics & IoT</option>
                <option value="Computer & Network">Computer & Network</option>
                <option value="Robotics & AI">Robotics & AI</option>
                <option value="Multimedia & VR">Multimedia & VR</option>
                <option value="Special Education Tools">Special Education Tools</option>
                <option value="General Lab Tools">General Lab Tools</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Total Jumlah Unit
              </label>
              <input
                type="number"
                min="1"
                value={formData.totalQuantity}
                onChange={(e) =>
                  setFormData({ ...formData, totalQuantity: parseInt(e.target.value, 10) || 1 })
                }
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-sky-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Jumlah Tersedia Saat Ini
              </label>
              <input
                type="number"
                min="0"
                max={formData.totalQuantity}
                value={formData.availableQuantity}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    availableQuantity: parseInt(e.target.value, 10) || 0,
                  })
                }
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-sky-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Kondisi
              </label>
              <select
                value={formData.condition}
                onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-sky-500 outline-none"
              >
                <option value="GOOD">Kondisi Baik / Siap Pakai</option>
                <option value="FAIR">Cukup / Perlu Pengecekan</option>
                <option value="MAINTENANCE">Dalam Perawatan</option>
                <option value="DAMAGED">Rusak</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Lokasi / Rak
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-sky-500 outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                URL Gambar
              </label>
              <input
                type="url"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-sky-500 outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Deskripsi
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-sky-500 outline-none resize-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 shadow-md transition disabled:opacity-50"
            >
              {saving ? 'Menyimpan...' : 'Perbarui Data'}
            </button>
          </div>
        </form>
      </Modal>

      {/* DELETE CONFIRMATION MODAL */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Konfirmasi Hapus Peralatan"
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Apakah Anda yakin ingin menghapus alat ini?</p>
              <p className="text-xs mt-1 text-rose-700">
                Peralatan <strong className="text-slate-900">{selectedItem?.name}</strong> ({selectedItem?.code}) akan dihapus secara permanen dari basis data inventaris.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={saving}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-md transition disabled:opacity-50"
            >
              {saving ? 'Menghapus...' : 'Ya, Hapus Sekarang'}
            </button>
          </div>
        </div>
      </Modal>

      {/* BARCODE & LABEL PRINTING MODAL */}
      <BarcodeModal
        isOpen={isBarcodeModalOpen}
        onClose={() => setIsBarcodeModalOpen(false)}
        equipment={barcodeItem}
      />
    </DashboardShell>
  );
}
