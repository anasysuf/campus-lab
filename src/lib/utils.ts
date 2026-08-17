import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '-';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '-';
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(d);
}

export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return '-';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '-';
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

export function getStatusBadge(status: string) {
  switch (status.toUpperCase()) {
    case 'APPROVED':
      return {
        label: 'Disetujui',
        bg: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
        dot: 'bg-emerald-500',
      };
    case 'PENDING':
      return {
        label: 'Menunggu',
        bg: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
        dot: 'bg-amber-500',
      };
    case 'REJECTED':
      return {
        label: 'Ditolak',
        bg: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
        dot: 'bg-rose-500',
      };
    case 'RETURNED':
      return {
        label: 'Dikembalikan',
        bg: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
        dot: 'bg-blue-500',
      };
    case 'CANCELLED':
      return {
        label: 'Dibatalkan',
        bg: 'bg-slate-500/10 text-slate-600 border-slate-500/20',
        dot: 'bg-slate-500',
      };
    default:
      return {
        label: status,
        bg: 'bg-slate-100 text-slate-700 border-slate-200',
        dot: 'bg-slate-400',
      };
  }
}

export function getConditionBadge(condition: string) {
  switch (condition.toUpperCase()) {
    case 'GOOD':
      return {
        label: 'Baik / Siap Pakai',
        bg: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
      };
    case 'FAIR':
      return {
        label: 'Cukup / Perlu Cek',
        bg: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
      };
    case 'MAINTENANCE':
      return {
        label: 'Dalam Perawatan',
        bg: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
      };
    case 'DAMAGED':
      return {
        label: 'Rusak',
        bg: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
      };
    default:
      return {
        label: condition,
        bg: 'bg-slate-100 text-slate-700 border-slate-200',
      };
  }
}
