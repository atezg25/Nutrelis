"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useScreenSize } from "@/hooks/useIsMobile";
import { useLocale } from "@/context/LocaleContext";

interface FloatingActionsProps {
  accent?: string; // couleur d'accent (default: #7D0806 pour produit, var(--accent) pour homepage)
}

export default function FloatingActions({ accent = "#7D0806" }: FloatingActionsProps) {
  const { totalItems } = useCart();
  const { contact, locale } = useLocale();
  const isMobile = useScreenSize() === "mobile";
  const [showScroll, setShowScroll] = useState(false);

  useEffect(() => {
    const check = () => setShowScroll(window.scrollY > 400);
    window.addEventListener("scroll", check);
    return () => window.removeEventListener("scroll", check);
  }, []);

  return (
    <div style={{
      position: "fixed",
      bottom: isMobile ? 20 : 32,
      right: isMobile ? 16 : 32,
      display: "flex",
      flexDirection: "column",
      gap: 12,
      zIndex: 90,
      alignItems: "flex-end",
    }}>
      {/* Contact WhatsApp : le numéro se règle dans la console (Paramètres) */}
      {contact.whatsapp && (
        <a
          href={`https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(locale === "fr" ? "Bonjour NUTRELIS, j'ai une question sur vos produits." : "Hello NUTRELIS, I have a question about your products.")}`}
          target="_blank" rel="noopener noreferrer"
          aria-label={locale === "fr" ? "Nous écrire sur WhatsApp" : "Chat with us on WhatsApp"}
          style={{ width: isMobile ? 48 : 54, height: isMobile ? 48 : 54, borderRadius: "50%", background: "#25D366", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 6px 20px rgba(37,211,102,0.45)" }}
        >
          <svg width="28" height="28" viewBox="0 0 32 32" fill="#fff" aria-hidden="true"><path d="M16.04 3C9.4 3 4 8.4 4 15.04c0 2.12.55 4.18 1.6 6L4 29l8.17-1.57A12 12 0 0 0 16.04 27C22.68 27 28 21.6 28 14.96 28 8.4 22.68 3 16.04 3zm0 21.9c-1.8 0-3.56-.48-5.1-1.4l-.37-.22-4.85.93.98-4.72-.24-.39a9.9 9.9 0 0 1-1.52-5.26c0-5.5 4.48-9.98 10-9.98 5.5 0 9.98 4.48 9.98 9.98 0 5.52-4.48 10.06-9.98 10.06zm5.5-7.5c-.3-.15-1.78-.88-2.06-.98-.28-.1-.48-.15-.68.15-.2.3-.78.98-.95 1.18-.18.2-.35.22-.65.07-.3-.15-1.27-.47-2.42-1.5-.9-.8-1.5-1.78-1.67-2.08-.18-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.38-.02-.53-.08-.15-.68-1.64-.93-2.25-.25-.58-.5-.5-.68-.5h-.58c-.2 0-.53.08-.8.38-.28.3-1.05 1.03-1.05 2.5s1.08 2.9 1.23 3.1c.15.2 2.1 3.2 5.08 4.5.7.3 1.26.5 1.7.62.72.23 1.37.2 1.88.12.58-.08 1.78-.73 2.03-1.43.25-.7.25-1.3.18-1.43-.08-.13-.28-.2-.58-.35z"/></svg>
        </a>
      )}

      {/* Bouton scroll to top */}
      {showScroll && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          style={{
            width: isMobile ? 44 : 48,
            height: isMobile ? 44 : 48,
            borderRadius: "50%",
            background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(255,255,255,0.15)",
            color: "#fff",
            fontSize: 20,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 16px rgba(0,0,0,0.25)",
            transition: "opacity 0.2s",
          }}
          aria-label="Remonter en haut"
        >
          ↑
        </button>
      )}

      {/* Panier flottant */}
      {totalItems > 0 && <Link
          href="/panier"
          style={{
            width: isMobile ? 52 : 56,
            height: isMobile ? 52 : 56,
            borderRadius: "50%",
            background: accent,
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            textDecoration: "none",
            boxShadow: `0 6px 24px rgba(0,0,0,0.3)`,
            position: "relative",
            transition: "transform 0.2s",
          }}
        >
          <svg width={isMobile ? 22 : 24} height={isMobile ? 22 : 24} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 01-8 0" />
          </svg>
          {totalItems > 0 && (
            <div style={{
              position: "absolute",
              top: -4,
              right: -4,
              width: 22,
              height: 22,
              borderRadius: "50%",
              background: "#fff",
              color: accent,
              fontSize: 12,
              fontWeight: 900,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            }}>
              {totalItems > 9 ? "9+" : totalItems}
            </div>
          )}
        </Link>}
    </div>
  );
}
