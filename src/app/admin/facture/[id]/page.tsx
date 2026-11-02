"use client";
import { use, useEffect, useState } from "react";

/**
 * FACTURE / REÇU d'une commande — à imprimer ou à enregistrer en PDF (A4). Montre les articles, la remise (code promo),
 * la livraison, le total et l'état du paiement. Ouverte depuis la fiche d'une commande dans la console (connexion requise).
 */
type Ligne = Record<string, string | number | boolean | null>;
type Donnees = { commande: Ligne; items: { name: string; unit_fcfa: number; qty: number }[]; paiements: Ligne[] };

const fcfa = (n: unknown) => `${Number(n ?? 0).toLocaleString("fr-FR")} FCFA`;
const LIB_PAIEMENT: Record<string, string> = { en_attente: "En attente de paiement", payee: "PAYÉE", echouee: "Paiement échoué", a_la_livraison: "À régler à la livraison", remboursee: "Remboursée" };

export default function Facture({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [d, setD] = useState<Donnees | null>(null);
  const [tel, setTel] = useState("");
  const [erreur, setErreur] = useState("");
  useEffect(() => {
    void fetch(`/api/admin/orders/${id}`, { cache: "no-store" })
      .then(async (r) => (r.ok ? setD((await r.json()) as Donnees) : setErreur(r.status === 401 ? "Connectez-vous à la console pour imprimer cette facture." : "Commande introuvable.")))
      .catch(() => setErreur("Chargement impossible."));
    void fetch("/api/shop-settings").then((r) => r.json()).then((s: { contact?: { whatsapp?: string } }) => setTel(s.contact?.whatsapp ?? "")).catch(() => undefined);
  }, [id]);

  if (erreur) return <p style={{ padding: 30, fontFamily: "system-ui" }}>{erreur}</p>;
  if (!d) return <p style={{ padding: 30, fontFamily: "system-ui" }}>Chargement…</p>;
  const c = d.commande;
  const remise = Number(c.discount_fcfa ?? 0);
  const payee = c.payment_status === "payee";

  return (
    <div style={{ background: "#fff", minHeight: "100vh", padding: 16, fontFamily: "Inter, system-ui, sans-serif", color: "#16201a" }}>
      <style>{`@media print { .no-print { display: none !important; } body { background: #fff !important; } @page { size: A4; margin: 14mm; } }`}</style>
      <div className="no-print" style={{ maxWidth: 780, margin: "0 auto 16px", display: "flex", gap: 10 }}>
        <button onClick={() => window.print()} style={{ background: "#1f7a3a", color: "#fff", border: 0, borderRadius: 10, padding: "11px 18px", fontWeight: 700, cursor: "pointer", fontSize: 15 }}>🖨️ Imprimer / enregistrer en PDF</button>
        <button onClick={() => window.close()} style={{ background: "#fff", border: "1px solid #bbb", borderRadius: 10, padding: "11px 18px", cursor: "pointer", fontSize: 15 }}>Fermer</button>
      </div>
      <div style={{ maxWidth: 780, margin: "0 auto", border: "1px solid #e3e9e3", borderRadius: 14, padding: 32 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", borderBottom: "2px solid #1f7a3a", paddingBottom: 16 }}>
          <div>
            <div style={{ fontWeight: 900, fontSize: 28, letterSpacing: -0.5, color: "#1f7a3a" }}>NUTRELIS</div>
            <div style={{ fontSize: 13, color: "#5b665e", marginTop: 4 }}>nutrelis.bio{tel ? ` · WhatsApp +${tel}` : ""}<br />Livraison partout au Cameroun</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 12, letterSpacing: 2, fontWeight: 700, color: "#5b665e" }}>FACTURE</div>
            <div style={{ fontWeight: 800, fontSize: 22 }}>{String(c.number)}</div>
            <div style={{ fontSize: 13, color: "#5b665e" }}>{new Date(String(c.created_at)).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })}</div>
          </div>
        </div>
        <div style={{ margin: "22px 0", display: "grid", gap: 4 }}>
          <div style={{ fontSize: 11, letterSpacing: 1.5, fontWeight: 700, color: "#5b665e" }}>FACTURÉ À</div>
          <div style={{ fontWeight: 800, fontSize: 17 }}>{String(c.customer_name)}</div>
          <div style={{ fontSize: 14 }}>{String(c.phone)}{c.email ? ` · ${String(c.email)}` : ""}</div>
          <div style={{ fontSize: 14 }}>{[c.address, c.city].filter(Boolean).join(", ")}</div>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <thead><tr style={{ background: "#f3f6f3" }}>{["Article", "Prix unitaire", "Qté", "Total"].map((t, i) => <th key={t} style={{ textAlign: i === 0 ? "left" : "right", padding: "10px 12px", fontSize: 12, letterSpacing: 0.5, textTransform: "uppercase" }}>{t}</th>)}</tr></thead>
          <tbody>
            {d.items.map((it, i) => (
              <tr key={i} style={{ borderBottom: "1px solid #eef2ee" }}>
                <td style={{ padding: "10px 12px" }}>{it.name}</td>
                <td style={{ padding: "10px 12px", textAlign: "right" }}>{fcfa(it.unit_fcfa)}</td>
                <td style={{ padding: "10px 12px", textAlign: "right" }}>{it.qty}</td>
                <td style={{ padding: "10px 12px", textAlign: "right", fontWeight: 700 }}>{fcfa(it.unit_fcfa * it.qty)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ marginLeft: "auto", marginTop: 16, maxWidth: 320, display: "grid", gap: 6, fontSize: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}><span>Sous-total</span><span>{fcfa(c.subtotal_fcfa)}</span></div>
          {remise > 0 && <div style={{ display: "flex", justifyContent: "space-between", color: "#1f7a3a", fontWeight: 700 }}><span>Remise{c.promo_code ? ` (${String(c.promo_code)})` : ""}</span><span>−{fcfa(remise)}</span></div>}
          <div style={{ display: "flex", justifyContent: "space-between" }}><span>Livraison</span><span>{Number(c.delivery_fcfa) > 0 ? fcfa(c.delivery_fcfa) : "Offerte"}</span></div>
          <div style={{ display: "flex", justifyContent: "space-between", borderTop: "2px solid #16201a", paddingTop: 8, fontWeight: 900, fontSize: 18 }}><span>TOTAL</span><span>{fcfa(c.total_fcfa)}</span></div>
        </div>
        <div style={{ marginTop: 22, padding: "12px 16px", borderRadius: 10, background: payee ? "#e8f5eb" : "#fff7e6", border: `1px solid ${payee ? "#c8e6d0" : "#f1c27d"}`, fontWeight: 800, textAlign: "center" }}>
          {LIB_PAIEMENT[String(c.payment_status)] ?? String(c.payment_status)}
        </div>
        <p style={{ textAlign: "center", color: "#5b665e", fontSize: 13, marginTop: 24 }}>Merci pour votre confiance 🌿 — NUTRELIS</p>
      </div>
    </div>
  );
}
