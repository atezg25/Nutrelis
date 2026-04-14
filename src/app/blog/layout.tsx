import { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_URL || "https://nutrelis.bio";

export const metadata: Metadata = {
  title: "Blog Santé & Bien-être — Conseils Nutrition NUTRELIS",
  description:
    "Articles sur la santé, la nutrition et les antioxydants. Conseils d'experts pour une vie saine au Cameroun. — Health, nutrition and antioxidant articles. Expert advice for healthy living in Cameroon.",
  keywords: [
    "blog santé Cameroun",
    "nutrition Afrique",
    "astaxanthine bienfaits",
    "antioxydants naturels",
    "health blog Cameroon",
    "nutrition Africa",
  ],
  openGraph: {
    type: "website",
    url: `${SITE_URL}/blog`,
    title: "Blog Santé & Bien-être | NUTRELIS",
    description: "Articles d'experts sur la nutrition, les antioxydants et la santé au Cameroun.",
    images: [{ url: "/images/astaxanthine/NUT2.png", width: 1200, height: 630, alt: "NUTRELIS — Blog" }],
    siteName: "NUTRELIS",
    locale: "fr_CM",
    alternateLocale: ["en_CM"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Health & Wellness Blog | NUTRELIS",
    description: "Expert articles on nutrition, antioxidants and health in Cameroon.",
    images: ["/images/astaxanthine/NUT2.png"],
  },
  alternates: {
    canonical: `${SITE_URL}/blog`,
    languages: { "fr-CM": `${SITE_URL}/blog`, "en-CM": `${SITE_URL}/blog` },
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
