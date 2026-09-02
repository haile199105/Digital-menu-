import React, { useState, useEffect, useMemo } from 'react';
import { Category, MenuItem, Restaurant } from '../types';
import { api } from '../services/api';
import { MenuHeader } from '../components/menu/MenuHeader';
import { CategoryNav } from '../components/menu/CategoryNav';
import { MenuSearchBar, FilterBadge } from '../components/menu/MenuSearchBar';
import { MenuItemCard } from '../components/menu/MenuItemCard';
import { MenuItemModal } from '../components/menu/MenuItemModal';
import { UtensilsCrossed, Search, Lock, ArrowUp, Sparkles, RefreshCw } from 'lucide-react';

interface CustomerMenuProps {
  onNavigateToAdmin: () => void;
}

export function CustomerMenu({ onNavigateToAdmin }: CustomerMenuProps) {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter & Search states
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterBadge>('all');

  // Detail Modal state
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);

  // Table number from URL if present
  const [tableNumber, setTableNumber] = useState<string | null>(null);

  // Scroll to top button visibility
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    // Parse table query param from URL (e.g. /menu?table=4)
    const params = new URLSearchParams(window.location.search);
    const table = params.get('table');
    if (table) setTableNumber(table);

    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch initial data
  const loadMenuData = async () => {
    setLoading(true);
    try {
      const [restData, catData, itemsData] = await Promise.all([
        api.getRestaurant(),
        api.getCategories(),
        api.getMenuItems(),
      ]);
      setRestaurant(restData);
      setCategories(catData.sort((a, b) => a.display_order - b.display_order));
      setMenuItems(itemsData.sort((a, b) => a.display_order - b.display_order));
    } catch (err) {
      console.error('Failed to load menu data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMenuData();
  }, []);

  // Map category IDs to names
  const categoryMap = useMemo(() => {
    const map = new Map<string, string>();
    categories.forEach((cat) => map.set(cat.id, cat.name));
    return map;
  }, [categories]);

  // Item counts by category
  const itemCountsByCategory = useMemo(() => {
    const counts: Record<string, number> = {};
    menuItems.forEach((item) => {
      counts[item.category_id] = (counts[item.category_id] || 0) + 1;
    });
    return counts;
  }, [menuItems]);

  // Filtered menu items
  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      // Category filter
      if (selectedCategoryId !== 'all' && item.category_id !== selectedCategoryId) {
        return false;
      }

      // Quick Badge Filter
      if (activeFilter === 'popular' && !item.is_popular) return false;
      if (activeFilter === 'special' && !item.is_special) return false;
      if (activeFilter === 'new' && !item.is_new) return false;
      if (
        activeFilter === 'vegetarian' &&
        !item.dietary?.some((d) => d.toLowerCase().includes('vegetarian') || d.toLowerCase().includes('vegan'))
      ) {
        return false;
      }

      // Search Query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const catName = categoryMap.get(item.category_id)?.toLowerCase() || '';
        const matchName = item.name.toLowerCase().includes(query);
        const matchDesc = item.description.toLowerCase().includes(query);
        const matchCat = catName.includes(query);
        const matchIng = item.ingredients?.some((ing) => ing.toLowerCase().includes(query));
        const matchAllergens = item.allergens?.some((alg) => alg.toLowerCase().includes(query));

        if (!matchName && !matchDesc && !matchCat && !matchIng && !matchAllergens) {
          return false;
        }
      }

      return true;
    });
  }, [menuItems, selectedCategoryId, activeFilter, searchQuery, categoryMap]);

  // Grouped items by category for "all items" mode without search
  const visibleCategories = categories.filter((c) => c.is_visible);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading && !restaurant) {
    return (
      <div className="min-h-screen bg-stone-900 flex flex-col items-center justify-center text-stone-100 p-6">
        <div className="w-12 h-12 border-3 border-amber-500/30 border-t-amber-500 rounded-full animate-spin mb-4" />
        <h2 className="font-roman text-xl font-bold tracking-widest text-amber-100 uppercase">
          ROME 1960 CAFE
        </h2>
        <p className="font-serif-elegant italic text-xs text-amber-400/80 mt-1">
          Loading Fresh Menu...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col selection:bg-amber-200">
      {/* 1. Restaurant Header */}
      {restaurant && <MenuHeader restaurant={restaurant} tableNumber={tableNumber} />}

      {/* 2. Category Navigation Bar (Sticky) */}
      <CategoryNav
        categories={categories}
        selectedCategoryId={selectedCategoryId}
        onSelectCategory={(catId) => {
          setSelectedCategoryId(catId);
          // If searching, keep query or focus
        }}
        itemCountsByCategory={itemCountsByCategory}
        totalCount={menuItems.length}
      />

      {/* 3. Search Bar and Filter Pills */}
      <MenuSearchBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        resultsCount={filteredItems.length}
      />

      {/* 4. Menu Items Section */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6">
        {/* If user filtered by search or specific category */}
        {searchQuery || activeFilter !== 'all' || selectedCategoryId !== 'all' ? (
          <div>
            {/* Header Title for Filter Mode */}
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-stone-200">
              <h2 className="font-serif-elegant font-bold text-xl sm:text-2xl text-stone-900">
                {selectedCategoryId !== 'all'
                  ? categoryMap.get(selectedCategoryId) || 'Category'
                  : searchQuery
                  ? `Search Results for "${searchQuery}"`
                  : 'Filtered Items'}
              </h2>
              <span className="text-xs font-semibold text-stone-500 bg-stone-200/80 px-2.5 py-1 rounded-full">
                {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'}
              </span>
            </div>

            {filteredItems.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {filteredItems.map((item) => (
                  <MenuItemCard
                    key={item.id}
                    item={item}
                    currency={restaurant?.currency || 'ETB'}
                    categoryName={categoryMap.get(item.category_id)}
                    onSelect={setSelectedItem}
                  />
                ))}
              </div>
            ) : (
              /* Empty State */
              <div className="text-center py-16 px-4 bg-white rounded-3xl border border-stone-200 shadow-2xs">
                <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3">
                  <Search className="w-8 h-8" />
                </div>
                <h3 className="font-serif-elegant font-bold text-lg text-stone-800">
                  No matching menu items found
                </h3>
                <p className="text-sm text-stone-500 max-w-sm mx-auto mt-1.5 leading-relaxed">
                  We couldn't find anything matching your search. Try adjusting your keywords or category filters.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setActiveFilter('all');
                    setSelectedCategoryId('all');
                  }}
                  className="mt-5 inline-flex items-center gap-2 bg-stone-900 hover:bg-stone-800 text-stone-100 font-semibold px-4 py-2 rounded-xl text-xs transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Reset All Filters</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Default: Show Section by Section grouped by Categories */
          <div className="space-y-10">
            {visibleCategories.map((category) => {
              const catItems = menuItems.filter((i) => i.category_id === category.id);
              if (catItems.length === 0) return null;

              return (
                <section key={category.id} id={`category-${category.id}`} className="scroll-mt-16">
                  {/* Category Section Header */}
                  <div className="flex items-end justify-between mb-4 pb-2 border-b border-stone-200">
                    <div>
                      <h2 className="font-serif-elegant font-bold text-xl sm:text-2xl text-stone-900 tracking-tight">
                        {category.name}
                      </h2>
                      {category.description && (
                        <p className="text-xs sm:text-sm text-stone-500 font-normal mt-0.5 max-w-xl">
                          {category.description}
                        </p>
                      )}
                    </div>
                    <span className="text-xs font-semibold text-stone-400 bg-stone-100 px-2.5 py-1 rounded-full shrink-0">
                      {catItems.length} {catItems.length === 1 ? 'item' : 'items'}
                    </span>
                  </div>

                  {/* Menu Item Cards Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {catItems.map((item) => (
                      <MenuItemCard
                        key={item.id}
                        item={item}
                        currency={restaurant?.currency || 'ETB'}
                        categoryName={category.name}
                        onSelect={setSelectedItem}
                      />
                    ))}
                  </div>
                </section>
              );
            })}

            {menuItems.length === 0 && (
              <div className="text-center py-20 px-4 bg-white rounded-3xl border border-stone-200 shadow-xs">
                <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3">
                  <UtensilsCrossed className="w-8 h-8" />
                </div>
                <h3 className="font-serif-elegant font-bold text-xl text-stone-800">
                  Menu is currently being updated
                </h3>
                <p className="text-sm text-stone-500 max-w-sm mx-auto mt-2 leading-relaxed">
                  The restaurant staff is updating the digital menu. Please check back shortly or speak with your waiter.
                </p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Floating Scroll to Top Button */}
      {showScrollTop && (
        <button
          type="button"
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-40 bg-stone-900/90 hover:bg-stone-900 text-amber-400 p-3 rounded-full shadow-xl border border-stone-700 transition-all hover:scale-110 cursor-pointer"
          aria-label="Scroll to top"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}

      {/* 5. Menu Footer */}
      <footer className="mt-12 bg-stone-900 text-stone-400 text-xs py-8 border-t border-stone-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-3">
          <div className="flex items-center justify-center gap-2">
            <span className="font-roman text-sm font-bold text-amber-100 uppercase tracking-widest">
              {restaurant?.name || 'ROME 1960 CAFE'}
            </span>
          </div>
          <p className="text-stone-400 italic font-serif-elegant">
            {restaurant?.tagline || 'Taste. Tradition. Experience.'}
          </p>
          <p className="text-stone-500 text-[11px] max-w-md mx-auto">
            All prices are in {restaurant?.currency || 'ETB'} inclusive of applicable local taxes and service fees.
          </p>
          <div className="pt-4 border-t border-stone-800 flex flex-wrap items-center justify-center gap-4 text-stone-500">
            <span>© {new Date().getFullYear()} {restaurant?.name || 'ROME 1960 CAFE'}</span>
            <span>•</span>
            <button
              type="button"
              onClick={onNavigateToAdmin}
              className="inline-flex items-center gap-1.5 text-stone-400 hover:text-amber-300 transition-colors cursor-pointer"
              id="link-admin-login-footer"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Staff & Admin Portal</span>
            </button>
          </div>
        </div>
      </footer>

      {/* 6. Rich Item Detail Modal */}
      <MenuItemModal
        item={selectedItem}
        currency={restaurant?.currency || 'ETB'}
        categoryName={selectedItem ? categoryMap.get(selectedItem.category_id) : undefined}
        onClose={() => setSelectedItem(null)}
      />
    </div>
  );
}
