"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Locale = "fr" | "en";

interface LocaleContextType {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string) => any;
}

const LocaleContext = createContext<LocaleContextType | null>(null);

// Import statique des dictionnaires
import fr from "@/i18n/fr";
import en from "@/i18n/en";

const dictionaries: Record<Locale, Record<string, string>> = { fr, en };

function getValue(obj: Record<string, any>, path: string): any {
  const keys = path.split(".");
  let val: any = obj;
  for (const k of keys) {
    if (val == null) return path;
    val = val[k];
  }
  if (typeof val === "string" || Array.isArray(val)) return val;
  return path;
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("fr");

  useEffect(() => {
    const saved = localStorage.getItem("nutrelis-locale") as Locale | null;
    if (saved === "en" || saved === "fr") setLocaleState(saved);
  }, []);

  const setLocale = (l: Locale) => {
    setLocaleState(l);
    localStorage.setItem("nutrelis-locale", l);
  };

  const t = (key: string): any => {
    return getValue(dictionaries[locale], key);
  };

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale doit être utilisé dans LocaleProvider");
  return ctx;
}
