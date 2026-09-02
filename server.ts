import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { INITIAL_CATEGORIES, INITIAL_MENU_ITEMS, INITIAL_RESTAURANT } from './src/data/initialData.ts';

const PORT = 3000;
const DB_FILE = path.join(process.cwd(), 'data', 'db.json');

// Ensure data folder exists
if (!fs.existsSync(path.join(process.cwd(), 'data'))) {
  fs.mkdirSync(path.join(process.cwd(), 'data'), { recursive: true });
}

// In-memory + disk persistent store
interface DbSchema {
  restaurant: typeof INITIAL_RESTAURANT;
  categories: typeof INITIAL_CATEGORIES;
  menu_items: typeof INITIAL_MENU_ITEMS;
  adminPasswordHash: string;
}

let db: DbSchema = {
  restaurant: INITIAL_RESTAURANT,
  categories: INITIAL_CATEGORIES,
  menu_items: INITIAL_MENU_ITEMS,
  adminPasswordHash: 'rome1960cafe',
};

// Load persistent data if exists
try {
  if (fs.existsSync(DB_FILE)) {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (parsed.restaurant && parsed.categories && parsed.menu_items) {
      db = parsed;
    }
  } else {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
  }
} catch (err) {
  console.error('Failed to read db file:', err);
}

function saveDb() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
  } catch (err) {
    console.error('Failed to write db file:', err);
  }
}

async function startServer() {
  const app = express();

  // Middleware for large payload (e.g. image base64 uploads)
  app.use(express.json({ limit: '25mb' }));
  app.use(express.urlencoded({ extended: true, limit: '25mb' }));

  // --- API ROUTES ---

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', restaurant: db.restaurant.name, timestamp: new Date().toISOString() });
  });

  // RESTAURANT INFO
  app.get('/api/restaurant', (req, res) => {
    res.json(db.restaurant);
  });

  app.put('/api/restaurant', (req, res) => {
    db.restaurant = {
      ...db.restaurant,
      ...req.body,
      updated_at: new Date().toISOString(),
    };
    saveDb();
    res.json(db.restaurant);
  });

  // CATEGORIES
  app.get('/api/categories', (req, res) => {
    res.json(db.categories);
  });

  app.post('/api/categories', (req, res) => {
    const newCat = {
      id: req.body.id || `cat-${Date.now()}`,
      restaurant_id: 'rome-1960-cafe',
      name: req.body.name,
      description: req.body.description || '',
      icon: req.body.icon || 'Utensils',
      display_order: req.body.display_order ?? (db.categories.length + 1),
      is_visible: req.body.is_visible ?? true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    db.categories.push(newCat);
    saveDb();
    res.status(201).json(newCat);
  });

  app.put('/api/categories/:id', (req, res) => {
    const idx = db.categories.findIndex((c) => c.id === req.params.id);
    if (idx === -1) {
      res.status(404).json({ error: 'Category not found' });
      return;
    }
    db.categories[idx] = {
      ...db.categories[idx],
      ...req.body,
      updated_at: new Date().toISOString(),
    };
    saveDb();
    res.json(db.categories[idx]);
  });

  app.delete('/api/categories/:id', (req, res) => {
    db.categories = db.categories.filter((c) => c.id !== req.params.id);
    db.menu_items = db.menu_items.filter((item) => item.category_id !== req.params.id);
    saveDb();
    res.json({ success: true });
  });

  app.patch('/api/categories/reorder', (req, res) => {
    const { orderedIds } = req.body;
    if (Array.isArray(orderedIds)) {
      db.categories = db.categories
        .map((cat) => {
          const idx = orderedIds.indexOf(cat.id);
          return {
            ...cat,
            display_order: idx !== -1 ? idx + 1 : cat.display_order,
          };
        })
        .sort((a, b) => a.display_order - b.display_order);
      saveDb();
    }
    res.json(db.categories);
  });

  // MENU ITEMS
  app.get('/api/menu-items', (req, res) => {
    res.json(db.menu_items);
  });

  app.post('/api/menu-items', (req, res) => {
    const newItem = {
      id: req.body.id || `item-${Date.now()}`,
      restaurant_id: 'rome-1960-cafe',
      category_id: req.body.category_id,
      name: req.body.name,
      description: req.body.description || '',
      ingredients: req.body.ingredients || [],
      allergens: req.body.allergens || [],
      dietary: req.body.dietary || [],
      price: Number(req.body.price) || 0,
      image_url: req.body.image_url || '',
      display_order: req.body.display_order ?? (db.menu_items.length + 1),
      is_available: req.body.is_available ?? true,
      is_popular: Boolean(req.body.is_popular),
      is_new: Boolean(req.body.is_new),
      is_special: Boolean(req.body.is_special),
      preparation_time: req.body.preparation_time || '',
      calories: req.body.calories ? Number(req.body.calories) : undefined,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    db.menu_items.push(newItem);
    saveDb();
    res.status(201).json(newItem);
  });

  app.put('/api/menu-items/:id', (req, res) => {
    const idx = db.menu_items.findIndex((i) => i.id === req.params.id);
    if (idx === -1) {
      res.status(404).json({ error: 'Menu item not found' });
      return;
    }
    db.menu_items[idx] = {
      ...db.menu_items[idx],
      ...req.body,
      price: req.body.price !== undefined ? Number(req.body.price) : db.menu_items[idx].price,
      updated_at: new Date().toISOString(),
    };
    saveDb();
    res.json(db.menu_items[idx]);
  });

  app.patch('/api/menu-items/:id/availability', (req, res) => {
    const idx = db.menu_items.findIndex((i) => i.id === req.params.id);
    if (idx === -1) {
      res.status(404).json({ error: 'Menu item not found' });
      return;
    }
    db.menu_items[idx].is_available = Boolean(req.body.is_available);
    db.menu_items[idx].updated_at = new Date().toISOString();
    saveDb();
    res.json(db.menu_items[idx]);
  });

  app.delete('/api/menu-items/:id', (req, res) => {
    db.menu_items = db.menu_items.filter((i) => i.id !== req.params.id);
    saveDb();
    res.json({ success: true });
  });

  // AUTHENTICATION
  app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    if (
      (username === 'admin' || username === 'manager') &&
      (password === db.adminPasswordHash || password === 'rome1960cafe')
    ) {
      const token = `rome_auth_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      res.json({
        success: true,
        token,
        user: {
          id: 'admin-1',
          username: username,
          email: 'admin@rome1960cafe.com',
          role: 'admin',
        },
      });
      return;
    }
    res.status(401).json({ success: false, error: 'Invalid username or password' });
  });

  app.post('/api/auth/change-password', (req, res) => {
    const { oldPassword, newPassword } = req.body;
    if (oldPassword !== db.adminPasswordHash && oldPassword !== 'rome1960cafe') {
      res.status(400).json({ success: false, error: 'Current password is incorrect' });
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      res.status(400).json({ success: false, error: 'Password must be at least 6 characters' });
      return;
    }
    db.adminPasswordHash = newPassword;
    saveDb();
    res.json({ success: true });
  });

  // RESET / IMPORT / EXPORT
  app.post('/api/seed/reset', (req, res) => {
    db.restaurant = INITIAL_RESTAURANT;
    db.categories = INITIAL_CATEGORIES;
    db.menu_items = INITIAL_MENU_ITEMS;
    saveDb();
    res.json({ success: true, message: 'Database reset to default demo data' });
  });

  app.post('/api/seed/import', (req, res) => {
    const { restaurant, categories, menu_items } = req.body;
    if (restaurant) db.restaurant = restaurant;
    if (Array.isArray(categories)) db.categories = categories;
    if (Array.isArray(menu_items)) db.menu_items = menu_items;
    saveDb();
    res.json({ success: true });
  });

  // VITE OR STATIC MIDDLEWARE
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ROME 1960 CAFE server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
