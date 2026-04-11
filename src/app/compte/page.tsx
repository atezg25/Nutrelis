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
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: 18 }}>Chargement...</p>
    </div>
  );

  if (!customer) return null;

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fa" }}>
      {/* NAVBAR */}
      <nav style={{ background: "#7D0806", padding: "0 60px", height: 68, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", color: "#7D0806", fontWeight: 900, fontSize: 16 }}>N</div>
          <span style={{ fontFamily: "var(--font-sora), sans-serif", fontWeight: 800, fontSize: 20, letterSpacing: 3, color: "#fff" }}>NUTRELIS</span>
        </Link>
        <button onClick={async () => { await deconnecter(); router.push("/"); }}
          style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)", color: "#fff", padding: "8px 20px", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
          Se déconnecter
        </button>
      </nav>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "48px 24px" }}>
        
        {/* Bienvenue */}
        <div style={{ background: "#7D0806", borderRadius: 20, padding: "32px 40px", marginBottom: 32, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 14, marginBottom: 8 }}>Bienvenue,</p>
            <h1 style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: "1.8rem", fontWeight: 900, color: "#fff", marginBottom: 4 }}>
              {customer.first_name} {customer.last_name}
            </h1>
            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 14 }}>{customer.email}</p>
          </div>
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, color: "#fff", fontWeight: 900 }}>
            {customer.first_name.charAt(0)}{customer.last_name.charAt(0)}
          </div>
        </div>

        {/* Menu */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
          {[
            { href: "/compte/commandes", icon: "📦", titre: "Mes commandes", desc: "Suivez vos commandes et livraisons" },
            { href: "/compte/profil", icon: "👤", titre: "Mon profil", desc: "Gérez vos informations personnelles" },
            { href: "/produits/astaxanthine-12mg", icon: "🛒", titre: "Commander à nouveau", desc: "Rechargez votre stock NUTRELIS" },
          ].map((item, i) => (
            <Link key={i} href={item.href} style={{ textDecoration: "none" }}>
              <div style={{ background: "#fff", borderRadius: 16, padding: "28px 24px", border: "1px solid #eee", boxShadow: "0 2px 12px rgba(0,0,0,0.05)", transition: "all 0.2s", cursor: "pointer" }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(125,8,6,0.12)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.05)"; }}
              >
                <div style={{ fontSize: 36, marginBottom: 16 }}>{item.icon}</div>
                <h3 style={{ fontFamily: "var(--font-sora), sans-serif", fontWeight: 800, fontSize: 16, marginBottom: 8, color: "#1a1a1a" }}>{item.titre}</h3>
                <p style={{ color: "#888", fontSize: 13, lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
