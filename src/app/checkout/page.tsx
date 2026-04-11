"use client";
import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
export default function Checkout() {
  const { items, totalPrix, viderPanier } = useCart();
  const [etape, setEtape] = useState<"formulaire" | "paiement" | "confirmation">("formulaire");
  const [modePaiement, setModePaiement] = useState<"mobile_money" | "orange_money" | "carte" | null>(null);
  const [form, setForm] = useState({
    nom: "", prenom: "", email: "", telephone: "",
    adresse: "", ville: "", quartier: "",
  });

const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState("");

  const handleSubmit = () => {
    if (!form.nom || !form.prenom || !form.telephone || !form.adresse) return;
    setEtape("paiement");
  };

  const handlePaiement = async () => {
    if (!modePaiement || modePaiement === "carte") return;
    setChargement(true);
    setErreur("");

    try {
      const res = await fetch("/api/notchpay/init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          telephone: form.telephone,
          nom: form.nom,
          prenom: form.prenom,
          montant: totalPrix,
          description: items.map(i => i.description).join(", "),
          items: items,
          adresse: form.adresse,
          ville: form.ville,
          quartier: form.quartier,
        }),
      });

      const data = await res.json();

      if (data.authorization_url) {
        window.location.href = data.authorization_url;
      } else {
        setErreur(data.error || "Erreur lors de l'initialisation du paiement");
      }
    } catch {
      setErreur("Erreur réseau. Réessayez.");
    } finally {
      setChargement(false);
    }
  };

  // PAGE CONFIRMATION
  if (etape === "confirmation") {
    return (
      <div style={{ background: "#fff", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", maxWidth: 560, padding: "60px 40px" }}>
          <div style={{ fontSize: 72, marginBottom: 24 }}>🎉</div>
          <h1 style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: "2rem", fontWeight: 900, marginBottom: 16, color: "#1a1a1a" }}>
            Commande confirmée !
          </h1>
          <p style={{ color: "#555", fontSize: 16, lineHeight: 1.8, marginBottom: 12 }}>
            Merci <strong>{form.prenom} {form.nom}</strong> pour votre commande.
          </p>
          <p style={{ color: "#555", fontSize: 15, lineHeight: 1.8, marginBottom: 36 }}>
            Vous recevrez une confirmation par email sous peu. Votre commande sera expédiée via <strong>ATEZ Express</strong> dans les 24h.
          </p>
          <div style={{ background: "#f0faf2", border: "1px solid #c8e6d0", borderRadius: 16, padding: "24px", marginBottom: 36 }}>
            {[
              { label: "Livraison", val: "4 à 7 jours ouvrés" },
              { label: "Adresse", val: `${form.adresse}, ${form.quartier}, ${form.ville}` },
              { label: "Contact", val: form.telephone },
            ].map((r, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: i < 2 ? "1px solid #c8e6d0" : "none", fontSize: 14 }}>
                <span style={{ color: "#888" }}>{r.label}</span>
                <span style={{ fontWeight: 700, color: "#1a1a1a" }}>{r.val}</span>
              </div>
            ))}
          </div>
          <Link href="/" style={{ background: "var(--accent)", color: "#060f08", padding: "16px 40px", borderRadius: 10, fontSize: 15, fontWeight: 800, textDecoration: "none", fontFamily: "var(--font-sora), sans-serif" }}>
            Retour à l'accueil →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "#f8f9fa", color: "#1a1a1a", minHeight: "100vh" }}>

      {/* NAVBAR */}
      <nav style={{ background: "#060f08", borderBottom: "1px solid #1a3522", padding: "0 60px", height: 68, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", color: "#060f08", fontWeight: 900, fontSize: 16 }}>N</div>
          <span style={{ fontFamily: "var(--font-sora), sans-serif", fontWeight: 800, fontSize: 20, letterSpacing: 3, color: "#f0fff4" }}>NUTRELIS</span>
        </Link>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {["Coordonnées", "Paiement"].map((s, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{
                width: 28, height: 28, borderRadius: "50%",
                background: (i === 0 && etape === "formulaire") || (i === 1 && etape === "paiement") ? "#7D0806" : i < (etape === "paiement" ? 1 : 0) ? "var(--accent)" : "rgba(255,255,255,0.2)",
                color: "#fff", fontSize: 12, fontWeight: 800,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>{i + 1}</div>
              <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 13 }}>{s}</span>
              {i < 1 && <span style={{ color: "rgba(255,255,255,0.3)", margin: "0 4px" }}>→</span>}
            </div>
          ))}
        </div>
        <Link href="/panier" style={{ color: "rgba(255,255,255,0.65)", fontSize: 14, textDecoration: "none" }}>
          ← Panier
        </Link>
      </nav>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "48px 60px", display: "grid", gridTemplateColumns: "1fr 380px", gap: 40, alignItems: "start" }}>

        {/* FORMULAIRE COORDONNÉES */}
        {etape === "formulaire" && (
          <div style={{ background: "#fff", borderRadius: 20, padding: "40px", border: "1px solid #eee" }}>
            <h2 style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: "1.4rem", fontWeight: 800, marginBottom: 32 }}>
              Vos coordonnées
            </h2>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
              {[
                { key: "prenom", label: "Prénom *", placeholder: "Jean" },
                { key: "nom", label: "Nom *", placeholder: "Dupont" },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ display: "block", fontWeight: 600, fontSize: 13, marginBottom: 8, color: "#333" }}>{f.label}</label>
                  <input
                    type="text" placeholder={f.placeholder}
                    value={(form as any)[f.key]}
                    onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                    style={{ width: "100%", padding: "13px 16px", borderRadius: 10, border: "1.5px solid #ddd", fontSize: 15, outline: "none", boxSizing: "border-box" }}
                    onFocus={e => e.currentTarget.style.borderColor = "#7D0806"}
                    onBlur={e => e.currentTarget.style.borderColor = "#ddd"}
                  />
                </div>
              ))}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 32 }}>
              {[
                { key: "telephone", label: "Téléphone *", placeholder: "+237 6XX XXX XXX", type: "tel" },
                { key: "email", label: "Email", placeholder: "jean@email.com", type: "email" },
                { key: "adresse", label: "Adresse *", placeholder: "Rue, numéro...", type: "text" },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ display: "block", fontWeight: 600, fontSize: 13, marginBottom: 8, color: "#333" }}>{f.label}</label>
                  <input
                    type={f.type} placeholder={f.placeholder}
                    value={(form as any)[f.key]}
                    onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                    style={{ width: "100%", padding: "13px 16px", borderRadius: 10, border: "1.5px solid #ddd", fontSize: 15, outline: "none", boxSizing: "border-box" }}
                    onFocus={e => e.currentTarget.style.borderColor = "#7D0806"}
                    onBlur={e => e.currentTarget.style.borderColor = "#ddd"}
                  />
                </div>
              ))}

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                {[
                  { key: "ville", label: "Ville *", placeholder: "Douala" },
                  { key: "quartier", label: "Quartier", placeholder: "Akwa, Bonanjo..." },
                ].map(f => (
                  <div key={f.key}>
                    <label style={{ display: "block", fontWeight: 600, fontSize: 13, marginBottom: 8, color: "#333" }}>{f.label}</label>
                    <input
                      type="text" placeholder={f.placeholder}
                      value={(form as any)[f.key]}
                      onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                      style={{ width: "100%", padding: "13px 16px", borderRadius: 10, border: "1.5px solid #ddd", fontSize: 15, outline: "none", boxSizing: "border-box" }}
                      onFocus={e => e.currentTarget.style.borderColor = "#7D0806"}
                      onBlur={e => e.currentTarget.style.borderColor = "#ddd"}
                    />
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={handleSubmit}
              style={{ width: "100%", background: "#7D0806", color: "#fff", border: "none", padding: "18px", borderRadius: 12, fontSize: 16, fontWeight: 900, cursor: "pointer", fontFamily: "var(--font-sora), sans-serif", boxShadow: "0 6px 24px rgba(125,8,6,0.3)" }}
            >
              Continuer vers le paiement →
            </button>
          </div>
        )}

        {/* CHOIX DU PAIEMENT */}
        {etape === "paiement" && (
          <div style={{ background: "#fff", borderRadius: 20, padding: "40px", border: "1px solid #eee" }}>
            <h2 style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: "1.4rem", fontWeight: 800, marginBottom: 8 }}>
              Mode de paiement
            </h2>
            <p style={{ color: "#888", fontSize: 14, marginBottom: 32 }}>Choisissez votre méthode de paiement préférée</p>

            <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 32 }}>
              {[
                { id: "mobile_money", label: "MTN Mobile Money", desc: "Paiement via MTN MoMo", emoji: "📱", color: "#ffcc00" },
                { id: "orange_money", label: "Orange Money", desc: "Paiement via Orange Money", emoji: "🟠", color: "#ff6600" },
                { id: "carte", label: "Carte bancaire", desc: "Visa, Mastercard (bientôt disponible)", emoji: "💳", color: "#1a1a2e", disabled: true },
              ].map(opt => (
                <div
                  key={opt.id}
                  onClick={() => !opt.disabled && setModePaiement(opt.id as any)}
                  style={{
                    display: "flex", alignItems: "center", gap: 16,
                    padding: "20px", borderRadius: 14, cursor: opt.disabled ? "not-allowed" : "pointer",
                    border: `2px solid ${modePaiement === opt.id ? "#7D0806" : "#eee"}`,
                    background: modePaiement === opt.id ? "#fdecea" : opt.disabled ? "#f8f8f8" : "#fff",
                    opacity: opt.disabled ? 0.5 : 1,
                    transition: "all 0.2s",
                  }}
                >
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: opt.color + "20", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>
                    {opt.emoji}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 4 }}>{opt.label}</div>
                    <div style={{ color: "#888", fontSize: 13 }}>{opt.desc}</div>
                  </div>
                  <div style={{
                    width: 22, height: 22, borderRadius: "50%",
                    border: `2px solid ${modePaiement === opt.id ? "#7D0806" : "#ddd"}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {modePaiement === opt.id && <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#7D0806" }} />}
                  </div>
                </div>
              ))}
            </div>

            {modePaiement && modePaiement !== "carte" && (
              <div style={{ background: "#f0faf2", border: "1px solid #c8e6d0", borderRadius: 12, padding: "20px", marginBottom: 24 }}>
                <p style={{ fontSize: 14, color: "#333", lineHeight: 1.7, marginBottom: 8 }}>
                  <strong>Instructions de paiement :</strong>
                </p>
                <ol style={{ paddingLeft: 20, fontSize: 14, color: "#555", lineHeight: 2 }}>
                  {modePaiement === "mobile_money" ? [
                    "Composez *126# sur votre téléphone MTN",
                    "Sélectionnez \"Paiement marchand\"",
                    `Entrez le code marchand : NUTRELIS`,
                    `Montant : ${totalPrix.toLocaleString()} FCFA`,
                    "Confirmez avec votre code PIN",
                  ] : [
                    "Composez #144# sur votre téléphone Orange",
                    "Sélectionnez \"Paiement\"",
                    `Entrez le code marchand : NUTRELIS`,
                    `Montant : ${totalPrix.toLocaleString()} FCFA`,
                    "Confirmez avec votre code PIN",
                  ].map((step, i) => <li key={i}>{step}</li>)}
                </ol>
              </div>
            )}

            {erreur && (
  <p style={{ color: "#e53e3e", fontSize: 13, marginBottom: 12, textAlign: "center" }}>{erreur}</p>
)}
<div style={{ display: "flex", gap: 12 }}>
  <button
    onClick={() => setEtape("formulaire")}
    style={{ flex: 1, background: "#fff", color: "#555", border: "1.5px solid #ddd", padding: "16px", borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: "pointer" }}
  >
    ← Retour
  </button>
  <button
    onClick={handlePaiement}
    disabled={!modePaiement || modePaiement === "carte" || chargement}
    style={{ flex: 2, background: modePaiement && modePaiement !== "carte" ? "#7D0806" : "#ccc", color: "#fff", border: "none", padding: "16px", borderRadius: 12, fontSize: 15, fontWeight: 900, cursor: "pointer", fontFamily: "var(--font-sora), sans-serif" }}
  >
    {chargement ? "Redirection..." : "Confirmer et payer →"}
  </button>
</div>
          </div>
        )}

        {/* RÉSUMÉ COMMANDE */}
        <div style={{ background: "#fff", borderRadius: 20, padding: "32px", border: "1px solid #eee", position: "sticky", top: 88 }}>
          <h2 style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: "1.1rem", fontWeight: 800, marginBottom: 24 }}>
            Votre commande
          </h2>

          {items.map((item, i) => (
            <div key={i} style={{ display: "flex", gap: 14, marginBottom: 16, paddingBottom: 16, borderBottom: "1px solid #f0f0f0" }}>
              <div style={{ width: 56, height: 56, borderRadius: 10, background: "#fdf5f3", border: "1px solid #eee", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <img src={item.image} alt={item.nom} style={{ width: "100%", height: "100%", objectFit: "contain", padding: 4 }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 2 }}>{item.nom}</div>
                <div style={{ color: "#888", fontSize: 12 }}>{item.description}</div>
                {item.mode === "abonnement" && <div style={{ color: "var(--accent)", fontSize: 11, fontWeight: 700, marginTop: 4 }}>⭐ Abonnement −15%</div>}
              </div>
              <div style={{ fontWeight: 800, fontSize: 14, color: "#7D0806" }}>
                {(item.prix * item.quantite).toLocaleString()} F
              </div>
            </div>
          ))}

          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: "#555" }}>
              <span>Sous-total</span><span>{totalPrix.toLocaleString()} FCFA</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: "#555" }}>
              <span>Livraison</span><span style={{ color: "var(--accent)", fontWeight: 700 }}>GRATUITE</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 900, fontSize: 16, paddingTop: 12, borderTop: "1px solid #eee" }}>
              <span>Total</span>
              <span style={{ color: "#7D0806" }}>{totalPrix.toLocaleString()} FCFA</span>
            </div>
          </div>

          <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 6 }}>
            {["🔒 Paiement sécurisé", "📦 Expédition sous 24h", "↩️ Garanti 90 jours"].map((b, i) => (
              <div key={i} style={{ fontSize: 12, color: "#888" }}>{b}</div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}