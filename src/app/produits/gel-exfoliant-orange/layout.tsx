import { Metadata } from "next";
import MemoireProduit from "@/components/MemoireProduit";

const SITE_URL = process.env.NEXT_PUBLIC_URL || "https://nutrelis.bio";

const productJsonLd = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: "NUTRELIS Gel exfoliant aux enzymes d’orange",
  description: "Gel exfoliant doux aux enzymes d’orange, sans grains abrasifs. Pour le visage et le corps.",
  image: `${SITE_URL}/images/gel/NUT2.png`,
  brand: { "@type": "Brand", name: "NUTRELIS" },
  sku: "GEL-ORANGE-1",
  offers: {
    "@type": "AggregateOffer",
    priceCurrency: "XAF",
    lowPrice: 10000,
    highPrice: 24000,
    offerCount: 3,
    availability: "https://schema.org/InStock",
    seller: { "@type": "Organization", name: "NUTRELIS" },
  },
};

export const metadata: Metadata = {
  title: "Gel exfoliant aux enzymes d’orange | NUTRELIS",
  description:
    "NUTRELIS gel exfoliant aux enzymes d’orange : une exfoliation douce, sans grains abrasifs, pour le visage et le corps. Livraison partout au Cameroun. Garantie 90 jours.",
  keywords: ["gel exfoliant Cameroun", "exfoliant enzymes d’orange", "gommage doux visage corps", "NUTRELIS gel exfoliant", "exfoliating gel Cameroon"],
  openGraph: {
    type: "website",
    url: `${SITE_URL}/produits/gel-exfoliant-orange`,
    title: "NUTRELIS Gel exfoliant aux enzymes d’orange",
    description: "Une exfoliation douce en 60 secondes, sans grains abrasifs. Livraison partout au Cameroun.",
    images: [{ url: "/api/og/gel-exfoliant-orange", width: 1200, height: 630, alt: "NUTRELIS Gel exfoliant à l’orange" }],
    siteName: "NUTRELIS",
    locale: "fr_CM",
    alternateLocale: ["en_CM"],
  },
  alternates: { canonical: `${SITE_URL}/produits/gel-exfoliant-orange` },
};

export default function GelLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }} />
      <MemoireProduit />
      {children}
    </>
  );
}
