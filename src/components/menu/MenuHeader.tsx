import React, { useState } from 'react';
import { Restaurant } from '../../types';
import { Phone, MapPin, Clock, MessageSquare, Wifi, Check, Sparkles, Navigation } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

interface MenuHeaderProps {
  restaurant: Restaurant;
  tableNumber?: string | null;
}

export function MenuHeader({ restaurant, tableNumber }: MenuHeaderProps) {
  const [showWifiModal, setShowWifiModal] = useState(false);
  const [copiedWifi, setCopiedWifi] = useState(false);
  const { showToast } = useToast();

  const handleCopyWifi = () => {
    if (restaurant.wifi_password) {
      navigator.clipboard.writeText(restaurant.wifi_password);
      setCopiedWifi(true);
      showToast('WiFi password copied to clipboard!');
      setTimeout(() => setCopiedWifi(false), 2000);
    }
  };

  return (
    <header className="relative bg-stone-900 text-stone-100 overflow-hidden pb-6 border-b border-stone-800">
      {/* Background Ambience / Subtle Vignette */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-15 mix-blend-overlay scale-105"
        style={{ backgroundImage: `url(${restaurant.cover_url})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-stone-950/80 via-stone-900/90 to-stone-900 pointer-events-none" />

      {/* Top Banner with Table Number if present */}
      {tableNumber && (
        <div className="relative z-10 bg-amber-500/20 text-amber-300 border-b border-amber-500/30 px-4 py-1.5 text-center text-xs font-semibold tracking-wide flex items-center justify-center gap-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Dining at Table <strong>#{tableNumber}</strong> — Welcome!</span>
        </div>
      )}

      {/* Main Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 text-center">
        {/* Brand Crest / Official Medallion Logo */}
        <div className="flex justify-center mb-3.5">
          <div className="relative group">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-stone-900 border-2 border-amber-500/60 p-1 shadow-2xl flex items-center justify-center overflow-hidden transition-transform duration-300 group-hover:scale-105">
              <img
                src={restaurant.logo_url || '/assets/logo.svg'}
                alt={restaurant.name}
                className="w-full h-full object-contain rounded-full"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/assets/logo.svg';
                }}
              />
            </div>
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 bg-amber-500 text-stone-950 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full shadow-md tracking-wider whitespace-nowrap border border-amber-300">
              Est. 1960
            </div>
          </div>
        </div>

        {/* Restaurant Name & Tagline */}
        <h1 className="font-roman text-2xl sm:text-4xl font-bold tracking-wider text-amber-50 uppercase drop-shadow-sm">
          {restaurant.name}
        </h1>
        <p className="font-serif-elegant italic text-amber-400/90 text-sm sm:text-base mt-1 tracking-wide">
          {restaurant.tagline || 'Taste. Tradition. Experience.'}
        </p>

        {/* Short Restaurant Intro */}
        {restaurant.description && (
          <p className="text-stone-300 text-xs sm:text-sm max-w-xl mx-auto mt-2.5 font-normal leading-relaxed line-clamp-2 sm:line-clamp-3">
            {restaurant.description}
          </p>
        )}

        {/* Info Badges (Hours, Address, WiFi) */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-xs text-stone-300">
          {restaurant.opening_hours && (
            <div className="inline-flex items-center gap-1.5 bg-stone-800/80 backdrop-blur-xs px-3 py-1 rounded-full border border-stone-700/60 shadow-xs">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>{restaurant.opening_hours}</span>
            </div>
          )}

          {restaurant.address && (
            <div className="inline-flex items-center gap-1.5 bg-stone-800/80 backdrop-blur-xs px-3 py-1 rounded-full border border-stone-700/60 shadow-xs">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <span className="truncate max-w-[200px] sm:max-w-xs">{restaurant.address}</span>
            </div>
          )}

          {restaurant.wifi_password && (
            <button
              type="button"
              onClick={() => setShowWifiModal(true)}
              className="inline-flex items-center gap-1.5 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 px-3 py-1 rounded-full border border-amber-500/30 transition-colors cursor-pointer"
            >
              <Wifi className="w-3.5 h-3.5" />
              <span>Free Guest WiFi</span>
            </button>
          )}
        </div>

        {/* Quick Action Contact Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 mt-5">
          {restaurant.phone && (
            <a
              href={`tel:${restaurant.phone.replace(/\s+/g, '')}`}
              className="inline-flex items-center gap-2 bg-stone-800 hover:bg-stone-700 text-stone-100 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold border border-stone-700 transition-all hover:scale-[1.02] shadow-sm"
              id="btn-call-restaurant"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              <span>Call Cafe</span>
            </a>
          )}

          {restaurant.whatsapp && (
            <a
              href={`https://wa.me/${restaurant.whatsapp.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all hover:scale-[1.02] shadow-sm"
              id="btn-whatsapp-restaurant"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </a>
          )}

          {restaurant.maps_url && (
            <a
              href={restaurant.maps_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-stone-800 hover:bg-stone-700 text-stone-100 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold border border-stone-700 transition-all hover:scale-[1.02] shadow-sm"
              id="btn-directions-restaurant"
            >
              <Navigation className="w-3.5 h-3.5 text-sky-400" />
              <span>Get Directions</span>
            </a>
          )}
        </div>
      </div>

      {/* Guest WiFi Modal */}
      {showWifiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-xs">
          <div className="bg-stone-900 border border-stone-700 text-stone-100 rounded-2xl max-w-xs w-full p-5 text-center shadow-2xl relative">
            <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-3">
              <Wifi className="w-6 h-6" />
            </div>
            <h3 className="font-serif-elegant font-bold text-lg text-amber-50">Complimentary WiFi</h3>
            <p className="text-xs text-stone-400 mt-1">Connect during your visit at ROME 1960 CAFE</p>

            <div className="bg-stone-950 rounded-xl p-3.5 mt-4 text-left border border-stone-800 space-y-2">
              <div>
                <span className="text-[10px] text-stone-400 uppercase font-semibold block">Network Name (SSID)</span>
                <span className="text-sm font-bold text-stone-200">{restaurant.wifi_name || 'Rome1960_Guest'}</span>
              </div>
              <div>
                <span className="text-[10px] text-stone-400 uppercase font-semibold block">Password</span>
                <span className="text-sm font-mono font-bold text-amber-400">{restaurant.wifi_password}</span>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={handleCopyWifi}
                className="flex-1 inline-flex items-center justify-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold py-2 px-3 rounded-xl text-xs transition-colors"
              >
                {copiedWifi ? <Check className="w-3.5 h-3.5" /> : null}
                <span>{copiedWifi ? 'Copied!' : 'Copy Password'}</span>
              </button>
              <button
                type="button"
                onClick={() => setShowWifiModal(false)}
                className="bg-stone-800 hover:bg-stone-700 text-stone-300 font-semibold py-2 px-3 rounded-xl text-xs transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
