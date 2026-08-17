'use client';

import React, { useState, useEffect } from 'react';
import DashboardShell from '@/components/layout/DashboardShell';
import { generateBarcodeSVG } from '@/lib/barcode';
import {
  Printer,
  QrCode,
  Tag,
  Boxes,
  CheckSquare,
  Square,
  Search,
  Filter,
  Sliders,
  Settings2,
  Sparkles,
  Layers,
  MapPin,
  RefreshCw,
  Eye,
  CheckCircle2,
} from 'lucide-react';

interface EquipmentItem {
  id: string;
  name: string;
  code: string;
  category: string;
  location: string | null;
  totalQuantity: number;
  availableQuantity: number;
  condition: string;
  createdAt: string;
}

export default function AdminBarcodeStickersPage() {
  const [equipment, setEquipment] = useState<EquipmentItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Selected items for printing: Map of equipmentId -> copies count
  const [selectedItems, setSelectedItems] = useState<{ [id: string]: number }>({});

  // Sticker Layout Settings
  const [layoutType, setLayoutType] = useState<'A4_GRID_10' | 'A4_GRID_21' | 'THERMAL_ROLL'>('A4_GRID_10');
  const [showInstitution, setShowInstitution] = useState(true);
  const [showLocation, setShowLocation] = useState(true);
  const [showCategory, setShowCategory] = useState(true);
  const [institutionName, setInstitutionName] = useState('LABORATORIUM TERPADU KAMPUS');

  const fetchEquipment = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/equipment');
      if (res.ok) {
        const data = await res.json();
        setEquipment(data.equipment || []);
        setCategories(data.categories || []);

        // Default: select all equipment with 1 copy each
        const initialSelected: { [id: string]: number } = {};
        (data.equipment || []).forEach((item: EquipmentItem) => {
          initialSelected[item.id] = 1;
        });
        setSelectedItems(initialSelected);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEquipment();
  }, []);

  const filteredEquipment = equipment.filter((item) => {
    const matchesSearch =
      search === '' ||
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.code.toLowerCase().includes(search.toLowerCase()) ||
      (item.location && item.location.toLowerCase().includes(search.toLowerCase()));

    const matchesCategory = selectedCategory === 'ALL' || item.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const toggleSelectAll = () => {
    if (Object.keys(selectedItems).length === filteredEquipment.length) {
      setSelectedItems({});
    } else {
      const newSelected: { [id: string]: number } = {};
      filteredEquipment.forEach((item) => {
        newSelected[item.id] = selectedItems[item.id] || 1;
      });
      setSelectedItems(newSelected);
    }
  };

  const toggleSelectItem = (id: string, totalQty: number = 1) => {
    setSelectedItems((prev) => {
      const updated = { ...prev };
      if (updated[id]) {
        delete updated[id];
      } else {
        updated[id] = 1;
      }
      return updated;
    });
  };

  const handleCopiesChange = (id: string, copies: number) => {
    if (copies < 1) return;
    setSelectedItems((prev) => ({
      ...prev,
      [id]: copies,
    }));
  };

  const handleSetCopiesToTotalStock = () => {
    const updated: { [id: string]: number } = {};
    filteredEquipment.forEach((item) => {
      updated[item.id] = item.totalQuantity || 1;
    });
    setSelectedItems(updated);
  };

  // Compile list of stickers to render
  const stickersToPrint: EquipmentItem[] = [];
  equipment.forEach((item) => {
    const count = selectedItems[item.id] || 0;
    for (let i = 0; i < count; i++) {
      stickersToPrint.push(item);
    }
  });

  const handlePrint = () => {
    if (stickersToPrint.length === 0) {
      alert('Pilih setidaknya satu peralatan untuk dicetak.');
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    let stickerStyle = '';
    let gridStyle = '';

    if (layoutType === 'A4_GRID_10') {
      // 2 columns x 5 rows on A4
      gridStyle = `
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
        padding: 10mm;
      `;
      stickerStyle = `
        border: 1.5px dashed #64748b;
        border-radius: 10px;
        padding: 12px;
        box-sizing: border-box;
        text-align: center;
        background: white;
        height: 52mm;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        page-break-inside: avoid;
      `;
    } else if (layoutType === 'A4_GRID_21') {
      // 3 columns x 7 rows on A4 (Label Tom & Jerry style)
      gridStyle = `
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 8px;
        padding: 8mm;
      `;
      stickerStyle = `
        border: 1px dashed #94a3b8;
        border-radius: 8px;
        padding: 8px;
        box-sizing: border-box;
        text-align: center;
        background: white;
        height: 38mm;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        page-break-inside: avoid;
      `;
    } else {
      // Thermal Roll Continuous Label (50mm x 30mm)
      gridStyle = `
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 15px;
        padding: 5mm;
      `;
      stickerStyle = `
        width: 60mm;
        height: 40mm;
        border: 1.5px dashed #475569;
        border-radius: 8px;
        padding: 8px;
        box-sizing: border-box;
        text-align: center;
        background: white;
        page-break-inside: avoid;
        page-break-after: always;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
      `;
    }

    const stickerCardsHtml = stickersToPrint
      .map((item) => {
        const svg = generateBarcodeSVG(item.code, layoutType === 'A4_GRID_21' ? 45 : 55, 1.8);
        return `
          <div class="sticker-card" style="${stickerStyle}">
            ${
              showInstitution
                ? `<div style="font-size: 8px; font-weight: 800; letter-spacing: 0.5px; color: #0369a1; text-transform: uppercase; border-bottom: 1px solid #e2e8f0; padding-bottom: 3px; margin-bottom: 4px;">${institutionName}</div>`
                : ''
            }
            <div style="font-size: ${layoutType === 'A4_GRID_21' ? '10px' : '12px'}; font-weight: bold; color: #0f172a; line-height: 1.2; max-height: 28px; overflow: hidden;">
              ${item.name}
            </div>
            ${
              showCategory || showLocation
                ? `<div style="font-size: 8px; color: #64748b; margin: 2px 0;">
                    ${showCategory ? item.category : ''} ${showCategory && showLocation ? '•' : ''} ${
                    showLocation ? item.location || 'Lab Terpadu' : ''
                  }
                  </div>`
                : ''
            }
            <div style="margin: 3px 0; display: flex; justify-content: center; height: ${
              layoutType === 'A4_GRID_21' ? '45px' : '55px'
            };">
              ${svg}
            </div>
            <div style="font-size: 7px; color: #94a3b8; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
              PROPERTI INVENTARIS RESMI
            </div>
          </div>
        `;
      })
      .join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Cetak Stiker Label Barcode Aset (${stickersToPrint.length} Stiker)</title>
          <style>
            @page {
              size: auto;
              margin: 0;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
              margin: 0;
              padding: 0;
              background: #fff;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .grid-container {
              ${gridStyle}
            }
          </style>
        </head>
        <body>
          <div class="grid-container">
            ${stickerCardsHtml}
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

  return (
    <DashboardShell
      title="Cetak Stiker Barcode Fisik Aset"
      subtitle="Studio pembuatan &amp; cetak massal label stiker barcode untuk ditempelkan pada fisik peralatan lab"
    >
      <div className="space-y-6">
        {/* Layout & Print Control Bar */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Settings2 className="w-5 h-5 text-sky-600" />
                Pengaturan Format &amp; Kertas Label Stiker
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Sesuaikan jenis kertas stiker dan informasi yang ingin ditampilkan pada label fisik
              </p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={handlePrint}
                disabled={stickersToPrint.length === 0}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 shadow-lg shadow-sky-500/25 active:scale-95 transition disabled:opacity-50"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak {stickersToPrint.length} Stiker (Print / PDF)</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Format Kertas */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Format Kertas / Stiker
              </label>
              <select
                value={layoutType}
                onChange={(e: any) => setLayoutType(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-800 outline-none focus:border-sky-500"
              >
                <option value="A4_GRID_10">Kertas A4 (2 x 5 = 10 Stiker / Lembar)</option>
                <option value="A4_GRID_21">Kertas A4 (3 x 7 = 21 Stiker / Lembar)</option>
                <option value="THERMAL_ROLL">Printer Thermal Stiker Roll (1 per label)</option>
              </select>
            </div>

            {/* Nama Instansi Header */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Teks Header Label
              </label>
              <input
                type="text"
                value={institutionName}
                onChange={(e) => setInstitutionName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-800 outline-none focus:border-sky-500"
              />
            </div>

            {/* Toggle Element Checks */}
            <div className="sm:col-span-2 flex items-center gap-4 flex-wrap pt-4">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showInstitution}
                  onChange={(e) => setShowInstitution(e.target.checked)}
                  className="rounded text-sky-600 focus:ring-sky-500 w-4 h-4"
                />
                <span>Header Instansi</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showCategory}
                  onChange={(e) => setShowCategory(e.target.checked)}
                  className="rounded text-sky-600 focus:ring-sky-500 w-4 h-4"
                />
                <span>Kategori Alat</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showLocation}
                  onChange={(e) => setShowLocation(e.target.checked)}
                  className="rounded text-sky-600 focus:ring-sky-500 w-4 h-4"
                />
                <span>Lokasi Rak</span>
              </label>

              <button
                type="button"
                onClick={handleSetCopiesToTotalStock}
                className="text-[11px] font-bold text-sky-600 hover:text-sky-700 underline underline-offset-2 ml-auto"
                title="Atur jumlah stiker tiap alat sesuai jumlah unit fisiknya"
              >
                ⚡ Set Jumlah Sesuai Stok Fisik
              </button>
            </div>
          </div>
        </div>

        {/* Equipment Selection List & Live Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Equipment Selection List (7 Cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <Boxes className="w-4 h-4 text-sky-600" />
                  Pilih Peralatan yang Ingin Dicetak ({Object.keys(selectedItems).length} Terpilih)
                </h4>
              </div>

              <button
                type="button"
                onClick={toggleSelectAll}
                className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1.5"
              >
                {Object.keys(selectedItems).length === filteredEquipment.length ? (
                  <>
                    <CheckSquare className="w-4 h-4" />
                    <span>Batalkan Semua</span>
                  </>
                ) : (
                  <>
                    <Square className="w-4 h-4" />
                    <span>Pilih Semua</span>
                  </>
                )}
              </button>
            </div>

            {/* Filter Search Row */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari nama alat / kode / lokasi..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs outline-none focus:border-sky-500"
                />
              </div>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 outline-none focus:border-sky-500"
              >
                <option value="ALL">Semua Kategori</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Selection Table / List */}
            <div className="max-h-[520px] overflow-y-auto space-y-2 pr-1 divide-y divide-slate-100">
              {loading ? (
                <div className="py-12 text-center text-slate-400">
                  <div className="w-6 h-6 border-2 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <span className="text-xs">Memuat katalog alat...</span>
                </div>
              ) : filteredEquipment.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs font-medium">
                  Tidak ada peralatan yang sesuai filter.
                </div>
              ) : (
                filteredEquipment.map((item) => {
                  const isSelected = !!selectedItems[item.id];
                  const copies = selectedItems[item.id] || 1;

                  return (
                    <div
                      key={item.id}
                      className={`pt-2.5 pb-2.5 px-3 rounded-2xl flex items-center justify-between gap-3 transition ${
                        isSelected
                          ? 'bg-sky-50/70 border border-sky-200'
                          : 'hover:bg-slate-50 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectItem(item.id, item.totalQuantity)}
                          className="rounded text-sky-600 focus:ring-sky-500 w-4 h-4 cursor-pointer"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate">{item.name}</p>
                          <p className="text-[10px] text-sky-600 font-mono font-bold">
                            {item.code}{' '}
                            <span className="text-slate-400 font-normal">• {item.category}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-2 py-1 shadow-sm">
                          <span className="text-[10px] text-slate-500 font-bold uppercase">
                            Qty Stiker:
                          </span>
                          <input
                            type="number"
                            min="1"
                            max="100"
                            value={copies}
                            disabled={!isSelected}
                            onChange={(e) =>
                              handleCopiesChange(item.id, parseInt(e.target.value, 10) || 1)
                            }
                            className="w-12 text-center text-xs font-bold text-slate-800 outline-none disabled:opacity-40"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right: Live Preview of Sticker Sheet (5 Cols) */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <Eye className="w-4 h-4 text-indigo-600" />
                  Pratinjau Fisik Stiker ({stickersToPrint.length} Label)
                </h4>
                <p className="text-[11px] text-slate-500">Tampilan stiker saat ditempel di aset</p>
              </div>
              <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                {layoutType}
              </span>
            </div>

            {/* Sticker Preview Container */}
            <div className="bg-slate-100/90 rounded-2xl p-4 max-h-[520px] overflow-y-auto space-y-3 shadow-inner">
              {stickersToPrint.length === 0 ? (
                <div className="py-20 text-center text-slate-400 text-xs">
                  <QrCode className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                  <p className="font-semibold text-slate-600">Pilih peralatan di sebelah kiri</p>
                  <p className="text-[11px] mt-0.5">Pratinjau barcode stiker akan tampil di sini</p>
                </div>
              ) : (
                stickersToPrint.slice(0, 6).map((item, idx) => {
                  const svg = generateBarcodeSVG(item.code, 50, 1.8);

                  return (
                    <div
                      key={`${item.id}-${idx}`}
                      className="bg-white border-2 border-dashed border-slate-300 rounded-2xl p-3.5 shadow-sm text-center space-y-1 relative"
                    >
                      {showInstitution && (
                        <p className="text-[9px] font-extrabold uppercase tracking-wider text-sky-700 border-b border-slate-100 pb-1">
                          {institutionName}
                        </p>
                      )}
                      <h5 className="text-xs font-bold text-slate-900 leading-tight">
                        {item.name}
                      </h5>
                      {(showCategory || showLocation) && (
                        <p className="text-[9px] text-slate-400">
                          {showCategory ? item.category : ''}{' '}
                          {showCategory && showLocation ? '•' : ''}{' '}
                          {showLocation ? item.location || 'Lab Terpadu' : ''}
                        </p>
                      )}
                      <div
                        className="py-1 flex justify-center"
                        dangerouslySetInnerHTML={{ __html: svg }}
                      />
                      <p className="text-[8px] text-slate-400 font-semibold uppercase tracking-wider">
                        PROPERTI INVENTARIS RESMI
                      </p>
                    </div>
                  );
                })
              )}

              {stickersToPrint.length > 6 && (
                <p className="text-center text-xs font-bold text-slate-500 py-2">
                  ... dan {stickersToPrint.length - 6} stiker lainnya siap dicetak
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
