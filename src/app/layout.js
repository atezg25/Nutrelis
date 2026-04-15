import { Sora, DM_Sans } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import { LocaleProvider } from "@/context/LocaleContext";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
});

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  weight: ["400", "600", "700", "800"],
});

const SITE_URL = process.env.NEXT_PUBLIC_URL || "https://nutrelis.bio";

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "NUTRELIS",
  url: SITE_URL,
  logo: `${SITE_URL}/images/astaxanthine/NUT2.png`,
  description: "Compléments alimentaires premium à base d'actifs naturels pour le Cameroun",
  contactPoint: {
    "@type": "ContactPoint",
    email: "support@nutrelis.bio",
    contactType: "customer service",
    availableLanguage: ["French", "English"],
    areaServed: "CM",
  },
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "NUTRELIS",
  url: SITE_URL,
  inLanguage: ["fr", "en"],
  publisher: { "@type": "Organization", name: "NUTRELIS" },
};

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "NUTRELIS — Compléments Alimentaires Premium au Cameroun",
    template: "%s | NUTRELIS",
  },
  description:
    "NUTRELIS propose des compléments alimentaires d'excellence à base d'actifs naturels — Astaxanthine 12mg, livraison ATEZ Express au Cameroun. Résultats visibles dès 2 semaines.",
  keywords: [
    "compléments alimentaires Cameroun",
    "astaxanthine 12mg",
    "antioxydant naturel",
    "beauté peau Cameroun",
    "énergie vitalité",
    "NUTRELIS",
    "Douala",
    "Yaoundé",
  ],
  authors: [{ name: "NUTRELIS" }],
  creator: "NUTRELIS",
  publisher: "NUTRELIS",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  openGraph: {
    type: "website",
    locale: "fr_CM",
    url: SITE_URL,
    siteName: "NUTRELIS",
    title: "NUTRELIS — Compléments Alimentaires Premium au Cameroun",
    description:
      "L'Astaxanthine naturelle à dose clinique de 12mg. Peau lumineuse, énergie, protection cellulaire. Livraison ATEZ Express partout au Cameroun.",
    images: [
      {
        url: "/images/astaxanthine/NUT2.png",
        width: 1200,
        height: 630,
        alt: "NUTRELIS Astaxanthine 12mg — Compléments Premium",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "NUTRELIS — Compléments Alimentaires Premium au Cameroun",
    description:
      "L'Astaxanthine naturelle à dose clinique de 12mg. Peau lumineuse, énergie, protection cellulaire.",
    images: ["/images/astaxanthine/NUT2.png"],
  },
  alternates: {
    canonical: SITE_URL,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body className={`${dmSans.variable} ${sora.variable}`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <LocaleProvider>
          <AuthProvider>
            <CartProvider>
              {children}
            </CartProvider>
          </AuthProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
