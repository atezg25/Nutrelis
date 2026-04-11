"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function Compte() {
  const { customer, loading, deconnecter } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !customer) router.push("/auth/connexion");
  }, [customer, loading, router]);

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#f8f5f5", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 48, height: 48, borderRadius: 12, background: "#7D0806", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900, fontSize: 20, margin: "0 auto 16px" }}>N</div>
        <p style={{ fontFamily: "var(--font-sora), sans-serif", color: "#7D0806", fontWeight: 700 }}>Chargement...</p>
      </div>
    </div>
  );

  if (!customer) return null;

  const initiales = `${customer.first_name?.charAt(0) || ""}${customer.last_name?.charAt(0) || ""}`.toUpperCase();

  return (
    <div style={{ minHeight: "100vh", background: "#f8f5f5" }}>
      
      {/* NAVBAR */}
      <nav style={{ background: "#fff", borderBottom: "1px solid #f0e8e8", padding: "0 40px", height: 68, display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 2px 12px rgba(125,8,6,0.06)" }}>
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: "#7D0806", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900, fontSize: 16 }}>N</div>
          <span style={{ fontFamily: "var(--font-sora), sans-serif", fontWeight: 800, fontSize: 18, letterSpacing: 3, color: "#7D0806" }}>NUTRELIS</span>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ fontSize: 14, color: "#555" }}>Bonjour, <strong>{customer.first_name}</strong></span>
          <button onClick={async () => { deconnecter(); router.push("/"); }}
            style={{ background: "#fdecea", border: "none", color: "#7D0806", padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
            Déconnexion
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "40px 24px" }}>

        {/* Hero card */}
        <div style={{ background: "linear-gradient(135deg, #7D0806 0%, #a01010 50%, #c41515 100%)", borderRadius: 24, padding: "40px", marginBottom: 32, display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 16px 48px rgba(125,8,6,0.25)", overflow: "hidden", position: "relative" }}>
          <div style={{ position: "absolute", top: -60, right: -60, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
          <div style={{ position: "absolute", bottom: -80, left: 200, width: 250, height: 250, borderRadius: "50%", background: "rgba(255,255,255,0.03)" }} />
          <div style={{ position: "relative", zIndex: 1 }}>
            <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 14, marginBottom: 8, letterSpacing: 1 }}>MON ESPACE NUTRELIS</p>
            <h1 style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: "2rem", fontWeight: 900, color: "#fff", marginBottom: 8 }}>
              Bonjour, {customer.first_name} ! 👋
            </h1>
            <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 14 }}>{customer.email}</p>
            {customer.phone && <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 14 }}>📱 {customer.phone}</p>}
          </div>
          <div style={{ width: 80, height: 80, borderRadius: "50%", background: "rgba(255,255,255,0.15)", border: "3px solid rgba(255,255,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, color: "#fff", fontWeight: 900, fontFamily: "var(--font-sora), sans-serif", flexShrink: 0, position: "relative", zIndex: 1 }}>
            {initiales}
          </div>
        </div>

        {/* Cards menu */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, marginBottom: 32 }}>
          {[
            { href: "/compte/commandes", icon: "📦", titre: "Mes commandes", desc: "Suivez vos commandes et livraisons en temps réel", couleur: "#fff3f3", bordure: "#fdd" },
            { href: "/compte/profil", icon: "👤", titre: "Mon profil", desc: "Gérez vos informations personnelles et adresse", couleur: "#f3f8ff", bordure: "#ddeeff" },
            { href: "/produits/astaxanthine-12mg", icon: "🛒", titre: "Commander à nouveau", desc: "Rechargez votre stock NUTRELIS Astaxanthine", couleur: "#f3fff5", bordure: "#ddfde5" },
          ].map((item, i) => (
            <Link key={i} href={item.href} style={{ textDecoration: "none" }}>
              <div style={{ background: item.couleur, borderRadius: 20, padding: "28px 24px", border: `1px solid ${item.bordure}`, cursor: "pointer", transition: "all 0.2s", height: "100%" }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-6px)"; e.currentTarget.style.boxShadow = "0 12px 32px rgba(125,8,6,0.12)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
              >
                <div style={{ fontSize: 40, marginBottom: 16 }}>{item.icon}</div>
                <h3 style={{ fontFamily: "var(--font-sora), sans-serif", fontWeight: 800, fontSize: 16, marginBottom: 8, color: "#1a1a1a" }}>{item.titre}</h3>
                <p style={{ color: "#777", fontSize: 13, lineHeight: 1.6, margin: 0 }}>{item.desc}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Bannière produit */}
        <div style={{ background: "#fff", borderRadius: 20, padding: "28px 32px", border: "1px solid #f0e8e8", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <p style={{ color: "#7D0806", fontSize: 12, fontWeight: 700, letterSpacing: 2, marginBottom: 8 }}>VOTRE PROGRAMME SANTÉ</p>
            <h3 style={{ fontFamily: "var(--font-sora), sans-serif", fontWeight: 800, fontSize: 18, marginBottom: 8 }}>Astaxanthine 12mg — Pack disponible</h3>
            <p style={{ color: "#777", fontSize: 14 }}>L'antioxydant le plus puissant au monde. 6000× la Vitamine C.</p>
          </div>
          <Link href="/produits/astaxanthine-12mg" style={{ background: "#7D0806", color: "#fff", padding: "14px 24px", borderRadius: 12, textDecoration: "none", fontWeight: 800, fontSize: 14, whiteSpace: "nowrap", boxShadow: "0 6px 20px rgba(125,8,6,0.3)" }}>
            Commander →
          </Link>
        </div>
      </div>
    </div>
  );
}
