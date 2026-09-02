import React, { useState, useEffect, useMemo, useRef } from 'react';
import { api } from '../services/api';
import { Category, DietaryType, MenuItem, Restaurant } from '../types';
import { PRESET_FOOD_IMAGES } from '../data/initialData';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Upload,
  Image as ImageIcon,
  Flame,
  Star,
  Sparkles,
  AlertCircle,
  Clock,
  X,
  Check,
  Filter,
} from 'lucide-react';
import { useToast } from '../context/ToastContext';

const ALLERGEN_OPTIONS = [
  'Dairy',
  'Gluten',
  'Eggs',
  'Nuts',
  'Peanuts',
  'Fish',
  'Shellfish',
  'Soy',
  'Sesame',
  'Celery',
  'Mustard',
];

const DIETARY_OPTIONS: DietaryType[] = [
  'Vegetarian',
  'Vegan',
  'Halal',
  'Gluten-Free',
  'Spicy',
  'Chef Special',
];

interface AdminMenuItemsProps {
  initialOpenAdd?: boolean;
}

export function AdminMenuItems({ initialOpenAdd = false }: AdminMenuItemsProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'available' | 'unavailable'>('all');

  // Edit / Create Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    category_id: '',
    name: '',
    description: '',
    price: 0,
    image_url: '',
    ingredients: [] as string[],
    allergens: [] as string[],
    dietary: [] as DietaryType[],
    is_available: true,
    is_popular: false,
    is_new: false,
    is_special: false,
    preparation_time: '',
    calories: '' as string | number,
  });

  // Ingredient input state
  const [ingredientInput, setIngredientInput] = useState('');

  // Image source tab in modal ('preset' | 'upload' | 'url')
  const [imageTab, setImageTab] = useState<'preset' | 'upload' | 'url'>('preset');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Delete Confirmation
  const [deletingItem, setDeletingItem] = useState<MenuItem | null>(null);

  const { showToast } = useToast();

  const loadData = async () => {
    setLoading(true);
    try {
      const [cats, items, rest] = await Promise.all([
        api.getCategories(),
        api.getMenuItems(),
        api.getRestaurant(),
      ]);
      setCategories(cats.sort((a, b) => a.display_order - b.display_order));
      setMenuItems(items.sort((a, b) => a.display_order - b.display_order));
      setRestaurant(rest);
    } catch (err) {
      showToast('Failed to load menu items', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (initialOpenAdd && categories.length > 0) {
      handleOpenAdd();
    }
  }, [initialOpenAdd, categories]);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      category_id: categories[0]?.id || '',
      name: '',
      description: '',
      price: 250,
      image_url: PRESET_FOOD_IMAGES[0]?.url || '',
      ingredients: ['Fresh ingredients', 'Olive oil'],
      allergens: [],
      dietary: [],
      is_available: true,
      is_popular: false,
      is_new: true,
      is_special: false,
      preparation_time: '10-15 mins',
      calories: '',
    });
    setIngredientInput('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      category_id: item.category_id,
      name: item.name,
      description: item.description,
      price: item.price,
      image_url: item.image_url,
      ingredients: [...(item.ingredients || [])],
      allergens: [...(item.allergens || [])],
      dietary: [...(item.dietary || [])],
      is_available: item.is_available,
      is_popular: item.is_popular,
      is_new: item.is_new,
      is_special: item.is_special,
      preparation_time: item.preparation_time || '',
      calories: item.calories || '',
    });
    setIngredientInput('');
    setIsModalOpen(true);
  };

  const handleAddIngredient = () => {
    if (ingredientInput.trim() && !formData.ingredients.includes(ingredientInput.trim())) {
      setFormData({
        ...formData,
        ingredients: [...formData.ingredients, ingredientInput.trim()],
      });
      setIngredientInput('');
    }
  };

  const handleRemoveIngredient = (ing: string) => {
    setFormData({
      ...formData,
      ingredients: formData.ingredients.filter((i) => i !== ing),
    });
  };

  const toggleAllergen = (alg: string) => {
    if (formData.allergens.includes(alg)) {
      setFormData({
        ...formData,
        allergens: formData.allergens.filter((a) => a !== alg),
      });
    } else {
      setFormData({
        ...formData,
        allergens: [...formData.allergens, alg],
      });
    }
  };

  const toggleDietary = (diet: DietaryType) => {
    if (formData.dietary.includes(diet)) {
      setFormData({
        ...formData,
        dietary: formData.dietary.filter((d) => d !== diet),
      });
    } else {
      setFormData({
        ...formData,
        dietary: [...formData.dietary, diet],
      });
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      showToast('Optimizing and uploading image...');
      const dataUrl = await api.uploadImage(file);
      setFormData((prev) => ({ ...prev, image_url: dataUrl }));
      showToast('Image uploaded successfully!');
    } catch (err) {
      showToast('Failed to process image', 'error');
    }
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast('Item name is required', 'error');
      return;
    }
    if (!formData.category_id) {
      showToast('Please select a category', 'error');
      return;
    }

    try {
      const payload = {
        category_id: formData.category_id,
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: Number(formData.price) || 0,
        image_url: formData.image_url.trim(),
        ingredients: formData.ingredients,
        allergens: formData.allergens,
        dietary: formData.dietary,
        is_available: formData.is_available,
        is_popular: formData.is_popular,
        is_new: formData.is_new,
        is_special: formData.is_special,
        preparation_time: formData.preparation_time.trim(),
        calories: formData.calories ? Number(formData.calories) : undefined,
      };

      if (editingItem) {
        const updated = await api.updateMenuItem(editingItem.id, payload);
        setMenuItems((prev) =>
          prev.map((i) => (i.id === updated.id ? updated : i))
        );
        showToast(`"${updated.name}" updated successfully!`);
      } else {
        const created = await api.createMenuItem({
          ...payload,
          display_order: menuItems.length + 1,
        });
        setMenuItems((prev) => [...prev, created]);
        showToast(`"${created.name}" added to the menu!`);
      }
      setIsModalOpen(false);
    } catch (err) {
      showToast('Failed to save menu item', 'error');
    }
  };

  const handleToggleAvailability = async (item: MenuItem) => {
    const nextState = !item.is_available;
    try {
      await api.toggleAvailability(item.id, nextState);
      setMenuItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, is_available: nextState } : i))
      );
      showToast(`${item.name} is now ${nextState ? 'In Stock' : 'Out of Stock'}`);
    } catch (err) {
      showToast('Failed to update availability', 'error');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingItem) return;
    try {
      await api.deleteMenuItem(deletingItem.id);
      setMenuItems((prev) => prev.filter((i) => i.id !== deletingItem.id));
      showToast(`Item "${deletingItem.name}" deleted.`);
      setDeletingItem(null);
    } catch (err) {
      showToast('Failed to delete item', 'error');
    }
  };

  // Filter items
  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      if (selectedCategoryFilter !== 'all' && item.category_id !== selectedCategoryFilter) {
        return false;
      }
      if (stockFilter === 'available' && !item.is_available) return false;
      if (stockFilter === 'unavailable' && item.is_available) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = item.name.toLowerCase().includes(q);
        const matchDesc = item.description.toLowerCase().includes(q);
        const matchIng = item.ingredients?.some((ing) => ing.toLowerCase().includes(q));
        if (!matchName && !matchDesc && !matchIng) return false;
      }
      return true;
    });
  }, [menuItems, selectedCategoryFilter, stockFilter, searchQuery]);

  const categoryMap = useMemo(() => {
    const map = new Map<string, string>();
    categories.forEach((c) => map.set(c.id, c.name));
    return map;
  }, [categories]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-roman text-amber-50">
            Menu Items
          </h1>
          <p className="text-stone-400 text-xs sm:text-sm mt-1">
            Manage food & drink items, prices, ingredients, photos, and stock status.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-md cursor-pointer"
          id="btn-add-menu-item-top"
        >
          <Plus className="w-4 h-4" />
          <span>Add Menu Item</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-stone-900 border border-stone-800 p-4 rounded-2xl flex flex-col sm:flex-row items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search items by name, description, ingredient..."
            className="w-full bg-stone-950 text-stone-100 text-xs sm:text-sm rounded-xl pl-10 pr-4 py-2.5 border border-stone-800 focus:border-amber-500 outline-hidden"
          />
        </div>

        {/* Category Select Filter */}
        <div className="w-full sm:w-auto">
          <select
            value={selectedCategoryFilter}
            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
            className="w-full bg-stone-950 text-stone-200 text-xs sm:text-sm rounded-xl px-3.5 py-2.5 border border-stone-800 focus:border-amber-500 outline-hidden"
          >
            <option value="all">All Categories ({menuItems.length})</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({menuItems.filter((i) => i.category_id === c.id).length})
              </option>
            ))}
          </select>
        </div>

        {/* Stock status filter */}
        <div className="flex items-center gap-1 bg-stone-950 p-1 rounded-xl border border-stone-800 text-xs w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setStockFilter('all')}
            className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg font-medium transition-colors ${
              stockFilter === 'all' ? 'bg-stone-800 text-white font-bold' : 'text-stone-400'
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setStockFilter('available')}
            className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg font-medium transition-colors ${
              stockFilter === 'available' ? 'bg-emerald-500/20 text-emerald-300 font-bold' : 'text-stone-400'
            }`}
          >
            In Stock
          </button>
          <button
            type="button"
            onClick={() => setStockFilter('unavailable')}
            className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg font-medium transition-colors ${
              stockFilter === 'unavailable' ? 'bg-red-500/20 text-red-300 font-bold' : 'text-stone-400'
            }`}
          >
            Out of Stock
          </button>
        </div>
      </div>

      {/* Menu Items Table / Grid */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-stone-800 flex items-center justify-between text-xs text-stone-400">
          <span>Showing {filteredItems.length} of {menuItems.length} items</span>
          <span>Currency: {restaurant?.currency || 'ETB'}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-stone-800 text-stone-400 uppercase text-[10px] tracking-wider bg-stone-950/40">
                <th className="py-3 px-4">Item Details</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4 text-center">Availability</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/80">
              {filteredItems.map((item) => {
                const catName = categoryMap.get(item.category_id);

                return (
                  <tr
                    key={item.id}
                    className={`hover:bg-stone-850/50 transition-colors ${
                      !item.is_available ? 'bg-stone-950/30' : ''
                    }`}
                  >
                    {/* Item details */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="w-12 h-12 rounded-xl object-cover bg-stone-800 shrink-0 border border-stone-700/50"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src =
                              'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80';
                          }}
                        />
                        <div className="min-w-0">
                          <h4 className="font-serif-elegant font-bold text-sm text-stone-100 truncate">
                            {item.name}
                          </h4>
                          <p className="text-xs text-stone-400 line-clamp-1 max-w-xs sm:max-w-md">
                            {item.description}
                          </p>
                          <div className="flex flex-wrap items-center gap-1.5 mt-1">
                            {item.is_popular && <Badge variant="popular">Popular</Badge>}
                            {item.is_special && <Badge variant="special">Special</Badge>}
                            {item.is_new && <Badge variant="new">New</Badge>}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4 text-xs font-medium text-stone-300">
                      {catName || '—'}
                    </td>

                    {/* Price */}
                    <td className="py-3.5 px-4 font-bold text-stone-100 text-sm">
                      {api.formatPrice(item.price, restaurant?.currency || 'ETB')}
                    </td>

                    {/* Availability toggle */}
                    <td className="py-3.5 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleAvailability(item)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
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
                        <span>{item.is_available ? 'In Stock' : 'Out of Stock'}</span>
                      </button>
                    </td>

                    {/* Action buttons */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(item)}
                          className="p-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors"
                          title="Edit Item"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingItem(item)}
                          className="p-2 rounded-lg bg-stone-800 hover:bg-red-950 text-stone-400 hover:text-red-400 transition-colors"
                          title="Delete Item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-stone-500">
                    No menu items match your search/filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Menu Item Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? `Edit Menu Item: ${editingItem.name}` : 'Add New Menu Item'}
        maxWidth="xl"
      >
        <form onSubmit={handleSaveItem} className="space-y-4">
          {/* Row 1: Name & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">
                Item Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Margherita Pizza, Sidama Macchiato"
                className="w-full bg-stone-50 text-stone-900 text-sm rounded-xl px-3.5 py-2.5 border border-stone-300 focus:border-amber-500 outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">
                Category *
              </label>
              <select
                required
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                className="w-full bg-stone-50 text-stone-900 text-sm rounded-xl px-3.5 py-2.5 border border-stone-300 focus:border-amber-500 outline-hidden"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: Price & Prep Time */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">
                Price ({restaurant?.currency || 'ETB'}) *
              </label>
              <input
                type="number"
                required
                min="0"
                step="1"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                placeholder="450"
                className="w-full bg-stone-50 text-stone-900 text-sm rounded-xl px-3.5 py-2.5 border border-stone-300 focus:border-amber-500 outline-hidden font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">
                Prep Time (Optional)
              </label>
              <input
                type="text"
                value={formData.preparation_time}
                onChange={(e) => setFormData({ ...formData, preparation_time: e.target.value })}
                placeholder="e.g. 10-15 mins"
                className="w-full bg-stone-50 text-stone-900 text-sm rounded-xl px-3.5 py-2.5 border border-stone-300 focus:border-amber-500 outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">
                Calories (Optional)
              </label>
              <input
                type="number"
                value={formData.calories}
                onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
                placeholder="e.g. 650"
                className="w-full bg-stone-50 text-stone-900 text-sm rounded-xl px-3.5 py-2.5 border border-stone-300 focus:border-amber-500 outline-hidden"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">
              Short Description *
            </label>
            <textarea
              required
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Fresh tomato sauce, buffalo mozzarella, fragrant basil and extra virgin olive oil."
              className="w-full bg-stone-50 text-stone-900 text-sm rounded-xl px-3.5 py-2.5 border border-stone-300 focus:border-amber-500 outline-hidden"
            />
          </div>

          {/* Image Manager Section */}
          <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-800">
                Menu Item Photo
              </label>
              <div className="flex items-center gap-1 text-xs">
                <button
                  type="button"
                  onClick={() => setImageTab('preset')}
                  className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                    imageTab === 'preset' ? 'bg-amber-500 text-stone-950' : 'text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  Presets Library
                </button>
                <button
                  type="button"
                  onClick={() => setImageTab('upload')}
                  className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                    imageTab === 'upload' ? 'bg-amber-500 text-stone-950' : 'text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  Upload File
                </button>
                <button
                  type="button"
                  onClick={() => setImageTab('url')}
                  className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                    imageTab === 'url' ? 'bg-amber-500 text-stone-950' : 'text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  Image URL
                </button>
              </div>
            </div>

            {/* Current Preview */}
            <div className="flex items-center gap-3">
              <img
                src={formData.image_url}
                alt="Item Preview"
                className="w-16 h-16 rounded-xl object-cover bg-stone-200 border border-stone-300 shrink-0"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80';
                }}
              />
              <div className="text-xs text-stone-600 flex-1">
                <span className="font-semibold block">Current Image Preview</span>
                <span className="text-[11px] text-stone-400 truncate block max-w-xs">
                  {formData.image_url || 'No image selected'}
                </span>
              </div>
            </div>

            {/* Preset Gallery Tab */}
            {imageTab === 'preset' && (
              <div className="max-h-40 overflow-y-auto grid grid-cols-3 sm:grid-cols-4 gap-2 pt-2 border-t border-stone-200">
                {PRESET_FOOD_IMAGES.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setFormData({ ...formData, image_url: preset.url })}
                    className={`relative rounded-xl overflow-hidden aspect-4/3 border-2 transition-all group ${
                      formData.image_url === preset.url ? 'border-amber-500 ring-2 ring-amber-500/30' : 'border-transparent opacity-80 hover:opacity-100'
                    }`}
                  >
                    <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" />
                    <span className="absolute inset-x-0 bottom-0 bg-stone-950/80 text-[10px] text-white p-1 truncate text-center">
                      {preset.label}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* File Upload Tab */}
            {imageTab === 'upload' && (
              <div className="pt-2 border-t border-stone-200">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-stone-300 hover:border-amber-500 rounded-xl p-4 text-center cursor-pointer transition-colors bg-white flex flex-col items-center justify-center gap-1.5"
                >
                  <Upload className="w-5 h-5 text-amber-600" />
                  <span className="text-xs font-semibold text-stone-800">
                    Click to select an image from your phone / computer
                  </span>
                  <span className="text-[10px] text-stone-400">
                    Images will automatically be optimized for ultra-fast mobile loading
                  </span>
                </button>
              </div>
            )}

            {/* URL Tab */}
            {imageTab === 'url' && (
              <div className="pt-2 border-t border-stone-200">
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-white text-stone-900 text-xs rounded-xl px-3 py-2 border border-stone-300 outline-hidden"
                />
              </div>
            )}
          </div>

          {/* Ingredients Builder */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">
              Ingredients
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={ingredientInput}
                onChange={(e) => setIngredientInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddIngredient();
                  }
                }}
                placeholder="Type ingredient (e.g. Buffalo Mozzarella) and press Enter"
                className="flex-1 bg-stone-50 text-stone-900 text-xs rounded-xl px-3 py-2 border border-stone-300 outline-hidden"
              />
              <button
                type="button"
                onClick={handleAddIngredient}
                className="bg-stone-800 hover:bg-stone-700 text-white text-xs px-3.5 py-2 rounded-xl font-semibold cursor-pointer"
              >
                Add
              </button>
            </div>

            {formData.ingredients.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {formData.ingredients.map((ing) => (
                  <span
                    key={ing}
                    className="inline-flex items-center gap-1 bg-stone-200 text-stone-800 text-xs px-2.5 py-1 rounded-lg"
                  >
                    <span>{ing}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveIngredient(ing)}
                      className="text-stone-500 hover:text-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Allergens Selection */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
              Allergens (Select all that apply)
            </label>
            <div className="flex flex-wrap gap-1.5">
              {ALLERGEN_OPTIONS.map((alg) => {
                const active = formData.allergens.includes(alg);
                return (
                  <button
                    key={alg}
                    type="button"
                    onClick={() => toggleAllergen(alg)}
                    className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-colors ${
                      active
                        ? 'bg-amber-500 text-stone-950 border-amber-600 font-bold'
                        : 'bg-stone-100 text-stone-700 border-stone-200 hover:bg-stone-200'
                    }`}
                  >
                    {alg}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dietary & Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-stone-200">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                Dietary Attributes
              </label>
              <div className="flex flex-wrap gap-1.5">
                {DIETARY_OPTIONS.map((diet) => {
                  const active = formData.dietary.includes(diet);
                  return (
                    <button
                      key={diet}
                      type="button"
                      onClick={() => toggleDietary(diet)}
                      className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-colors ${
                        active
                          ? 'bg-emerald-600 text-white border-emerald-700 font-bold'
                          : 'bg-stone-100 text-stone-700 border-stone-200 hover:bg-stone-200'
                      }`}
                    >
                      {diet}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Badges & Stock */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                Badges & Availability
              </label>
              <div className="space-y-2 text-xs">
                <label className="flex items-center gap-2 font-medium text-stone-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_available}
                    onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Currently In Stock & Available</span>
                </label>

                <label className="flex items-center gap-2 font-medium text-stone-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_popular}
                    onChange={(e) => setFormData({ ...formData, is_popular: e.target.checked })}
                    className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500"
                  />
                  <span>Mark as "Popular" (🔥)</span>
                </label>

                <label className="flex items-center gap-2 font-medium text-stone-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_special}
                    onChange={(e) => setFormData({ ...formData, is_special: e.target.checked })}
                    className="w-4 h-4 rounded text-amber-600 focus:ring-amber-600"
                  />
                  <span>Mark as "Chef Special" (⭐)</span>
                </label>

                <label className="flex items-center gap-2 font-medium text-stone-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_new}
                    onChange={(e) => setFormData({ ...formData, is_new: e.target.checked })}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-600"
                  />
                  <span>Mark as "New Addition" (✨)</span>
                </label>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-4 flex items-center justify-end gap-2 border-t border-stone-200">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-md cursor-pointer"
            >
              {editingItem ? 'Update Menu Item' : 'Add Item to Menu'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Item Confirmation Modal */}
      <Modal
        isOpen={Boolean(deletingItem)}
        onClose={() => setDeletingItem(null)}
        title="Confirm Delete Menu Item"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-stone-700">
            Are you sure you want to permanently remove <strong>"{deletingItem?.name}"</strong> from the digital menu?
          </p>
          <div className="text-xs text-stone-500">
            Tip: If this item is temporarily out of ingredients, you can toggle its status to "Out of Stock" instead of deleting it.
          </div>
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setDeletingItem(null)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDeleteConfirm}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-500 text-white shadow-sm"
            >
              Yes, Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
