'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import {
  FlaskConical,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  GraduationCap,
  Sparkles,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Harap masukkan email dan password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError(res.error);
        setLoading(false);
        return;
      }

      // Check role or redirect to callback or appropriate portal
      if (email.toLowerCase().includes('admin')) {
        router.push(callbackUrl || '/admin');
      } else {
        router.push(callbackUrl || '/dashboard');
      }
      router.refresh();
    } catch (err: any) {
      setError('Terjadi kesalahan koneksi saat login.');
      setLoading(false);
    }
  };

  // Quick Demo Login Helper
  const fillCredentials = (role: 'ADMIN' | 'STUDENT') => {
    if (role === 'ADMIN') {
      setEmail('admin@campus.ac.id');
      setPassword('admin123');
    } else {
      setEmail('student@campus.ac.id');
      setPassword('student123');
    }
    setError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-slate-950 text-slate-100 relative overflow-hidden">
      {/* Dynamic Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 group mb-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-xl shadow-sky-500/20 group-hover:scale-105 transition">
              <FlaskConical className="w-7 h-7 text-white" />
            </div>
            <div className="text-left">
              <div className="text-2xl font-black tracking-tight text-white">
                SIMLAB <span className="text-sky-400">KAMPUS</span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                Sistem Informasi Manajemen Lab
              </p>
            </div>
          </Link>
          <p className="text-slate-400 text-sm">
            Masuk ke portal laboratorium untuk mengelola aset, peminjaman, & reservasi ruang
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/50">
          {/* Quick Demo Role Switcher */}
          <div className="mb-6 p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/60">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-sky-400 mb-2.5">
              <Sparkles className="w-4 h-4" />
              <span>Akses Cepat Demo Pengguna</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => fillCredentials('ADMIN')}
                className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition active:scale-95"
              >
                <ShieldCheck className="w-4 h-4" />
                Sebagai Admin
              </button>
              <button
                type="button"
                onClick={() => fillCredentials('STUDENT')}
                className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/30 transition active:scale-95"
              >
                <GraduationCap className="w-4 h-4" />
                Sebagai Mahasiswa
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Alamat Email Kampus
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="contoh: nama@campus.ac.id"
                  className="w-full bg-slate-950 border border-slate-700 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-slate-500 outline-none transition"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Kata Sandi
                </label>
              </div>
              <div className="relative">
                <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-700 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-slate-500 outline-none transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 active:scale-[0.98] shadow-lg shadow-sky-500/25 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Masuk ke Sistem</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Bottom Register Link */}
          <div className="mt-6 pt-6 border-t border-slate-800 text-center text-xs text-slate-400">
            Belum memiliki akun mahasiswa?{' '}
            <Link
              href="/register"
              className="text-sky-400 hover:text-sky-300 font-semibold underline underline-offset-4"
            >
              Daftar Akun Baru
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Memuat formulir login...</div>}>
      <LoginForm />
    </Suspense>
  );
}
