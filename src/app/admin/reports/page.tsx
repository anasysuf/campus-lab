'use client';

import React, { useState, useEffect } from 'react';
import DashboardShell from '@/components/layout/DashboardShell';
import BarcodeModal from '@/components/admin/BarcodeModal';
import {
  FileSpreadsheet,
  Printer,
  Download,
  Calendar,
  Layers,
  ClipboardCheck,
  RotateCcw,
  Boxes,
  DoorOpen,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sparkles,
  QrCode,
  Search,
  Filter,
  User,
  Tag,
} from 'lucide-react';

export default function AdminReportsPage() {
  const [academicYear, setAcademicYear] = useState('2025/2026');
  const [semester, setSemester] = useState('GENAP');
  const [activeTab, setActiveTab] = useState<'loans' | 'assets' | 'returns' | 'rooms'>('loans');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Barcode Modal
  const [barcodeItem, setBarcodeItem] = useState<any>(null);
  const [isBarcodeModalOpen, setIsBarcodeModalOpen] = useState(false);

  // Search filter inside active tab table
  const [tableSearch, setTableSearch] = useState('');

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/reports?year=${encodeURIComponent(academicYear)}&semester=${semester}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [academicYear, semester]);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const handlePrintOfficialReport = () => {
    if (!data) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const periodLabel = data.period.label;
    const nowStr = new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    let tabContentHtml = '';

    if (activeTab === 'loans') {
      tabContentHtml = `
        <h3 style="margin-top: 20px; font-size: 14px; border-bottom: 2px solid #0284c7; padding-bottom: 5px;">I. REKAPITULASI PEMINJAMAN ALAT</h3>
        <table style="width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 11px;">
          <thead>
            <tr style="background-color: #f1f5f9; text-align: left;">
              <th style="border: 1px solid #cbd5e1; padding: 6px;">No</th>
              <th style="border: 1px solid #cbd5e1; padding: 6px;">Nama Mahasiswa (NIM)</th>
              <th style="border: 1px solid #cbd5e1; padding: 6px;">Peralatan (Kode)</th>
              <th style="border: 1px solid #cbd5e1; padding: 6px;">Qty</th>
              <th style="border: 1px solid #cbd5e1; padding: 6px;">Tgl Pinjam</th>
              <th style="border: 1px solid #cbd5e1; padding: 6px;">Tgl Kembali</th>
              <th style="border: 1px solid #cbd5e1; padding: 6px;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${data.loanRecap.loans
              .map(
                (l: any, idx: number) => `
              <tr>
                <td style="border: 1px solid #cbd5e1; padding: 6px;">${idx + 1}</td>
                <td style="border: 1px solid #cbd5e1; padding: 6px;">${l.user.name} (${l.user.nim || '-'})</td>
                <td style="border: 1px solid #cbd5e1; padding: 6px;">${l.equipment.name} [${l.equipment.code}]</td>
                <td style="border: 1px solid #cbd5e1; padding: 6px; text-align: center;">${l.quantity}</td>
                <td style="border: 1px solid #cbd5e1; padding: 6px;">${formatDate(l.requestDate)}</td>
                <td style="border: 1px solid #cbd5e1; padding: 6px;">${formatDate(l.returnDate)}</td>
                <td style="border: 1px solid #cbd5e1; padding: 6px;">${l.status}</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
      `;
    } else if (activeTab === 'assets') {
      tabContentHtml = `
        <h3 style="margin-top: 20px; font-size: 14px; border-bottom: 2px solid #0284c7; padding-bottom: 5px;">II. REKAPITULASI DATA ASET & INVENTARIS</h3>
        <table style="width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 11px;">
          <thead>
            <tr style="background-color: #f1f5f9; text-align: left;">
              <th style="border: 1px solid #cbd5e1; padding: 6px;">No</th>
              <th style="border: 1px solid #cbd5e1; padding: 6px;">Kode Aset</th>
              <th style="border: 1px solid #cbd5e1; padding: 6px;">Nama Peralatan</th>
              <th style="border: 1px solid #cbd5e1; padding: 6px;">Kategori</th>
              <th style="border: 1px solid #cbd5e1; padding: 6px;">Lokasi Rak</th>
              <th style="border: 1px solid #cbd5e1; padding: 6px;">Total Unit</th>
              <th style="border: 1px solid #cbd5e1; padding: 6px;">Kondisi</th>
            </tr>
          </thead>
          <tbody>
            ${data.assetRecap.allEquipment
              .map(
                (e: any, idx: number) => `
              <tr>
                <td style="border: 1px solid #cbd5e1; padding: 6px;">${idx + 1}</td>
                <td style="border: 1px solid #cbd5e1; padding: 6px; font-family: monospace;">${e.code}</td>
                <td style="border: 1px solid #cbd5e1; padding: 6px;">${e.name}</td>
                <td style="border: 1px solid #cbd5e1; padding: 6px;">${e.category}</td>
                <td style="border: 1px solid #cbd5e1; padding: 6px;">${e.location || 'Lab Utama'}</td>
                <td style="border: 1px solid #cbd5e1; padding: 6px; text-align: center;">${e.totalQuantity}</td>
                <td style="border: 1px solid #cbd5e1; padding: 6px;">${e.condition}</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
      `;
    } else {
      tabContentHtml = `
        <h3 style="margin-top: 20px; font-size: 14px; border-bottom: 2px solid #0284c7; padding-bottom: 5px;">III. REKAPITULASI PENGEMBALIAN ALAT</h3>
        <p style="font-size: 12px; margin-top: 6px;">Tingkat Pengembalian Tepat Waktu: <strong>${data.returnRecap.onTimeReturnRate}%</strong> (${data.returnRecap.onTimeReturns} tepat waktu, ${data.returnRecap.lateReturns} terlambat)</p>
        <table style="width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 11px;">
          <thead>
            <tr style="background-color: #f1f5f9; text-align: left;">
              <th style="border: 1px solid #cbd5e1; padding: 6px;">No</th>
              <th style="border: 1px solid #cbd5e1; padding: 6px;">Peminjam</th>
              <th style="border: 1px solid #cbd5e1; padding: 6px;">Alat</th>
              <th style="border: 1px solid #cbd5e1; padding: 6px;">Batas Kembali</th>
              <th style="border: 1px solid #cbd5e1; padding: 6px;">Tanggal Dikembalikan</th>
              <th style="border: 1px solid #cbd5e1; padding: 6px;">Catatan Admin</th>
            </tr>
          </thead>
          <tbody>
            ${data.returnRecap.returnedLoansList
              .map(
                (l: any, idx: number) => `
              <tr>
                <td style="border: 1px solid #cbd5e1; padding: 6px;">${idx + 1}</td>
                <td style="border: 1px solid #cbd5e1; padding: 6px;">${l.user.name}</td>
                <td style="border: 1px solid #cbd5e1; padding: 6px;">${l.equipment.name}</td>
                <td style="border: 1px solid #cbd5e1; padding: 6px;">${formatDate(l.returnDate)}</td>
                <td style="border: 1px solid #cbd5e1; padding: 6px;">${formatDate(l.actualReturnDate)}</td>
                <td style="border: 1px solid #cbd5e1; padding: 6px;">${l.adminNote || 'Selesai diverifikasi'}</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
      `;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Laporan Rekapitulasi Laboratorium - ${periodLabel}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              color: #0f172a;
              padding: 24px;
              margin: 0;
            }
            .kop {
              text-align: center;
              border-bottom: 3px double #0f172a;
              padding-bottom: 12px;
              margin-bottom: 20px;
            }
            .kop h1 {
              font-size: 16px;
              margin: 0;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            .kop h2 {
              font-size: 14px;
              margin: 4px 0;
              color: #0369a1;
            }
            .kop p {
              font-size: 11px;
              margin: 0;
              color: #475569;
            }
            .summary-box {
              display: flex;
              gap: 12px;
              margin-bottom: 16px;
            }
            .box {
              flex: 1;
              border: 1px solid #cbd5e1;
              border-radius: 8px;
              padding: 8px;
              font-size: 11px;
              background: #f8fafc;
            }
            .signature {
              margin-top: 40px;
              float: right;
              text-align: center;
              font-size: 12px;
              width: 220px;
            }
            .signature .line {
              margin-top: 60px;
              border-top: 1px solid #0f172a;
              font-weight: bold;
            }
          </style>
        </head>
        <body>
          <div class="kop">
            <h1>UNIVERSITAS TEKNOLOGI NUSANTARA</h1>
            <h2>UNIT PELAKSANA TEKNIS LABORATORIUM TERPADU</h2>
            <p>Jl. Kampus Terpadu No. 1, Gedung Laboratorium Lantai 2 | Email: lab@campus.ac.id</p>
          </div>

          <div style="text-align: center; margin-bottom: 16px;">
            <h2 style="font-size: 14px; margin: 0; text-decoration: underline;">LAPORAN REKAPITULASI SEMESTER</h2>
            <p style="font-size: 12px; margin: 2px 0 0 0; color: #334155;">Periode: ${periodLabel}</p>
          </div>

          <div class="summary-box">
            <div class="box">
              <strong>Total Peminjaman:</strong> ${data.loanRecap.totalLoans} Permohonan<br>
              <strong>Unit Dipinjam:</strong> ${data.loanRecap.totalUnitsBorrowed} Fisik
            </div>
            <div class="box">
              <strong>Total Jenis Aset:</strong> ${data.assetRecap.totalAssetTypes} Jenis<br>
              <strong>Total Unit Fisik:</strong> ${data.assetRecap.totalPhysicalUnits} Unit
            </div>
            <div class="box">
              <strong>Pengembalian On-Time:</strong> ${data.returnRecap.onTimeReturnRate}%<br>
              <strong>Aset Baru Semester Ini:</strong> ${data.assetRecap.newAssetsCount} Aset
            </div>
          </div>

          ${tabContentHtml}

          <div class="signature">
            <p>Kota Kampus, ${nowStr}</p>
            <p>Kepala UPT Laboratorium,</p>
            <div class="line">Dr. Ir. Hendra Setiawan, M.T.</div>
            <p style="font-size: 10px; margin: 2px 0;">NIP. 19820415 200812 1 002</p>
          </div>

          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleExportCSV = () => {
    if (!data) return;
    let csvContent = 'data:text/csv;charset=utf-8,';

    if (activeTab === 'loans') {
      csvContent += 'No,Nama Mahasiswa,NIM,Email,Peralatan,Kode Aset,Kategori,Jumlah,Tanggal Pinjam,Tanggal Kembali,Status\n';
      data.loanRecap.loans.forEach((l: any, idx: number) => {
        csvContent += `"${idx + 1}","${l.user.name}","${l.user.nim || ''}","${l.user.email}","${l.equipment.name}","${l.equipment.code}","${l.equipment.category}","${l.quantity}","${l.requestDate}","${l.returnDate}","${l.status}"\n`;
      });
    } else if (activeTab === 'assets') {
      csvContent += 'No,Kode Aset,Nama Peralatan,Kategori,Lokasi,Total Unit,Tersedia,Kondisi,Tanggal Terdaftar\n';
      data.assetRecap.allEquipment.forEach((e: any, idx: number) => {
        csvContent += `"${idx + 1}","${e.code}","${e.name}","${e.category}","${e.location || ''}","${e.totalQuantity}","${e.availableQuantity}","${e.condition}","${e.createdAt}"\n`;
      });
    } else {
      csvContent += 'No,Peminjam,NIM,Peralatan,Kode,Batas Kembali,Tanggal Aktual Kembali,Catatan Admin\n';
      data.returnRecap.returnedLoansList.forEach((l: any, idx: number) => {
        csvContent += `"${idx + 1}","${l.user.name}","${l.user.nim || ''}","${l.equipment.name}","${l.equipment.code}","${l.returnDate}","${l.actualReturnDate || ''}","${l.adminNote || ''}"\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `REKAP_LAB_${activeTab.toUpperCase()}_${semester}_${academicYear.replace('/', '-')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <DashboardShell
      title="Rekap &amp; Laporan Laboratorium"
      subtitle="Analisis sirkulasi peminjaman, audit kondisi inventaris, dan kepatuhan pengembalian per semester"
    >
      <div className="space-y-6">
        {/* Top Filter & Period Control Bar */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700">
              <Calendar className="w-4 h-4 text-sky-600" />
              <span>Pilih Periode Semester:</span>
            </div>

            <select
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              className="px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 outline-none focus:border-sky-500 transition"
            >
              <option value="2025/2026">T.A. 2025/2026</option>
              <option value="2024/2025">T.A. 2024/2025</option>
              <option value="2026/2027">T.A. 2026/2027</option>
            </select>

            <select
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              className="px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 outline-none focus:border-sky-500 transition"
            >
              <option value="GENAP">Semester Genap (Maret - Agustus)</option>
              <option value="GANJIL">Semester Ganjil (September - Februari)</option>
              <option value="ALL">Satu Tahun Akademik Penuh</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
            >
              <Download className="w-4 h-4" />
              <span>Ekspor CSV</span>
            </button>

            <button
              onClick={handlePrintOfficialReport}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 shadow-md shadow-sky-500/20 active:scale-95 transition"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Laporan Resmi (PDF)</span>
            </button>
          </div>
        </div>

        {/* 4 Summary Stat Cards */}
        {data && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Total Peminjaman
                </p>
                <h3 className="text-2xl font-black text-slate-900 mt-1">
                  {data.loanRecap.totalLoans}
                </h3>
                <p className="text-[11px] text-sky-600 font-semibold mt-0.5">
                  {data.loanRecap.totalUnitsBorrowed} unit alat dipinjam
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600">
                <ClipboardCheck className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Data Aset Fisik
                </p>
                <h3 className="text-2xl font-black text-slate-900 mt-1">
                  {data.assetRecap.totalPhysicalUnits}
                </h3>
                <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">
                  {data.assetRecap.totalAssetTypes} jenis instrumen
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                <Boxes className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Ketepatan Pengembalian
                </p>
                <h3 className="text-2xl font-black text-slate-900 mt-1">
                  {data.returnRecap.onTimeReturnRate}%
                </h3>
                <p className="text-[11px] text-indigo-600 font-semibold mt-0.5">
                  {data.returnRecap.onTimeReturns} tepat waktu / {data.returnRecap.lateReturns} telat
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                <RotateCcw className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Aset Baru Semester Ini
                </p>
                <h3 className="text-2xl font-black text-slate-900 mt-1">
                  +{data.assetRecap.newAssetsCount}
                </h3>
                <p className="text-[11px] text-amber-600 font-semibold mt-0.5">
                  Registrasi barcode baru
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
                <Sparkles className="w-6 h-6" />
              </div>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-1 overflow-x-auto">
          <button
            onClick={() => {
              setActiveTab('loans');
              setTableSearch('');
            }}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'loans'
                ? 'bg-slate-900 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <ClipboardCheck className="w-4 h-4" />
            <span>Rekap Peminjaman Alat</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('assets');
              setTableSearch('');
            }}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'assets'
                ? 'bg-slate-900 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Boxes className="w-4 h-4" />
            <span>Data Aset &amp; Barcode</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('returns');
              setTableSearch('');
            }}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'returns'
                ? 'bg-slate-900 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <RotateCcw className="w-4 h-4" />
            <span>Rekap Pengembalian</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('rooms');
              setTableSearch('');
            }}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'rooms'
                ? 'bg-slate-900 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <DoorOpen className="w-4 h-4" />
            <span>Penggunaan Ruang Lab</span>
          </button>
        </div>

        {/* Tab Content 1: Rekap Peminjaman */}
        {activeTab === 'loans' && data && (
          <div className="space-y-6">
            {/* Top Equipment & Top Borrowers Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Most Borrowed Equipment */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
                <h4 className="text-sm font-extrabold text-slate-900 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-sky-600" />
                  5 Alat Paling Sering Dipinjam Semester Ini
                </h4>
                {data.loanRecap.topEquipment.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">Belum ada data peminjaman di periode ini.</p>
                ) : (
                  <div className="space-y-3">
                    {data.loanRecap.topEquipment.map((eq: any, i: number) => (
                      <div
                        key={eq.code}
                        className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-full bg-sky-100 text-sky-800 text-xs font-black flex items-center justify-center">
                            {i + 1}
                          </span>
                          <div>
                            <p className="text-xs font-bold text-slate-800">{eq.name}</p>
                            <p className="text-[10px] text-slate-400 font-mono">{eq.code} • {eq.category}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-sky-50 text-sky-700 border border-sky-200">
                            {eq.count}x pinjam ({eq.quantity} unit)
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Top Borrowers */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
                <h4 className="text-sm font-extrabold text-slate-900 mb-4 flex items-center gap-2">
                  <User className="w-4 h-4 text-indigo-600" />
                  Mahasiswa Paling Aktif Meminjam
                </h4>
                {data.loanRecap.topBorrowers.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">Belum ada peminjam di periode ini.</p>
                ) : (
                  <div className="space-y-3">
                    {data.loanRecap.topBorrowers.map((b: any, i: number) => (
                      <div
                        key={b.name}
                        className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-800 text-xs font-black flex items-center justify-center">
                            {i + 1}
                          </span>
                          <div>
                            <p className="text-xs font-bold text-slate-800">{b.name}</p>
                            <p className="text-[10px] text-slate-400">{b.nim || '-'} • {b.department || '-'}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                            {b.count} Transaksi
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Loan Transactions Table */}
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <h4 className="text-sm font-extrabold text-slate-900">
                  Daftar Transaksi Peminjaman Semester Ini
                </h4>
                <input
                  type="text"
                  placeholder="Cari peminjam / alat..."
                  value={tableSearch}
                  onChange={(e) => setTableSearch(e.target.value)}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs outline-none focus:border-sky-500"
                />
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 uppercase tracking-wider text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4 font-bold">Peminjam</th>
                      <th className="py-3 px-4 font-bold">Peralatan</th>
                      <th className="py-3 px-4 font-bold text-center">Jumlah</th>
                      <th className="py-3 px-4 font-bold">Tgl Pengajuan</th>
                      <th className="py-3 px-4 font-bold">Batas Pengembalian</th>
                      <th className="py-3 px-4 font-bold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.loanRecap.loans.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-400">
                          Tidak ada peminjaman dalam periode ini.
                        </td>
                      </tr>
                    ) : (
                      data.loanRecap.loans
                        .filter((l: any) =>
                          tableSearch
                            ? l.user.name.toLowerCase().includes(tableSearch.toLowerCase()) ||
                              l.equipment.name.toLowerCase().includes(tableSearch.toLowerCase())
                            : true
                        )
                        .map((loan: any) => (
                          <tr key={loan.id} className="hover:bg-slate-50/70">
                            <td className="py-3 px-4">
                              <p className="font-bold text-slate-800">{loan.user.name}</p>
                              <p className="text-[10px] text-slate-400 font-mono">{loan.user.nim || '-'}</p>
                            </td>
                            <td className="py-3 px-4">
                              <p className="font-semibold text-slate-800">{loan.equipment.name}</p>
                              <p className="text-[10px] text-slate-400 font-mono">{loan.equipment.code}</p>
                            </td>
                            <td className="py-3 px-4 text-center font-bold text-slate-800">
                              {loan.quantity} unit
                            </td>
                            <td className="py-3 px-4">{formatDate(loan.requestDate)}</td>
                            <td className="py-3 px-4">{formatDate(loan.returnDate)}</td>
                            <td className="py-3 px-4">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  loan.status === 'APPROVED'
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : loan.status === 'RETURNED'
                                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                    : loan.status === 'REJECTED'
                                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                                }`}
                              >
                                {loan.status}
                              </span>
                            </td>
                          </tr>
                        ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content 2: Rekap Data Aset & Barcode */}
        {activeTab === 'assets' && data && (
          <div className="space-y-6">
            {/* Condition Breakdown */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                <p className="text-xs font-bold text-emerald-800 uppercase">Kondisi Baik</p>
                <p className="text-xl font-black text-emerald-900 mt-1">
                  {data.assetRecap.conditionBreakdown.GOOD} Jenis
                </p>
                <span className="text-[10px] text-emerald-700">Siap digunakan praktikum</span>
              </div>
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
                <p className="text-xs font-bold text-amber-800 uppercase">Kondisi Cukup</p>
                <p className="text-xl font-black text-amber-900 mt-1">
                  {data.assetRecap.conditionBreakdown.FAIR} Jenis
                </p>
                <span className="text-[10px] text-amber-700">Perlu kalibrasi/cek</span>
              </div>
              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200">
                <p className="text-xs font-bold text-blue-800 uppercase">Dalam Perawatan</p>
                <p className="text-xl font-black text-blue-900 mt-1">
                  {data.assetRecap.conditionBreakdown.MAINTENANCE} Jenis
                </p>
                <span className="text-[10px] text-blue-700">Servis berkala</span>
              </div>
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200">
                <p className="text-xs font-bold text-rose-800 uppercase">Kondisi Rusak</p>
                <p className="text-xl font-black text-rose-900 mt-1">
                  {data.assetRecap.conditionBreakdown.DAMAGED} Jenis
                </p>
                <span className="text-[10px] text-rose-700">Usulan penghapusan</span>
              </div>
            </div>

            {/* Asset Table with Barcode Print Button */}
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <h4 className="text-sm font-extrabold text-slate-900">
                  Inventaris Seluruh Peralatan Lab &amp; Cetak Barcode
                </h4>
                <input
                  type="text"
                  placeholder="Cari kode aset / nama alat..."
                  value={tableSearch}
                  onChange={(e) => setTableSearch(e.target.value)}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs outline-none focus:border-sky-500"
                />
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 uppercase tracking-wider text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4 font-bold">Kode Inventaris</th>
                      <th className="py-3 px-4 font-bold">Nama Alat</th>
                      <th className="py-3 px-4 font-bold">Kategori</th>
                      <th className="py-3 px-4 font-bold">Lokasi Rak</th>
                      <th className="py-3 px-4 font-bold text-center">Stok (Ada / Total)</th>
                      <th className="py-3 px-4 font-bold">Kondisi</th>
                      <th className="py-3 px-4 font-bold text-right">Barcode &amp; Label</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.assetRecap.allEquipment
                      .filter((e: any) =>
                        tableSearch
                          ? e.name.toLowerCase().includes(tableSearch.toLowerCase()) ||
                            e.code.toLowerCase().includes(tableSearch.toLowerCase())
                          : true
                      )
                      .map((item: any) => (
                        <tr key={item.id} className="hover:bg-slate-50/70">
                          <td className="py-3 px-4 font-mono font-bold text-sky-600">
                            {item.code}
                          </td>
                          <td className="py-3 px-4 font-semibold text-slate-800">{item.name}</td>
                          <td className="py-3 px-4 text-slate-500">{item.category}</td>
                          <td className="py-3 px-4 text-slate-500">{item.location || 'Lab Utama'}</td>
                          <td className="py-3 px-4 text-center font-bold">
                            <span className="text-emerald-600">{item.availableQuantity}</span> /{' '}
                            <span className="text-slate-400">{item.totalQuantity}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                item.condition === 'GOOD'
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : item.condition === 'FAIR'
                                  ? 'bg-amber-50 text-amber-700'
                                  : 'bg-rose-50 text-rose-700'
                              }`}
                            >
                              {item.condition}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => {
                                setBarcodeItem(item);
                                setIsBarcodeModalOpen(true);
                              }}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-100 transition"
                            >
                              <QrCode className="w-3.5 h-3.5" />
                              <span>Cetak Barcode</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content 3: Rekap Pengembalian */}
        {activeTab === 'returns' && data && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
              <div>
                <h4 className="text-base font-extrabold text-slate-900">
                  Tingkat Kepatuhan Pengembalian Tepat Waktu
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Persentase pengembalian sebelum tanggal jatuh tempo pada semester ini
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <span className="text-3xl font-black text-emerald-600">
                    {data.returnRecap.onTimeReturnRate}%
                  </span>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Ketepatan Waktu
                  </p>
                </div>
                <div className="h-10 w-px bg-slate-200" />
                <div className="text-center">
                  <span className="text-3xl font-black text-slate-800">
                    {data.returnRecap.totalReturned}
                  </span>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Total Kembali
                  </p>
                </div>
              </div>
            </div>

            {/* Returned Loans Table */}
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100">
                <h4 className="text-sm font-extrabold text-slate-900">
                  Log Audit Pengembalian Alat
                </h4>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 uppercase tracking-wider text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4 font-bold">Peminjam</th>
                      <th className="py-3 px-4 font-bold">Peralatan</th>
                      <th className="py-3 px-4 font-bold">Jatuh Tempo</th>
                      <th className="py-3 px-4 font-bold">Tanggal Aktual Kembali</th>
                      <th className="py-3 px-4 font-bold">Status Ketepatan</th>
                      <th className="py-3 px-4 font-bold">Catatan Verifikasi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.returnRecap.returnedLoansList.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-400">
                          Belum ada pengembalian di semester ini.
                        </td>
                      </tr>
                    ) : (
                      data.returnRecap.returnedLoansList.map((loan: any) => {
                        const isLate =
                          loan.actualReturnDate &&
                          new Date(loan.actualReturnDate) > new Date(loan.returnDate);

                        return (
                          <tr key={loan.id} className="hover:bg-slate-50/70">
                            <td className="py-3 px-4 font-bold text-slate-800">
                              {loan.user.name}
                            </td>
                            <td className="py-3 px-4">{loan.equipment.name}</td>
                            <td className="py-3 px-4">{formatDate(loan.returnDate)}</td>
                            <td className="py-3 px-4 font-semibold text-slate-800">
                              {formatDate(loan.actualReturnDate)}
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  isLate
                                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                }`}
                              >
                                {isLate ? 'Terlambat' : 'Tepat Waktu'}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-slate-500">
                              {loan.adminNote || 'Kondisi lengkap dan baik'}
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
        )}

        {/* Tab Content 4: Penggunaan Ruangan */}
        {activeTab === 'rooms' && data && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <h4 className="text-sm font-extrabold text-slate-900">
                  Daftar Penggunaan &amp; Pemeliharaan Ruang Lab
                </h4>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 uppercase tracking-wider text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4 font-bold">Ruangan Lab</th>
                      <th className="py-3 px-4 font-bold">Pengguna / Dosen</th>
                      <th className="py-3 px-4 font-bold">Waktu Mulai</th>
                      <th className="py-3 px-4 font-bold">Waktu Selesai</th>
                      <th className="py-3 px-4 font-bold">Keperluan</th>
                      <th className="py-3 px-4 font-bold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.roomRecap.bookings.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-400">
                          Belum ada reservasi ruang lab di periode ini.
                        </td>
                      </tr>
                    ) : (
                      data.roomRecap.bookings.map((booking: any) => (
                        <tr key={booking.id} className="hover:bg-slate-50/70">
                          <td className="py-3 px-4 font-bold text-slate-800">
                            {booking.roomName}
                          </td>
                          <td className="py-3 px-4">{booking.user?.name || 'Admin'}</td>
                          <td className="py-3 px-4">
                            {new Date(booking.startTime).toLocaleString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </td>
                          <td className="py-3 px-4">
                            {new Date(booking.endTime).toLocaleString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </td>
                          <td className="py-3 px-4 text-slate-600">{booking.purpose}</td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                booking.status === 'APPROVED'
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : booking.status === 'REJECTED'
                                  ? 'bg-rose-50 text-rose-700'
                                  : 'bg-amber-50 text-amber-700'
                              }`}
                            >
                              {booking.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* BARCODE MODAL */}
      <BarcodeModal
        isOpen={isBarcodeModalOpen}
        onClose={() => setIsBarcodeModalOpen(false)}
        equipment={barcodeItem}
      />
    </DashboardShell>
  );
}
