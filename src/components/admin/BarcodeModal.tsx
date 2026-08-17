'use client';

import React from 'react';
import Modal from '@/components/ui/Modal';
import { generateBarcodeSVG } from '@/lib/barcode';
import { Printer, Download, Sparkles, Tag, MapPin, Layers } from 'lucide-react';

interface EquipmentItem {
  id: string;
  name: string;
  code: string;
  category: string;
  location?: string | null;
  totalQuantity?: number;
  condition?: string;
  createdAt?: string | Date;
}

interface BarcodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  equipment: EquipmentItem | null;
}

export default function BarcodeModal({ isOpen, onClose, equipment }: BarcodeModalProps) {
  if (!equipment) return null;

  const barcodeSvg = generateBarcodeSVG(equipment.code || 'LAB-EQUIP-000', 70, 2);

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Cetak Label Barcode - ${equipment.code}</title>
          <style>
            @page {
              size: auto;
              margin: 10mm;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              margin: 0;
              padding: 20px;
              color: #0f172a;
            }
            .label-card {
              width: 340px;
              border: 2px dashed #94a3b8;
              border-radius: 12px;
              padding: 16px;
              text-align: center;
              page-break-inside: avoid;
              margin-bottom: 20px;
            }
            .header {
              font-size: 11px;
              font-weight: 800;
              letter-spacing: 1px;
              text-transform: uppercase;
              color: #0284c7;
              border-bottom: 1px solid #e2e8f0;
              padding-bottom: 6px;
              margin-bottom: 10px;
            }
            .item-name {
              font-size: 14px;
              font-weight: bold;
              margin-bottom: 4px;
            }
            .meta {
              font-size: 11px;
              color: #64748b;
              margin-bottom: 12px;
            }
            .barcode-svg-container {
              margin: 8px 0;
            }
            .barcode-svg-container svg {
              max-width: 100%;
              height: 70px;
            }
            .footer {
              font-size: 9px;
              color: #94a3b8;
              margin-top: 8px;
            }
          </style>
        </head>
        <body>
          <div class="label-card">
            <div class="header">SISTEM INFORMASI MANAJEMEN LABORATORIUM</div>
            <div class="item-name">${equipment.name}</div>
            <div class="meta">${equipment.category} | Lokasi: ${equipment.location || 'Lab Utama'}</div>
            <div class="barcode-svg-container">
              ${barcodeSvg}
            </div>
            <div class="footer">PROPERTI INVENTARIS RESMI KAMPUS</div>
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleDownloadSVG = () => {
    const blob = new Blob([barcodeSvg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `BARCODE_${equipment.code}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Barcode &amp; Label Aset Otomatis"
      subtitle={`Kode Unik Inventaris: ${equipment.code}`}
      maxWidth="md"
    >
      <div className="space-y-6 text-center">
        {/* Printable Label Card Preview */}
        <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-3xl p-6 relative overflow-hidden shadow-inner">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-100 text-sky-800 text-[10px] font-extrabold uppercase tracking-wider mb-3">
            <Sparkles className="w-3 h-3" />
            Label Fisik Inventaris Lab
          </div>

          <h4 className="text-base font-extrabold text-slate-900 leading-tight">
            {equipment.name}
          </h4>

          <div className="flex items-center justify-center gap-4 text-xs text-slate-500 mt-1 mb-4">
            <span className="flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-sky-600" />
              {equipment.category}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-rose-500" />
              {equipment.location || 'Laboratorium Terpadu'}
            </span>
          </div>

          {/* Barcode SVG Rendering */}
          <div
            className="p-3 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center justify-center"
            dangerouslySetInnerHTML={{ __html: barcodeSvg }}
          />

          <p className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase mt-3">
            Sistem Informasi Manajemen Laboratorium Kampus
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={handleDownloadSVG}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
          >
            <Download className="w-4 h-4" />
            <span>Unduh File Barcode (SVG)</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 shadow-md shadow-sky-600/20 active:scale-95 transition"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Label Stiker (Print)</span>
          </button>
        </div>
      </div>
    </Modal>
  );
}
