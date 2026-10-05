import { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_URL || "https://nutrelis.bio";

export const metadata: Metadata = {
  title: "Avis clients — Les retours de nos clients | NUTRELIS",
  description:
    "Les avis vérifiés de clients NUTRELIS (achat livré). — Verified reviews from NUTRELIS customers (delivered purchase).",
  openGraph: {
    type: "website",
    url: `${SITE_URL}/avis-clients`,
    title: "Avis clients | NUTRELIS",
    description: "Les avis vérifiés de clients NUTRELIS.",
    images: [{ url: "/images/og-boutique.jpg", width: 1200, height: 630, alt: "NUTRELIS — Avis clients" }],
    siteName: "NUTRELIS",
    locale: "fr_CM",
    alternateLocale: ["en_CM"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Customer reviews | NUTRELIS",
    description: "Verified reviews from NUTRELIS customers.",
    images: ["/images/og-boutique.jpg"],
  },
  alternates: {
    canonical: `${SITE_URL}/avis-clients`,
    languages: { "fr-CM": `${SITE_URL}/avis-clients`, "en-CM": `${SITE_URL}/avis-clients` },
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
