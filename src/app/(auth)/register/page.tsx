'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  FlaskConical,
  Lock,
  Mail,
  User,
  BadgeInfo,
  Phone,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Image as ImageIcon,
} from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    nim: '',
    department: 'S1 Teknik Informatika',
    phone: '',
    password: '',
    confirmPassword: '',
    ktmImage: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleIdentityUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        setError('Ukuran file foto kartu identitas maksimal 3MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, ktmImage: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.password !== formData.confirmPassword) {
      setError('Konfirmasi password tidak cocok.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password minimal harus 6 karakter.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          nim: formData.nim,
          department: formData.department,
          phone: formData.phone,
          password: formData.password,
          ktmImage: formData.ktmImage || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Gagal mendaftarkan akun.');
        setLoading(false);
        return;
      }

      setSuccess('Registrasi berhasil! Mengalihkan ke halaman login...');
      setTimeout(() => {
        router.push('/login');
      }, 1500);
    } catch (err) {
      setError('Terjadi kesalahan jaringan.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-slate-950 text-slate-100 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-lg relative z-10 my-8">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-3 group mb-2">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-xl shadow-sky-500/20 group-hover:scale-105 transition">
              <FlaskConical className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <div className="text-xl font-black tracking-tight text-white">
                SIMLAB <span className="text-sky-400">KAMPUS</span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                Pendaftaran Akun Mahasiswa
              </p>
            </div>
          </Link>
          <p className="text-slate-400 text-xs">
            Daftarkan akun untuk akses peminjaman peralatan praktikum &amp; booking laboratorium
          </p>
        </div>

        {/* Register Card */}
        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/50">
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-5 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm flex items-start gap-2.5">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Nama Lengkap *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="contoh: Muhammad Rizky"
                  className="w-full bg-slate-950 border border-slate-700 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 outline-none transition"
                />
              </div>
            </div>

            {/* NIM & Department Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  NIM / ID Mahasiswa *
                </label>
                <div className="relative">
                  <BadgeInfo className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    name="nim"
                    value={formData.nim}
                    onChange={handleChange}
                    required
                    placeholder="21051204000"
                    className="w-full bg-slate-950 border border-slate-700 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 outline-none transition font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Program Studi *
                </label>
                <div className="relative">
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 rounded-xl py-2.5 px-3 text-sm text-white outline-none transition"
                  >
                    <option value="S1 Teknik Informatika">S1 Teknik Informatika</option>
                    <option value="S1 Sistem Informasi">S1 Sistem Informasi</option>
                    <option value="S1 Teknik Elektro">S1 Teknik Elektro</option>
                    <option value="S1 Teknik Komputer">S1 Teknik Komputer</option>
                    <option value="S1 Pendidikan Luar Biasa">S1 Pendidikan Luar Biasa</option>
                    <option value="D4 Rekayasa Perangkat Lunak">D4 RPL</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Email & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Email Kampus *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="nim@campus.ac.id"
                    className="w-full bg-slate-950 border border-slate-700 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  No. WhatsApp / HP
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="08123456789"
                    className="w-full bg-slate-950 border border-slate-700 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 outline-none transition"
                  />
                </div>
              </div>
            </div>

            {/* Password & Confirm */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder="Min. 6 karakter"
                    className="w-full bg-slate-950 border border-slate-700 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Ulangi Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-700 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 outline-none transition"
                  />
                </div>
              </div>
            </div>

            {/* Upload Foto Kartu Identitas */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Kartu Identitas (KTM / KTP / SIM)
              </label>
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-700 border-dashed hover:border-sky-500 transition">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleIdentityUpload}
                  className="w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-sky-500/20 file:text-sky-300 hover:file:bg-sky-500/30 cursor-pointer"
                />
                {formData.ktmImage ? (
                  <div className="mt-3 flex items-center gap-3">
                    <img
                      src={formData.ktmImage}
                      alt="Preview Identitas"
                      className="w-20 h-14 object-cover rounded-xl border border-slate-600 shadow"
                    />
                    <div className="text-xs">
                      <p className="font-semibold text-emerald-400">✓ Foto Kartu Identitas berhasil dimuat</p>
                      <button
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, ktmImage: '' }))}
                        className="text-[11px] text-rose-400 hover:underline mt-0.5"
                      >
                        Hapus / Ganti Foto
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                    Wajib melampirkan foto kartu identitas (<strong className="text-sky-300">KTM</strong>, <strong className="text-sky-300">KTP</strong>, atau <strong className="text-sky-300">SIM</strong>) format .jpg/.png max 3MB untuk verifikasi peminjaman alat lab.
                  </p>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 active:scale-[0.98] shadow-lg shadow-sky-500/25 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Daftar Sekarang</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-5 pt-5 border-t border-slate-800 text-center text-xs text-slate-400">
            Sudah memiliki akun?{' '}
            <Link
              href="/login"
              className="text-sky-400 hover:text-sky-300 font-semibold underline underline-offset-4"
            >
              Masuk di sini
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
