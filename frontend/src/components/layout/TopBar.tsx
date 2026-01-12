interface TopBarProps {
  title: string;
}

export function TopBar({ title }: TopBarProps) {
  return (
    <header className="h-14 bg-surface border-b border-border px-6 flex items-center justify-between sticky top-0 z-20">
      <h1 className="text-[16px] font-semibold text-text-primary tracking-tight">
        {title}
      </h1>
    </header>
  );
}
