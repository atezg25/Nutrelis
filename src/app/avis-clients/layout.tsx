import { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_URL || "https://nutrelis.bio";

const reviewJsonLd = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: "NUTRELIS Astaxanthine 12mg",
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.8",
    reviewCount: "127",
    bestRating: "5",
    worstRating: "1",
  },
  review: [
    {
      "@type": "Review",
      author: { "@type": "Person", name: "Marie K." },
      reviewRating: { "@type": "Rating", ratingValue: "5", bestRating: "5" },
      reviewBody: "Ma peau est plus lumineuse après seulement 2 semaines. Je recommande !",
    },
    {
      "@type": "Review",
      author: { "@type": "Person", name: "Jean-Paul T." },
      reviewRating: { "@type": "Rating", ratingValue: "5", bestRating: "5" },
      reviewBody: "Plus d'énergie au quotidien, je ne m'en passe plus.",
    },
    {
      "@type": "Review",
      author: { "@type": "Person", name: "Aïcha M." },
      reviewRating: { "@type": "Rating", ratingValue: "5", bestRating: "5" },
      reviewBody: "Livraison rapide à Douala et produit de qualité. Très satisfaite.",
    },
  ],
};

export const metadata: Metadata = {
  title: "Avis Clients — Témoignages Astaxanthine NUTRELIS",
  description:
    "Découvrez les témoignages de nos clients satisfaits au Cameroun. Résultats visibles sur la peau, l'énergie et le bien-être. — Read testimonials from satisfied customers in Cameroon. Visible results on skin, energy and wellness.",
  keywords: [
    "avis NUTRELIS",
    "témoignages astaxanthine",
    "résultats compléments Cameroun",
    "NUTRELIS reviews",
    "astaxanthin testimonials",
  ],
  openGraph: {
    type: "website",
    url: `${SITE_URL}/avis-clients`,
    title: "Avis Clients — Témoignages | NUTRELIS",
    description: "Témoignages de clients satisfaits. Résultats visibles dès 2 semaines.",
    images: [{ url: "/images/astaxanthine/NUT2.png", width: 1200, height: 630, alt: "NUTRELIS — Avis Clients" }],
    siteName: "NUTRELIS",
    locale: "fr_CM",
    alternateLocale: ["en_CM"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Customer Reviews — Testimonials | NUTRELIS",
    description: "Testimonials from satisfied customers. Visible results within 2 weeks.",
    images: ["/images/astaxanthine/NUT2.png"],
  },
  alternates: {
    canonical: `${SITE_URL}/avis-clients`,
    languages: { "fr-CM": `${SITE_URL}/avis-clients`, "en-CM": `${SITE_URL}/avis-clients` },
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(reviewJsonLd) }}
      />
      {children}
    </>
  );
}
