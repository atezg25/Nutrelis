import { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_URL || "https://nutrelis.bio";

export const metadata: Metadata = {
  title: "Livraison ATEZ Express — Partout au Cameroun",
  description:
    "Livraison ATEZ Express dans tout le Cameroun : Douala, Yaoundé, et toutes les villes. Délais, tarifs et suivi de commande. — ATEZ Express delivery across Cameroon: Douala, Yaoundé, all cities. Timeframes, rates and order tracking.",
  keywords: [
    "livraison Cameroun",
    "ATEZ Express",
    "livraison Douala",
    "livraison Yaoundé",
    "delivery Cameroon",
    "shipping supplements",
  ],
  openGraph: {
    type: "website",
    url: `${SITE_URL}/livraison`,
    title: "Livraison ATEZ Express — Partout au Cameroun | NUTRELIS",
    description: "Livraison rapide dans tout le Cameroun. Douala, Yaoundé et toutes les villes.",
    images: [{ url: "/images/astaxanthine/NUT2.png", width: 1200, height: 630, alt: "NUTRELIS — Livraison" }],
    siteName: "NUTRELIS",
    locale: "fr_CM",
    alternateLocale: ["en_CM"],
  },
  twitter: {
    card: "summary",
    title: "ATEZ Express Delivery — All Cameroon | NUTRELIS",
    description: "Fast delivery across Cameroon. Douala, Yaoundé and all cities.",
    images: ["/images/astaxanthine/NUT2.png"],
  },
  alternates: {
    canonical: `${SITE_URL}/livraison`,
    languages: { "fr-CM": `${SITE_URL}/livraison`, "en-CM": `${SITE_URL}/livraison` },
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
