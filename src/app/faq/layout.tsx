import { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_URL || "https://nutrelis.bio";

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Qu'est-ce que l'astaxanthine ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "L'astaxanthine est un antioxydant naturel issu de la microalgue Haematococcus pluvialis, 6000× plus puissant que la Vitamine C.",
      },
    },
    {
      "@type": "Question",
      name: "Quelle est la posologie recommandée ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "1 capsule de 12mg par jour, de préférence avec un repas contenant des graisses pour une meilleure absorption.",
      },
    },
    {
      "@type": "Question",
      name: "Quand vais-je voir les résultats ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Les premiers résultats sont généralement visibles dès 2 semaines d'utilisation régulière.",
      },
    },
    {
      "@type": "Question",
      name: "Comment payer au Cameroun ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Nous acceptons MTN Mobile Money et Orange Money via Notchpay, ainsi que les cartes bancaires.",
      },
    },
    {
      "@type": "Question",
      name: "Quelle est la politique de retour ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Garantie satisfait ou remboursé 90 jours pour les boîtes non ouvertes.",
      },
    },
  ],
};

export const metadata: Metadata = {
  title: "FAQ — Questions Fréquentes sur l'Astaxanthine et NUTRELIS",
  description:
    "Réponses à toutes vos questions : posologie, effets, livraison, paiement Mobile Money, garantie 90 jours. — Answers to all your questions: dosage, effects, delivery, Mobile Money payment, 90-day guarantee.",
  keywords: [
    "FAQ astaxanthine",
    "questions compléments alimentaires",
    "posologie astaxanthine",
    "livraison Cameroun",
    "paiement Mobile Money",
    "FAQ supplements Cameroon",
  ],
  openGraph: {
    type: "website",
    url: `${SITE_URL}/faq`,
    title: "FAQ — Questions Fréquentes | NUTRELIS",
    description: "Posologie, effets, livraison, paiement, garantie — toutes les réponses.",
    images: [{ url: "/images/astaxanthine/NUT2.png", width: 1200, height: 630, alt: "NUTRELIS — FAQ" }],
    siteName: "NUTRELIS",
    locale: "fr_CM",
    alternateLocale: ["en_CM"],
  },
  twitter: {
    card: "summary_large_image",
    title: "FAQ — Frequently Asked Questions | NUTRELIS",
    description: "Dosage, effects, delivery, payment, guarantee — all the answers.",
    images: ["/images/astaxanthine/NUT2.png"],
  },
  alternates: {
    canonical: `${SITE_URL}/faq`,
    languages: { "fr-CM": `${SITE_URL}/faq`, "en-CM": `${SITE_URL}/faq` },
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      {children}
    </>
  );
}
