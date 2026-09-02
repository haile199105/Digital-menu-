import React from 'react';
import { Search, X, Flame, Star, Sparkles, Leaf } from 'lucide-react';

export type FilterBadge = 'all' | 'popular' | 'special' | 'new' | 'vegetarian';

interface MenuSearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeFilter: FilterBadge;
  onFilterChange: (filter: FilterBadge) => void;
  resultsCount: number;
}

export function MenuSearchBar({
  searchQuery,
  onSearchChange,
  activeFilter,
  onFilterChange,
  resultsCount,
}: MenuSearchBarProps) {
  return (
    <div className="bg-white/80 backdrop-blur-xs border-b border-stone-200 py-3.5 px-3 sm:px-6 shadow-2xs">
      <div className="max-w-5xl mx-auto space-y-2.5">
        {/* Search Input Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search pizza, macchiato, pasta, ingredients..."
            className="w-full bg-stone-100 hover:bg-stone-50 focus:bg-white text-stone-900 placeholder:text-stone-400 text-sm rounded-xl pl-10 pr-10 py-2.5 border border-stone-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all outline-hidden"
            id="input-menu-search"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-400 hover:text-stone-700"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Quick Filter Tags */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
          <button
            type="button"
            onClick={() => onFilterChange('all')}
            className={`px-3 py-1 rounded-lg font-medium transition-colors shrink-0 ${
              activeFilter === 'all'
                ? 'bg-stone-900 text-stone-100 font-semibold'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            All Items
          </button>

          <button
            type="button"
            onClick={() => onFilterChange('popular')}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-colors shrink-0 ${
              activeFilter === 'popular'
                ? 'bg-amber-500 text-stone-950 font-bold'
                : 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-600" />
            <span>Popular</span>
          </button>

          <button
            type="button"
            onClick={() => onFilterChange('special')}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-colors shrink-0 ${
              activeFilter === 'special'
                ? 'bg-amber-600 text-white font-bold'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>Chef's Specials</span>
          </button>

          <button
            type="button"
            onClick={() => onFilterChange('new')}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-colors shrink-0 ${
              activeFilter === 'new'
                ? 'bg-emerald-600 text-white font-bold'
                : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>New Additions</span>
          </button>

          <button
            type="button"
            onClick={() => onFilterChange('vegetarian')}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-colors shrink-0 ${
              activeFilter === 'vegetarian'
                ? 'bg-emerald-700 text-white font-bold'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            <Leaf className="w-3.5 h-3.5 text-emerald-600" />
            <span>Vegetarian</span>
          </button>

          {(searchQuery || activeFilter !== 'all') && (
            <span className="text-[11px] text-stone-500 ml-auto shrink-0 pl-2">
              Showing {resultsCount} {resultsCount === 1 ? 'item' : 'items'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
