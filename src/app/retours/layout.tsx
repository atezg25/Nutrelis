import { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_URL || "https://nutrelis.bio";

export const metadata: Metadata = {
  title: "Politique de Retours & Garantie 90 Jours — NUTRELIS",
  description:
    "Garantie satisfait ou remboursé 90 jours. Conditions de retour et remboursement pour les produits NUTRELIS non ouverts. — 90-day money-back guarantee. Return and refund conditions for unopened NUTRELIS products.",
  keywords: [
    "retours NUTRELIS",
    "garantie 90 jours",
    "remboursement compléments",
    "return policy NUTRELIS",
    "90 day guarantee",
  ],
  openGraph: {
    type: "website",
    url: `${SITE_URL}/retours`,
    title: "Politique de Retours & Garantie 90 Jours | NUTRELIS",
    description: "Satisfait ou remboursé 90 jours. Boîte non ouverte = remboursement intégral.",
    images: [{ url: "/images/astaxanthine/NUT2.png", width: 1200, height: 630, alt: "NUTRELIS — Retours" }],
    siteName: "NUTRELIS",
    locale: "fr_CM",
    alternateLocale: ["en_CM"],
  },
  twitter: {
    card: "summary",
    title: "Return Policy & 90-Day Guarantee | NUTRELIS",
    description: "90-day money-back guarantee. Unopened box = full refund.",
    images: ["/images/astaxanthine/NUT2.png"],
  },
  alternates: {
    canonical: `${SITE_URL}/retours`,
    languages: { "fr-CM": `${SITE_URL}/retours`, "en-CM": `${SITE_URL}/retours` },
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
