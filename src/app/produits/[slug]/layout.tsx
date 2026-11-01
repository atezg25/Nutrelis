import type { Metadata } from "next";
import { query } from "@/lib/db";

const SITE_URL = process.env.NEXT_PUBLIC_URL || "https://nutrelis.bio";

/**
 * Titre, description et VIGNETTE DE PARTAGE (WhatsApp, Facebook…) de chaque produit ajouté depuis la console :
 * la vignette est celle du produit en question (`/api/og/<slug>`).
 */
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const voulu = decodeURIComponent(slug).toLowerCase();
  let p: { slug: string; name: string; subtitle: string | null; description: string | null } | undefined;
  try {
    [p] = await query<{ slug: string; name: string; subtitle: string | null; description: string | null }>(
      "SELECT slug, name, subtitle, description FROM product WHERE lower(slug) = $1 AND active LIMIT 1",
      [voulu.slice(0, 120)],
    );
  } catch {
    p = undefined;
  }
  if (!p) return { title: "NUTRELIS" };
  const titre = `${p.name} | NUTRELIS`;
  const description = p.description ?? p.subtitle ?? "NUTRELIS — livraison partout au Cameroun, paiement Mobile Money ou à la livraison.";
  const url = `${SITE_URL}/produits/${p.slug}`;
  const image = `${SITE_URL}/api/og/${p.slug}`;
  return {
    title: titre,
    description,
    alternates: { canonical: url },
    openGraph: { type: "website", url, title: titre, description, siteName: "NUTRELIS", locale: "fr_CM", images: [{ url: image, width: 1200, height: 630, alt: p.name }] },
    twitter: { card: "summary_large_image", title: titre, description, images: [image] },
  };
}

export default function LayoutProduit({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
