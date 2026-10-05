import { prixAbonne } from "./abonnement";

/** Un pack tel que le renvoie /api/catalog (modifiable dans la console, onglet Produits). */
export type VariantApi = {
  id: string; sku: string; label: string; priceFcfa: number; originalPriceFcfa: number | null;
  description?: string | null; popular?: boolean; units?: number; inStock?: boolean; stockFaible?: boolean;
};

/** Un pack prêt à afficher : prix, prix barré, prix d'abonné, durée. */
export type PackVue = {
  id: number; sku: string; variantId: string; label: string; units: number;
  prix: number; ancien: number; aboPrix: number; eco: string | null;
  popular: boolean; description: string | null; mois: number; inStock: boolean;
};

/**
 * Construit les packs d'un produit À PARTIR de la console : libellé, prix, prix barré, « populaire », description et unités
 * sont saisis là-bas ; un pack ajouté dans la console apparaît ici tout seul.
 * « Ancien prix » = le prix barré de la console s'il existe, sinon le prix de N produits achetés à l'unité (calcul exact).
 * Durée d'un pack = unités × jours par produit (réglage), arrondie au mois.
 */
export function construirePacks(variantes: VariantApi[], opts: { pct: number; joursParUnite: number }): PackVue[] {
  const tri = [...variantes].sort((a, b) => (a.units ?? 1) - (b.units ?? 1) || a.priceFcfa - b.priceFcfa);
  const base = tri.find((v) => (v.units ?? 1) === 1) ?? tri[0];
  const unite = base ? base.priceFcfa / (base.units ?? 1) : 0;
  return tri.map((v, i) => {
    const units = v.units ?? 1;
    const calcule = Math.round(unite * units);
    const ancien = v.originalPriceFcfa && v.originalPriceFcfa > v.priceFcfa ? v.originalPriceFcfa : calcule > v.priceFcfa ? calcule : v.priceFcfa;
    return {
      id: i + 1, sku: v.sku, variantId: v.id, label: v.label, units,
      prix: v.priceFcfa, ancien, aboPrix: prixAbonne(v.priceFcfa, opts.pct),
      eco: ancien > v.priceFcfa ? (ancien - v.priceFcfa).toLocaleString("fr-FR") + " FCFA" : null,
      popular: v.popular === true, description: v.description?.trim() ? v.description.trim() : null,
      mois: Math.max(1, Math.round((units * opts.joursParUnite) / 30)), inStock: v.inStock !== false,
    };
  });
}
