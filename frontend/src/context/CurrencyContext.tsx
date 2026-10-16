import type { ReactNode } from 'react';
import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  CURRENCIES,
  CURRENCY_LIST,
  type CurrencyCode,
  type CurrencyConfig,
  formatCurrencyWithCode,
  getCurrencySymbol,
  getStoredCurrency,
  setStoredCurrency,
} from '../lib/currencies';
import { useAuth } from './AuthContext';

interface CurrencyContextType {
  currency: CurrencyCode;
  setCurrency: (code: CurrencyCode) => void;
  formatCurrency: (val: number, overrideCode?: CurrencyCode) => string;
  currencySymbol: string;
  currencyConfig: CurrencyConfig;
  currencies: CurrencyConfig[];
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [currency, setCurrencyState] = useState<CurrencyCode>(() => {
    return getStoredCurrency();
  });

  // Sync with user's backend profile currency once loaded
  useEffect(() => {
    if (user?.currency && user.currency in CURRENCIES) {
      const userCurr = user.currency as CurrencyCode;
      setCurrencyState(userCurr);
      setStoredCurrency(userCurr);
    }
  }, [user?.currency]);

  const setCurrency = useCallback((code: CurrencyCode) => {
    if (code in CURRENCIES) {
      setCurrencyState(code);
      setStoredCurrency(code);
    }
  }, []);

  const formatCurr = useCallback(
    (val: number, overrideCode?: CurrencyCode) => {
      return formatCurrencyWithCode(val, overrideCode || currency);
    },
    [currency]
  );

  const currencySymbol = useMemo(() => getCurrencySymbol(currency), [currency]);
  const currencyConfig = useMemo(() => CURRENCIES[currency] || CURRENCIES.USD, [currency]);

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        formatCurrency: formatCurr,
        currencySymbol,
        currencyConfig,
        currencies: CURRENCY_LIST,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}
