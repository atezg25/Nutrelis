import { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_URL || "https://nutrelis.bio";

export const metadata: Metadata = {
  title: "Contactez NUTRELIS — Service Client Cameroun",
  description:
    "Contactez l'équipe NUTRELIS : support@nutrelis.bio, WhatsApp, formulaire de contact. Réponse rapide garantie. — Contact NUTRELIS team: email, WhatsApp, contact form. Fast response guaranteed.",
  keywords: [
    "contact NUTRELIS",
    "service client Cameroun",
    "support compléments alimentaires",
    "contact supplements Cameroon",
  ],
  openGraph: {
    type: "website",
    url: `${SITE_URL}/contact`,
    title: "Contactez NUTRELIS — Service Client",
    description: "Email, WhatsApp, formulaire — nous répondons rapidement.",
    images: [{ url: "/images/astaxanthine/NUT2.png", width: 1200, height: 630, alt: "NUTRELIS — Contact" }],
    siteName: "NUTRELIS",
    locale: "fr_CM",
    alternateLocale: ["en_CM"],
  },
  twitter: {
    card: "summary",
    title: "Contact NUTRELIS — Customer Service",
    description: "Email, WhatsApp, contact form — we respond quickly.",
    images: ["/images/astaxanthine/NUT2.png"],
  },
  alternates: {
    canonical: `${SITE_URL}/contact`,
    languages: { "fr-CM": `${SITE_URL}/contact`, "en-CM": `${SITE_URL}/contact` },
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
