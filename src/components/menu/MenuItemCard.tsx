import React, { useState } from 'react';
import { MenuItem } from '../../types';
import { Badge } from '../ui/Badge';
import { api } from '../../services/api';
import { AlertCircle, Clock, ChevronRight } from 'lucide-react';

interface MenuItemCardProps {
  item: MenuItem;
  currency: string;
  categoryName?: string;
  onSelect: (item: MenuItem) => void;
}

export const MenuItemCard: React.FC<MenuItemCardProps> = ({ item, currency, categoryName, onSelect }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Fallback food image placeholder
  const fallbackImage =
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80';

  const isUnavailable = !item.is_available;

  return (
    <div
      onClick={() => onSelect(item)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(item);
        }
      }}
      className={`group relative bg-white rounded-2xl border transition-all duration-200 overflow-hidden text-left cursor-pointer flex flex-col justify-between shadow-2xs hover:shadow-md ${
        isUnavailable
          ? 'border-stone-300/70 bg-stone-100/70 opacity-80'
          : 'border-stone-200/80 hover:border-amber-400/80'
      }`}
      id={`menu-item-card-${item.id}`}
    >
      {/* Top Media Container */}
      <div className="relative aspect-16/10 w-full overflow-hidden bg-stone-100">
        {/* Placeholder shimmer while loading */}
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 bg-stone-200 animate-pulse" />
        )}

        <img
          src={imageError ? fallbackImage : item.image_url || fallbackImage}
          alt={item.name}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          onError={() => {
            setImageError(true);
            setImageLoaded(true);
          }}
          className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
            isUnavailable ? 'grayscale-70 contrast-90' : ''
          }`}
        />

        {/* Badges Overlay */}
        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5 z-10">
          {item.is_popular && <Badge variant="popular">Popular</Badge>}
          {item.is_special && <Badge variant="special">Chef Special</Badge>}
          {item.is_new && <Badge variant="new">New</Badge>}
        </div>

        {/* Category tag badge on top right */}
        {categoryName && (
          <div className="absolute top-2.5 right-2.5 bg-stone-950/75 backdrop-blur-xs text-stone-200 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md">
            {categoryName}
          </div>
        )}

        {/* Unavailable Banner Overlay */}
        {isUnavailable && (
          <div className="absolute inset-0 bg-stone-950/60 backdrop-blur-2xs flex items-center justify-center p-3">
            <div className="bg-stone-900/90 text-stone-100 border border-stone-700 px-3 py-1.5 rounded-xl text-xs font-bold tracking-wide flex items-center gap-1.5 shadow-lg">
              <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
              <span>Currently Unavailable</span>
            </div>
          </div>
        )}
      </div>

      {/* Item Information */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Header Row with Name & Price */}
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <h3 className="font-serif-elegant font-bold text-base sm:text-lg text-stone-900 leading-snug group-hover:text-amber-900 transition-colors">
              {item.name}
            </h3>
          </div>

          {/* Short Description */}
          <p className="text-xs sm:text-sm text-stone-600 line-clamp-2 leading-relaxed font-normal mb-3">
            {item.description}
          </p>
        </div>

        {/* Footer: Price, Dietary tags & Details button */}
        <div className="pt-2 border-t border-stone-100 flex items-center justify-between mt-auto">
          <div>
            <div className="font-bold text-base sm:text-lg text-stone-950 tracking-tight">
              {api.formatPrice(item.price, currency)}
            </div>
            {item.preparation_time && (
              <div className="flex items-center gap-1 text-[11px] text-stone-400 mt-0.5">
                <Clock className="w-3 h-3" />
                <span>{item.preparation_time}</span>
              </div>
            )}
          </div>

          <div className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 group-hover:text-amber-800 group-hover:translate-x-0.5 transition-all">
            <span>Details</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </div>
  );
}
