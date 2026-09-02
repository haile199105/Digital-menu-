import React, { useRef, useEffect } from 'react';
import { Category } from '../../types';
import {
  Coffee,
  Pizza,
  UtensilsCrossed,
  Sandwich,
  Flame,
  Cake,
  GlassWater,
  CupSoda,
  Sparkles,
  Star,
  Croissant,
  Layers,
} from 'lucide-react';

interface CategoryNavProps {
  categories: Category[];
  selectedCategoryId: string | 'all';
  onSelectCategory: (categoryId: string | 'all') => void;
  itemCountsByCategory: Record<string, number>;
  totalCount: number;
}

// Icon helper mapper
export function getCategoryIcon(iconName?: string) {
  const size = 'w-4 h-4 shrink-0';
  switch (iconName?.toLowerCase()) {
    case 'coffee':
      return <Coffee className={size} />;
    case 'croissant':
      return <Croissant className={size} />;
    case 'pizza':
      return <Pizza className={size} />;
    case 'utensilscrossed':
    case 'pasta':
      return <UtensilsCrossed className={size} />;
    case 'sandwich':
    case 'burger':
      return <Sandwich className={size} />;
    case 'flame':
    case 'grill':
    case 'meat':
      return <Flame className={size} />;
    case 'cake':
    case 'dessert':
      return <Cake className={size} />;
    case 'glasswater':
    case 'juice':
      return <GlassWater className={size} />;
    case 'cupsoda':
    case 'tea':
      return <CupSoda className={size} />;
    case 'sparkles':
    case 'snack':
      return <Sparkles className={size} />;
    case 'star':
    case 'special':
      return <Star className={size} />;
    default:
      return <Layers className={size} />;
  }
}

export function CategoryNav({
  categories,
  selectedCategoryId,
  onSelectCategory,
  itemCountsByCategory,
  totalCount,
}: CategoryNavProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeBtnRef = useRef<HTMLButtonElement>(null);

  // Auto-scroll active category into visible range on mobile
  useEffect(() => {
    if (activeBtnRef.current && scrollRef.current) {
      const container = scrollRef.current;
      const element = activeBtnRef.current;
      const elementLeft = element.offsetLeft;
      const elementWidth = element.offsetWidth;
      const containerWidth = container.offsetWidth;

      container.scrollTo({
        left: elementLeft - containerWidth / 2 + elementWidth / 2,
        behavior: 'smooth',
      });
    }
  }, [selectedCategoryId]);

  const visibleCategories = categories.filter((c) => c.is_visible);

  return (
    <nav className="sticky top-0 z-30 bg-stone-900/95 backdrop-blur-md border-b border-stone-800 py-2.5 shadow-md">
      <div className="max-w-5xl mx-auto px-3 sm:px-6">
        <div
          ref={scrollRef}
          className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 scroll-smooth"
          role="tablist"
          aria-label="Menu categories"
        >
          {/* "All" Category Pill */}
          <button
            ref={selectedCategoryId === 'all' ? activeBtnRef : null}
            type="button"
            role="tab"
            aria-selected={selectedCategoryId === 'all'}
            onClick={() => onSelectCategory('all')}
            className={`whitespace-nowrap flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 shrink-0 cursor-pointer ${
              selectedCategoryId === 'all'
                ? 'bg-amber-500 text-stone-950 shadow-md font-bold'
                : 'bg-stone-800/80 text-stone-300 hover:bg-stone-800 hover:text-stone-100 border border-stone-700/50'
            }`}
          >
            <Layers className="w-4 h-4 shrink-0" />
            <span>All Items</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                selectedCategoryId === 'all' ? 'bg-stone-950/20 text-stone-950 font-extrabold' : 'bg-stone-700 text-stone-300'
              }`}
            >
              {totalCount}
            </span>
          </button>

          {/* Individual Category Pills */}
          {visibleCategories.map((category) => {
            const isSelected = selectedCategoryId === category.id;
            const count = itemCountsByCategory[category.id] || 0;

            return (
              <button
                key={category.id}
                ref={isSelected ? activeBtnRef : null}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => onSelectCategory(category.id)}
                className={`whitespace-nowrap flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-amber-500 text-stone-950 shadow-md font-bold'
                    : 'bg-stone-800/80 text-stone-300 hover:bg-stone-800 hover:text-stone-100 border border-stone-700/50'
                }`}
              >
                {getCategoryIcon(category.icon)}
                <span>{category.name}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isSelected ? 'bg-stone-950/20 text-stone-950 font-extrabold' : 'bg-stone-700 text-stone-300'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
