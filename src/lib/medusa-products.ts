const BACKEND = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000";
const PUB_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "";

/** Corriger les URLs localhost:9000 retournées par le file provider Medusa */
function fixMediaUrl(url: string | null): string | null {
  if (!url) return null;
  return url.replace("http://localhost:9000", BACKEND);
}

export interface MedusaVariant {
  id: string;
  title: string;
  sku: string | null;
  prices: { amount: number; currency_code: string }[];
  options: { value: string }[];
  metadata: Record<string, unknown> | null;
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

/** Corriger toutes les URLs media d'un produit Medusa */
function fixProductUrls(product: MedusaProduct): MedusaProduct {
  return {
    ...product,
    thumbnail: fixMediaUrl(product.thumbnail),
    images: product.images?.map(img => ({ ...img, url: fixMediaUrl(img.url) || img.url })) || [],
  };
}

export async function fetchProducts(): Promise<MedusaProduct[]> {
  try {
    const res = await fetch(
      `${BACKEND}/store/products?fields=*variants,*variants.prices`,
      {
        headers: { "x-publishable-api-key": PUB_KEY },
        next: { revalidate: 60 },
      }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data.products || []).map(fixProductUrls);
  } catch {
    return [];
  }
}

export async function fetchProductByHandle(handle: string): Promise<MedusaProduct | null> {
  try {
    const res = await fetch(
      `${BACKEND}/store/products?handle=${handle}&fields=*variants,*variants.prices`,
      {
        headers: { "x-publishable-api-key": PUB_KEY },
        next: { revalidate: 60 },
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const product = data.products?.[0];
    return product ? fixProductUrls(product) : null;
  } catch {
    return null;
  }
}

/** Extraire le prix XAF d'un variant Medusa */
export function getVariantPrice(variant: MedusaVariant): number {
  const price = variant.prices?.find(p => p.currency_code === "xaf");
  return price?.amount ?? 0;
}
