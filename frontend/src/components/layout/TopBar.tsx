import { Menu } from 'lucide-react';

interface TopBarProps {
  title: string;
  onOpenMobileMenu?: () => void;
}

export function TopBar({ title, onOpenMobileMenu }: TopBarProps) {
  return (
    <header className="lg:hidden h-14 bg-surface border-b border-border px-4 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center space-x-3">
        {onOpenMobileMenu && (
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="p-1.5 rounded-md text-text-secondary hover:text-text-primary hover:bg-hover-row focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent cursor-pointer"
            aria-label="Toggle navigation"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <h1 className="text-[15px] font-semibold text-text-primary tracking-tight">
          {title}
        </h1>
      </div>
    </header>
  );
}
