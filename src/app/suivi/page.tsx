"use client";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Reveler from "@/components/Reveler";
import { useLocale } from "@/context/LocaleContext";

/** Suivi de commande pour le client : numéro + téléphone de la commande. Aucune connexion, aucun compte. */
type Suivi = {
  numero: string; statut: string; paiement: string; total: number; client: string;
  colis: { statut: string; transporteur: string | null; suivi: string | null; expedieLe: string; livreLe: string | null; evenements: { at: string; status: string; note: string | null }[] } | null;
};

function Contenu() {
  const { locale } = useLocale();
  const fr = locale === "fr";
  const L = (f: string, e: string) => (fr ? f : e);
  const params = useSearchParams();
  const [numero, setNumero] = useState(params.get("commande") ?? "");
  const [tel, setTel] = useState("");
  const [res, setRes] = useState<Suivi | null>(null);
  const [erreur, setErreur] = useState("");
  const [charge, setCharge] = useState(false);

  const STATUT_COMMANDE: Record<string, string> = {
    nouvelle: L("Commande reçue", "Order received"), confirmee: L("Commande confirmée", "Order confirmed"), expediee: L("Colis expédié", "Parcel shipped"),
    livree: L("Livrée", "Delivered"), annulee: L("Annulée", "Cancelled"),
  };
  const STATUT_COLIS: Record<string, string> = {
    expediee: L("Colis expédié", "Parcel shipped"), en_livraison: L("En cours de livraison", "Out for delivery"), livree: L("Livré", "Delivered"),
    echec: L("Livraison non aboutie", "Delivery attempt failed"), retournee: L("Colis retourné", "Parcel returned"),
  };
  const PAIEMENT: Record<string, string> = {
    payee: L("Payée", "Paid"), en_attente: L("Paiement en attente", "Payment pending"), a_la_livraison: L("À payer à la livraison", "Pay on delivery"),
    echouee: L("Paiement échoué", "Payment failed"), remboursee: L("Remboursée", "Refunded"),
  };
  const date = (s: string) => new Date(s).toLocaleString(fr ? "fr-FR" : "en-GB", { day: "2-digit", month: "long", hour: "2-digit", minute: "2-digit" });

  async function chercher(e: React.FormEvent) {
    e.preventDefault();
    setCharge(true); setErreur(""); setRes(null);
    try {
      const r = await fetch(`/api/orders/${encodeURIComponent(numero.trim())}?tel=${encodeURIComponent(tel)}`, { cache: "no-store" });
      const d = await r.json();
      if (!r.ok) setErreur(r.status === 404 ? L("Commande introuvable. Vérifiez le numéro et le téléphone utilisés pour la commande.", "Order not found. Check the number and the phone used for the order.") : L("Une erreur est survenue. Réessayez.", "An error occurred. Please try again."));
      else setRes(d as Suivi);
    } catch {
      setErreur(L("Connexion impossible. Réessayez.", "Connection failed. Please try again."));
    }
    setCharge(false);
  }

  const champ: React.CSSProperties = { border: "1.5px solid var(--asta-border)", borderRadius: 12, padding: "13px 14px", fontSize: 15, background: "#fff", width: "100%", boxSizing: "border-box" };
  return (
    <main style={{ maxWidth: 620, margin: "0 auto", padding: "56px 20px 90px", color: "var(--asta-text)" }}>
      <Reveler />
      <Link href="/" style={{ color: "var(--asta-text2)", fontSize: 14, textDecoration: "none" }}>← NUTRELIS</Link>
      <h1 style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: "2rem", fontWeight: 800, margin: "14px 0 6px" }}>{L("Suivre ma commande", "Track my order")}</h1>
      <p style={{ color: "var(--asta-text2)", marginBottom: 24 }}>{L("Saisissez le numéro de votre commande (NUT-000123) et le téléphone utilisé pour commander.", "Enter your order number (NUT-000123) and the phone used to order.")}</p>
      <form onSubmit={chercher} style={{ display: "grid", gap: 12 }}>
        <input value={numero} onChange={(e) => setNumero(e.target.value)} placeholder="NUT-000123" style={champ} autoCapitalize="characters" />
        <input value={tel} onChange={(e) => setTel(e.target.value)} placeholder={L("Téléphone (ex. 699 00 00 00)", "Phone (e.g. 699 00 00 00)")} inputMode="tel" style={champ} />
        <button type="submit" disabled={charge || !numero.trim() || tel.replace(/\D/g, "").length < 8} style={{ background: "var(--asta-accent)", color: "#fff", border: 0, borderRadius: 50, padding: "15px", fontWeight: 800, fontSize: 15, cursor: "pointer", opacity: charge || !numero.trim() || tel.replace(/\D/g, "").length < 8 ? 0.55 : 1 }}>
          {charge ? L("Recherche…", "Searching…") : L("Suivre", "Track")}
        </button>
      </form>
      {erreur && <p style={{ color: "#b91c1c", fontWeight: 700, marginTop: 18 }}>{erreur}</p>}
      {res && (
        <section style={{ marginTop: 28, background: "#fff", border: "1.5px solid var(--asta-border)", borderRadius: 20, padding: 22 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
            <strong style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: 18 }}>{res.numero}</strong>
            <span style={{ background: "var(--asta-bg2)", color: "var(--asta-accent)", fontWeight: 800, fontSize: 13, padding: "4px 12px", borderRadius: 20 }}>{res.colis ? STATUT_COLIS[res.colis.statut] ?? res.colis.statut : STATUT_COMMANDE[res.statut] ?? res.statut}</span>
          </div>
          <p style={{ color: "var(--asta-text2)", fontSize: 14, margin: "10px 0 0" }}>{res.total.toLocaleString("fr-FR")} FCFA · {PAIEMENT[res.paiement] ?? res.paiement}</p>
          {res.colis && (
            <p style={{ fontSize: 14, margin: "8px 0 0" }}>
              {res.colis.transporteur && <>{L("Transporteur", "Carrier")} : <strong>{res.colis.transporteur}</strong> </>}
              {res.colis.suivi && <>· {L("Suivi", "Tracking")} : <strong>{res.colis.suivi}</strong></>}
            </p>
          )}
          {res.colis && res.colis.evenements.length > 0 && (
            <ol style={{ listStyle: "none", padding: 0, margin: "18px 0 0", display: "grid", gap: 14 }}>
              {[...res.colis.evenements].reverse().map((e, i) => (
                <li key={i} style={{ display: "flex", gap: 12 }}>
                  <span style={{ width: 12, height: 12, borderRadius: "50%", background: i === 0 ? "var(--asta-accent)" : "var(--asta-border)", marginTop: 5, flexShrink: 0 }} />
                  <div><div style={{ fontWeight: 700, fontSize: 14 }}>{STATUT_COLIS[e.status] ?? e.status}</div><div style={{ color: "var(--asta-text2)", fontSize: 12.5 }}>{date(e.at)}{e.note ? ` · ${e.note}` : ""}</div></div>
                </li>
              ))}
            </ol>
          )}
          {!res.colis && res.statut !== "annulee" && <p style={{ color: "var(--asta-text2)", fontSize: 14, marginTop: 14 }}>{L("Votre commande est en préparation. Vous pourrez suivre ici son expédition dès qu'elle sera partie.", "Your order is being prepared. You will be able to follow its shipment here once it has left.")}</p>}
        </section>
      )}
    </main>
  );
}

export default function Page() {
  return <Suspense fallback={null}><Contenu /></Suspense>;
}
