"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useScreenSize } from "@/hooks/useIsMobile";
import BoutonGoogle from "@/components/BoutonGoogle";
import { useLocale } from "@/context/LocaleContext";

export default function Checkout() {
  const { items, totalPrix } = useCart();
  const { customer } = useAuth();
  const { t } = useLocale();
  const [etape, setEtape] = useState<"formulaire" | "paiement" | "confirmation">("formulaire");
  const [modePaiement, setModePaiement] = useState<"mobile_money" | "orange_money" | "carte" | null>(null);
  const [form, setForm] = useState({
    nom: "", prenom: "", email: "", telephone: "",
    adresse: "", ville: "", quartier: "",
  });

  // Pré-remplir le formulaire si connecté via Google
  useEffect(() => {
    if (customer && !form.nom && !form.prenom) {
      setForm(prev => ({
        ...prev,
        nom: prev.nom || customer.last_name || "",
        prenom: prev.prenom || customer.first_name || "",
        email: prev.email || customer.email || "",
        telephone: prev.telephone || customer.phone || "",
      }));
    }
  }, [customer]);

  const sc = useScreenSize();
  const isMobile = sc === "mobile";
  const isSmall = sc === "mobile" || sc === "tablet";
  const px = isMobile ? "16px" : sc === "tablet" ? "24px" : "60px";

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
      const BACKEND = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL;
      const PUB_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY;

      // Lancer Medusa en arrière-plan (sans bloquer Notchpay)
      const itemsAvecVariant = items.filter(i => i.variantId);
      if (itemsAvecVariant.length > 0) {
        fetch(`${BACKEND}/store/carts`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-publishable-api-key": PUB_KEY! },
          body: JSON.stringify({ region_id: "reg_01KNX74XTS40FD0GVD8296GKHN" }),
        })
          .then(r => r.json())
          .then(cartData => {
            const cartId = cartData.cart?.id;
            if (!cartId) return;
            localStorage.setItem("nutrelis-medusa-cart", cartId);
            return Promise.all(
              itemsAvecVariant.map(item =>
                fetch(`${BACKEND}/store/carts/${cartId}/line-items`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json", "x-publishable-api-key": PUB_KEY! },
                  body: JSON.stringify({ variant_id: item.variantId, quantity: item.quantite }),
                })
              )
            );
          })
          .catch(() => {});
      }

      // 2. Initialiser le paiement Notchpay
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
          items,
          adresse: form.adresse,
          ville: form.ville,
          quartier: form.quartier,
        }),
      });

      const data = await res.json();

      if (data.authorization_url) {
        // Sauvegarder les infos client pour l'email de confirmation
        localStorage.setItem("nutrelis-customer", JSON.stringify({
          nom: form.nom,
          prenom: form.prenom,
          email: form.email,
          telephone: form.telephone,
          adresse: form.adresse,
          ville: form.ville,
          quartier: form.quartier,
          items,
          total: totalPrix,
        }));
        window.location.href = data.authorization_url;
      } else {
        setErreur(data.error || t("common.error"));
      }
    } catch {
      setErreur(t("common.error"));
    } finally {
      setChargement(false);
    }
  };

  // PAGE CONFIRMATION
  if (etape === "confirmation") {
    return (
      <div style={{ background: "#fff", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", maxWidth: 560, padding: "60px 24px" }}>
          <div style={{ fontSize: 72, marginBottom: 24 }}>🎉</div>
          <h1 style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: "2rem", fontWeight: 900, marginBottom: 16, color: "#1a1a1a" }}>
            {t("checkout.orderConfirmed")}
          </h1>
          <p style={{ color: "#555", fontSize: 16, lineHeight: 1.8, marginBottom: 12 }}>
            {t("success.desc")} <strong>ATEZ Express</strong> {t("success.in24h")}
          </p>
          <p style={{ color: "#555", fontSize: 15, lineHeight: 1.8, marginBottom: 36 }}>
            {t("success.emailSent")}
          </p>
          <div style={{ background: "#f0faf2", border: "1px solid #c8e6d0", borderRadius: 16, padding: "24px", marginBottom: 36 }}>
            {[
              { label: t("cart.shipping"), val: t("shipping.standardDelay") },
              { label: t("checkout.address").replace(" *", ""), val: `${form.adresse}, ${form.quartier}, ${form.ville}` },
              { label: t("checkout.phone").replace(" *", ""), val: form.telephone },
            ].map((r, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: i < 2 ? "1px solid #c8e6d0" : "none", fontSize: 14 }}>
                <span style={{ color: "#888" }}>{r.label}</span>
                <span style={{ fontWeight: 700, color: "#1a1a1a" }}>{r.val}</span>
              </div>
            ))}
          </div>
          <Link href="/" style={{ background: "var(--accent)", color: "#060f08", padding: "16px 40px", borderRadius: 10, fontSize: 15, fontWeight: 800, textDecoration: "none", fontFamily: "var(--font-sora), sans-serif" }}>
            {t("success.backHome")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "#f8f9fa", color: "#1a1a1a", minHeight: "100vh" }}>

      {/* NAVBAR */}
      <nav style={{ background: "#060f08", borderBottom: "1px solid #1a3522", padding: `0 ${px}`, height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", color: "#060f08", fontWeight: 900, fontSize: 15 }}>N</div>
          <span style={{ fontFamily: "var(--font-sora), sans-serif", fontWeight: 800, fontSize: isMobile ? 16 : 20, letterSpacing: 3, color: "#f0fff4" }}>NUTRELIS</span>
        </Link>
        {!isMobile && (
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {[t("checkout.title"), t("checkout.paymentTitle")].map((s, i) => (
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
        )}
        <Link href="/panier" style={{ color: "rgba(255,255,255,0.65)", fontSize: isMobile ? 12 : 14, textDecoration: "none" }}>
          ← {t("checkout.backToCart")}
        </Link>
      </nav>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: `32px ${px}`, display: "grid", gridTemplateColumns: isSmall ? "1fr" : "1fr 380px", gap: isSmall ? 24 : 40, alignItems: "start" }}>

        {/* FORMULAIRE COORDONNÉES */}
        {etape === "formulaire" && (
          <div style={{ background: "#fff", borderRadius: 20, padding: isMobile ? "24px 20px" : "40px", border: "1px solid #eee" }}>
            <h2 style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: "1.4rem", fontWeight: 800, marginBottom: 28 }}>
              {t("checkout.title")}
            </h2>

            {/* Connexion rapide Google */}
            {!customer && (
              <div style={{ marginBottom: 28 }}>
                <p style={{ color: "#888", fontSize: 13, marginBottom: 12, textAlign: "center" }}>
                  {t("checkout.googleFill")}
                </p>
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <BoutonGoogle />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 16, margin: "24px 0 0" }}>
                  <div style={{ flex: 1, height: 1, background: "#e0e0e0" }} />
                  <span style={{ color: "#aaa", fontSize: 13, fontWeight: 600 }}>{t("checkout.orManual")}</span>
                  <div style={{ flex: 1, height: 1, background: "#e0e0e0" }} />
                </div>
              </div>
            )}

            {customer && (
              <div style={{ background: "#f0faf2", border: "1px solid #c8e6d0", borderRadius: 10, padding: "12px 16px", marginBottom: 24, display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 18 }}>✅</span>
                <span style={{ fontSize: 14, color: "#333" }}>
                  {t("checkout.googleConnected")} <strong>{customer.first_name} {customer.last_name}</strong>
                </span>
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16, marginBottom: 16 }}>
              {[
                { key: "prenom", label: t("checkout.firstName"), placeholder: t("auth.firstNamePlaceholder") },
                { key: "nom", label: t("checkout.lastName"), placeholder: t("auth.lastNamePlaceholder") },
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

            <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 28 }}>
              {[
                { key: "telephone", label: t("checkout.phone"), placeholder: t("auth.phonePlaceholder"), type: "tel" },
                { key: "email", label: t("checkout.email"), placeholder: t("auth.emailPlaceholder"), type: "email" },
                { key: "adresse", label: t("checkout.address"), placeholder: t("checkout.address").replace(" *", ""), type: "text" },
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
                  { key: "ville", label: t("checkout.city"), placeholder: "Douala" },
                  { key: "quartier", label: t("checkout.district"), placeholder: "Akwa, Bonanjo..." },
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
              {t("checkout.continuePayment")}
            </button>
          </div>
        )}

        {/* CHOIX DU PAIEMENT */}
        {etape === "paiement" && (
          <div style={{ background: "#fff", borderRadius: 20, padding: isMobile ? "24px 20px" : "40px", border: "1px solid #eee" }}>
            <h2 style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: "1.4rem", fontWeight: 800, marginBottom: 8 }}>
              {t("checkout.paymentTitle")}
            </h2>
            <p style={{ color: "#888", fontSize: 14, marginBottom: 28 }}>{t("checkout.paymentDesc")}</p>

            <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 28 }}>
              {[
                { id: "mobile_money", label: t("checkout.mtnMomo"), desc: t("checkout.mtnDesc"), emoji: "📱", color: "#ffcc00" },
                { id: "orange_money", label: t("checkout.orangeMoney"), desc: t("checkout.orangeDesc"), emoji: "🟠", color: "#ff6600" },
                { id: "carte", label: t("checkout.card"), desc: t("checkout.cardDesc"), emoji: "💳", color: "#1a1a2e", disabled: true },
              ].map(opt => (
                <div
                  key={opt.id}
                  onClick={() => !opt.disabled && setModePaiement(opt.id as any)}
                  style={{
                    display: "flex", alignItems: "center", gap: 14,
                    padding: isMobile ? "16px" : "20px", borderRadius: 14, cursor: opt.disabled ? "not-allowed" : "pointer",
                    border: `2px solid ${modePaiement === opt.id ? "#7D0806" : "#eee"}`,
                    background: modePaiement === opt.id ? "#fdecea" : opt.disabled ? "#f8f8f8" : "#fff",
                    opacity: opt.disabled ? 0.5 : 1,
                    transition: "all 0.2s",
                  }}
                >
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: opt.color + "20", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
                    {opt.emoji}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: isMobile ? 14 : 15, marginBottom: 4 }}>{opt.label}</div>
                    <div style={{ color: "#888", fontSize: 12 }}>{opt.desc}</div>
                  </div>
                  <div style={{
                    width: 22, height: 22, borderRadius: "50%",
                    border: `2px solid ${modePaiement === opt.id ? "#7D0806" : "#ddd"}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                  }}>
                    {modePaiement === opt.id && <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#7D0806" }} />}
                  </div>
                </div>
              ))}
            </div>

            {modePaiement && modePaiement !== "carte" && (
              <div style={{ background: "#f0faf2", border: "1px solid #c8e6d0", borderRadius: 12, padding: "20px", marginBottom: 24 }}>
                <p style={{ fontSize: 14, color: "#333", lineHeight: 1.7, marginBottom: 8 }}>
                  <strong>{t("checkout.paymentInstructions")}</strong>
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
                ← {t("common.back")}
              </button>
              <button
                onClick={handlePaiement}
                disabled={!modePaiement || modePaiement === "carte" || chargement}
                style={{ flex: 2, background: modePaiement && modePaiement !== "carte" ? "#7D0806" : "#ccc", color: "#fff", border: "none", padding: "16px", borderRadius: 12, fontSize: isMobile ? 13 : 15, fontWeight: 900, cursor: "pointer", fontFamily: "var(--font-sora), sans-serif" }}
              >
                {chargement ? `⏳ ${t("checkout.redirecting")}` : t("checkout.confirmPay")}
              </button>
            </div>
          </div>
        )}

        {/* RÉSUMÉ COMMANDE */}
        <div style={{ background: "#fff", borderRadius: 20, padding: isMobile ? "20px" : "32px", border: "1px solid #eee", position: isSmall ? "relative" : "sticky", top: isSmall ? 0 : 80 }}>
          <h2 style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: "1.1rem", fontWeight: 800, marginBottom: 20 }}>
            {t("checkout.yourOrder")}
          </h2>

          {items.map((item, i) => (
            <div key={i} style={{ display: "flex", gap: 12, marginBottom: 16, paddingBottom: 16, borderBottom: "1px solid #f0f0f0" }}>
              <div style={{ width: 52, height: 52, borderRadius: 10, background: "#fdf5f3", border: "1px solid #eee", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <img src={item.image} alt={item.nom} style={{ width: "100%", height: "100%", objectFit: "contain", padding: 4 }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.nom}</div>
                <div style={{ color: "#888", fontSize: 12 }}>{item.description}</div>
                {item.mode === "abonnement" && <div style={{ color: "var(--accent)", fontSize: 11, fontWeight: 700, marginTop: 4 }}>⭐ Abonnement −15%</div>}
              </div>
              <div style={{ fontWeight: 800, fontSize: 14, color: "#7D0806", flexShrink: 0 }}>
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
