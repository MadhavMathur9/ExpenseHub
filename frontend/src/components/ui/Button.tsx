import type { ButtonHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
}

export function Button({ variant = 'primary', className, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-[8px] px-4 h-9 lg:h-10 text-[13px] lg:text-[14px] font-medium transition-all duration-150 ease-out fin-focus disabled:opacity-50 disabled:pointer-events-none cursor-pointer',
        {
          'bg-accent text-white hover:bg-accent-hover': variant === 'primary',
          'fin-border bg-transparent text-text-primary hover:bg-hover-row': variant === 'secondary',
          'bg-transparent text-text-primary hover:bg-hover-row': variant === 'ghost',
        },
        className
      )}
      {...props}
    />
  );
}
