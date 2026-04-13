"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useLocale } from "@/context/LocaleContext";
import { useScreenSize } from "@/hooks/useIsMobile";

export default function Compte() {
  const { t } = useLocale();
  const screen = useScreenSize();
  const isMobile = screen === "mobile";
  const { customer, loading, deconnecter } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !customer) router.push("/auth/connexion");
  }, [customer, loading, router]);

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#f8f5f5", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <img src="/images/logo-product.png" alt="Nutrelis" style={{ height: 40, width: "auto", margin: "0 auto 16px", display: "block" }} />
        <p style={{ fontFamily: "var(--font-sora), sans-serif", color: "#7D0806", fontWeight: 700 }}>{t("account.loading")}</p>
      </div>
    </div>
  );

  if (!customer) return null;

  const initiales = `${customer.first_name?.charAt(0) || ""}${customer.last_name?.charAt(0) || ""}`.toUpperCase();

  return (
    <div style={{ minHeight: "100vh", background: "#f8f5f5" }}>

      {/* NAVBAR */}
      <nav style={{ background: "#fff", borderBottom: "1px solid #f0e8e8", padding: isMobile ? "0 16px" : "0 40px", height: isMobile ? 56 : 68, display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 2px 12px rgba(125,8,6,0.06)" }}>
        <Link href="/" style={{ textDecoration: "none", flexShrink: 0 }}>
          <img src="/images/logo-product.png" alt="Nutrelis" style={{ height: isMobile ? 28 : 36, width: "auto" }} />
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 8 : 16 }}>
          {!isMobile && <span style={{ fontSize: 14, color: "#555" }}>{t("account.hello")} <strong>{customer.first_name}</strong></span>}
          <button onClick={async () => { deconnecter(); router.push("/"); }}
            style={{ background: "#fdecea", border: "none", color: "#7D0806", padding: isMobile ? "6px 12px" : "8px 16px", borderRadius: 8, fontSize: isMobile ? 12 : 13, fontWeight: 700, cursor: "pointer" }}>
            {t("account.logout")}
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: isMobile ? "24px 16px" : "40px 24px" }}>

        {/* Hero card */}
        <div style={{ background: "linear-gradient(135deg, #7D0806 0%, #a01010 50%, #c41515 100%)", borderRadius: isMobile ? 16 : 24, padding: isMobile ? "24px 20px" : "40px", marginBottom: isMobile ? 20 : 32, display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 16px 48px rgba(125,8,6,0.25)", overflow: "hidden", position: "relative" }}>
          <div style={{ position: "absolute", top: -60, right: -60, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
          <div style={{ position: "absolute", bottom: -80, left: 200, width: 250, height: 250, borderRadius: "50%", background: "rgba(255,255,255,0.03)" }} />
          <div style={{ position: "relative", zIndex: 1, minWidth: 0 }}>
            <p style={{ color: "rgba(255,255,255,0.65)", fontSize: isMobile ? 12 : 14, marginBottom: 8, letterSpacing: 1 }}>{t("account.spaceLabel")}</p>
            <h1 style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: isMobile ? "1.3rem" : "2rem", fontWeight: 900, color: "#fff", marginBottom: 8 }}>
              {t("account.hello")} {customer.first_name} ! 👋
            </h1>
            <p style={{ color: "rgba(255,255,255,0.65)", fontSize: isMobile ? 12 : 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{customer.email}</p>
            {customer.phone && <p style={{ color: "rgba(255,255,255,0.65)", fontSize: isMobile ? 12 : 14 }}>📱 {customer.phone}</p>}
          </div>
          <div style={{ width: isMobile ? 56 : 80, height: isMobile ? 56 : 80, borderRadius: "50%", background: "rgba(255,255,255,0.15)", border: "3px solid rgba(255,255,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: isMobile ? 20 : 28, color: "#fff", fontWeight: 900, fontFamily: "var(--font-sora), sans-serif", flexShrink: 0, position: "relative", zIndex: 1, marginLeft: isMobile ? 12 : 0 }}>
            {initiales}
          </div>
        </div>

        {/* Cards menu */}
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: isMobile ? 12 : 20, marginBottom: isMobile ? 20 : 32 }}>
          {[
            { href: "/compte/commandes", icon: "📦", titre: t("account.ordersTitle"), desc: t("account.ordersDesc"), couleur: "#fff3f3", bordure: "#fdd" },
            { href: "/compte/profil", icon: "👤", titre: t("account.profileTitle"), desc: t("account.profileDesc"), couleur: "#f3f8ff", bordure: "#ddeeff" },
            { href: "/produits/astaxanthine-12mg", icon: "🛒", titre: t("account.reorderTitle"), desc: t("account.reorderDesc"), couleur: "#f3fff5", bordure: "#ddfde5" },
          ].map((item, i) => (
            <Link key={i} href={item.href} style={{ textDecoration: "none" }}>
              <div style={{ background: item.couleur, borderRadius: isMobile ? 14 : 20, padding: isMobile ? "20px 18px" : "28px 24px", border: `1px solid ${item.bordure}`, cursor: "pointer", transition: "all 0.2s", height: "100%", display: isMobile ? "flex" : "block", alignItems: "center", gap: isMobile ? 16 : undefined }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-6px)"; e.currentTarget.style.boxShadow = "0 12px 32px rgba(125,8,6,0.12)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
              >
                <div style={{ fontSize: isMobile ? 32 : 40, marginBottom: isMobile ? 0 : 16, flexShrink: 0 }}>{item.icon}</div>
                <div>
                  <h3 style={{ fontFamily: "var(--font-sora), sans-serif", fontWeight: 800, fontSize: isMobile ? 14 : 16, marginBottom: 4, color: "#1a1a1a" }}>{item.titre}</h3>
                  <p style={{ color: "#777", fontSize: isMobile ? 12 : 13, lineHeight: 1.6, margin: 0 }}>{item.desc}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Bannière produit */}
        <div style={{ background: "#fff", borderRadius: isMobile ? 14 : 20, padding: isMobile ? "20px 18px" : "28px 32px", border: "1px solid #f0e8e8", display: "flex", flexDirection: isMobile ? "column" : "row", alignItems: isMobile ? "stretch" : "center", justifyContent: "space-between", gap: isMobile ? 16 : 0 }}>
          <div>
            <p style={{ color: "#7D0806", fontSize: 12, fontWeight: 700, letterSpacing: 2, marginBottom: 8 }}>{t("account.healthProgram")}</p>
            <h3 style={{ fontFamily: "var(--font-sora), sans-serif", fontWeight: 800, fontSize: isMobile ? 16 : 18, marginBottom: 8 }}>{t("account.healthProductTitle")}</h3>
            <p style={{ color: "#777", fontSize: isMobile ? 13 : 14 }}>{t("account.healthProductDesc")}</p>
          </div>
          <Link href="/produits/astaxanthine-12mg" style={{ background: "#7D0806", color: "#fff", padding: "14px 24px", borderRadius: 12, textDecoration: "none", fontWeight: 800, fontSize: 14, whiteSpace: "nowrap", boxShadow: "0 6px 20px rgba(125,8,6,0.3)", textAlign: "center" }}>
            {t("account.orderBtn")}
          </Link>
        </div>
      </div>
    </div>
  );
}
