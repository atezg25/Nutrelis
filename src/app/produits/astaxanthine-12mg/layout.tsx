import { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_URL || "https://nutrelis.bio";

export const metadata: Metadata = {
  title: "Astaxanthine 12mg — Antioxydant le Plus Puissant au Monde | NUTRELIS",
  description:
    "NUTRELIS Astaxanthine 12mg : 6000× plus puissante que la Vitamine C. Peau lumineuse, énergie, protection cellulaire dès 2 semaines. Livraison ATEZ Express au Cameroun. Garantie 90 jours. — NUTRELIS Astaxanthin 12mg: 6000× more powerful than Vitamin C. Radiant skin, energy, cell protection within 2 weeks. Delivery in Cameroon. 90-day guarantee.",
  keywords: [
    "astaxanthine 12mg Cameroun",
    "meilleur antioxydant naturel",
    "complément anti-âge",
    "peau lumineuse naturellement",
    "énergie fatigue",
    "protection cellulaire",
    "haematococcus pluvialis",
    "achat astaxanthine Douala",
    "NUTRELIS astaxanthine",
    "astaxanthin 12mg Cameroon",
    "best natural antioxidant",
    "anti-aging supplement",
    "radiant skin naturally",
    "cell protection supplement",
    "buy astaxanthin Douala",
  ],
  openGraph: {
    type: "website",
    url: `${SITE_URL}/produits/astaxanthine-12mg`,
    title: "NUTRELIS Astaxanthine 12mg — L'Antioxydant le Plus Puissant au Monde",
    description:
      "6000× plus puissante que la Vitamine C. Résultats visibles dès 2 semaines : peau lumineuse, énergie stable, protection cellulaire. Livraison partout au Cameroun.",
    images: [
      {
        url: "/images/astaxanthine/NUT2.png",
        width: 1200,
        height: 630,
        alt: "NUTRELIS Astaxanthine 12mg — Premium Supplement",
      },
    ],
    siteName: "NUTRELIS",
    locale: "fr_CM",
    alternateLocale: ["en_CM"],
  },
  twitter: {
    card: "summary_large_image",
    title: "NUTRELIS Astaxanthin 12mg — The World's Most Powerful Antioxidant",
    description:
      "6000× more powerful than Vitamin C. Visible results in 2 weeks. Delivery in Cameroon. 90-day money-back guarantee.",
    images: ["/images/astaxanthine/NUT2.png"],
  },
  alternates: {
    canonical: `${SITE_URL}/produits/astaxanthine-12mg`,
    languages: {
      "fr-CM": `${SITE_URL}/produits/astaxanthine-12mg`,
      "en-CM": `${SITE_URL}/produits/astaxanthine-12mg`,
    },
  },
};

export default function AstaxanthineLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
