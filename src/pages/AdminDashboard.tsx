import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Category, MenuItem, Restaurant } from '../types';
import {
  UtensilsCrossed,
  CheckCircle2,
  AlertCircle,
  FolderTree,
  Star,
  Flame,
  Plus,
  QrCode,
  ExternalLink,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { AdminTab } from '../components/admin/AdminLayout';

interface AdminDashboardProps {
  onNavigateTab: (tab: AdminTab) => void;
  onOpenAddItem: () => void;
  onOpenAddCategory: () => void;
}

export function AdminDashboard({
  onNavigateTab,
  onOpenAddItem,
  onOpenAddCategory,
}: AdminDashboardProps) {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const loadData = async () => {
    setLoading(true);
    try {
      const [rest, cats, items] = await Promise.all([
        api.getRestaurant(),
        api.getCategories(),
        api.getMenuItems(),
      ]);
      setRestaurant(rest);
      setCategories(cats);
      setMenuItems(items);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalItems = menuItems.length;
  const availableItems = menuItems.filter((i) => i.is_available).length;
  const unavailableItems = totalItems - availableItems;
  const popularCount = menuItems.filter((i) => i.is_popular).length;
  const specialCount = menuItems.filter((i) => i.is_special).length;

  const handleToggleAvailability = async (item: MenuItem) => {
    const nextState = !item.is_available;
    try {
      await api.toggleAvailability(item.id, nextState);
      setMenuItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, is_available: nextState } : i))
      );
      showToast(
        `${item.name} is now marked as ${nextState ? 'Available' : 'Unavailable'}`
      );
    } catch (err) {
      showToast('Failed to update availability', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-roman tracking-wide text-amber-50">
            Menu Overview
          </h1>
          <p className="text-stone-400 text-xs sm:text-sm mt-1">
            Real-time digital menu statistics and quick management for {restaurant?.name || 'ROME 1960 CAFE'}.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onOpenAddItem}
            className="inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-md cursor-pointer"
            id="btn-dash-add-item"
          >
            <Plus className="w-4 h-4" />
            <span>Add Menu Item</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab('qr-code')}
            className="inline-flex items-center gap-1.5 bg-stone-800 hover:bg-stone-700 text-stone-100 px-3.5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm border border-stone-700 transition-colors cursor-pointer"
          >
            <QrCode className="w-4 h-4 text-amber-400" />
            <span>Generate QR</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Items */}
        <div className="bg-stone-900 border border-stone-800 p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Total Items</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <UtensilsCrossed className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-bold text-stone-100">{totalItems}</div>
            <div className="text-[11px] text-stone-500 mt-0.5">{categories.length} Active Categories</div>
          </div>
        </div>

        {/* Available Items */}
        <div className="bg-stone-900 border border-stone-800 p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">In Stock</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-bold text-emerald-400">{availableItems}</div>
            <div className="text-[11px] text-stone-500 mt-0.5">
              {totalItems > 0 ? Math.round((availableItems / totalItems) * 100) : 0}% available
            </div>
          </div>
        </div>

        {/* Unavailable Items */}
        <div className="bg-stone-900 border border-stone-800 p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Out of Stock</span>
            <div className="p-2 rounded-xl bg-red-500/10 text-red-400">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-bold text-stone-300">{unavailableItems}</div>
            <div className="text-[11px] text-stone-500 mt-0.5">Marked as unavailable</div>
          </div>
        </div>

        {/* Categories */}
        <div className="bg-stone-900 border border-stone-800 p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Categories</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <FolderTree className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-bold text-stone-100">{categories.length}</div>
            <div className="text-[11px] text-stone-500 mt-0.5">{popularCount} Popular • {specialCount} Specials</div>
          </div>
        </div>
      </div>

      {/* Quick Availability Switcher Table */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base sm:text-lg font-bold font-serif-elegant text-stone-100">
              Live Item Availability Switcher
            </h2>
            <p className="text-xs text-stone-400">
              Instantly toggle items in stock or out of stock without deleting them.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab('menu-items')}
            className="inline-flex items-center gap-1 text-xs font-semibold text-amber-400 hover:text-amber-300"
          >
            <span>Manage All Items</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-stone-800 text-stone-400 uppercase text-[10px] tracking-wider">
                <th className="py-3 px-3">Item</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Price</th>
                <th className="py-3 px-3 text-right">Availability Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/60">
              {menuItems.slice(0, 8).map((item) => {
                const cat = categories.find((c) => c.id === item.category_id);
                return (
                  <tr key={item.id} className="hover:bg-stone-800/40 transition-colors">
                    <td className="py-3 px-3 flex items-center gap-3">
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-10 h-10 rounded-lg object-cover bg-stone-800 shrink-0"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80';
                        }}
                      />
                      <div>
                        <div className="font-semibold text-stone-200">{item.name}</div>
                        <div className="flex gap-1.5 mt-0.5">
                          {item.is_popular && (
                            <span className="text-[10px] text-amber-400 flex items-center gap-0.5">
                              <Flame className="w-3 h-3" /> Popular
                            </span>
                          )}
                          {item.is_special && (
                            <span className="text-[10px] text-amber-300 flex items-center gap-0.5">
                              <Star className="w-3 h-3" /> Special
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-stone-400 text-xs">{cat?.name || '—'}</td>
                    <td className="py-3 px-3 font-semibold text-stone-200">
                      {api.formatPrice(item.price, restaurant?.currency || 'ETB')}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleToggleAvailability(item)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                          item.is_available
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30'
                            : 'bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30'
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            item.is_available ? 'bg-emerald-400' : 'bg-red-400'
                          }`}
                        />
                        <span>{item.is_available ? 'In Stock' : 'Unavailable'}</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Launch Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          onClick={() => onNavigateTab('categories')}
          className="bg-stone-900 hover:bg-stone-850 border border-stone-800 p-5 rounded-2xl cursor-pointer transition-all hover:border-amber-500/50 flex items-center justify-between"
        >
          <div>
            <h3 className="font-bold text-stone-100 text-sm">Organize Categories</h3>
            <p className="text-xs text-stone-400 mt-1">Reorder, hide or add new course categories</p>
          </div>
          <FolderTree className="w-5 h-5 text-amber-400" />
        </div>

        <div
          onClick={() => onNavigateTab('qr-code')}
          className="bg-stone-900 hover:bg-stone-850 border border-stone-800 p-5 rounded-2xl cursor-pointer transition-all hover:border-amber-500/50 flex items-center justify-between"
        >
          <div>
            <h3 className="font-bold text-stone-100 text-sm">Print QR Stands</h3>
            <p className="text-xs text-stone-400 mt-1">Generate table QR codes & printable stands</p>
          </div>
          <QrCode className="w-5 h-5 text-amber-400" />
        </div>

        <div
          onClick={() => onNavigateTab('settings')}
          className="bg-stone-900 hover:bg-stone-850 border border-stone-800 p-5 rounded-2xl cursor-pointer transition-all hover:border-amber-500/50 flex items-center justify-between"
        >
          <div>
            <h3 className="font-bold text-stone-100 text-sm">Cafe Information</h3>
            <p className="text-xs text-stone-400 mt-1">Update hours, WiFi, phone, currency, and address</p>
          </div>
          <TrendingUp className="w-5 h-5 text-amber-400" />
        </div>
      </div>
    </div>
  );
}
