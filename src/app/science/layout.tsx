import { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_URL || "https://nutrelis.bio";

export const metadata: Metadata = {
  title: "La Science derrière l'Astaxanthine — Études Cliniques",
  description:
    "Preuves scientifiques de l'astaxanthine 12mg : études cliniques, mécanismes d'action, comparaison avec d'autres antioxydants. 6000× plus puissante que la Vitamine C. — Scientific evidence for astaxanthin 12mg: clinical studies, mechanisms, comparison with other antioxidants.",
  keywords: [
    "astaxanthine études cliniques",
    "science antioxydant",
    "haematococcus pluvialis recherche",
    "astaxanthin clinical studies",
    "antioxidant science",
  ],
  openGraph: {
    type: "article",
    url: `${SITE_URL}/science`,
    title: "La Science derrière l'Astaxanthine — Études Cliniques | NUTRELIS",
    description: "6000× plus puissante que la Vitamine C. Découvrez les preuves scientifiques.",
    images: [{ url: "/images/astaxanthine/NUT2.png", width: 1200, height: 630, alt: "NUTRELIS — Science Astaxanthine" }],
    siteName: "NUTRELIS",
    locale: "fr_CM",
    alternateLocale: ["en_CM"],
  },
  twitter: {
    card: "summary_large_image",
    title: "The Science Behind Astaxanthin — Clinical Studies | NUTRELIS",
    description: "6000× more powerful than Vitamin C. Discover the scientific evidence.",
    images: ["/images/astaxanthine/NUT2.png"],
  },
  alternates: {
    canonical: `${SITE_URL}/science`,
    languages: { "fr-CM": `${SITE_URL}/science`, "en-CM": `${SITE_URL}/science` },
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
