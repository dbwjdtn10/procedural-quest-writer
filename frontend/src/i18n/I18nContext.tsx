import React, { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { translations, type Locale, type Translations } from './translations';

interface I18nContextType {
  locale: Locale;
  t: Translations;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
}

const I18nContext = createContext<I18nContextType>({
  locale: 'ko',
  t: translations.ko,
  setLocale: () => {},
  toggleLocale: () => {},
});

export const useI18n = () => useContext(I18nContext);

export const I18nProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [locale, setLocaleState] = useState<Locale>(() => {
    const saved = localStorage.getItem('pqw-locale');
    return (saved === 'en' || saved === 'ko') ? saved : 'ko';
  });

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    localStorage.setItem('pqw-locale', l);
  }, []);

  const toggleLocale = useCallback(() => {
    setLocale(locale === 'ko' ? 'en' : 'ko');
  }, [locale, setLocale]);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return (
    <I18nContext.Provider value={{ locale, t: translations[locale], setLocale, toggleLocale }}>
      {children}
    </I18nContext.Provider>
  );
};
