"use client";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

export default function NavbarCart() {
  const { totalItems } = useCart();
  const { customer } = useAuth();

  const btnStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 42,
    height: 42,
    borderRadius: 10,
    border: "1.5px solid rgba(255,255,255,0.2)",
    textDecoration: "none",
    transition: "all 0.2s",
    color: "#fff",
    fontSize: 13,
    fontWeight: 700,
  } as React.CSSProperties;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      
      {/* Lien Mon compte */}
      {customer ? (
        <Link href="/compte" style={{ ...btnStyle, gap: 8, width: "auto", padding: "0 14px" }}
          onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.6)"}
          onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"}
        >
          <div style={{ width: 26, height: 26, borderRadius: "50%", background: "#7D0806", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 900, color: "#fff", flexShrink: 0 }}>
            {customer.first_name?.charAt(0)}{customer.last_name?.charAt(0)}
          </div>
          <span style={{ fontSize: 13 }}>{customer.first_name}</span>
        </Link>
      ) : (
        <Link href="/auth/connexion" style={{ ...btnStyle, width: "auto", padding: "0 14px", gap: 6 }}
          onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.6)"}
          onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          <span>Connexion</span>
        </Link>
      )}

      {/* Icône panier */}
      <Link href="/panier" style={{ ...btnStyle, position: "relative" }}
        onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.6)"}
        onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10a4 4 0 01-8 0" />
        </svg>
        {totalItems > 0 && (
          <div style={{ position: "absolute", top: -8, right: -8, width: 20, height: 20, borderRadius: "50%", background: "#7D0806", color: "#fff", fontSize: 11, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid #060f08" }}>
            {totalItems > 9 ? "9+" : totalItems}
          </div>
        )}
      </Link>
    </div>
  );
}
