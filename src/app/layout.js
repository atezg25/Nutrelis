import { Sora, DM_Sans } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
});

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  weight: ["400", "600", "700", "800"],
});

export const metadata = {
  title: "NUTRELIS — Compléments Alimentaires Premium",
  description: "Des compléments alimentaires d'excellence pour votre vitalité.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body className={`${dmSans.variable} ${sora.variable}`}>
        {children}
      </body>
    </html>
  );
}