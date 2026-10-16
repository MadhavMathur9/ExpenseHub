export type CurrencyCode =
  | 'USD'
  | 'EUR'
  | 'GBP'
  | 'INR'
  | 'CAD'
  | 'AUD'
  | 'JPY'
  | 'CHF'
  | 'CNY'
  | 'SGD'
  | 'AED'
  | 'SAR'
  | 'BRL'
  | 'KRW'
  | 'SEK'
  | 'NOK'
  | 'DKK'
  | 'NZD'
  | 'MXN'
  | 'HKD'
  | 'RUB'
  | 'ZAR'
  | 'TRY'
  | 'PLN'
  | 'THB'
  | 'PHP'
  | 'MYR'
  | 'ILS';

export interface CurrencyConfig {
  code: CurrencyCode;
  name: string;
  symbol: string;
  flag: string;
  countryCode: string;
  decimals?: number;
  space?: boolean;
}

export const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  USD: { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸', countryCode: 'us' },
  EUR: { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺', countryCode: 'eu' },
  GBP: { code: 'GBP', name: 'British Pound', symbol: '£', flag: '🇬🇧', countryCode: 'gb' },
  INR: { code: 'INR', name: 'Indian Rupee', symbol: '₹', flag: '🇮🇳', countryCode: 'in' },
  CAD: { code: 'CAD', name: 'Canadian Dollar', symbol: 'CA$', flag: '🇨🇦', countryCode: 'ca' },
  AUD: { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', flag: '🇦🇺', countryCode: 'au' },
  JPY: { code: 'JPY', name: 'Japanese Yen', symbol: '¥', flag: '🇯🇵', countryCode: 'jp', decimals: 0 },
  CHF: { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', flag: '🇨🇭', countryCode: 'ch', space: true },
  CNY: { code: 'CNY', name: 'Chinese Yuan', symbol: 'CN¥', flag: '🇨🇳', countryCode: 'cn' },
  SGD: { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', flag: '🇸🇬', countryCode: 'sg' },
  AED: { code: 'AED', name: 'UAE Dirham', symbol: 'AED', flag: '🇦🇪', countryCode: 'ae', space: true },
  SAR: { code: 'SAR', name: 'Saudi Riyal', symbol: 'SAR', flag: '🇸🇦', countryCode: 'sa', space: true },
  BRL: { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', flag: '🇧🇷', countryCode: 'br' },
  KRW: { code: 'KRW', name: 'South Korean Won', symbol: '₩', flag: '🇰🇷', countryCode: 'kr', decimals: 0 },
  SEK: { code: 'SEK', name: 'Swedish Krona', symbol: 'kr', flag: '🇸🇪', countryCode: 'se', space: true },
  NOK: { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr', flag: '🇳🇴', countryCode: 'no', space: true },
  DKK: { code: 'DKK', name: 'Danish Krone', symbol: 'kr', flag: '🇩🇰', countryCode: 'dk', space: true },
  NZD: { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$', flag: '🇳🇿', countryCode: 'nz' },
  MXN: { code: 'MXN', name: 'Mexican Peso', symbol: 'MX$', flag: '🇲🇽', countryCode: 'mx' },
  HKD: { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$', flag: '🇭🇰', countryCode: 'hk' },
  RUB: { code: 'RUB', name: 'Russian Ruble', symbol: '₽', flag: '🇷🇺', countryCode: 'ru' },
  ZAR: { code: 'ZAR', name: 'South African Rand', symbol: 'R', flag: '🇿🇦', countryCode: 'za', space: true },
  TRY: { code: 'TRY', name: 'Turkish Lira', symbol: '₺', flag: '🇹🇷', countryCode: 'tr' },
  PLN: { code: 'PLN', name: 'Polish Złoty', symbol: 'zł', flag: '🇵🇱', countryCode: 'pl', space: true },
  THB: { code: 'THB', name: 'Thai Baht', symbol: '฿', flag: '🇹🇭', countryCode: 'th' },
  PHP: { code: 'PHP', name: 'Philippine Peso', symbol: '₱', flag: '🇵🇭', countryCode: 'ph' },
  MYR: { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM', flag: '🇲🇾', countryCode: 'my', space: true },
  ILS: { code: 'ILS', name: 'Israeli Shekel', symbol: '₪', flag: '🇮🇱', countryCode: 'il' },
};

export const CURRENCY_LIST: CurrencyConfig[] = Object.values(CURRENCIES);

const STORAGE_KEY = 'expensehub_currency';

export function getStoredCurrency(): CurrencyCode {
  try {
    const stored = localStorage.getItem(STORAGE_KEY) as CurrencyCode | null;
    if (stored && stored in CURRENCIES) {
      return stored;
    }
  } catch {
    // ignore
  }
  return 'USD';
}

export function setStoredCurrency(code: string): void {
  try {
    if (code in CURRENCIES) {
      localStorage.setItem(STORAGE_KEY, code);
    }
  } catch {
    // ignore
  }
}

export function getCurrencySymbol(currencyCode?: string): string {
  const conf = CURRENCIES[(currencyCode as CurrencyCode) || 'USD'] || CURRENCIES.USD;
  return conf.symbol;
}

export function formatCurrencyWithCode(val: number, currencyCode?: string): string {
  const conf = CURRENCIES[(currencyCode as CurrencyCode) || 'USD'] || CURRENCIES.USD;
  const dec = conf.decimals !== undefined ? conf.decimals : 2;
  const absVal = Math.abs(val);

  const formattedNum = absVal.toLocaleString('en-US', {
    minimumFractionDigits: dec,
    maximumFractionDigits: dec,
  });

  const sp = conf.space ? ' ' : '';
  const prefix = val < 0 ? '−' : '';

  return `${prefix}${conf.symbol}${sp}${formattedNum}`;
}
