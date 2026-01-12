import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ArrowLeftRight, FolderKanban, User, LogOut, ChevronLeft, Wallet, Target } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export function Sidebar({ collapsed, onToggleCollapse }: SidebarProps) {
  const { logout, user } = useAuth();

  const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Goals', path: '/goals', icon: Target },
    { label: 'Transactions', path: '/transactions', icon: ArrowLeftRight },
    { label: 'Categories', path: '/categories', icon: FolderKanban },
    { label: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <aside
      className={cn(
        'fixed top-0 left-0 bottom-0 z-30 bg-surface border-r border-border flex flex-col transition-all duration-200 ease-out',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Brand Header */}
      <div className={cn('h-14 flex items-center border-b border-border', collapsed ? 'justify-center px-2' : 'justify-between px-4')}>
        {!collapsed ? (
          <>
            <div className="flex items-center space-x-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-white shrink-0">
                <Wallet className="w-4 h-4" />
              </div>
              <span className="font-semibold text-text-primary text-[15px] tracking-tight truncate">
                ExpenseHub
              </span>
            </div>
            <button
              onClick={onToggleCollapse}
              className="p-1.5 rounded-md text-text-secondary hover:text-text-primary hover:bg-hover-row transition-colors cursor-pointer"
              title="Collapse sidebar"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </>
        ) : (
          <button
            onClick={onToggleCollapse}
            className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center text-white cursor-pointer hover:bg-accent-hover transition-colors shadow-xs"
            title="Expand sidebar"
          >
            <Wallet className="w-4.5 h-4.5" />
          </button>
        )}
      </div>

      {/* Nav List */}
      <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'flex items-center h-10 px-3 rounded-[8px] text-[13px] font-medium transition-colors duration-150',
                  isActive
                    ? 'bg-accent-subtle text-accent'
                    : 'text-text-secondary hover:text-text-primary hover:bg-hover-row',
                  collapsed && 'justify-center px-0'
                )
              }
              title={collapsed ? item.label : undefined}
            >
              <Icon className={cn('w-4 h-4 shrink-0', collapsed ? '' : 'mr-3')} />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer / User Profile summary */}
      <div className="p-2 border-t border-border">
        {!collapsed && user && (
          <div className="px-3 py-2 mb-1 flex items-center space-x-2.5 rounded-[8px]">
            <img
              src={
                user.profileImageUrl ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName || 'User')}&background=EAF3EE&color=1A5F3F&size=64`
              }
              alt={user.fullName}
              className="w-7 h-7 rounded-full object-cover shrink-0"
            />
            <div className="overflow-hidden min-w-0 flex-1">
              <p className="text-[13px] font-medium text-text-primary truncate">{user.fullName}</p>
              <p className="text-[11px] text-text-secondary truncate">{user.email}</p>
            </div>
          </div>
        )}
        <button
          onClick={logout}
          className={cn(
            'w-full flex items-center h-10 px-3 rounded-[8px] text-[13px] font-medium text-text-secondary hover:text-negative hover:bg-hover-row transition-colors cursor-pointer',
            collapsed && 'justify-center px-0'
          )}
          title="Sign out"
        >
          <LogOut className={cn('w-4 h-4 shrink-0', collapsed ? '' : 'mr-3')} />
          {!collapsed && <span>Sign out</span>}
        </button>
      </div>
    </aside>
  );
}
