import { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_URL || "https://nutrelis.bio";

export const metadata: Metadata = {
  title: "Blog Santé & Bien-être — Conseils Nutrition NUTRELIS",
  description:
    "Conseils santé, beauté et bien-être pour bien choisir vos produits au Cameroun. — Health, beauty and wellness tips to choose your products in Cameroon.",
  keywords: [
    "blog santé Cameroun",
    "nutrition Afrique",
    "conseils beauté Cameroun",
    "bien choisir un complément",
    "health blog Cameroon",
    "nutrition Africa",
  ],
  openGraph: {
    type: "website",
    url: `${SITE_URL}/blog`,
    title: "Blog Santé & Bien-être | NUTRELIS",
    description: "Conseils santé, beauté et bien-être au Cameroun.",
    images: [{ url: "/images/og-boutique.jpg", width: 1200, height: 630, alt: "NUTRELIS — Blog" }],
    siteName: "NUTRELIS",
    locale: "fr_CM",
    alternateLocale: ["en_CM"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Health & Wellness Blog | NUTRELIS",
    description: "Expert articles on nutrition, antioxidants and health in Cameroon.",
    images: ["/images/og-boutique.jpg"],
  },
  alternates: {
    canonical: `${SITE_URL}/blog`,
    languages: { "fr-CM": `${SITE_URL}/blog`, "en-CM": `${SITE_URL}/blog` },
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
