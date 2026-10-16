import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

import { formatCurrencyWithCode, getStoredCurrency, type CurrencyCode } from './currencies';

/** Format a number using the active or specified currency */
export function formatCurrency(val: number, currencyCode?: CurrencyCode | string): string {
  const code = currencyCode || getStoredCurrency();
  return formatCurrencyWithCode(val, code);
}

/** Format an ISO date string as dd/MM/yyyy, returns '—' for empty input */
export function formatDate(dateStr: string): string {
  if (!dateStr) return '—';
  return format(new Date(dateStr), 'dd/MM/yyyy');
}
