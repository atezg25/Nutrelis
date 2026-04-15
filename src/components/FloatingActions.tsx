"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useScreenSize } from "@/hooks/useIsMobile";

interface FloatingActionsProps {
  accent?: string; // couleur d'accent (default: #7D0806 pour produit, var(--accent) pour homepage)
}

export default function FloatingActions({ accent = "#7D0806" }: FloatingActionsProps) {
  const { totalItems } = useCart();
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
