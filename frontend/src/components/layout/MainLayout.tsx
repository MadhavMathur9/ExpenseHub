import type { ReactNode } from 'react';
import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { cn } from '../../lib/utils';

const titles: Record<string, string> = {
  '/': 'Dashboard',
  '/goals': 'Goals',
  '/transactions': 'Transactions',
  '/categories': 'Categories',
  '/profile': 'Profile',
};

export function MainLayout({ children }: { children?: ReactNode } = {}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const title = titles[location.pathname] || 'Dashboard';

  // Automatically close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-bg flex">
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar container */}
      <div
        className={cn(
          'fixed top-0 left-0 bottom-0 z-40 lg:z-30 transition-transform duration-200 lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <Sidebar collapsed={collapsed} onToggleCollapse={() => setCollapsed(!collapsed)} />
      </div>

      <div
        className={cn(
          'flex-1 flex flex-col min-w-0 transition-all duration-200 ease-out',
          collapsed ? 'lg:ml-16' : 'lg:ml-60'
        )}
      >
        {/* TopBar is strictly limited to mobile viewports */}
        <TopBar title={title} onOpenMobileMenu={() => setMobileOpen(!mobileOpen)} />
        <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
}
