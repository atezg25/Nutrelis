import { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_URL || "https://nutrelis.bio";

export const metadata: Metadata = {
  title: "À Propos de NUTRELIS — Notre Mission Santé au Cameroun",
  description:
    "Découvrez NUTRELIS : compléments alimentaires premium à base d'actifs naturels pour le Cameroun. Notre mission, nos valeurs, notre engagement qualité. — Discover NUTRELIS: premium natural supplements for Cameroon.",
  keywords: [
    "NUTRELIS à propos",
    "compléments alimentaires Cameroun",
    "mission santé naturelle",
    "NUTRELIS about",
    "natural supplements Cameroon",
  ],
  openGraph: {
    type: "website",
    url: `${SITE_URL}/a-propos`,
    title: "À Propos de NUTRELIS — Notre Mission Santé au Cameroun",
    description:
      "Compléments alimentaires premium à base d'actifs naturels. Notre mission : rendre la santé optimale accessible au Cameroun.",
    images: [{ url: "/images/astaxanthine/NUT2.png", width: 1200, height: 630, alt: "NUTRELIS — À Propos" }],
    siteName: "NUTRELIS",
    locale: "fr_CM",
    alternateLocale: ["en_CM"],
  },
  twitter: {
    card: "summary_large_image",
    title: "About NUTRELIS — Our Health Mission in Cameroon",
    description: "Premium natural supplements. Our mission: making optimal health accessible in Cameroon.",
    images: ["/images/astaxanthine/NUT2.png"],
  },
  alternates: {
    canonical: `${SITE_URL}/a-propos`,
    languages: { "fr-CM": `${SITE_URL}/a-propos`, "en-CM": `${SITE_URL}/a-propos` },
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
