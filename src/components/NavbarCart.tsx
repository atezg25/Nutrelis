"use client";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

interface NavbarCartProps {
  dark?: boolean; // true = fond sombre (blanc), false = fond clair (bordeaux)
}

export default function NavbarCart({ dark = true }: NavbarCartProps) {
  const { totalItems } = useCart();
  const { customer } = useAuth();

  const color = dark ? "#fff" : "#7D0806";
  const borderColor = dark ? "rgba(255,255,255,0.2)" : "rgba(125,8,6,0.2)";
  const borderHover = dark ? "rgba(255,255,255,0.6)" : "rgba(125,8,6,0.6)";

  const btnStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: 42,
    borderRadius: 10,
    border: `1.5px solid ${borderColor}`,
    textDecoration: "none",
    transition: "all 0.2s",
    color,
    fontSize: 13,
    fontWeight: 700,
    padding: "0 12px",
    gap: 8,
  } as React.CSSProperties;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>

      {/* Lien Mon compte */}
      {customer ? (
        <Link href="/compte" style={btnStyle}
          onMouseEnter={e => e.currentTarget.style.borderColor = borderHover}
          onMouseLeave={e => e.currentTarget.style.borderColor = borderColor}
        >
          <div style={{ width: 26, height: 26, borderRadius: "50%", background: "#7D0806", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 900, color: "#fff", flexShrink: 0 }}>
            {customer.first_name?.charAt(0)}{customer.last_name?.charAt(0)}
          </div>
          <span>{customer.first_name}</span>
        </Link>
      ) : (
        <Link href="/auth/connexion" style={btnStyle}
          onMouseEnter={e => e.currentTarget.style.borderColor = borderHover}
          onMouseLeave={e => e.currentTarget.style.borderColor = borderColor}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          <span>Connexion</span>
        </Link>
      )}

      {/* Icône panier */}
      <Link href="/panier" style={{ ...btnStyle, position: "relative", width: 42, padding: 0, justifyContent: "center" }}
        onMouseEnter={e => e.currentTarget.style.borderColor = borderHover}
        onMouseLeave={e => e.currentTarget.style.borderColor = borderColor}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10a4 4 0 01-8 0" />
        </svg>
        {totalItems > 0 && (
          <div style={{ position: "absolute", top: -8, right: -8, width: 20, height: 20, borderRadius: "50%", background: "#7D0806", color: "#fff", fontSize: 11, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", border: `2px solid ${dark ? "#060f08" : "#fff"}` }}>
            {totalItems > 9 ? "9+" : totalItems}
          </div>
        )}
      </Link>
    </div>
  );
}
