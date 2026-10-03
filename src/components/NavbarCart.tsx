"use client";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useScreenSize } from "@/hooks/useIsMobile";
import { useLocale } from "@/context/LocaleContext";
import { useEffect, useRef, useState } from "react";

interface NavbarCartProps {
  dark?: boolean; // true = fond sombre (blanc), false = fond clair (bordeaux)
}

export default function NavbarCart({ dark = true }: NavbarCartProps) {
  const { totalItems } = useCart();
  const isMobile = useScreenSize() === "mobile";
  const { t } = useLocale();
  const [bouncing, setBouncing] = useState(false);
  const prevItems = useRef(totalItems);

  useEffect(() => {
    if (totalItems > prevItems.current) {
      setBouncing(true);
      const timer = setTimeout(() => setBouncing(false), 600);
      return () => clearTimeout(timer);
    }
    prevItems.current = totalItems;
  }, [totalItems]);

  const color = dark ? "#fff" : "#7D0806";
  const borderColor = dark ? "rgba(255,255,255,0.2)" : "rgba(125,8,6,0.2)";
  const borderHover = dark ? "rgba(255,255,255,0.6)" : "rgba(125,8,6,0.6)";

  const size = isMobile ? 36 : 42;

  const btnStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: size,
    borderRadius: 10,
    border: `1.5px solid ${borderColor}`,
    textDecoration: "none",
    transition: "all 0.2s",
    color,
    fontSize: 13,
    fontWeight: 700,
    padding: isMobile ? 0 : "0 12px",
    gap: isMobile ? 0 : 8,
    width: isMobile ? size : undefined,
  } as React.CSSProperties;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 6 : 10 }}>

      {/* Icône panier */}
      <Link href="/panier" style={{ ...btnStyle, position: "relative", width: size, padding: 0, justifyContent: "center" }}
        onMouseEnter={e => e.currentTarget.style.borderColor = borderHover}
        onMouseLeave={e => e.currentTarget.style.borderColor = borderColor}
      >
        <svg width={isMobile ? 18 : 20} height={isMobile ? 18 : 20} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10a4 4 0 01-8 0" />
        </svg>
        {totalItems > 0 && (
          <div style={{
            position: "absolute", top: -8, right: -8, width: 20, height: 20, borderRadius: "50%",
            background: "#7D0806", color: "#fff", fontSize: 11, fontWeight: 900,
            display: "flex", alignItems: "center", justifyContent: "center",
            border: `2px solid ${dark ? "#060f08" : "#fff"}`,
            animation: bouncing ? "cartBounce 0.6s ease" : "none",
          }}>
            {totalItems > 9 ? "9+" : totalItems}
          </div>
        )}
      </Link>
    </div>
  );
}
