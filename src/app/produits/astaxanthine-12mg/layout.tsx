import { Metadata } from "next";

const URL = "https://nutrelis-v76z.vercel.app";

export const metadata: Metadata = {
  title: "Astaxanthine 12mg — Antioxydant le Plus Puissant au Monde",
  description:
    "NUTRELIS Astaxanthine 12mg : 6000× plus puissante que la Vitamine C. Peau lumineuse, énergie, protection cellulaire dès 2 semaines. Livraison ATEZ Express au Cameroun. Garantie 90 jours.",
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
  ],
  openGraph: {
    type: "website",
    url: `${URL}/produits/astaxanthine-12mg`,
    title: "NUTRELIS Astaxanthine 12mg — L'Antioxydant le Plus Puissant au Monde",
    description:
      "6000× plus puissante que la Vitamine C. Résultats visibles dès 2 semaines : peau lumineuse, énergie stable, protection cellulaire. Livraison partout au Cameroun.",
    images: [
      {
        url: "/images/astaxanthine/NUT2.png",
        width: 1200,
        height: 630,
        alt: "NUTRELIS Astaxanthine 12mg — Complément Premium",
      },
    ],
    siteName: "NUTRELIS",
    locale: "fr_CM",
  },
  twitter: {
    card: "summary_large_image",
    title: "NUTRELIS Astaxanthine 12mg — L'Antioxydant le Plus Puissant",
    description:
      "6000× plus puissante que la Vitamine C. Résultats visibles dès 2 semaines. Livraison au Cameroun.",
    images: ["/images/astaxanthine/NUT2.png"],
  },
  alternates: {
    canonical: `${URL}/produits/astaxanthine-12mg`,
  },
};

export default function AstaxanthineLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
