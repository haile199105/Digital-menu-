export interface Restaurant {
  id: string;
  name: string;
  tagline: string;
  description: string;
  logo_url: string;
  cover_url: string;
  phone: string;
  whatsapp: string;
  email?: string;
  address: string;
  maps_url: string;
  opening_hours: string;
  currency: string;
  wifi_name?: string;
  wifi_password?: string;
  instagram_url?: string;
  facebook_url?: string;
  telegram_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  restaurant_id: string;
  name: string;
  description?: string;
  icon?: string;
  display_order: number;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
}

export type DietaryType = 'Vegetarian' | 'Vegan' | 'Halal' | 'Gluten-Free' | 'Spicy' | 'Chef Special';

export interface MenuItem {
  id: string;
  restaurant_id: string;
  category_id: string;
  name: string;
  description: string;
  ingredients: string[];
  allergens?: string[];
  dietary?: DietaryType[];
  price: number;
  image_url: string;
  display_order: number;
  is_available: boolean;
  is_popular: boolean;
  is_new: boolean;
  is_special: boolean;
  preparation_time?: string;
  calories?: number;
  created_at: string;
  updated_at: string;
}

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'manager';
  token: string;
}

export interface DatabaseState {
  restaurant: Restaurant;
  categories: Category[];
  menu_items: MenuItem[];
}
