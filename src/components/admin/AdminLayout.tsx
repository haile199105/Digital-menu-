import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Restaurant } from '../../types';
import {
  LayoutDashboard,
  FolderTree,
  UtensilsCrossed,
  Settings,
  QrCode,
  LogOut,
  ExternalLink,
  Menu as MenuIcon,
  X,
  Store,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export type AdminTab = 'dashboard' | 'categories' | 'menu-items' | 'settings' | 'qr-code';

interface AdminLayoutProps {
  currentTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  onLogout: () => void;
  onViewMenu: () => void;
  children: React.ReactNode;
}

export function AdminLayout({
  currentTab,
  onSelectTab,
  onLogout,
  onViewMenu,
  children,
}: AdminLayoutProps) {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    api.getRestaurant().then(setRestaurant);
  }, []);

  const navItems = [
    { id: 'dashboard' as const, label: 'Overview', icon: LayoutDashboard },
    { id: 'categories' as const, label: 'Categories', icon: FolderTree },
    { id: 'menu-items' as const, label: 'Menu Items', icon: UtensilsCrossed },
    { id: 'qr-code' as const, label: 'QR Code Studio', icon: QrCode },
    { id: 'settings' as const, label: 'Settings & Cafe Info', icon: Settings },
  ];

  const handleNavClick = (tab: AdminTab) => {
    onSelectTab(tab);
    setMobileMenuOpen(false);
  };

  const handleLogoutClick = () => {
    api.logout();
    showToast('Logged out successfully');
    onLogout();
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col md:flex-row">
      {/* Mobile Top App Bar */}
      <header className="md:hidden flex items-center justify-between p-4 bg-stone-900 border-b border-stone-800 sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <img
            src={restaurant?.logo_url || '/assets/logo.svg'}
            alt="Logo"
            className="w-8 h-8 rounded-full border border-amber-500/50 object-contain bg-stone-950"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = '/assets/logo.svg';
            }}
          />
          <div>
            <h1 className="font-roman font-bold text-sm tracking-wider text-amber-50">
              {restaurant?.name || 'ROME 1960'}
            </h1>
            <span className="text-[10px] text-amber-400 font-medium">Admin Portal</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onViewMenu}
            className="p-2 text-stone-400 hover:text-amber-400 rounded-lg bg-stone-800"
            title="Preview Customer Menu"
          >
            <ExternalLink className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-stone-200 hover:text-white rounded-lg bg-stone-800"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Desktop & Mobile Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-stone-900 border-r border-stone-800 flex flex-col transition-transform duration-300 md:translate-x-0 md:static md:w-64 shrink-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Banner */}
        <div className="p-5 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border border-amber-500/50 bg-stone-950 flex items-center justify-center p-0.5 shadow-md shrink-0">
              <img
                src={restaurant?.logo_url || '/assets/logo.svg'}
                alt="Logo"
                className="w-full h-full rounded-full object-contain"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/assets/logo.svg';
                }}
              />
            </div>
            <div>
              <h2 className="font-roman font-bold text-sm text-stone-100 uppercase tracking-wider">
                {restaurant?.name || 'ROME 1960 CAFE'}
              </h2>
              <span className="text-xs text-amber-400 font-serif-elegant italic">Admin Console</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            className="md:hidden text-stone-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* View Customer Menu Button */}
        <div className="p-4 border-b border-stone-800">
          <button
            type="button"
            onClick={onViewMenu}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500/20 to-amber-600/10 hover:from-amber-500/30 hover:to-amber-600/20 text-amber-300 border border-amber-500/30 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer"
            id="btn-sidebar-view-menu"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Open Customer Menu</span>
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-amber-500 text-stone-950 shadow-md font-bold'
                    : 'text-stone-300 hover:bg-stone-800 hover:text-stone-100'
                }`}
                id={`admin-nav-${item.id}`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-stone-950' : 'text-stone-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User Footer & Logout */}
        <div className="p-4 border-t border-stone-800 space-y-3">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-stone-800 border border-stone-700 flex items-center justify-center text-xs font-bold text-amber-400">
              AD
            </div>
            <div className="overflow-hidden">
              <span className="block text-xs font-bold text-stone-200 truncate">Administrator</span>
              <span className="block text-[10px] text-stone-400 truncate">admin@rome1960cafe.com</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogoutClick}
            className="w-full flex items-center gap-2 text-stone-400 hover:text-red-400 hover:bg-red-950/30 px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            id="btn-admin-logout"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Backdrop on mobile when drawer is open */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-stone-950/80 z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Main Content Pane */}
      <main className="flex-1 min-w-0 bg-stone-950 text-stone-100 p-4 sm:p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
