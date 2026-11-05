"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Locale = "fr" | "en";

interface LocaleContextType {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string) => any;
  /** Réglages pilotés depuis la console (abonnement, accueil). */
  abonnement: { actif: boolean; pct: number; jours: number };
  boutique: { titre: string; description: string; carrousel: number };
  /** Numéro WhatsApp de la boutique, chiffres seulement (Paramètres de la console). */
  contact: { whatsapp: string };
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

/** Écrit la langue dans l'adresse (?lang=en) : un lien copié depuis la barre d'adresse ou partagé s'ouvre alors dans la même langue. */
function langueDansUrl(l: Locale) {
  try {
    const u = new URL(window.location.href);
    if (u.searchParams.get("lang") === l) return;
    u.searchParams.set("lang", l);
    window.history.replaceState(window.history.state, "", u);
  } catch { /* adresse non modifiable : la langue reste mémorisée dans le navigateur */ }
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("fr");
  const [abonnement, setAbonnement] = useState({ actif: true, pct: 15, jours: 60 });
  const [boutique, setBoutique] = useState({ titre: "", description: "", carrousel: 5 });
  const [contact, setContact] = useState({ whatsapp: "" });

  // Réglages saisis dans la console : l'abonnement (remise, activation) et les textes de l'accueil.
  useEffect(() => {
    void fetch("/api/shop-settings", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.abonnement) setAbonnement(d.abonnement);
        if (d?.boutique) setBoutique(d.boutique);
        if (d?.contact) setContact(d.contact);
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    // Un lien partagé (ex. WhatsApp) peut imposer la langue : ?lang=en ou ?lang=fr ; sinon la préférence mémorisée.
    const demandee = new URLSearchParams(window.location.search).get("lang");
    if (demandee === "en" || demandee === "fr") {
      setLocaleState(demandee);
      localStorage.setItem("nutrelis-locale", demandee);
      return;
    }
    const saved = localStorage.getItem("nutrelis-locale") as Locale | null;
    if (saved === "en" || saved === "fr") { setLocaleState(saved); langueDansUrl(saved); }
  }, []);

  const setLocale = (l: Locale) => {
    setLocaleState(l);
    localStorage.setItem("nutrelis-locale", l);
    langueDansUrl(l);
  };

  const t = (key: string): any => {
    const v = getValue(dictionaries[locale], key);
    // {pct} = remise d'abonnement saisie dans la console
    return typeof v === "string" ? v.replace(/\{pct\}/g, String(abonnement.pct)) : v;
  };

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t, abonnement, boutique, contact }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale doit être utilisé dans LocaleProvider");
  return ctx;
}
