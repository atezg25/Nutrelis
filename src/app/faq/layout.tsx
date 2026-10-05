import { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_URL || "https://nutrelis.bio";

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Comment passer commande sur NUTRELIS ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Ouvrez la fiche du produit, choisissez votre pack, puis ajoutez-le au panier ou achetez directement. Les frais de livraison s'affichent avant le paiement.",
      },
    },
    {
      "@type": "Question",
      name: "Quels moyens de paiement ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Mobile Money en ligne (paiement sécurisé), ou espèces à la livraison.",
      },
    },
    {
      "@type": "Question",
      name: "Quelle est la politique de retour ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Garantie de 90 jours : voir les conditions sur la page Retours et remboursements. Seuls les produits non ouverts et non entamés peuvent être retournés.",
      },
    },
  ],
};

export const metadata: Metadata = {
  title: "FAQ — Questions fréquentes sur les produits NUTRELIS",
  description:
    "Commande, paiement, livraison, abonnement, retours et garantie : les réponses à vos questions sur les produits NUTRELIS au Cameroun. — Ordering, payment, delivery, subscription, returns: answers about NUTRELIS products in Cameroon.",
  keywords: ["FAQ NUTRELIS", "livraison Cameroun", "paiement Mobile Money", "garantie 90 jours", "NUTRELIS questions"],
  openGraph: {
    type: "website",
    url: `${SITE_URL}/faq`,
    title: "FAQ — Questions fréquentes | NUTRELIS",
    description: "Commande, paiement, livraison, abonnement, retours et garantie.",
    images: [{ url: "/images/og-boutique.jpg", width: 1200, height: 630, alt: "NUTRELIS — FAQ" }],
    siteName: "NUTRELIS",
    locale: "fr_CM",
    alternateLocale: ["en_CM"],
  },
  twitter: {
    card: "summary_large_image",
    title: "FAQ | NUTRELIS",
    description: "Ordering, payment, delivery, subscription, returns and guarantee.",
    images: ["/images/og-boutique.jpg"],
  },
  alternates: {
    canonical: `${SITE_URL}/faq`,
    languages: { "fr-CM": `${SITE_URL}/faq`, "en-CM": `${SITE_URL}/faq` },
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      {children}
    </>
  );
}
