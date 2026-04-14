import { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_URL || "https://nutrelis.bio";

export const metadata: Metadata = {
  title: "Mentions Légales — NUTRELIS",
  description:
    "Mentions légales du site nutrelis.bio : éditeur, hébergeur, propriété intellectuelle, données personnelles. — Legal notice for nutrelis.bio.",
  alternates: {
    canonical: `${SITE_URL}/mentions-legales`,
  },
  robots: { index: true, follow: true },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
