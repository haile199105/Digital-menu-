import { Category, DatabaseState, MenuItem, Restaurant } from '../types';
import { INITIAL_CATEGORIES, INITIAL_MENU_ITEMS, INITIAL_RESTAURANT } from '../data/initialData';

const STORAGE_KEYS = {
  RESTAURANT: 'rome1960_restaurant_v1',
  CATEGORIES: 'rome1960_categories_v1',
  MENU_ITEMS: 'rome1960_menu_items_v1',
  AUTH_TOKEN: 'rome1960_admin_token_v1',
  ADMIN_USER: 'rome1960_admin_user_v1',
  ADMIN_CRED: 'rome1960_admin_credentials_v1',
};

// Helper for local storage initialization
function getLocalData<T>(key: string, defaultVal: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultVal;
    return JSON.parse(raw) as T;
  } catch (err) {
    console.error(`Error reading ${key} from storage:`, err);
    return defaultVal;
  }
}

function setLocalData<T>(key: string, val: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (err) {
    console.error(`Error saving ${key} to storage:`, err);
  }
}

export const api = {
  // Format price helper with ETB / currency
  formatPrice(price: number, currency: string = 'ETB'): string {
    const formattedNum = new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 0,
    }).format(price);
    return `${formattedNum} ${currency}`;
  },

  // RESTAURANT INFO
  async getRestaurant(): Promise<Restaurant> {
    try {
      const res = await fetch('/api/restaurant');
      if (res.ok) {
        let data = await res.json();
        if (data.logo_url && data.logo_url.includes('images.unsplash.com/photo-1559925393')) {
          data.logo_url = '/assets/logo.svg';
        }
        setLocalData(STORAGE_KEYS.RESTAURANT, data);
        return data;
      }
    } catch (e) {
      // Fallback to local
    }
    const local = getLocalData<Restaurant>(STORAGE_KEYS.RESTAURANT, INITIAL_RESTAURANT);
    if (local.logo_url && local.logo_url.includes('images.unsplash.com/photo-1559925393')) {
      local.logo_url = '/assets/logo.svg';
      setLocalData(STORAGE_KEYS.RESTAURANT, local);
    }
    return local;
  },

  async updateRestaurant(data: Partial<Restaurant>): Promise<Restaurant> {
    const current = await this.getRestaurant();
    const updated: Restaurant = {
      ...current,
      ...data,
      updated_at: new Date().toISOString(),
    };

    setLocalData(STORAGE_KEYS.RESTAURANT, updated);

    try {
      const res = await fetch('/api/restaurant', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN) || ''}`,
        },
        body: JSON.stringify(updated),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      // Offline / Local mode ok
    }
    return updated;
  },

  // CATEGORIES
  async getCategories(): Promise<Category[]> {
    try {
      const res = await fetch('/api/categories');
      if (res.ok) {
        const data = await res.json();
        setLocalData(STORAGE_KEYS.CATEGORIES, data);
        return data;
      }
    } catch (e) {
      // Fallback
    }
    return getLocalData<Category[]>(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
  },

  async createCategory(data: Omit<Category, 'id' | 'created_at' | 'updated_at' | 'restaurant_id'>): Promise<Category> {
    const categories = await this.getCategories();
    const newCategory: Category = {
      id: `cat-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      restaurant_id: 'rome-1960-cafe',
      name: data.name.trim(),
      description: data.description?.trim() || '',
      icon: data.icon || 'Utensils',
      display_order: data.display_order ?? (categories.length + 1),
      is_visible: data.is_visible ?? true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const next = [...categories, newCategory];
    setLocalData(STORAGE_KEYS.CATEGORIES, next);

    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN) || ''}`,
        },
        body: JSON.stringify(newCategory),
      });
      if (res.ok) return await res.json();
    } catch (e) {
      // Local fallback
    }
    return newCategory;
  },

  async updateCategory(id: string, data: Partial<Category>): Promise<Category> {
    const categories = await this.getCategories();
    const index = categories.findIndex((c) => c.id === id);
    if (index === -1) throw new Error('Category not found');

    const updated: Category = {
      ...categories[index],
      ...data,
      updated_at: new Date().toISOString(),
    };
    categories[index] = updated;
    setLocalData(STORAGE_KEYS.CATEGORIES, categories);

    try {
      await fetch(`/api/categories/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN) || ''}`,
        },
        body: JSON.stringify(updated),
      });
    } catch (e) {}

    return updated;
  },

  async deleteCategory(id: string): Promise<void> {
    const categories = (await this.getCategories()).filter((c) => c.id !== id);
    setLocalData(STORAGE_KEYS.CATEGORIES, categories);

    // Also remove items in this category or reassign them
    const items = (await this.getMenuItems()).filter((item) => item.category_id !== id);
    setLocalData(STORAGE_KEYS.MENU_ITEMS, items);

    try {
      await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN) || ''}`,
        },
      });
    } catch (e) {}
  },

  async reorderCategories(orderedIds: string[]): Promise<Category[]> {
    const categories = await this.getCategories();
    const reordered = categories.map((cat) => {
      const orderIdx = orderedIds.indexOf(cat.id);
      return {
        ...cat,
        display_order: orderIdx !== -1 ? orderIdx + 1 : cat.display_order,
      };
    }).sort((a, b) => a.display_order - b.display_order);

    setLocalData(STORAGE_KEYS.CATEGORIES, reordered);

    try {
      await fetch('/api/categories/reorder', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN) || ''}`,
        },
        body: JSON.stringify({ orderedIds }),
      });
    } catch (e) {}

    return reordered;
  },

  // MENU ITEMS
  async getMenuItems(): Promise<MenuItem[]> {
    try {
      const res = await fetch('/api/menu-items');
      if (res.ok) {
        const data = await res.json();
        setLocalData(STORAGE_KEYS.MENU_ITEMS, data);
        return data;
      }
    } catch (e) {
      // Fallback
    }
    return getLocalData<MenuItem[]>(STORAGE_KEYS.MENU_ITEMS, INITIAL_MENU_ITEMS);
  },

  async createMenuItem(data: Omit<MenuItem, 'id' | 'created_at' | 'updated_at' | 'restaurant_id'>): Promise<MenuItem> {
    const items = await this.getMenuItems();
    const newItem: MenuItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      restaurant_id: 'rome-1960-cafe',
      category_id: data.category_id,
      name: data.name.trim(),
      description: data.description.trim(),
      ingredients: data.ingredients || [],
      allergens: data.allergens || [],
      dietary: data.dietary || [],
      price: Number(data.price) || 0,
      image_url: data.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
      display_order: data.display_order ?? (items.length + 1),
      is_available: data.is_available ?? true,
      is_popular: Boolean(data.is_popular),
      is_new: Boolean(data.is_new),
      is_special: Boolean(data.is_special),
      preparation_time: data.preparation_time || '',
      calories: data.calories ? Number(data.calories) : undefined,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const next = [...items, newItem];
    setLocalData(STORAGE_KEYS.MENU_ITEMS, next);

    try {
      const res = await fetch('/api/menu-items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN) || ''}`,
        },
        body: JSON.stringify(newItem),
      });
      if (res.ok) return await res.json();
    } catch (e) {}

    return newItem;
  },

  async updateMenuItem(id: string, data: Partial<MenuItem>): Promise<MenuItem> {
    const items = await this.getMenuItems();
    const index = items.findIndex((i) => i.id === id);
    if (index === -1) throw new Error('Menu item not found');

    const updated: MenuItem = {
      ...items[index],
      ...data,
      price: data.price !== undefined ? Number(data.price) : items[index].price,
      updated_at: new Date().toISOString(),
    };
    items[index] = updated;
    setLocalData(STORAGE_KEYS.MENU_ITEMS, items);

    try {
      await fetch(`/api/menu-items/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN) || ''}`,
        },
        body: JSON.stringify(updated),
      });
    } catch (e) {}

    return updated;
  },

  async toggleAvailability(id: string, is_available: boolean): Promise<MenuItem> {
    return this.updateMenuItem(id, { is_available });
  },

  async deleteMenuItem(id: string): Promise<void> {
    const items = (await this.getMenuItems()).filter((i) => i.id !== id);
    setLocalData(STORAGE_KEYS.MENU_ITEMS, items);

    try {
      await fetch(`/api/menu-items/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN) || ''}`,
        },
      });
    } catch (e) {}
  },

  // IMAGE UPLOAD (Supports file conversion to optimized WebP/JPEG Base64 or API storage)
  async uploadImage(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      // Client-side image compression & optimization to dataURL
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxDim = 1200;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxDim) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            }
          } else {
            if (height > maxDim) {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const optimizedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
            resolve(optimizedDataUrl);
          } else {
            resolve(e.target?.result as string);
          }
        };
        img.onerror = () => resolve(e.target?.result as string);
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Failed to read image file'));
      reader.readAsDataURL(file);
    });
  },

  // DATABASE BACKUP & RESTORE
  async resetToDemoData(): Promise<void> {
    setLocalData(STORAGE_KEYS.RESTAURANT, INITIAL_RESTAURANT);
    setLocalData(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
    setLocalData(STORAGE_KEYS.MENU_ITEMS, INITIAL_MENU_ITEMS);

    try {
      await fetch('/api/seed/reset', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN) || ''}`,
        },
      });
    } catch (e) {}
  },

  async exportDatabase(): Promise<DatabaseState> {
    const restaurant = await this.getRestaurant();
    const categories = await this.getCategories();
    const menu_items = await this.getMenuItems();
    return { restaurant, categories, menu_items };
  },

  async importDatabase(state: DatabaseState): Promise<void> {
    if (state.restaurant) setLocalData(STORAGE_KEYS.RESTAURANT, state.restaurant);
    if (Array.isArray(state.categories)) setLocalData(STORAGE_KEYS.CATEGORIES, state.categories);
    if (Array.isArray(state.menu_items)) setLocalData(STORAGE_KEYS.MENU_ITEMS, state.menu_items);

    try {
      await fetch('/api/seed/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN) || ''}`,
        },
        body: JSON.stringify(state),
      });
    } catch (e) {}
  },

  // AUTHENTICATION
  async login(username: string, password: string): Promise<{ success: boolean; token?: string; error?: string }> {
    // Check custom saved admin password or default
    const savedCreds = getLocalData<{ username: string; passwordHash: string }>(
      STORAGE_KEYS.ADMIN_CRED,
      { username: 'admin', passwordHash: 'rome1960cafe' }
    );

    // Also attempt server auth
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, data.token);
        localStorage.setItem(STORAGE_KEYS.ADMIN_USER, JSON.stringify(data.user));
        return { success: true, token: data.token };
      }
    } catch (e) {}

    // Fallback authentication
    if (
      (username.trim().toLowerCase() === savedCreds.username.toLowerCase() || username.trim().toLowerCase() === 'admin') &&
      (password === savedCreds.passwordHash || password === 'rome1960cafe')
    ) {
      const fakeToken = `token_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const user = { id: 'admin-1', username: 'admin', email: 'admin@rome1960cafe.com', role: 'admin' as const, token: fakeToken };
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, fakeToken);
      localStorage.setItem(STORAGE_KEYS.ADMIN_USER, JSON.stringify(user));
      return { success: true, token: fakeToken };
    }

    return { success: false, error: 'Invalid username or password. Default is admin / rome1960cafe' };
  },

  isAuthenticated(): boolean {
    return Boolean(localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN));
  },

  logout(): void {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.ADMIN_USER);
    try {
      fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {}
  },

  async changePassword(oldPass: string, newPass: string): Promise<{ success: boolean; error?: string }> {
    const savedCreds = getLocalData<{ username: string; passwordHash: string }>(
      STORAGE_KEYS.ADMIN_CRED,
      { username: 'admin', passwordHash: 'rome1960cafe' }
    );

    if (oldPass !== savedCreds.passwordHash && oldPass !== 'rome1960cafe') {
      return { success: false, error: 'Current password is incorrect.' };
    }

    if (!newPass || newPass.length < 6) {
      return { success: false, error: 'New password must be at least 6 characters.' };
    }

    setLocalData(STORAGE_KEYS.ADMIN_CRED, {
      username: 'admin',
      passwordHash: newPass,
    });

    try {
      await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN) || ''}`,
        },
        body: JSON.stringify({ oldPassword: oldPass, newPassword: newPass }),
      });
    } catch (e) {}

    return { success: true };
  },
};
