/**
 * Contenu d'une fiche produit (colonne `product.content`). Tout est facultatif : une section sans contenu n'est pas affichée,
 * et les AVIS ne sont jamais inventés — la section n'existe que si l'administrateur en saisit de réels.
 */
export type ContenuProduit = {
  accroche?: string;
  miseEnAvant?: string;
  avantages?: string[];
  raisons?: { titre: string; texte: string; image?: string }[];
  description?: string;
  ingredients?: string;
  utilisation?: string;
  precautions?: string;
  faq?: { q: string; a: string }[];
  avis?: { nom: string; ville?: string; note: number; texte: string }[];
  garantieJours?: number;
  images?: string[];
};

const t = (v: unknown, max: number): string | undefined => (typeof v === "string" && v.trim() ? v.trim().slice(0, max) : undefined);

/** Une image est soit une image du site (`/images/...`), soit une image envoyée (`/api/media/<uuid>`). Jamais une adresse externe. */
const IMAGE = /^(\/images\/[A-Za-z0-9._\-\/]+|\/api\/media\/[0-9a-f-]{36})$/i;

/** Nettoie et borne le contenu reçu : types, longueurs, nombre d'éléments. Tout ce qui est inattendu est ignoré. */
export function nettoyerContenu(brut: unknown): ContenuProduit {
  const o = (brut && typeof brut === "object" ? brut : {}) as Record<string, unknown>;
  const liste = <T,>(v: unknown, max: number, f: (x: unknown) => T | null): T[] =>
    (Array.isArray(v) ? v : []).slice(0, max).map(f).filter((x): x is T => x !== null);
  const c: ContenuProduit = {};
  const set = <K extends keyof ContenuProduit>(k: K, v: ContenuProduit[K] | undefined) => {
    if (v !== undefined && !(Array.isArray(v) && v.length === 0)) c[k] = v;
  };
  set("accroche", t(o.accroche, 400));
  set("miseEnAvant", t(o.miseEnAvant, 60));
  set("avantages", liste(o.avantages, 12, (x) => t(x, 200) ?? null));
  set("raisons", liste(o.raisons, 5, (x) => {
    const r = x as Record<string, unknown>;
    const titre = t(r?.titre, 80), texte = t(r?.texte, 400);
    const image = typeof r?.image === "string" && IMAGE.test(r.image) ? r.image : undefined;
    return titre && texte ? { titre, texte, ...(image ? { image } : {}) } : null;
  }));
  set("description", t(o.description, 4000));
  set("ingredients", t(o.ingredients, 2000));
  set("utilisation", t(o.utilisation, 2000));
  set("precautions", t(o.precautions, 2000));
  set("faq", liste(o.faq, 12, (x) => {
    const r = x as Record<string, unknown>;
    const q = t(r?.q, 200), a = t(r?.a, 1200);
    return q && a ? { q, a } : null;
  }));
  set("avis", liste(o.avis, 20, (x) => {
    const r = x as Record<string, unknown>;
    const nom = t(r?.nom, 80), texte = t(r?.texte, 800);
    const note = typeof r?.note === "number" && r.note >= 1 && r.note <= 5 ? Math.round(r.note) : 5;
    const ville = t(r?.ville, 80);
    return nom && texte ? { nom, ...(ville ? { ville } : {}), note, texte } : null;
  }));
  if (typeof o.garantieJours === "number" && Number.isInteger(o.garantieJours) && o.garantieJours >= 0 && o.garantieJours <= 365) c.garantieJours = o.garantieJours;
  set("images", liste(o.images, 10, (x) => (typeof x === "string" && IMAGE.test(x) ? x : null)));
  return c;
}
