import { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_URL || "https://nutrelis.bio";

export const metadata: Metadata = {
  title: "Conditions Générales de Vente — NUTRELIS",
  description:
    "Conditions générales de vente NUTRELIS : commandes, paiement Mobile Money, livraison, retours et garanties. — NUTRELIS terms and conditions: orders, Mobile Money payment, delivery, returns and guarantees.",
  alternates: {
    canonical: `${SITE_URL}/cgv`,
  },
  robots: { index: true, follow: true },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
