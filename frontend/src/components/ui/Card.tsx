import type { HTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('bg-surface fin-border rounded-[10px] p-4 lg:p-6', className)}
      {...props}
    />
  );
}
