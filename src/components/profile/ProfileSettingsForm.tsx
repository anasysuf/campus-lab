'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  User,
  Mail,
  Phone,
  Building,
  Lock,
  Camera,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  GraduationCap,
  Eye,
  KeyRound,
  FileCheck,
} from 'lucide-react';

export default function ProfileSettingsForm() {
  const { data: session, update: updateSession } = useSession();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    nim: '',
    department: '',
    phone: '',
    avatar: '',
    ktmImage: '',
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [previewKtm, setPreviewKtm] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/profile');
        if (res.ok) {
          const user = await res.json();
          setFormData((prev) => ({
            ...prev,
            name: user.name || '',
            email: user.email || '',
            nim: user.nim || '',
            department: user.department || '',
            phone: user.phone || '',
            avatar: user.avatar || '',
            ktmImage: user.ktmImage || '',
          }));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'avatar' | 'ktmImage'
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        setToast({ type: 'error', message: 'Ukuran file gambar maksimal 3MB.' });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, [field]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setToast(null);

    // Password validation
    if (formData.newPassword) {
      if (formData.newPassword !== formData.confirmNewPassword) {
        setToast({ type: 'error', message: 'Konfirmasi kata sandi baru tidak cocok.' });
        return;
      }
      if (formData.newPassword.length < 6) {
        setToast({ type: 'error', message: 'Kata sandi baru minimal harus 6 karakter.' });
        return;
      }
      if (!formData.currentPassword) {
        setToast({
          type: 'error',
          message: 'Masukkan kata sandi lama Anda untuk konfirmasi perubahan password.',
        });
        return;
      }
    }

    setSaving(true);

    try {
      const payload: any = {
        name: formData.name,
        phone: formData.phone,
        department: formData.department,
        avatar: formData.avatar,
        ktmImage: formData.ktmImage,
      };

      if (formData.newPassword) {
        payload.currentPassword = formData.currentPassword;
        payload.newPassword = formData.newPassword;
      }

      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setToast({ type: 'error', message: data.error || 'Gagal memperbarui profil.' });
      } else {
        setToast({ type: 'success', message: 'Profil akun pribadi Anda berhasil diperbarui!' });
        setFormData((prev) => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmNewPassword: '',
        }));

        // Trigger session update for navbar / sidebar
        if (updateSession) {
          updateSession({
            name: data.user?.name,
            avatar: data.user?.avatar,
            phone: data.user?.phone,
            department: data.user?.department,
            ktmImage: data.user?.ktmImage,
          });
        }
      }
    } catch (err) {
      setToast({ type: 'error', message: 'Terjadi kesalahan sistem.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-400">
        <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <span className="text-xs font-medium">Memuat data profil akun...</span>
      </div>
    );
  }

  const isAdmin = session?.user?.role === 'ADMIN';

  return (
    <div className="space-y-6 max-w-4xl">
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

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Identity & Avatar Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Informasi Identitas &amp; Profil
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Perbarui data diri, nomor kontak WhatsApp, dan foto profil Anda
              </p>
            </div>
            {isAdmin ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                <ShieldCheck className="w-4 h-4" />
                ADMIN LABORATURIUM
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-sky-50 text-sky-700 border border-sky-200">
                <GraduationCap className="w-4 h-4" />
                MAHASISWA
              </span>
            )}
          </div>

          {/* Avatar and Info Row */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="flex flex-col items-center gap-2">
              <div className="relative group">
                <img
                  src={
                    formData.avatar ||
                    `https://api.dicebear.com/7.x/bottts/svg?seed=${formData.email}`
                  }
                  alt="Avatar"
                  className="w-24 h-24 rounded-full object-cover border-4 border-slate-100 shadow-md bg-slate-50"
                />
                <label className="absolute bottom-0 right-0 p-2 rounded-full bg-sky-600 hover:bg-sky-700 text-white shadow-md cursor-pointer transition">
                  <Camera className="w-4 h-4" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'avatar')}
                    className="hidden"
                  />
                </label>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">Ubah Foto Profil</span>
            </div>

            <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Nama Lengkap *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Email Kampus (Akun Login)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={formData.email}
                    disabled
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-100/80 text-sm text-slate-500 cursor-not-allowed outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  NIM / NIP
                </label>
                <input
                  type="text"
                  value={formData.nim}
                  onChange={(e) => setFormData({ ...formData, nim: e.target.value })}
                  placeholder="21051204000"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-sky-500 outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Program Studi / Unit
                </label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  placeholder="contoh: S1 Teknik Informatika"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-sky-500 outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Nomor WhatsApp / Telepon Aktif
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="contoh: 081234567890"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-sky-500 outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Kartu Identitas (HANYA UNTUK MAHASISWA, TIDAK DITAMPILKAN PADA ADMIN) */}
        {!isAdmin && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-sky-600" />
                  Kartu Identitas (KTM / KTP / SIM)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Digunakan sebagai verifikasi identitas resmi saat pengambilan alat fisik di laboratorium
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-800">
                    {formData.ktmImage
                      ? 'Foto Kartu Identitas Anda telah terunggah'
                      : 'Belum mengunggah foto kartu identitas'}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Dapat berupa foto <strong className="text-slate-700">KTM</strong>, <strong className="text-slate-700">KTP</strong>, atau <strong className="text-slate-700">SIM</strong> (format JPG/PNG maks 3MB).
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <label className="px-3.5 py-2 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white shadow-sm cursor-pointer transition">
                    <span>
                      {formData.ktmImage ? 'Ganti Kartu Identitas' : 'Upload Kartu Identitas'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'ktmImage')}
                      className="hidden"
                    />
                  </label>
                  {formData.ktmImage && (
                    <button
                      type="button"
                      onClick={() => setPreviewKtm(true)}
                      className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-200 hover:bg-slate-300 text-slate-700 transition"
                    >
                      Lihat Kartu Identitas
                    </button>
                  )}
                </div>
              </div>

              {formData.ktmImage && (
                <div className="mt-4 pt-3 border-t border-slate-200 flex items-center gap-4">
                  <img
                    src={formData.ktmImage}
                    alt="Kartu Identitas"
                    className="w-28 h-18 object-cover rounded-xl border border-slate-300 shadow-sm"
                  />
                  <span className="text-xs text-emerald-600 font-semibold">
                    ✓ Foto Kartu Identitas siap tersimpan
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Section 3: Security & Password Change */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-indigo-600" />
                Ganti Kata Sandi (Password)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Kosongkan bidang ini jika Anda tidak ingin mengubah password
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Kata Sandi Lama
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={formData.currentPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, currentPassword: e.target.value })
                  }
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-sky-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Kata Sandi Baru
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={formData.newPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, newPassword: e.target.value })
                  }
                  placeholder="Min. 6 karakter"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-sky-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Ulangi Kata Sandi Baru
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={formData.confirmNewPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, confirmNewPassword: e.target.value })
                  }
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-sky-500 outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Submit button bar */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 shadow-lg shadow-sky-500/25 active:scale-95 transition disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <CheckCircle2 className="w-4 h-4" />
            )}
            <span>{saving ? 'Menyimpan Perubahan...' : 'Simpan Perubahan Akun'}</span>
          </button>
        </div>
      </form>

      {/* Preview KTM Modal */}
      {previewKtm && formData.ktmImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="relative bg-white rounded-3xl p-6 max-w-lg w-full border shadow-2xl">
            <h4 className="text-base font-bold text-slate-900 mb-3">
              Foto Kartu Tanda Mahasiswa (KTM)
            </h4>
            <img
              src={formData.ktmImage}
              alt="KTM Preview"
              className="w-full max-h-[60vh] object-contain rounded-2xl border"
            />
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setPreviewKtm(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
