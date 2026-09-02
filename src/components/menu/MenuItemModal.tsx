import React, { useState } from 'react';
import { MenuItem } from '../../types';
import { Badge } from '../ui/Badge';
import { api } from '../../services/api';
import {
  X,
  Clock,
  Flame,
  AlertTriangle,
  Share2,
  Check,
  Sparkles,
  Info,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';

interface MenuItemModalProps {
  item: MenuItem | null;
  currency: string;
  categoryName?: string;
  onClose: () => void;
}

export function MenuItemModal({ item, currency, categoryName, onClose }: MenuItemModalProps) {
  const [copied, setCopied] = useState(false);
  const { showToast } = useToast();

  if (!item) return null;

  const fallbackImage =
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80';

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: `${item.name} | ROME 1960 CAFE`,
          text: `Check out ${item.name} (${api.formatPrice(item.price, currency)}) at ROME 1960 CAFE`,
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(`${item.name} (${api.formatPrice(item.price, currency)}) at ROME 1960 CAFE - ${window.location.href}`);
      setCopied(true);
      showToast('Item details copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-stone-950/80 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden z-10 my-auto text-stone-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Large Media Banner with badges & close button */}
        <div className="relative aspect-16/10 w-full overflow-hidden bg-stone-900">
          <img
            src={item.image_url || fallbackImage}
            alt={item.name}
            className={`w-full h-full object-cover ${
              !item.is_available ? 'grayscale-60 contrast-90' : ''
            }`}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = fallbackImage;
            }}
          />

          {/* Gradient shadow for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/20 to-transparent pointer-events-none" />

          {/* Floating Action Buttons */}
          <div className="absolute top-3 right-3 flex items-center gap-2">
            <button
              type="button"
              onClick={handleShare}
              className="bg-stone-900/80 hover:bg-stone-900 text-stone-100 p-2 rounded-full backdrop-blur-md transition-colors cursor-pointer"
              title="Share item"
              aria-label="Share item"
            >
              {copied ? <Check className="w-4 h-4 text-amber-400" /> : <Share2 className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="bg-stone-900/80 hover:bg-stone-900 text-stone-100 p-2 rounded-full backdrop-blur-md transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Badges on top left */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
            {item.is_popular && <Badge variant="popular">Popular</Badge>}
            {item.is_special && <Badge variant="special">Chef Special</Badge>}
            {item.is_new && <Badge variant="new">New</Badge>}
          </div>

          {/* Bottom Title on Image banner */}
          <div className="absolute bottom-3 left-4 right-4 text-white">
            {categoryName && (
              <span className="text-[11px] font-semibold tracking-wider uppercase text-amber-300 block mb-1">
                {categoryName}
              </span>
            )}
            <h2 className="font-serif-elegant font-bold text-xl sm:text-2xl text-stone-50 leading-tight">
              {item.name}
            </h2>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Price & Availability Bar */}
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div>
              <span className="text-xs text-stone-500 font-medium block">Price</span>
              <div className="text-2xl font-bold text-stone-950 font-serif-elegant">
                {api.formatPrice(item.price, currency)}
              </div>
            </div>

            <div className="text-right">
              {item.is_available ? (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Freshly Available</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-stone-700 bg-stone-200 px-2.5 py-1 rounded-full border border-stone-300">
                  <AlertTriangle className="w-3.5 h-3.5 text-stone-500" />
                  <span>Currently Unavailable</span>
                </span>
              )}
            </div>
          </div>

          {/* Dietary & Spec Tags */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {item.dietary?.map((diet) => (
              <span
                key={diet}
                className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-lg font-medium flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3 text-emerald-600" />
                <span>{diet}</span>
              </span>
            ))}

            {item.preparation_time && (
              <span className="bg-stone-100 text-stone-700 px-2.5 py-1 rounded-lg font-medium flex items-center gap-1">
                <Clock className="w-3 h-3 text-stone-500" />
                <span>Prep: {item.preparation_time}</span>
              </span>
            )}

            {item.calories && (
              <span className="bg-stone-100 text-stone-700 px-2.5 py-1 rounded-lg font-medium flex items-center gap-1">
                <Flame className="w-3 h-3 text-amber-500" />
                <span>{item.calories} kcal</span>
              </span>
            )}
          </div>

          {/* Full Description */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-1">
              Description
            </h4>
            <p className="text-sm text-stone-700 leading-relaxed font-normal">
              {item.description}
            </p>
          </div>

          {/* Ingredients List */}
          {item.ingredients && item.ingredients.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-1.5">
                Ingredients & Recipe
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {item.ingredients.map((ing, idx) => (
                  <span
                    key={idx}
                    className="bg-stone-100 hover:bg-stone-200/70 text-stone-700 text-xs px-2.5 py-1 rounded-md transition-colors"
                  >
                    {ing}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Allergens Warning */}
          {item.allergens && item.allergens.length > 0 && (
            <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold block text-amber-950">Allergen Notice:</strong>
                <p className="mt-0.5">
                  Contains: {item.allergens.join(', ')}. Please inform your server if you have any food allergies.
                </p>
              </div>
            </div>
          )}

          {/* Ordering Note */}
          <div className="bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs text-stone-600 flex items-center gap-2">
            <Info className="w-4 h-4 text-stone-400 shrink-0" />
            <span>
              Please place your order directly with our friendly waitstaff at your table.
            </span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-100 flex items-center justify-between">
          <div className="text-xs text-stone-500">
            ROME 1960 CAFE • Freshly Prepared
          </div>
          <button
            type="button"
            onClick={onClose}
            className="bg-stone-900 hover:bg-stone-800 text-stone-100 font-semibold px-5 py-2 rounded-xl text-xs sm:text-sm transition-colors cursor-pointer"
          >
            Back to Menu
          </button>
        </div>
      </div>
    </div>
  );
}
