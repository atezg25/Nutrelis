"use client";
import Link from "next/link";
import { useCart } from "@/context/CartContext";

export default function NavbarCart() {
  const { totalItems } = useCart();

  return (
    <Link href="/panier" style={{
      position: "relative",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: 42,
      height: 42,
      borderRadius: 10,
      border: "1.5px solid rgba(255,255,255,0.2)",
      textDecoration: "none",
      transition: "all 0.2s",
    }}
      onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.6)"}
      onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"}
    >
      {/* Icône panier SVG */}
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 01-8 0" />
      </svg>

      {/* Compteur */}
      {totalItems > 0 && (
        <div style={{
          position: "absolute",
          top: -8,
          right: -8,
          width: 20,
          height: 20,
          borderRadius: "50%",
          background: "#7D0806",
          color: "#fff",
          fontSize: 11,
          fontWeight: 900,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "2px solid #060f08",
        }}>
          {totalItems > 9 ? "9+" : totalItems}
        </div>
      )}
    </Link>
  );
}