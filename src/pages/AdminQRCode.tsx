import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { api } from '../services/api';
import { Restaurant } from '../types';
import {
  Download,
  Copy,
  Printer,
  ExternalLink,
  Sparkles,
  Check,
  QrCode as QrCodeIcon,
  Wifi,
  Smartphone,
} from 'lucide-react';
import { useToast } from '../context/ToastContext';

export function AdminQRCode() {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [tableNumber, setTableNumber] = useState<string>('');
  const [qrSize, setQrSize] = useState<number>(320);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [includeTableInQr, setIncludeTableInQr] = useState<boolean>(false);
  const [showPrintTemplate, setShowPrintTemplate] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { showToast } = useToast();

  useEffect(() => {
    api.getRestaurant().then(setRestaurant);
  }, []);

  // Compute full target menu URL
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const targetMenuUrl = `${origin}/menu${
    includeTableInQr && tableNumber.trim() ? `?table=${encodeURIComponent(tableNumber.trim())}` : ''
  }`;

  // Generate QR Code whenever URL changes
  useEffect(() => {
    QRCode.toDataURL(
      targetMenuUrl,
      {
        width: qrSize,
        margin: 2,
        color: {
          dark: '#1c1917', // Dark stone
          light: '#ffffff',
        },
        errorCorrectionLevel: 'H',
      },
      (err, url) => {
        if (!err && url) {
          setQrDataUrl(url);
        }
      }
    );
  }, [targetMenuUrl, qrSize]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(targetMenuUrl);
    setCopied(true);
    showToast('Menu URL copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPng = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `rome-1960-cafe-menu-qr${tableNumber ? `-table-${tableNumber}` : ''}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast('QR Code image downloaded!');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-roman text-amber-50">
            QR Code Studio
          </h1>
          <p className="text-stone-400 text-xs sm:text-sm mt-1">
            Generate, customize, and print digital menu QR codes for customer dining tables.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-md cursor-pointer"
            id="btn-print-qr"
          >
            <Printer className="w-4 h-4" />
            <span>Print Table Standee</span>
          </button>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 no-print">
        {/* Left: Configuration Controls */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-stone-900 border border-stone-800 p-5 rounded-2xl space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-amber-400 font-roman">
              QR Code Configuration
            </h2>

            {/* Target URL Info */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-400 mb-1">
                Destination URL (Direct to Menu)
              </label>
              <div className="flex items-center gap-2 bg-stone-950 p-2.5 rounded-xl border border-stone-800 text-xs text-stone-300 font-mono overflow-x-auto">
                <span className="truncate flex-1">{targetMenuUrl}</span>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 transition-colors shrink-0"
                  title="Copy Link"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-amber-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Table Number Toggle */}
            <div className="pt-2 border-t border-stone-800 space-y-3">
              <label className="flex items-center gap-2 text-xs font-semibold text-stone-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeTableInQr}
                  onChange={(e) => setIncludeTableInQr(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500"
                />
                <span>Generate for Specific Table Number</span>
              </label>

              {includeTableInQr && (
                <div>
                  <label className="block text-xs text-stone-400 mb-1">Table Number or Identifier</label>
                  <input
                    type="text"
                    value={tableNumber}
                    onChange={(e) => setTableNumber(e.target.value)}
                    placeholder="e.g. 5, Patio-2, VIP-1"
                    className="w-full bg-stone-950 text-stone-100 text-sm rounded-xl px-3.5 py-2.5 border border-stone-800 focus:border-amber-500 outline-hidden"
                  />
                  <p className="text-[11px] text-stone-500 mt-1">
                    Customers scanning this QR code will see "Welcome to Table #{tableNumber || '1'}" on their phone.
                  </p>
                </div>
              )}
            </div>

            {/* Resolution Selector */}
            <div className="pt-2 border-t border-stone-800">
              <label className="block text-xs font-semibold text-stone-400 mb-1.5">
                QR Code Resolution
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[240, 320, 500].map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setQrSize(size)}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                      qrSize === size
                        ? 'bg-amber-500 text-stone-950 border-amber-500 font-bold'
                        : 'bg-stone-950 text-stone-400 border-stone-800 hover:bg-stone-800'
                    }`}
                  >
                    {size}x{size}px
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-stone-800 flex flex-col gap-2">
              <button
                type="button"
                onClick={handleDownloadPng}
                className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold py-2.5 px-4 rounded-xl text-xs sm:text-sm transition-all shadow-md cursor-pointer"
                id="btn-download-qr-png"
              >
                <Download className="w-4 h-4" />
                <span>Download High-Res PNG</span>
              </button>

              <a
                href={targetMenuUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 bg-stone-800 hover:bg-stone-750 text-stone-200 font-semibold py-2.5 px-4 rounded-xl text-xs transition-colors border border-stone-700"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Test Live Link in New Tab</span>
              </a>
            </div>
          </div>

          {/* Quick instructions */}
          <div className="bg-stone-900/60 border border-stone-800/80 p-4 rounded-2xl text-xs text-stone-400 space-y-2">
            <div className="flex items-center gap-2 text-stone-200 font-semibold">
              <Smartphone className="w-4 h-4 text-amber-400" />
              <span>Customer Scanning Tips</span>
            </div>
            <p>
              • Customers don't need any special app — standard iPhone camera and Android Google Lens will open the menu instantly.
            </p>
            <p>
              • No login or account registration is required for guests.
            </p>
          </div>
        </div>

        {/* Right: Live Table Standee Preview */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center">
          <div className="text-xs text-stone-400 uppercase tracking-wider font-semibold mb-3">
            Table Stand Preview (Printable)
          </div>

          {/* Physical Standee Mockup Container */}
          <div className="bg-gradient-to-b from-stone-100 to-stone-200 text-stone-950 p-8 sm:p-10 rounded-3xl shadow-2xl border-4 border-amber-600/30 max-w-sm w-full text-center relative overflow-hidden">
            {/* Top Emblem */}
            <div className="w-16 h-16 rounded-full bg-stone-900 border-2 border-amber-500 flex items-center justify-center mx-auto mb-3 shadow-md p-0.5">
              <img
                src={restaurant?.logo_url || '/assets/logo.svg'}
                alt="ROME 1960 CAFE"
                className="w-full h-full object-contain rounded-full"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/assets/logo.svg';
                }}
              />
            </div>

            <h3 className="font-roman text-xl sm:text-2xl font-bold tracking-widest text-stone-950 uppercase">
              {restaurant?.name || 'ROME 1960 CAFE'}
            </h3>
            <p className="font-serif-elegant italic text-xs text-amber-800 font-medium mt-0.5">
              {restaurant?.tagline || 'Taste. Tradition. Experience.'}
            </p>

            {/* Table Badge if active */}
            {includeTableInQr && tableNumber && (
              <div className="inline-block bg-stone-900 text-amber-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider my-3 shadow-xs">
                Table #{tableNumber}
              </div>
            )}

            {/* QR Code Container */}
            <div className="bg-white p-4 rounded-2xl shadow-md border border-stone-300 inline-block my-3">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="Menu QR Code"
                  className="w-44 h-44 sm:w-48 sm:h-48 object-contain mx-auto"
                />
              ) : (
                <div className="w-48 h-48 bg-stone-100 animate-pulse rounded-xl" />
              )}
            </div>

            <div className="space-y-1">
              <p className="font-bold text-xs sm:text-sm text-stone-900 tracking-tight">
                Scan with your phone camera
              </p>
              <p className="text-[11px] text-stone-600 leading-tight">
                Browse our fresh Italian & Ethiopian food & beverage menu
              </p>
            </div>

            {/* WiFi strip on stand */}
            {restaurant?.wifi_password && (
              <div className="mt-4 pt-3 border-t border-stone-300 text-[10px] text-stone-600 flex items-center justify-center gap-1.5">
                <Wifi className="w-3 h-3 text-stone-800" />
                <span>
                  Free WiFi: <strong>{restaurant.wifi_name || 'Rome1960_Guest'}</strong> • Key: <strong>{restaurant.wifi_password}</strong>
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* PRINT-ONLY VIEW (Hidden on screen, active on print command) */}
      <div className="hidden print:block text-black bg-white p-8 max-w-md mx-auto text-center border-2 border-black rounded-3xl">
        <div className="w-20 h-20 mx-auto mb-3">
          <img src={restaurant?.logo_url || '/assets/logo.svg'} alt="Logo" className="w-full h-full object-contain mx-auto" />
        </div>
        <h2 className="font-roman text-3xl font-bold uppercase tracking-widest text-black mb-1">
          {restaurant?.name || 'ROME 1960 CAFE'}
        </h2>
        <p className="font-serif italic text-sm text-stone-800 mb-3">
          {restaurant?.tagline || 'Taste. Tradition. Experience.'}
        </p>

        {tableNumber && (
          <div className="inline-block bg-black text-white text-sm font-bold px-4 py-1 rounded-full uppercase tracking-wider mb-4">
            Table #{tableNumber}
          </div>
        )}

        <div className="p-4 border-2 border-stone-300 rounded-2xl inline-block my-2">
          {qrDataUrl && (
            <img src={qrDataUrl} alt="Menu QR Code" className="w-64 h-64 mx-auto object-contain" />
          )}
        </div>

        <h3 className="font-bold text-base text-black mt-3">
          Scan with your phone to view our Digital Menu
        </h3>
        <p className="text-xs text-stone-600 mt-1">
          Instant access • Fresh food, coffees, pizzas & desserts
        </p>

        {restaurant?.wifi_password && (
          <div className="mt-6 pt-4 border-t border-stone-400 text-xs text-stone-700">
            Guest WiFi: <strong>{restaurant.wifi_name}</strong> | Password: <strong>{restaurant.wifi_password}</strong>
          </div>
        )}
      </div>
    </div>
  );
}
