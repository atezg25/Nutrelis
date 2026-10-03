/**
 * CATALOGUE — ex-« medusa-products ». Le nom du fichier est conservé pour ne pas toucher aux pages qui l'importent,
 * mais les produits viennent désormais de NOTRE base (via /api/catalog), plus de Medusa.
 * Les formes (`MedusaProduct`, `getVariantPrice`) restent identiques : les pages n'ont rien à changer.
 */
export interface MedusaVariant {
  id: string;
  title: string;
  sku: string | null;
  prices: { amount: number; currency_code: string }[];
  options: { value: string }[];
  metadata: Record<string, unknown> | null;
  /** Ajouts NUTRELIS : disponibilité. */
  inStock?: boolean;
  stockFaible?: boolean;
}

export interface MedusaProduct {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  handle: string;
  thumbnail: string | null;
  images: { url: string }[];
  variants: MedusaVariant[];
  metadata: Record<string, unknown> | null;
}

type ApiVariant = { id: string; sku: string; label: string; priceFcfa: number; originalPriceFcfa: number | null; inStock: boolean; stockFaible: boolean };
type ApiProduct = { id: string; slug: string; name: string; subtitle: string | null; description: string | null; imageUrl: string | null; variants: ApiVariant[] };

function versProduit(p: ApiProduct): MedusaProduct {
  return {
    id: p.id,
    title: p.name,
    subtitle: p.subtitle,
    description: p.description,
    handle: p.slug,
    thumbnail: p.imageUrl,
    images: p.imageUrl ? [{ url: p.imageUrl }] : [],
    metadata: null,
    variants: p.variants.map((v) => ({
      id: v.id,
      title: v.label,
      sku: v.sku,
      prices: [{ amount: v.priceFcfa, currency_code: "xaf" }],
      options: [{ value: v.label }],
      metadata: v.originalPriceFcfa ? { originalPrice: v.originalPriceFcfa } : null,
      inStock: v.inStock,
      stockFaible: v.stockFaible,
    })),
  };
}

export async function fetchProducts(): Promise<MedusaProduct[]> {
  try {
    const res = await fetch("/api/catalog", { cache: "no-store" });
    if (!res.ok) return [];
    const data = (await res.json()) as { products?: ApiProduct[] };
    return (data.products ?? []).map(versProduit);
  } catch {
    return [];
  }
}

export async function fetchProductByHandle(handle: string): Promise<MedusaProduct | null> {
  const tous = await fetchProducts();
  // La casse ne compte pas : /produits/Essai-100F et /produits/essai-100f désignent le même produit.
  const voulu = decodeURIComponent(handle).toLowerCase();
  return tous.find((p) => p.handle.toLowerCase() === voulu) ?? null;
}

/** Prix en FCFA (XAF) d'un pack. */
export function getVariantPrice(variant: MedusaVariant): number {
  const price = variant.prices?.find((p) => p.currency_code === "xaf");
  return price?.amount ?? 0;
}
