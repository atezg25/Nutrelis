import { Sora, DM_Sans } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { LocaleProvider } from "@/context/LocaleContext";
import { ScreenSizeProvider } from "@/context/ScreenSizeContext";

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
  logo: `${SITE_URL}/images/og-boutique.jpg`,
  description: "Soins et compléments naturels, livrés partout au Cameroun",
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
    "La boutique NUTRELIS : soins et compléments naturels, livrés partout au Cameroun. Paiement par Mobile Money ou à la livraison, garantie 90 jours.",
  keywords: [
    "compléments alimentaires Cameroun",
    "soins naturels Cameroun",
    "boutique en ligne Cameroun",
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
      "La boutique NUTRELIS : soins et compléments naturels, livrés partout au Cameroun. Paiement Mobile Money ou à la livraison, garantie 90 jours.",
    images: [
      {
        url: "/images/og-boutique.jpg",
        width: 1200,
        height: 630,
        alt: "NUTRELIS — La boutique",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "NUTRELIS — Compléments Alimentaires Premium au Cameroun",
    description:
      "La boutique NUTRELIS : soins et compléments naturels, livrés partout au Cameroun.",
    images: ["/images/og-boutique.jpg"],
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
          <ScreenSizeProvider>
            <CartProvider>
              {children}
            </CartProvider>
          </ScreenSizeProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
