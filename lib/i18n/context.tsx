"use client";

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import type { Dictionary, Locale } from "./index";
import { LOCALES, DEFAULT_LOCALE } from "./index";

import { en } from "./dictionaries/en";
import { it } from "./dictionaries/it";
import { fr } from "./dictionaries/fr";
import { es } from "./dictionaries/es";
import { de } from "./dictionaries/de";

const dictionaries: Record<Locale, Dictionary> = { en, it, fr, es, de };

interface LocaleContextValue {
  locale: Locale;
  t: Dictionary;
  setLocale: (locale: Locale) => void;
}

const LocaleContext = createContext<LocaleContextValue>({
  locale: DEFAULT_LOCALE,
  t: dictionaries[DEFAULT_LOCALE],
  setLocale: () => {},
});

export function useLocale() {
  return useContext(LocaleContext);
}

export function useT() {
  return useContext(LocaleContext).t;
}

function readCookieLocale(): Locale {
  if (typeof document === "undefined") return DEFAULT_LOCALE;
  const match = document.cookie.match(/(?:^|;\s*)locale=([a-z]{2})/);
  const value = match?.[1] as Locale | undefined;
  return value && LOCALES.includes(value) ? value : DEFAULT_LOCALE;
}

function writeCookieLocale(locale: Locale) {
  document.cookie = `locale=${locale};path=/;max-age=${60 * 60 * 24 * 365};samesite=lax`;
}

export function LocaleProvider({ children, initialLocale }: { children: ReactNode; initialLocale?: Locale }) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale ?? DEFAULT_LOCALE);

  useEffect(() => {
    if (!initialLocale) {
      setLocaleState(readCookieLocale());
    }
  }, [initialLocale]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    writeCookieLocale(next);
  }, []);

  return (
    <LocaleContext.Provider value={{ locale, t: dictionaries[locale], setLocale }}>
      {children}
    </LocaleContext.Provider>
  );
}
