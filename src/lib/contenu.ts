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
  /** Catégorie affichée au-dessus du titre (ex. « Cosmetic »). */
  categorie?: string;
  /** Image d'un pack, par SKU (ex. 1, 2 ou 3 flacons) : affichée dans le choix du pack et dans le panier. */
  imagesPacks?: Record<string, string>;
  /** Palette de la fiche : « violet » surcharge les couleurs de la charte (Bleach Darkening). */
  theme?: "violet";
  /** `false` masque l'onglet d'abonnement de la fiche (activé par défaut si le réglage de la console l'est). */
  abonnement?: boolean;
  images?: string[];
  /** Image large (16:9 conseillé) du carrousel de la page d'accueil. */
  banniere?: string;
  /** Routine / mode d'emploi en étapes numérotées. */
  etapes?: { titre: string; texte: string }[];
  /** Chiffres clés. ⚠️ Affichés SEULEMENT avec une source (étude, test documenté) : sans source, ils sont écartés. */
  chiffres?: { valeur: string; libelle: string }[];
  sourceChiffres?: string;
  /** Comparatif « ce produit / les autres solutions » : à rédiger avec des critères vérifiables. */
  comparatif?: { critere: string; nous: string; autres: string }[];
  /** Photos de résultats : uniquement avec l'accord écrit des personnes photographiées. */
  resultats?: string[];
  /** Vidéos : lien YouTube ou Vimeo (stocké sous forme d'adresse « embed »). Vos propres vidéos, ou celles dont vous avez le droit. */
  videos?: { url: string; titre?: string }[];
  /** Version anglaise : mêmes champs que ci-dessus (seuls les textes comptent), plus le nom, le sous-titre et les libellés des packs. Sans traduction, le français s'affiche. */
  en?: Omit<ContenuProduit, "en"> & { name?: string; subtitle?: string; descriptionCourte?: string; variants?: Record<string, { label?: string; description?: string }> };
};

/** Textes d'un produit dans la langue demandée : le français par défaut, l'anglais s'il a été saisi (sinon repli sur le français, champ par champ). */
export function localiserProduit<P extends { name: string; subtitle: string | null; description: string | null; content?: unknown; variants?: unknown[] }>(p: P, lang: string): P {
  const c = (p.content ?? {}) as ContenuProduit;
  const { en, ...base } = c;
  if (lang !== "en" || !en) return { ...p, content: base };
  const { name, subtitle, descriptionCourte, variants, ...champs } = en;
  const contenu: Record<string, unknown> = { ...base };
  for (const [k, v] of Object.entries(champs)) if (v !== undefined && !(Array.isArray(v) && v.length === 0) && k !== "images" && k !== "banniere" && k !== "resultats" && k !== "videos" && k !== "garantieJours") contenu[k] = v;
  return {
    ...p, name: name || p.name, subtitle: subtitle || p.subtitle, description: descriptionCourte || p.description, content: contenu,
    variants: (p.variants ?? []).map((v) => {
      const x = v as { sku: string; label: string; description: string | null };
      const tr = variants?.[x.sku];
      return { ...x, label: tr?.label || x.label, description: tr?.description || x.description };
    }),
  };
}

/**
 * Ramène un lien YouTube / Vimeo à son adresse d'intégration, ou null si le lien n'est pas reconnu. Idempotent : une adresse
 * d'intégration déjà normalisée est acceptée telle quelle. Aucun autre site n'est accepté (la politique de sécurité du site ne les chargerait pas).
 */
export function versEmbed(brut: string): string | null {
  const u = brut.trim();
  // Vidéo envoyée depuis l'administration : adresse interne, acceptée telle quelle.
  if (/^\/api\/media\/[0-9a-f-]{36}$/i.test(u)) return u;
  const yt = /^https:\/\/(?:www\.|m\.)?(?:youtube\.com\/(?:watch\?(?:[^#]*&)?v=|shorts\/|embed\/)|youtube-nocookie\.com\/embed\/|youtu\.be\/)([A-Za-z0-9_-]{11})/.exec(u);
  if (yt) return `https://www.youtube-nocookie.com/embed/${yt[1]}`;
  const vm = /^https:\/\/(?:www\.)?(?:vimeo\.com\/|player\.vimeo\.com\/video\/)(\d{6,12})/.exec(u);
  if (vm) return `https://player.vimeo.com/video/${vm[1]}`;
  return null;
}

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
  set("categorie", t(o.categorie, 40));
  if (o.imagesPacks && typeof o.imagesPacks === "object" && !Array.isArray(o.imagesPacks)) {
    const ip: Record<string, string> = {};
    for (const [sku, u] of Object.entries(o.imagesPacks as Record<string, unknown>).slice(0, 20)) {
      if (/^[A-Za-z0-9_.\-]{1,60}$/.test(sku) && typeof u === "string" && IMAGE.test(u)) ip[sku] = u;
    }
    if (Object.keys(ip).length) c.imagesPacks = ip;
  }
  if (o.theme === "violet") c.theme = "violet";
  if (o.abonnement === false) c.abonnement = false;
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
  set("etapes", liste(o.etapes, 6, (x) => {
    const r = x as Record<string, unknown>;
    const titre = t(r?.titre, 80), texte = t(r?.texte, 300);
    return titre && texte ? { titre, texte } : null;
  }));
  const source = t(o.sourceChiffres, 300);
  // Pas de source, pas de chiffres : une statistique sans origine n'a pas sa place sur la page.
  if (source) {
    set("chiffres", liste(o.chiffres, 4, (x) => {
      const r = x as Record<string, unknown>;
      const valeur = t(r?.valeur, 20), libelle = t(r?.libelle, 120);
      return valeur && libelle ? { valeur, libelle } : null;
    }));
    if (c.chiffres?.length) c.sourceChiffres = source;
  }
  set("comparatif", liste(o.comparatif, 8, (x) => {
    const r = x as Record<string, unknown>;
    const critere = t(r?.critere, 80), nous = t(r?.nous, 120), autres = t(r?.autres, 120);
    return critere && nous && autres ? { critere, nous, autres } : null;
  }));
  set("videos", liste(o.videos, 6, (x) => {
    const r = x as Record<string, unknown>;
    const url = typeof r?.url === "string" ? versEmbed(r.url) : null;
    const titre = t(r?.titre, 80);
    return url ? { url, ...(titre ? { titre } : {}) } : null;
  }));
  set("resultats", liste(o.resultats, 8, (x) => (typeof x === "string" && IMAGE.test(x) ? x : null)));
  if (typeof o.garantieJours === "number" && Number.isInteger(o.garantieJours) && o.garantieJours >= 0 && o.garantieJours <= 365) c.garantieJours = o.garantieJours;
  set("banniere", typeof o.banniere === "string" && IMAGE.test(o.banniere) ? o.banniere : undefined);
  set("images", liste(o.images, 30, (x) => (typeof x === "string" && IMAGE.test(x) ? x : null)));
  if (o.en && typeof o.en === "object" && !Array.isArray(o.en)) {
    const e = o.en as Record<string, unknown>;
    const { en: _ignore, ...texte } = nettoyerContenu(e) as ContenuProduit;
    const variants: Record<string, { label?: string; description?: string }> = {};
    if (e.variants && typeof e.variants === "object") {
      for (const [sku, v] of Object.entries(e.variants as Record<string, Record<string, unknown>>).slice(0, 40)) {
        const label = t(v?.label, 120), description = t(v?.description, 300);
        if (/^[A-Za-z0-9_.\-]{1,60}$/.test(sku) && (label || description)) variants[sku] = { ...(label ? { label } : {}), ...(description ? { description } : {}) };
      }
    }
    const en = { ...texte, ...(t(e.name, 120) ? { name: t(e.name, 120) } : {}), ...(t(e.subtitle, 200) ? { subtitle: t(e.subtitle, 200) } : {}), ...(t(e.descriptionCourte, 2000) ? { descriptionCourte: t(e.descriptionCourte, 2000) } : {}), ...(Object.keys(variants).length ? { variants } : {}) };
    if (Object.keys(en).length) c.en = en;
  }
  return c;
}
