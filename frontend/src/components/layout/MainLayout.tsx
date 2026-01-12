import { useState } from 'react';
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

export function MainLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const title = titles[location.pathname] || 'Dashboard';

  return (
    <div className="min-h-screen bg-bg flex">
      <Sidebar collapsed={collapsed} onToggleCollapse={() => setCollapsed(!collapsed)} />

      <div
        className={cn(
          'flex-1 flex flex-col min-w-0 transition-all duration-200 ease-out',
          collapsed ? 'ml-16' : 'ml-60'
        )}
      >
        <TopBar title={title} />
        <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
