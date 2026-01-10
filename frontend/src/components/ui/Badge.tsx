import type { HTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  dotColor?: string;
}

export function Badge({ children, dotColor, className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-[6px] bg-hover-row px-2 py-1 text-[12px] font-medium text-text-primary',
        className
      )}
      {...props}
    >
      {dotColor && (
        <span
          className="mr-1.5 h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: dotColor }}
        />
      )}
      {children}
    </span>
  );
}
