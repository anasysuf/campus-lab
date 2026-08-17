'use client';

import React from 'react';
import { Menu, Bell, Shield, GraduationCap, Clock } from 'lucide-react';
import { useSession } from 'next-auth/react';

interface NavbarProps {
  onOpenSidebar: () => void;
  title: string;
  subtitle?: string;
}

import Link from 'next/link';

export default function Navbar({ onOpenSidebar, title, subtitle }: NavbarProps) {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === 'ADMIN';

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-20 px-6 sm:px-8 bg-white/80 backdrop-blur-md border-b border-slate-200/80">
      {/* Left: Mobile menu toggle + Page title */}
      <div className="flex items-center gap-4">
        <button
          onClick={onOpenSidebar}
          className="p-2 -ml-2 rounded-xl text-slate-600 hover:bg-slate-100 lg:hidden"
          aria-label="Buka Sidebar"
        >
          <Menu className="w-6 h-6" />
        </button>

        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs sm:text-sm text-slate-500 font-medium hidden sm:block">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Right: Academic Year / Status & User profile */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Semester / Status Indicator */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100/90 text-xs font-semibold text-slate-700 border border-slate-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Semester Genap 2025/2026</span>
        </div>

        {/* User Card Link to Profile */}
        <Link
          href={isAdmin ? '/admin/profile' : '/dashboard/profile'}
          className="flex items-center gap-3 pl-3 sm:border-l sm:border-slate-200 group hover:opacity-90 transition"
          title="Buka Pengaturan Akun Pribadi"
        >
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-slate-800 leading-tight group-hover:text-sky-600 transition">
              {session?.user?.name || 'Pengguna'}
            </p>
            <p className="text-xs text-slate-500 font-medium">
              {session?.user?.department || (isAdmin ? 'Laboratorium Terpadu' : 'Mahasiswa')}
            </p>
          </div>
          <div className="relative">
            <img
              src={
                session?.user?.avatar ||
                `https://api.dicebear.com/7.x/bottts/svg?seed=${session?.user?.email || 'user'}`
              }
              alt="Avatar"
              className="w-10 h-10 rounded-full object-cover border-2 border-slate-200 shadow-sm group-hover:border-sky-400 transition"
            />
            <div
              className={`absolute -bottom-0.5 -right-0.5 p-0.5 rounded-full ${
                isAdmin ? 'bg-amber-500 text-white' : 'bg-sky-500 text-white'
              }`}
              title={isAdmin ? 'Administrator Lab' : 'Mahasiswa'}
            >
              {isAdmin ? (
                <Shield className="w-2.5 h-2.5" />
              ) : (
                <GraduationCap className="w-2.5 h-2.5" />
              )}
            </div>
          </div>
        </Link>
      </div>
    </header>
  );
}
