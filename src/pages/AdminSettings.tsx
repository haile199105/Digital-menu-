import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { DatabaseState, Restaurant } from '../types';
import { Modal } from '../components/ui/Modal';
import {
  Save,
  RotateCcw,
  Download,
  Upload,
  KeyRound,
  Store,
  Clock,
  Phone,
  MessageSquare,
  MapPin,
  Wifi,
  Coins,
  ShieldAlert,
} from 'lucide-react';
import { useToast } from '../context/ToastContext';

export function AdminSettings() {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Partial<Restaurant>>({});

  // Password Modal
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Reset Modal
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  const fileImportRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await api.getRestaurant();
      setRestaurant(data);
      setFormData(data);
    } catch (err) {
      showToast('Failed to load settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await api.updateRestaurant(formData);
      setRestaurant(updated);
      showToast('Restaurant information updated successfully!');
    } catch (err) {
      showToast('Failed to update restaurant settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match', 'error');
      return;
    }
    if (newPassword.length < 6) {
      showToast('New password must be at least 6 characters', 'error');
      return;
    }

    try {
      const res = await api.changePassword(oldPassword, newPassword);
      if (res.success) {
        showToast('Admin password changed successfully!');
        setIsPasswordModalOpen(false);
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        showToast(res.error || 'Password update failed', 'error');
      }
    } catch (err) {
      showToast('Failed to update password', 'error');
    }
  };

  const handleResetData = async () => {
    try {
      await api.resetToDemoData();
      showToast('Database reset to authentic ROME 1960 CAFE demo data!');
      setIsResetModalOpen(false);
      await loadData();
    } catch (err) {
      showToast('Failed to reset data', 'error');
    }
  };

  const handleExportBackup = async () => {
    try {
      const data = await api.exportDatabase();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rome-1960-cafe-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      showToast('Database backup JSON exported!');
    } catch (err) {
      showToast('Failed to export backup', 'error');
    }
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string) as DatabaseState;
        if (parsed.restaurant && parsed.categories && parsed.menu_items) {
          await api.importDatabase(parsed);
          showToast('Database backup successfully imported!');
          await loadData();
        } else {
          showToast('Invalid backup file format', 'error');
        }
      } catch (err) {
        showToast('Failed to parse backup JSON file', 'error');
      }
    };
    reader.readAsText(file);
  };

  if (loading || !restaurant) {
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
          <h1 className="text-2xl sm:text-3xl font-bold font-roman text-amber-50">
            Restaurant Settings
          </h1>
          <p className="text-stone-400 text-xs sm:text-sm mt-1">
            Configure cafe branding, contact channels, opening hours, guest WiFi, and currency.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsPasswordModalOpen(true)}
            className="inline-flex items-center gap-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 px-3.5 py-2 rounded-xl text-xs font-semibold border border-stone-700 transition-colors"
          >
            <KeyRound className="w-4 h-4 text-amber-400" />
            <span>Change Password</span>
          </button>
        </div>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Branding & Identity */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-stone-800 text-amber-400">
            <Store className="w-5 h-5" />
            <h2 className="text-sm font-bold uppercase tracking-wider font-roman text-stone-100">
              Branding & Cafe Identity
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-400 mb-1">
                Restaurant Name *
              </label>
              <input
                type="text"
                required
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-stone-950 text-stone-100 text-sm rounded-xl px-3.5 py-2.5 border border-stone-800 focus:border-amber-500 outline-hidden font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-400 mb-1">
                Tagline / Slogan
              </label>
              <input
                type="text"
                value={formData.tagline || ''}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                placeholder="Taste. Tradition. Experience."
                className="w-full bg-stone-950 text-stone-100 text-sm rounded-xl px-3.5 py-2.5 border border-stone-800 focus:border-amber-500 outline-hidden italic"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-400 mb-1">
              Short Welcome Description
            </label>
            <textarea
              rows={2}
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-stone-950 text-stone-100 text-sm rounded-xl px-3.5 py-2.5 border border-stone-800 focus:border-amber-500 outline-hidden leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-400 mb-1">
                Logo Image URL
              </label>
              <input
                type="url"
                value={formData.logo_url || ''}
                onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                className="w-full bg-stone-950 text-stone-100 text-xs rounded-xl px-3.5 py-2.5 border border-stone-800 focus:border-amber-500 outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-400 mb-1">
                Cover Banner URL
              </label>
              <input
                type="url"
                value={formData.cover_url || ''}
                onChange={(e) => setFormData({ ...formData, cover_url: e.target.value })}
                className="w-full bg-stone-950 text-stone-100 text-xs rounded-xl px-3.5 py-2.5 border border-stone-800 focus:border-amber-500 outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Contact & Location */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-stone-800 text-amber-400">
            <MapPin className="w-5 h-5" />
            <h2 className="text-sm font-bold uppercase tracking-wider font-roman text-stone-100">
              Location & Contact Details
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-400 mb-1">
                Phone Number (For Click-to-Call)
              </label>
              <input
                type="text"
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+251 91 123 4567"
                className="w-full bg-stone-950 text-stone-100 text-sm rounded-xl px-3.5 py-2.5 border border-stone-800 focus:border-amber-500 outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-400 mb-1">
                WhatsApp Number
              </label>
              <input
                type="text"
                value={formData.whatsapp || ''}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                placeholder="+251 91 123 4567"
                className="w-full bg-stone-950 text-stone-100 text-sm rounded-xl px-3.5 py-2.5 border border-stone-800 focus:border-amber-500 outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-400 mb-1">
              Physical Street Address
            </label>
            <input
              type="text"
              value={formData.address || ''}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="e.g. Bole Road, Near Medhanialem Square, Addis Ababa"
              className="w-full bg-stone-950 text-stone-100 text-sm rounded-xl px-3.5 py-2.5 border border-stone-800 focus:border-amber-500 outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-400 mb-1">
              Google Maps URL (For "Get Directions")
            </label>
            <input
              type="url"
              value={formData.maps_url || ''}
              onChange={(e) => setFormData({ ...formData, maps_url: e.target.value })}
              placeholder="https://maps.google.com/?q=..."
              className="w-full bg-stone-950 text-stone-100 text-xs rounded-xl px-3.5 py-2.5 border border-stone-800 focus:border-amber-500 outline-hidden"
            />
          </div>
        </div>

        {/* Section 3: Operating Hours, Currency & Guest WiFi */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-stone-800 text-amber-400">
            <Clock className="w-5 h-5" />
            <h2 className="text-sm font-bold uppercase tracking-wider font-roman text-stone-100">
              Operations, Currency & Amenities
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-400 mb-1">
                Opening Hours
              </label>
              <input
                type="text"
                value={formData.opening_hours || ''}
                onChange={(e) => setFormData({ ...formData, opening_hours: e.target.value })}
                placeholder="Monday – Sunday: 7:00 AM – 11:00 PM"
                className="w-full bg-stone-950 text-stone-100 text-sm rounded-xl px-3.5 py-2.5 border border-stone-800 focus:border-amber-500 outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-400 mb-1">
                Default Currency Code
              </label>
              <input
                type="text"
                required
                value={formData.currency || 'ETB'}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                placeholder="ETB"
                className="w-full bg-stone-950 text-stone-100 text-sm rounded-xl px-3.5 py-2.5 border border-stone-800 focus:border-amber-500 outline-hidden font-bold"
              />
              <span className="text-[11px] text-stone-500 mt-1 block">
                Prices are formatted automatically as e.g. "450 ETB"
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-stone-800">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-400 mb-1">
                Guest WiFi Network (SSID)
              </label>
              <input
                type="text"
                value={formData.wifi_name || ''}
                onChange={(e) => setFormData({ ...formData, wifi_name: e.target.value })}
                placeholder="Rome1960_Guest"
                className="w-full bg-stone-950 text-stone-100 text-sm rounded-xl px-3.5 py-2.5 border border-stone-800 focus:border-amber-500 outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-400 mb-1">
                Guest WiFi Password
              </label>
              <input
                type="text"
                value={formData.wifi_password || ''}
                onChange={(e) => setFormData({ ...formData, wifi_password: e.target.value })}
                placeholder="rome1960taste"
                className="w-full bg-stone-950 text-stone-100 text-sm rounded-xl px-3.5 py-2.5 border border-stone-800 focus:border-amber-500 outline-hidden font-mono"
              />
            </div>
          </div>
        </div>

        {/* Save Button Bar */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold px-6 py-3 rounded-xl text-sm transition-all shadow-lg cursor-pointer disabled:opacity-50"
            id="btn-save-settings"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving Changes...' : 'Save Restaurant Settings'}</span>
          </button>
        </div>
      </form>

      {/* Database Management & Backups */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-stone-800 text-stone-300">
          <ShieldAlert className="w-5 h-5 text-amber-400" />
          <h2 className="text-sm font-bold uppercase tracking-wider font-roman text-stone-100">
            Database Maintenance & Backups
          </h2>
        </div>

        <p className="text-xs text-stone-400">
          Export full JSON backups of your restaurant menu, import previous versions, or reset the catalog to sample demo data.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleExportBackup}
            className="inline-flex items-center gap-1.5 bg-stone-800 hover:bg-stone-750 text-stone-200 px-4 py-2.5 rounded-xl text-xs font-semibold border border-stone-700 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Export Backup (JSON)</span>
          </button>

          <input
            type="file"
            ref={fileImportRef}
            onChange={handleImportBackup}
            accept=".json"
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileImportRef.current?.click()}
            className="inline-flex items-center gap-1.5 bg-stone-800 hover:bg-stone-750 text-stone-200 px-4 py-2.5 rounded-xl text-xs font-semibold border border-stone-700 transition-colors cursor-pointer"
          >
            <Upload className="w-4 h-4 text-sky-400" />
            <span>Import Backup (JSON)</span>
          </button>

          <button
            type="button"
            onClick={() => setIsResetModalOpen(true)}
            className="inline-flex items-center gap-1.5 bg-red-950/40 hover:bg-red-950/80 text-red-300 px-4 py-2.5 rounded-xl text-xs font-semibold border border-red-800/60 transition-colors ml-auto cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-red-400" />
            <span>Reset to Default Demo Data</span>
          </button>
        </div>
      </div>

      {/* Password Change Modal */}
      <Modal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        title="Update Admin Security Password"
        maxWidth="sm"
      >
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">
              Current Password *
            </label>
            <input
              type="password"
              required
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full bg-stone-50 text-stone-900 text-sm rounded-xl px-3.5 py-2.5 border border-stone-300 outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">
              New Password (min 6 characters) *
            </label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full bg-stone-50 text-stone-900 text-sm rounded-xl px-3.5 py-2.5 border border-stone-300 outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">
              Confirm New Password *
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full bg-stone-50 text-stone-900 text-sm rounded-xl px-3.5 py-2.5 border border-stone-300 outline-hidden"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsPasswordModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-sm"
            >
              Update Password
            </button>
          </div>
        </form>
      </Modal>

      {/* Reset Confirmation Modal */}
      <Modal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        title="Confirm Reset to Demo Data"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-stone-700">
            Are you sure you want to reset all categories, items, and settings back to the initial sample dataset for ROME 1960 CAFE?
          </p>
          <div className="bg-amber-50 border border-amber-200 text-amber-900 text-xs p-3 rounded-xl">
            This will restore all default 11 categories and 20+ food items with Ethiopian Birr prices.
          </div>
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsResetModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleResetData}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-500 text-white shadow-sm"
            >
              Yes, Reset Now
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
