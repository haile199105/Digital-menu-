import React, { useState, useEffect } from 'react';
import { CustomerMenu } from './pages/CustomerMenu';
import { AdminLogin } from './pages/AdminLogin';
import { AdminLayout, AdminTab } from './components/admin/AdminLayout';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminCategories } from './pages/AdminCategories';
import { AdminMenuItems } from './pages/AdminMenuItems';
import { AdminSettings } from './pages/AdminSettings';
import { AdminQRCode } from './pages/AdminQRCode';
import { ToastProvider } from './context/ToastContext';
import { api } from './services/api';

type PageRoute = 'menu' | 'admin-login' | 'admin-app';

export function App() {
  const [currentRoute, setCurrentRoute] = useState<PageRoute>('menu');
  const [adminTab, setAdminTab] = useState<AdminTab>('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [openAddItemDirectly, setOpenAddItemDirectly] = useState(false);

  // Sync route with URL on load and popstate
  useEffect(() => {
    const checkAuthAndRoute = () => {
      const authed = api.isAuthenticated();
      setIsAuthenticated(authed);

      const path = window.location.pathname;
      if (path.startsWith('/admin')) {
        if (path === '/admin/login') {
          setCurrentRoute(authed ? 'admin-app' : 'admin-login');
        } else {
          // If accessing admin routes
          if (authed) {
            setCurrentRoute('admin-app');
            if (path.includes('categories')) setAdminTab('categories');
            else if (path.includes('menu-items') || path.includes('items')) setAdminTab('menu-items');
            else if (path.includes('settings')) setAdminTab('settings');
            else if (path.includes('qr')) setAdminTab('qr-code');
            else setAdminTab('dashboard');
          } else {
            setCurrentRoute('admin-login');
          }
        }
      } else {
        setCurrentRoute('menu');
      }
    };

    checkAuthAndRoute();
    window.addEventListener('popstate', checkAuthAndRoute);
    return () => window.removeEventListener('popstate', checkAuthAndRoute);
  }, []);

  const navigateTo = (path: string, route: PageRoute, tab?: AdminTab) => {
    window.history.pushState({}, '', path);
    setCurrentRoute(route);
    if (tab) setAdminTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGoToCustomerMenu = () => {
    navigateTo('/menu', 'menu');
  };

  const handleGoToAdmin = () => {
    if (api.isAuthenticated()) {
      navigateTo('/admin/dashboard', 'admin-app', 'dashboard');
    } else {
      navigateTo('/admin/login', 'admin-login');
    }
  };

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    navigateTo('/admin/dashboard', 'admin-app', 'dashboard');
  };

  const handleAdminLogout = () => {
    setIsAuthenticated(false);
    navigateTo('/admin/login', 'admin-login');
  };

  const handleSelectAdminTab = (tab: AdminTab) => {
    setAdminTab(tab);
    setOpenAddItemDirectly(false);
    const pathMap: Record<AdminTab, string> = {
      dashboard: '/admin/dashboard',
      categories: '/admin/categories',
      'menu-items': '/admin/menu-items',
      'qr-code': '/admin/qr-code',
      settings: '/admin/settings',
    };
    window.history.pushState({}, '', pathMap[tab]);
  };

  return (
    <ToastProvider>
      {/* Route 1: Customer Facing Menu */}
      {currentRoute === 'menu' && (
        <CustomerMenu onNavigateToAdmin={handleGoToAdmin} />
      )}

      {/* Route 2: Admin Login */}
      {currentRoute === 'admin-login' && (
        <AdminLogin
          onLoginSuccess={handleLoginSuccess}
          onBackToMenu={handleGoToCustomerMenu}
        />
      )}

      {/* Route 3: Admin Console */}
      {currentRoute === 'admin-app' && (
        <AdminLayout
          currentTab={adminTab}
          onSelectTab={handleSelectAdminTab}
          onLogout={handleAdminLogout}
          onViewMenu={handleGoToCustomerMenu}
        >
          {adminTab === 'dashboard' && (
            <AdminDashboard
              onNavigateTab={handleSelectAdminTab}
              onOpenAddItem={() => {
                setOpenAddItemDirectly(true);
                handleSelectAdminTab('menu-items');
              }}
              onOpenAddCategory={() => handleSelectAdminTab('categories')}
            />
          )}

          {adminTab === 'categories' && <AdminCategories />}

          {adminTab === 'menu-items' && (
            <AdminMenuItems initialOpenAdd={openAddItemDirectly} />
          )}

          {adminTab === 'qr-code' && <AdminQRCode />}

          {adminTab === 'settings' && <AdminSettings />}
        </AdminLayout>
      )}
    </ToastProvider>
  );
}
export default App;
