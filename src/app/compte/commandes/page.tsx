"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { medusa } from "@/lib/medusa";

export default function Commandes() {
  const { customer, loading } = useAuth();
  const router = useRouter();
  const [commandes, setCommandes] = useState<any[]>([]);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    if (!loading && !customer) router.push("/auth/connexion");
  }, [customer, loading, router]);

  useEffect(() => {
    if (!customer) return;
    medusa.store.order.list()
      .then(({ orders }) => setCommandes(orders))
      .catch(() => setCommandes([]))
      .finally(() => setChargement(false));
  }, [customer]);

  if (loading || chargement) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p>Chargement...</p>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fa" }}>
      <nav style={{ background: "#7D0806", padding: "0 60px", height: 68, display: "flex", alignItems: "center", gap: 16 }}>
        <Link href="/compte" style={{ color: "rgba(255,255,255,0.7)", textDecoration: "none", fontSize: 14 }}>← Mon compte</Link>
        <span style={{ color: "rgba(255,255,255,0.4)" }}>|</span>
        <span style={{ fontFamily: "var(--font-sora), sans-serif", fontWeight: 800, fontSize: 16, color: "#fff" }}>Mes commandes</span>
      </nav>

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "48px 24px" }}>
        <h1 style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: "1.6rem", fontWeight: 800, marginBottom: 32 }}>Mes commandes</h1>

        {commandes.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 40px", background: "#fff", borderRadius: 20, border: "1px solid #eee" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📦</div>
            <h2 style={{ fontFamily: "var(--font-sora), sans-serif", fontWeight: 800, marginBottom: 12 }}>Aucune commande</h2>
            <p style={{ color: "#888", marginBottom: 24 }}>Vous n'avez pas encore passé de commande.</p>
            <Link href="/produits/astaxanthine-12mg" style={{ background: "#7D0806", color: "#fff", padding: "14px 28px", borderRadius: 10, textDecoration: "none", fontWeight: 800, fontSize: 14 }}>
              Commander maintenant →
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {commandes.map((cmd, i) => (
              <div key={i} style={{ background: "#fff", borderRadius: 16, padding: "24px", border: "1px solid #eee" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <div>
                    <p style={{ fontWeight: 800, fontSize: 15 }}>Commande #{cmd.display_id}</p>
                    <p style={{ color: "#888", fontSize: 13 }}>{new Date(cmd.created_at).toLocaleDateString("fr-FR")}</p>
                  </div>
                  <span style={{ background: cmd.status === "completed" ? "#f0faf2" : "#fdecea", color: cmd.status === "completed" ? "#1db954" : "#7D0806", padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
                    {cmd.status === "completed" ? "✅ Livrée" : cmd.status === "pending" ? "⏳ En cours" : cmd.status}
                  </span>
                </div>
                <div style={{ borderTop: "1px solid #f0f0f0", paddingTop: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <p style={{ color: "#555", fontSize: 14 }}>{cmd.items?.length} article(s)</p>
                  <p style={{ fontWeight: 900, fontSize: 16, color: "#7D0806" }}>{(cmd.total / 100).toLocaleString()} FCFA</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
