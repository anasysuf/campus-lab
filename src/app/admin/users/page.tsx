'use client';

import React, { useState, useEffect } from 'react';
import DashboardShell from '@/components/layout/DashboardShell';
import Modal from '@/components/ui/Modal';
import { formatDate, formatDateTime } from '@/lib/utils';
import {
  Users,
  Search,
  Plus,
  Edit2,
  Trash2,
  ShieldCheck,
  GraduationCap,
  CreditCard,
  Phone,
  Mail,
  Building,
  CheckCircle2,
  AlertTriangle,
  Eye,
  KeyRound,
  FileCheck,
  Calendar,
  Sparkles,
} from 'lucide-react';

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: string;
  nim: string | null;
  department: string | null;
  phone: string | null;
  avatar: string | null;
  ktmImage: string | null;
  createdAt: string;
  _count: {
    loans: number;
    bookings: number;
  };
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState('ALL');
  const [selectedDepartment, setSelectedDepartment] = useState('ALL');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [previewKtmUrl, setPreviewKtmUrl] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'STUDENT',
    nim: '',
    department: 'S1 Teknik Informatika',
    phone: '',
    avatar: '',
    ktmImage: '',
  });

  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (selectedRole !== 'ALL') params.set('role', selectedRole);
      if (selectedDepartment !== 'ALL') params.set('department', selectedDepartment);

      const res = await fetch(`/api/users?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
        setDepartments(data.departments || []);
      }
    } catch (err) {
      console.error(err);
      setToast({ type: 'error', message: 'Gagal memuat data pengguna.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchUsers();
    }, 250);
    return () => clearTimeout(timeout);
  }, [search, selectedRole, selectedDepartment]);

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      email: '',
      password: 'password123',
      role: 'STUDENT',
      nim: '',
      department: 'S1 Teknik Informatika',
      phone: '',
      avatar: '',
      ktmImage: '',
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (user: UserItem) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
      nim: user.nim || '',
      department: user.department || 'S1 Teknik Informatika',
      phone: user.phone || '',
      avatar: user.avatar || '',
      ktmImage: user.ktmImage || '',
    });
    setIsEditModalOpen(true);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setToast(null);

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (!res.ok) {
        setToast({ type: 'error', message: data.error || 'Gagal menambahkan akun.' });
      } else {
        setToast({ type: 'success', message: 'Akun pengguna berhasil ditambahkan!' });
        setIsAddModalOpen(false);
        fetchUsers();
      }
    } catch (err) {
      setToast({ type: 'error', message: 'Terjadi kesalahan sistem.' });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    setSaving(true);
    setToast(null);

    try {
      const payload: any = {
        name: formData.name,
        role: formData.role,
        nim: formData.nim,
        department: formData.department,
        phone: formData.phone,
        avatar: formData.avatar,
        ktmImage: formData.ktmImage,
      };
      if (formData.password) {
        payload.newPassword = formData.password;
      }

      const res = await fetch(`/api/users/${selectedUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        setToast({ type: 'error', message: data.error || 'Gagal memperbarui akun.' });
      } else {
        setToast({ type: 'success', message: 'Data akun pengguna berhasil diperbarui!' });
        setIsEditModalOpen(false);
        fetchUsers();
      }
    } catch (err) {
      setToast({ type: 'error', message: 'Terjadi kesalahan sistem.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedUser) return;
    setSaving(true);
    setToast(null);

    try {
      const res = await fetch(`/api/users/${selectedUser.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (!res.ok) {
        setToast({ type: 'error', message: data.error || 'Gagal menghapus akun.' });
      } else {
        setToast({ type: 'success', message: 'Akun pengguna berhasil dihapus.' });
        setIsDeleteModalOpen(false);
        fetchUsers();
      }
    } catch (err) {
      setToast({ type: 'error', message: 'Terjadi kesalahan sistem.' });
    } finally {
      setSaving(false);
    }
  };

  // Convert uploaded image file to Base64
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, targetField: 'ktmImage' | 'avatar') => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        alert('Ukuran file maksimal adalah 3MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, [targetField]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <DashboardShell
      title="Manajemen Data Akun Mahasiswa & Staf"
      subtitle="Pemeriksaan identitas mahasiswa, verifikasi foto KTM, pengelolaan peran, dan rekam jejak aktivitas lab"
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

        {/* Action Header: Search, Filters, Add Button */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari berdasarkan nama, NIM, email, nomor telepon, atau program studi..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 text-sm outline-none transition"
            />
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 outline-none focus:border-sky-500 transition"
            >
              <option value="ALL">Semua Peran (Role)</option>
              <option value="STUDENT">Mahasiswa</option>
              <option value="ADMIN">Admin Lab</option>
            </select>

            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 outline-none focus:border-sky-500 transition"
            >
              <option value="ALL">Semua Program Studi</option>
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>

            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 shadow-md shadow-sky-500/25 active:scale-95 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Pengguna</span>
            </button>
          </div>
        </div>

        {/* Users Data Table */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50/80 text-xs uppercase tracking-wider text-slate-500 border-b border-slate-200/80">
                <tr>
                  <th className="py-4 px-6 font-bold">Mahasiswa / Pengguna</th>
                  <th className="py-4 px-4 font-bold">NIM &amp; Program Studi</th>
                  <th className="py-4 px-4 font-bold text-center">Kartu Identitas</th>
                  <th className="py-4 px-4 font-bold">Kontak WhatsApp</th>
                  <th className="py-4 px-4 font-bold text-center">Aktivitas Lab</th>
                  <th className="py-4 px-4 font-bold">Peran</th>
                  <th className="py-4 px-6 font-bold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-7 h-7 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
                        <span className="text-xs font-medium">Memuat data pengguna...</span>
                      </div>
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      <Users className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                      <p className="font-semibold text-slate-600">Tidak ada pengguna ditemukan.</p>
                    </td>
                  </tr>
                ) : (
                  users.map((user) => {
                    const isAdmin = user.role === 'ADMIN';

                    return (
                      <tr key={user.id} className="hover:bg-slate-50/60 transition group">
                        {/* User identity */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3.5">
                            <img
                              src={
                                user.avatar ||
                                `https://api.dicebear.com/7.x/bottts/svg?seed=${user.email}`
                              }
                              alt={user.name}
                              className="w-10 h-10 rounded-full object-cover border border-slate-200"
                            />
                            <div>
                              <p className="font-bold text-slate-900 leading-tight">
                                {user.name}
                              </p>
                              <p className="text-xs text-slate-500 mt-0.5">{user.email}</p>
                              <p className="text-[10px] text-slate-400 mt-0.5">
                                Terdaftar: {formatDate(user.createdAt)}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* NIM & Department */}
                        <td className="py-4 px-4">
                          <div>
                            <p className="font-mono text-xs font-bold text-sky-600">
                              {user.nim || '-'}
                            </p>
                            <p className="text-xs text-slate-600 mt-0.5">
                              {user.department || '-'}
                            </p>
                          </div>
                        </td>

                        {/* Kartu Identitas */}
                        <td className="py-4 px-4 text-center">
                          {user.ktmImage ? (
                            <button
                              onClick={() => setPreviewKtmUrl(user.ktmImage)}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-100 transition"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Lihat Identitas</span>
                            </button>
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">
                              {isAdmin ? '-' : 'Belum upload'}
                            </span>
                          )}
                        </td>

                        {/* Phone / WhatsApp */}
                        <td className="py-4 px-4 text-xs font-medium text-slate-700">
                          {user.phone ? (
                            <div className="flex items-center gap-1.5">
                              <Phone className="w-3.5 h-3.5 text-emerald-500" />
                              <span>{user.phone}</span>
                            </div>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>

                        {/* Lab Activity Counts */}
                        <td className="py-4 px-4 text-center">
                          <div className="flex items-center justify-center gap-2 text-xs">
                            <span
                              className="px-2 py-0.5 rounded-full bg-slate-100 font-bold text-slate-700"
                              title="Jumlah Peminjaman Alat"
                            >
                              {user._count.loans} Pinjam
                            </span>
                            <span
                              className="px-2 py-0.5 rounded-full bg-slate-100 font-bold text-slate-700"
                              title="Jumlah Reservasi Ruang Lab"
                            >
                              {user._count.bookings} Lab
                            </span>
                          </div>
                        </td>

                        {/* Role Badge */}
                        <td className="py-4 px-4">
                          {isAdmin ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              <ShieldCheck className="w-3 h-3" />
                              ADMIN
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-sky-50 text-sky-700 border border-sky-200">
                              <GraduationCap className="w-3 h-3" />
                              MAHASISWA
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenEdit(user)}
                              className="p-2 rounded-lg text-slate-500 hover:text-sky-600 hover:bg-sky-50 transition"
                              title="Edit Data Pengguna"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                setIsDeleteModalOpen(true);
                              }}
                              className="p-2 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition"
                              title="Hapus Pengguna"
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

      {/* MODAL PREVIEW FOTO KARTU IDENTITAS */}
      <Modal
        isOpen={previewKtmUrl !== null}
        onClose={() => setPreviewKtmUrl(null)}
        title="Pratinjau Kartu Identitas (KTM / KTP / SIM)"
        maxWidth="lg"
      >
        <div className="space-y-4 text-center">
          {previewKtmUrl && (
            <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-md bg-slate-950/5 p-2">
              <img
                src={previewKtmUrl}
                alt="Kartu Identitas"
                className="w-full max-h-[70vh] object-contain rounded-xl mx-auto"
              />
            </div>
          )}
          <div className="flex justify-end">
            <button
              onClick={() => setPreviewKtmUrl(null)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
            >
              Tutup Pratinjau
            </button>
          </div>
        </div>
      </Modal>

      {/* CREATE USER MODAL */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Tambah Akun Pengguna Baru"
        subtitle="Daftarkan akun mahasiswa atau koordinator lab secara manual"
        maxWidth="2xl"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Nama Lengkap *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="contoh: Muhammad Rizky"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-sky-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Email Kampus *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                placeholder="nama@campus.ac.id"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-sky-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Password Awal *
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                placeholder="Minimal 6 karakter"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-sky-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Peran (Role) *
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-sky-500 outline-none"
              >
                <option value="STUDENT">Mahasiswa (Peminjam)</option>
                <option value="ADMIN">Admin Lab (Koordinator)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                NIM / NIP
              </label>
              <input
                type="text"
                value={formData.nim}
                onChange={(e) => setFormData({ ...formData, nim: e.target.value })}
                placeholder="21051204000"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-sky-500 outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Program Studi / Departemen
              </label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-sky-500 outline-none"
              >
                <option value="S1 Teknik Informatika">S1 Teknik Informatika</option>
                <option value="S1 Sistem Informasi">S1 Sistem Informasi</option>
                <option value="S1 Teknik Elektro">S1 Teknik Elektro</option>
                <option value="S1 Teknik Komputer">S1 Teknik Komputer</option>
                <option value="S1 Pendidikan Luar Biasa">S1 Pendidikan Luar Biasa</option>
                <option value="D4 Rekayasa Perangkat Lunak">D4 Rekayasa Perangkat Lunak</option>
                <option value="Laboratorium Terpadu">Laboratorium Terpadu (Staf)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Nomor Telepon / WhatsApp
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="081234567890"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-sky-500 outline-none"
              />
            </div>

            {/* Foto Kartu Identitas (Hanya untuk Mahasiswa) */}
            {formData.role === 'STUDENT' && (
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Foto Kartu Identitas (KTM / KTP / SIM)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'ktmImage')}
                  className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100 cursor-pointer"
                />
                {formData.ktmImage && (
                  <div className="mt-2 flex items-center gap-2">
                    <img
                      src={formData.ktmImage}
                      alt="Preview Identitas"
                      className="w-16 h-12 object-cover rounded-lg border"
                    />
                    <span className="text-xs text-emerald-600 font-semibold">
                      Foto Kartu Identitas terlampir
                    </span>
                  </div>
                )}
              </div>
            )}
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
              {saving ? 'Menyimpan...' : 'Simpan Akun'}
            </button>
          </div>
        </form>
      </Modal>

      {/* EDIT USER MODAL */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Ubah Data Akun Pengguna"
        subtitle={`Mengubah informasi untuk ${selectedUser?.name}`}
        maxWidth="2xl"
      >
        <form onSubmit={handleUpdate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Nama Lengkap
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
                Peran (Role)
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-sky-500 outline-none"
              >
                <option value="STUDENT">Mahasiswa (Peminjam)</option>
                <option value="ADMIN">Admin Lab (Koordinator)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                NIM / NIP
              </label>
              <input
                type="text"
                value={formData.nim}
                onChange={(e) => setFormData({ ...formData, nim: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-sky-500 outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Program Studi
              </label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-sky-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Nomor Telepon
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-sky-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Reset Password
              </label>
              <input
                type="text"
                disabled
                value="Dinonaktifkan pada mode demo"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-xs text-slate-400 font-semibold cursor-not-allowed outline-none"
              />
            </div>

            {/* Foto Kartu Identitas (Hanya untuk Mahasiswa) */}
            {formData.role === 'STUDENT' && (
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Update Foto Kartu Identitas (KTM / KTP / SIM)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'ktmImage')}
                  className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100 cursor-pointer"
                />
                {formData.ktmImage && (
                  <div className="mt-2 flex items-center gap-3">
                    <img
                      src={formData.ktmImage}
                      alt="Kartu Identitas"
                      className="w-20 h-14 object-cover rounded-lg border"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, ktmImage: '' })}
                      className="text-xs text-rose-600 font-bold hover:underline"
                    >
                      Hapus Foto Identitas
                    </button>
                  </div>
                )}
              </div>
            )}
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
              {saving ? 'Menyimpan...' : 'Perbarui Akun'}
            </button>
          </div>
        </form>
      </Modal>

      {/* DELETE CONFIRMATION MODAL */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Konfirmasi Hapus Akun"
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
            <p className="font-bold text-sm text-rose-900 mb-1">
              Apakah Anda yakin ingin menghapus akun ini?
            </p>
            Akun <strong>{selectedUser?.name}</strong> ({selectedUser?.email}) beserta semua data
            terkait akan dihapus secara permanen.
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
              {saving ? 'Menghapus...' : 'Ya, Hapus Akun'}
            </button>
          </div>
        </div>
      </Modal>
    </DashboardShell>
  );
}
