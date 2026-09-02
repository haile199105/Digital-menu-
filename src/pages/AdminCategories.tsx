import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Category, MenuItem } from '../types';
import { Modal } from '../components/ui/Modal';
import { getCategoryIcon } from '../components/menu/CategoryNav';
import {
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  Layers,
  Check,
} from 'lucide-react';
import { useToast } from '../context/ToastContext';

const ICON_OPTIONS = [
  { label: 'Coffee / Espresso', value: 'Coffee' },
  { label: 'Croissant / Bakery', value: 'Croissant' },
  { label: 'Pizza / Stone Baked', value: 'Pizza' },
  { label: 'Pasta / Italian', value: 'UtensilsCrossed' },
  { label: 'Burgers & Sandwiches', value: 'Sandwich' },
  { label: 'Grill / Steaks / Meat', value: 'Flame' },
  { label: 'Cakes & Desserts', value: 'Cake' },
  { label: 'Fresh Juices / Drinks', value: 'GlassWater' },
  { label: 'Tea / Infusions', value: 'CupSoda' },
  { label: 'Antipasti / Snacks', value: 'Sparkles' },
  { label: 'Special Offers', value: 'Star' },
  { label: 'General Course', value: 'Layers' },
];

export function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: 'UtensilsCrossed',
    is_visible: true,
  });

  // Delete dialog
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);

  const { showToast } = useToast();

  const loadData = async () => {
    setLoading(true);
    try {
      const [cats, items] = await Promise.all([api.getCategories(), api.getMenuItems()]);
      setCategories(cats.sort((a, b) => a.display_order - b.display_order));
      setMenuItems(items);
    } catch (err) {
      showToast('Failed to load categories', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      description: '',
      icon: 'Coffee',
      is_visible: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      icon: category.icon || 'UtensilsCrossed',
      is_visible: category.is_visible,
    });
    setIsModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast('Category name is required', 'error');
      return;
    }

    try {
      if (editingCategory) {
        const updated = await api.updateCategory(editingCategory.id, {
          name: formData.name.trim(),
          description: formData.description.trim(),
          icon: formData.icon,
          is_visible: formData.is_visible,
        });
        setCategories((prev) =>
          prev.map((c) => (c.id === updated.id ? updated : c))
        );
        showToast(`Category "${updated.name}" updated successfully!`);
      } else {
        const created = await api.createCategory({
          name: formData.name.trim(),
          description: formData.description.trim(),
          icon: formData.icon,
          is_visible: formData.is_visible,
          display_order: categories.length + 1,
        });
        setCategories((prev) => [...prev, created]);
        showToast(`Category "${created.name}" created!`);
      }
      setIsModalOpen(false);
    } catch (err) {
      showToast('Failed to save category', 'error');
    }
  };

  const handleToggleVisibility = async (category: Category) => {
    try {
      const nextVal = !category.is_visible;
      await api.updateCategory(category.id, { is_visible: nextVal });
      setCategories((prev) =>
        prev.map((c) => (c.id === category.id ? { ...c, is_visible: nextVal } : c))
      );
      showToast(
        `Category "${category.name}" is now ${nextVal ? 'visible' : 'hidden from customers'}`
      );
    } catch (err) {
      showToast('Failed to update category visibility', 'error');
    }
  };

  const handleMoveOrder = async (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= categories.length) return;

    const newCategories = [...categories];
    const temp = newCategories[index];
    newCategories[index] = newCategories[targetIdx];
    newCategories[targetIdx] = temp;

    const orderedIds = newCategories.map((c) => c.id);
    const updated = await api.reorderCategories(orderedIds);
    setCategories(updated);
    showToast('Categories reordered');
  };

  const handleDeleteConfirm = async () => {
    if (!deletingCategory) return;
    try {
      await api.deleteCategory(deletingCategory.id);
      setCategories((prev) => prev.filter((c) => c.id !== deletingCategory.id));
      setMenuItems((prev) => prev.filter((i) => i.category_id !== deletingCategory.id));
      showToast(`Category "${deletingCategory.name}" and its items deleted.`);
      setDeletingCategory(null);
    } catch (err) {
      showToast('Failed to delete category', 'error');
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
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-roman text-amber-50">
            Menu Categories
          </h1>
          <p className="text-stone-400 text-xs sm:text-sm mt-1">
            Create, rename, reorder, and control visibility of menu sections.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-md cursor-pointer"
          id="btn-add-category"
        >
          <Plus className="w-4 h-4" />
          <span>New Category</span>
        </button>
      </div>

      {/* Category List */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-stone-800 flex items-center justify-between text-xs text-stone-400">
          <span>{categories.length} Categories Configured</span>
          <span>Reorder using the arrow buttons</span>
        </div>

        <div className="divide-y divide-stone-800/80">
          {categories.map((category, index) => {
            const itemCount = menuItems.filter((i) => i.category_id === category.id).length;

            return (
              <div
                key={category.id}
                className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                  !category.is_visible ? 'bg-stone-950/40 opacity-70' : 'hover:bg-stone-850/50'
                }`}
              >
                {/* Left: Icon, Name & Description */}
                <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0">
                    {getCategoryIcon(category.icon)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-serif-elegant font-bold text-base text-stone-100">
                        {category.name}
                      </h3>
                      {!category.is_visible && (
                        <span className="text-[10px] bg-stone-800 text-stone-400 px-2 py-0.5 rounded-md">
                          Hidden
                        </span>
                      )}
                    </div>
                    {category.description && (
                      <p className="text-xs text-stone-400 line-clamp-1 mt-0.5">
                        {category.description}
                      </p>
                    )}
                    <span className="text-[11px] text-amber-400/80 font-medium">
                      {itemCount} {itemCount === 1 ? 'item' : 'items'}
                    </span>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-1.5 self-end sm:self-center">
                  {/* Order buttons */}
                  <div className="flex items-center bg-stone-950 rounded-lg border border-stone-800 p-0.5 mr-2">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => handleMoveOrder(index, 'up')}
                      className="p-1.5 text-stone-400 hover:text-stone-100 disabled:opacity-30 disabled:hover:text-stone-400"
                      title="Move up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={index === categories.length - 1}
                      onClick={() => handleMoveOrder(index, 'down')}
                      className="p-1.5 text-stone-400 hover:text-stone-100 disabled:opacity-30 disabled:hover:text-stone-400"
                      title="Move down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Visibility toggle */}
                  <button
                    type="button"
                    onClick={() => handleToggleVisibility(category)}
                    className={`p-2 rounded-lg border transition-colors ${
                      category.is_visible
                        ? 'bg-stone-800 border-stone-700 text-stone-300 hover:text-white'
                        : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                    }`}
                    title={category.is_visible ? 'Hide from customers' : 'Make visible to customers'}
                  >
                    {category.is_visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>

                  {/* Edit */}
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(category)}
                    className="p-2 rounded-lg bg-stone-800 hover:bg-stone-700 border border-stone-700 text-stone-300 hover:text-white transition-colors"
                    title="Edit Category"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  {/* Delete */}
                  <button
                    type="button"
                    onClick={() => setDeletingCategory(category)}
                    className="p-2 rounded-lg bg-stone-800 hover:bg-red-950 border border-stone-700 hover:border-red-800 text-stone-400 hover:text-red-400 transition-colors"
                    title="Delete Category"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}

          {categories.length === 0 && (
            <div className="p-8 text-center text-stone-500">
              No categories found. Click "New Category" to create your first one.
            </div>
          )}
        </div>
      </div>

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCategory ? `Edit Category: ${editingCategory.name}` : 'Create New Category'}
      >
        <form onSubmit={handleSaveCategory} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">
              Category Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Breakfast, Roman Pizza, Artisan Coffee..."
              className="w-full bg-stone-50 text-stone-900 text-sm rounded-xl px-3.5 py-2.5 border border-stone-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">
              Subtitle / Description (Optional)
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Short description displayed on the menu"
              className="w-full bg-stone-50 text-stone-900 text-sm rounded-xl px-3.5 py-2.5 border border-stone-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
              Category Icon
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1 border border-stone-200 rounded-xl bg-stone-50">
              {ICON_OPTIONS.map((opt) => {
                const isSelected = formData.icon === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, icon: opt.value })}
                    className={`flex items-center gap-2 p-2 rounded-lg text-xs font-medium text-left transition-all ${
                      isSelected
                        ? 'bg-amber-500 text-stone-950 font-bold shadow-xs'
                        : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
                    }`}
                  >
                    {getCategoryIcon(opt.value)}
                    <span className="truncate">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-stone-100">
            <label className="flex items-center gap-2 text-xs font-semibold text-stone-700 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_visible}
                onChange={(e) => setFormData({ ...formData, is_visible: e.target.checked })}
                className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500"
              />
              <span>Visible to customers on digital menu</span>
            </label>
          </div>

          <div className="pt-4 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-sm transition-colors cursor-pointer"
            >
              {editingCategory ? 'Update Category' : 'Create Category'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(deletingCategory)}
        onClose={() => setDeletingCategory(null)}
        title="Confirm Delete Category"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-stone-700">
            Are you sure you want to delete <strong>"{deletingCategory?.name}"</strong>?
          </p>
          <div className="bg-red-50 border border-red-200 text-red-800 text-xs p-3 rounded-xl">
            ⚠️ Warning: All menu items in this category will also be deleted. This action cannot be undone.
          </div>
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setDeletingCategory(null)}
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
