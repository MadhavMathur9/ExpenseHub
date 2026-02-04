import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a number as USD currency, e.g. $1,234.56 */
export function formatCurrency(val: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
}

/** Format an ISO date string as dd/MM/yyyy, returns '—' for empty input */
export function formatDate(dateStr: string): string {
  if (!dateStr) return '—';
  return format(new Date(dateStr), 'dd/MM/yyyy');
}
