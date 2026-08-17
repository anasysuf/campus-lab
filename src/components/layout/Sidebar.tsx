'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Boxes,
  ClipboardCheck,
  CalendarDays,
  Sparkles,
  BookOpen,
  History,
  DoorOpen,
  FlaskConical,
  LogOut,
  ChevronRight,
  ShieldCheck,
  GraduationCap,
  Users,
  UserCog,
  FileSpreadsheet,
  QrCode,
} from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === 'ADMIN';

  const adminNav = [
    {
      label: 'Ikhtisar Lab',
      href: '/admin',
      icon: LayoutDashboard,
      desc: 'Ringkasan & metrik lab',
    },
    {
      label: 'Manajemen Inventaris',
      href: '/admin/inventory',
      icon: Boxes,
      desc: 'Katalog, barcode, stok alat',
    },
    {
      label: 'Cetak Stiker Barcode',
      href: '/admin/barcodes',
      icon: QrCode,
      desc: 'Studio label fisik aset',
    },
    {
      label: 'Persetujuan Peminjaman',
      href: '/admin/loans',
      icon: ClipboardCheck,
      desc: 'Verifikasi permohonan',
    },
    {
      label: 'Jadwal & Pemeliharaan',
      href: '/admin/schedules',
      icon: CalendarDays,
      desc: 'Kalender ruang & servis',
    },
    {
      label: 'Rekap & Laporan Lab',
      href: '/admin/reports',
      icon: FileSpreadsheet,
      desc: 'Rekap semester & ekspor',
    },
    {
      label: 'Data Akun Mahasiswa',
      href: '/admin/users',
      icon: Users,
      desc: 'Verifikasi identitas & akun',
    },
    {
      label: 'Pengaturan Akun',
      href: '/admin/profile',
      icon: UserCog,
      desc: 'Profil pribadi & password',
    },
  ];

  const studentNav = [
    {
      label: 'Portal Mahasiswa',
      href: '/dashboard',
      icon: LayoutDashboard,
      desc: 'Ringkasan aktivitas lab',
    },
    {
      label: 'Katalog Peralatan',
      href: '/dashboard/equipment',
      icon: FlaskConical,
      desc: 'Cari & ajukan pinjaman',
    },
    {
      label: 'Peminjaman Saya',
      href: '/dashboard/loans',
      icon: History,
      desc: 'Status pinjaman aktif',
    },
    {
      label: 'Reservasi Ruang Lab',
      href: '/dashboard/bookings',
      icon: DoorOpen,
      desc: 'Booking jadwal ruangan',
    },
    {
      label: 'Pengaturan Akun',
      href: '/dashboard/profile',
      icon: UserCog,
      desc: 'Profil, KTM, & password',
    },
  ];

  const navItems = isAdmin ? adminNav : studentNav;

  return (
    <>
      {/* Mobile overlay backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-72 bg-slate-900 text-slate-100 flex flex-col transition-transform duration-300 ease-in-out border-r border-slate-800 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <Link href={isAdmin ? '/admin' : '/dashboard'} className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/25 group-hover:scale-105 transition">
              <FlaskConical className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-sky-300 bg-clip-text text-transparent">
                SIMLAB KAMPUS
              </div>
              <p className="text-[11px] text-slate-400 font-medium tracking-wide">
                Sistem Manajemen Lab Terpadu
              </p>
            </div>
          </Link>
        </div>

        {/* User Identity Chip */}
        <div className="px-5 py-4 mx-4 my-3 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center gap-3">
          <div className="relative">
            <img
              src={session?.user?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${session?.user?.email || 'user'}`}
              alt={session?.user?.name || 'User'}
              className="w-10 h-10 rounded-full object-cover border-2 border-sky-400/40 bg-slate-700"
            />
            <span
              className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-slate-900 ${
                isAdmin ? 'bg-amber-400' : 'bg-emerald-400'
              }`}
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{session?.user?.name || 'Pengguna'}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              {isAdmin ? (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  <ShieldCheck className="w-2.5 h-2.5" />
                  ADMIN LAB
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  <GraduationCap className="w-2.5 h-2.5" />
                  MAHASISWA
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Section */}
        <div className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
          <div className="px-3 py-2 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
            Menu Utama
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/admin' && item.href !== '/dashboard' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`group flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-lg shadow-sky-500/20'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon
                    className={`w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-sky-400'
                    }`}
                  />
                  <div className="truncate">
                    <div className="font-semibold">{item.label}</div>
                    <div
                      className={`text-[11px] truncate ${
                        isActive ? 'text-sky-100' : 'text-slate-400'
                      }`}
                    >
                      {item.desc}
                    </div>
                  </div>
                </div>
                <ChevronRight
                  className={`w-4 h-4 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all ${
                    isActive ? 'opacity-100 translate-x-0 text-white' : 'text-slate-400'
                  }`}
                />
              </Link>
            );
          })}
        </div>

        {/* Quick Portal Switcher (For Demo & Fast Navigation) */}
        <div className="p-4 mx-4 my-2 rounded-xl bg-slate-800/40 border border-slate-700/50">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            Mode Peran
          </div>
          {isAdmin ? (
            <Link
              href="/dashboard"
              className="flex items-center justify-between text-xs text-sky-300 hover:text-sky-200 bg-sky-950/50 p-2 rounded-lg border border-sky-800/50 hover:bg-sky-900/50 transition"
            >
              <span>Lihat Tampilan Mahasiswa</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          ) : (
            <Link
              href="/admin"
              className="flex items-center justify-between text-xs text-amber-300 hover:text-amber-200 bg-amber-950/50 p-2 rounded-lg border border-amber-800/50 hover:bg-amber-900/50 transition"
            >
              <span>Akses Panel Admin</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>

        {/* Footer / Logout */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40">
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-rose-400 hover:text-white hover:bg-rose-600/20 border border-rose-500/20 transition"
          >
            <LogOut className="w-4 h-4" />
            Keluar Akun
          </button>
        </div>
      </aside>
    </>
  );
}
