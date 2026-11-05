"use client";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Reveler from "@/components/Reveler";
import { useLocale } from "@/context/LocaleContext";

/** Donner son avis : réservé aux clients dont le colis est livré (numéro de commande + téléphone). Publié après validation par la boutique. */
type Produit = { id: string; name: string; deja: boolean };

function Contenu() {
  const { locale } = useLocale();
  const L = (f: string, e: string) => (locale === "fr" ? f : e);
  const params = useSearchParams();
  const [numero, setNumero] = useState(params.get("commande") ?? "");
  const [tel, setTel] = useState("");
  const [infos, setInfos] = useState<{ nom: string; ville: string | null; produits: Produit[] } | null>(null);
  const [produitId, setProduitId] = useState("");
  const [note, setNote] = useState(0);
  const [texte, setTexte] = useState("");
  const [nom, setNom] = useState("");
  const [erreur, setErreur] = useState("");
  const [charge, setCharge] = useState(false);
  const [fait, setFait] = useState(false);

  async function verifier(e: React.FormEvent) {
    e.preventDefault();
    setCharge(true); setErreur("");
    try {
      const r = await fetch(`/api/reviews?numero=${encodeURIComponent(numero.trim())}&tel=${encodeURIComponent(tel)}`, { cache: "no-store" });
      const d = await r.json();
      if (!r.ok) { setErreur(d.error ?? L("Une erreur est survenue.", "An error occurred.")); setInfos(null); }
      else {
        setInfos(d);
        setNom(d.nom ?? "");
        const libre = (d.produits as Produit[]).find((p) => !p.deja);
        setProduitId(libre?.id ?? "");
      }
    } catch { setErreur(L("Connexion impossible. Réessayez.", "Connection failed. Please try again.")); }
    setCharge(false);
  }

  async function envoyer(e: React.FormEvent) {
    e.preventDefault();
    setCharge(true); setErreur("");
    try {
      const r = await fetch("/api/reviews", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ numero, tel, productId: produitId, note, texte, nom }) });
      const d = await r.json();
      if (!r.ok) setErreur(d.error ?? L("Une erreur est survenue.", "An error occurred.")); else setFait(true);
    } catch { setErreur(L("Connexion impossible. Réessayez.", "Connection failed. Please try again.")); }
    setCharge(false);
  }

  const champ: React.CSSProperties = { border: "1.5px solid var(--asta-border)", borderRadius: 12, padding: "13px 14px", fontSize: 15, background: "#fff", width: "100%", boxSizing: "border-box", fontFamily: "inherit" };
  const bouton: React.CSSProperties = { background: "var(--asta-accent)", color: "#fff", border: 0, borderRadius: 50, padding: "15px", fontWeight: 800, fontSize: 15, cursor: "pointer" };
  const restants = (infos?.produits ?? []).filter((p) => !p.deja);

  return (
    <main style={{ maxWidth: 560, margin: "0 auto", padding: "56px 20px 90px", color: "var(--asta-text)" }}>
      <Reveler />
      <Link href="/" style={{ color: "var(--asta-text2)", fontSize: 14, textDecoration: "none" }}>← NUTRELIS</Link>
      <h1 style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: "2rem", fontWeight: 800, margin: "14px 0 6px" }}>{L("Donner mon avis", "Leave my review")}</h1>

      {fait ? (
        <div style={{ marginTop: 20, background: "#fff", border: "1.5px solid var(--asta-border)", borderRadius: 20, padding: 24 }}>
          <div style={{ fontSize: 40 }}>🙏</div>
          <p style={{ fontWeight: 800, fontSize: 18, margin: "8px 0" }}>{L("Merci pour votre avis !", "Thank you for your review!")}</p>
          <p style={{ color: "var(--asta-text2)", lineHeight: 1.7 }}>{L("Il sera publié sur la page du produit après validation par notre équipe, avec la mention « Achat vérifié ».", "It will be published on the product page after review by our team, marked “Verified purchase”.")}</p>
        </div>
      ) : !infos ? (
        <>
          <p style={{ color: "var(--asta-text2)", marginBottom: 22 }}>{L("Réservé aux clients dont le colis a été livré. Saisissez le numéro de votre commande et le téléphone utilisé pour la passer.", "For customers whose parcel has been delivered. Enter your order number and the phone used to place it.")}</p>
          <form onSubmit={verifier} style={{ display: "grid", gap: 12 }}>
            <input value={numero} onChange={(e) => setNumero(e.target.value)} placeholder="NUT-000123" style={champ} autoCapitalize="characters" />
            <input value={tel} onChange={(e) => setTel(e.target.value)} placeholder={L("Téléphone (ex. 699 00 00 00)", "Phone (e.g. 699 00 00 00)")} inputMode="tel" style={champ} />
            <button type="submit" disabled={charge || !numero.trim() || tel.replace(/\D/g, "").length < 8} style={{ ...bouton, opacity: charge || !numero.trim() || tel.replace(/\D/g, "").length < 8 ? 0.55 : 1 }}>{charge ? L("Vérification…", "Checking…") : L("Continuer", "Continue")}</button>
          </form>
        </>
      ) : restants.length === 0 ? (
        <p style={{ marginTop: 20, color: "var(--asta-text2)", lineHeight: 1.7 }}>{L("Vous avez déjà donné votre avis sur tous les produits de cette commande. Merci !", "You have already reviewed every product in this order. Thank you!")}</p>
      ) : (
        <form onSubmit={envoyer} style={{ display: "grid", gap: 14, marginTop: 14 }}>
          <p style={{ color: "var(--asta-text2)", margin: 0 }}>{L(`Bonjour ${infos.nom}, comment s'est passée votre expérience ?`, `Hello ${infos.nom}, how was your experience?`)}</p>
          {restants.length > 1 && (
            <select value={produitId} onChange={(e) => setProduitId(e.target.value)} style={champ}>
              {restants.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          )}
          {restants.length === 1 && <strong>{restants[0]!.name}</strong>}
          <div role="radiogroup" aria-label={L("Note", "Rating")} style={{ display: "flex", gap: 6 }}>
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} type="button" role="radio" aria-checked={note === n} aria-label={`${n}/5`} onClick={() => setNote(n)} style={{ background: "none", border: 0, fontSize: 36, cursor: "pointer", color: n <= note ? "#f5a623" : "#ccc", padding: 2 }}>★</button>
            ))}
          </div>
          <textarea value={texte} onChange={(e) => setTexte(e.target.value)} rows={5} maxLength={1200} placeholder={L("Votre avis, avec vos mots : ce que vous avez aimé, ce qui peut être amélioré…", "Your review, in your own words: what you liked, what could be better…")} style={{ ...champ, resize: "vertical" }} />
          <label style={{ display: "grid", gap: 4, fontSize: 13, color: "var(--asta-text2)" }}>{L("Nom affiché avec votre avis", "Name shown with your review")}<input value={nom} onChange={(e) => setNom(e.target.value)} maxLength={60} style={champ} /></label>
          <p style={{ fontSize: 12.5, color: "var(--asta-text2)", margin: 0 }}>{L("Votre avis sera publié après validation, avec la mention « Achat vérifié ». Nous ne le modifions pas.", "Your review will be published after validation, marked “Verified purchase”. We do not edit it.")}</p>
          <button type="submit" disabled={charge || note === 0 || texte.trim().length < 3 || !produitId} style={{ ...bouton, opacity: charge || note === 0 || texte.trim().length < 3 || !produitId ? 0.55 : 1 }}>{charge ? L("Envoi…", "Sending…") : L("Envoyer mon avis", "Send my review")}</button>
        </form>
      )}
      {erreur && <p role="alert" style={{ color: "#b91c1c", fontWeight: 700, marginTop: 18 }}>{erreur}</p>}
    </main>
  );
}

export default function Page() {
  return <Suspense fallback={null}><Contenu /></Suspense>;
}
