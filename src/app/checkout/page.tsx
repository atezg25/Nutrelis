"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useScreenSize } from "@/hooks/useIsMobile";
import HydrationGuard from "@/components/HydrationGuard";
import { useLocale } from "@/context/LocaleContext";

export default function Checkout() {
  const { items, totalPrix, viderPanier } = useCart();
  const { t, locale } = useLocale();
  // Avis de paiement (ex. un opérateur en panne), piloté depuis la console > Paramètres ; vide = rien d'affiché.
  const [avisPaiement, setAvisPaiement] = useState<{ fr: string; en: string }>({ fr: "", en: "" });
  useEffect(() => {
    void fetch("/api/shop-settings").then((r) => r.json()).then((d: { avis?: { fr?: string; en?: string } }) => setAvisPaiement({ fr: d.avis?.fr ?? "", en: d.avis?.en ?? "" })).catch(() => undefined);
  }, []);
  const [etape, setEtape] = useState<"formulaire" | "paiement" | "confirmation">("formulaire");
  const [modePaiement, setModePaiement] = useState<"mobile_money" | "livraison" | null>("mobile_money");
  const [form, setForm] = useState({
    nom: "", prenom: "", email: "", telephone: "",
    adresse: "", ville: "", quartier: "",
  });

  // Frais de livraison : tarif de la ville saisie (table des tarifs de la console), sinon tarif par défaut.
  const [tarifs, setTarifs] = useState<{ villes: { ville: string; quartier: string; fraisFcfa: number; delai: string | null }[]; defautFcfa: number } | null>(null);
  useEffect(() => {
    void fetch("/api/shipping/rates", { cache: "no-store" }).then(r => (r.ok ? r.json() : null)).then(setTarifs).catch(() => setTarifs(null));
  }, []);
  // Sans tenir compte des accents ni de la casse (« Yaounde » = « Yaoundé »), comme le serveur.
  const norm = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
  const lignesVille = (tarifs?.villes ?? []).filter(v => norm(v.ville) === norm(form.ville));
  const tarifVille = lignesVille.find(v => v.quartier && norm(v.quartier) === norm(form.quartier)) ?? lignesVille.find(v => !v.quartier);
  const frais = tarifVille ? tarifVille.fraisFcfa : (tarifs?.defautFcfa ?? 0);
  // Code promo : la remise affichée est indicative, le serveur la recalcule à la commande.
  const [codeSaisi, setCodeSaisi] = useState("");
  const [promo, setPromo] = useState<{ code: string; remiseFcfa: number; libelle: string } | null>(null);
  const [promoMsg, setPromoMsg] = useState("");
  const [promoEnCours, setPromoEnCours] = useState(false);
  async function appliquerCode() {
    if (!codeSaisi.trim()) return;
    setPromoEnCours(true); setPromoMsg("");
    try {
      const r = await fetch("/api/promo/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code: codeSaisi, sousTotal: totalPrix }) });
      const d = (await r.json().catch(() => ({}))) as { code?: string; remiseFcfa?: number; libelle?: string; error?: string };
      if (r.ok && d.code) { setPromo({ code: d.code, remiseFcfa: d.remiseFcfa ?? 0, libelle: d.libelle ?? "" }); setPromoMsg(""); }
      else { setPromo(null); setPromoMsg(d.error ?? "Code invalide."); }
    } catch { setPromoMsg("Vérification impossible. Réessayez."); }
    setPromoEnCours(false);
  }
  // Le panier a changé (quantité, pack) : on revérifie le code pour afficher le bon montant.
  useEffect(() => { if (promo) void (async () => { const r = await fetch("/api/promo/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code: promo.code, sousTotal: totalPrix }) }); const d = (await r.json().catch(() => ({}))) as { code?: string; remiseFcfa?: number; libelle?: string; error?: string }; if (r.ok && d.code) setPromo({ code: d.code, remiseFcfa: d.remiseFcfa ?? 0, libelle: d.libelle ?? "" }); else { setPromo(null); setPromoMsg(d.error ?? ""); } })(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [totalPrix]);
  const remiseCode = promo?.remiseFcfa ?? 0;
  const totalAPayer = totalPrix - remiseCode + frais;

  // Panier abandonné : dès que le téléphone est saisi, on garde le panier (le serveur ignore les numéros trop courts).
  useEffect(() => {
    const tel = form.telephone.replace(/\D/g, "");
    if (tel.length < 9 || items.length === 0) return;
    const t = setTimeout(() => {
      void fetch("/api/cart-capture", { method: "POST", headers: { "Content-Type": "application/json" }, keepalive: true,
        body: JSON.stringify({ telephone: form.telephone, nom: form.nom, prenom: form.prenom, email: form.email, ville: form.ville, total: totalAPayer,
          items: items.filter(i => i.variantId).map(i => ({ variantId: i.variantId, qty: i.quantite, mode: i.mode })) }) }).catch(() => undefined);
    }, 1500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.telephone, form.nom, form.prenom, form.email, form.ville, items, totalAPayer]);

  const sc = useScreenSize();
  const isMobile = sc === "mobile";
  const isSmall = sc === "mobile" || sc === "tablet";
  const px = isMobile ? "16px" : sc === "tablet" ? "24px" : "60px";

  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState("");

  const [formErreur, setFormErreur] = useState("");

  const handleSubmit = () => {
    if (!form.nom || !form.prenom || !form.telephone || !form.adresse) {
      setFormErreur(t("checkout.fillRequired") || "Please fill all required fields");
      return;
    }
    setFormErreur("");
    setEtape("paiement");
  };

  const handlePaiement = async () => {
    if (!modePaiement) return;
    setChargement(true);
    setErreur("");

    try {
      // Les lignes du panier : seuls les packs de la boutique (identifiant valide) peuvent être commandés.
      const lignes = items
        .filter(i => i.variantId)
        .map(i => ({ variantId: i.variantId, qty: i.quantite, mode: i.mode }));
      if (lignes.length === 0) {
        setErreur(t("common.error"));
        setChargement(false);
        return;
      }

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: lignes,
          mode: modePaiement === "livraison" ? "livraison" : "fapshi",
          code: promo?.code,
          client: {
            nom: form.nom,
            prenom: form.prenom,
            email: form.email,
            telephone: form.telephone,
            adresse: form.adresse,
            ville: form.ville,
            quartier: form.quartier,
          },
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setErreur(data.error || t("common.error"));
        setChargement(false);
        return;
      }

      // Pour l'e-mail de confirmation et l'écran de suivi.
      localStorage.setItem("nutrelis-customer", JSON.stringify({
        numero: data.numero,
        nom: form.nom,
        prenom: form.prenom,
        email: form.email,
        telephone: form.telephone,
        adresse: form.adresse,
        ville: form.ville,
        quartier: form.quartier,
        items,
        total: totalAPayer,
      }));

      if (data.checkoutUrl) {
        // Paiement en ligne : on part chez Fapshi (ne pas couper le spinner, la redirection peut prendre un instant).
        window.location.href = data.checkoutUrl;
        return;
      }
      // Paiement à la livraison : la commande est enregistrée, c'est terminé.
      viderPanier();
      setChargement(false);
      setEtape("confirmation");
    } catch {
      setErreur(t("common.error"));
      setChargement(false);
    }
  };

  // PAGE CONFIRMATION
  // Choix du mode de paiement : affiché dès le formulaire ET à l'étape de paiement. Le paiement en ligne est recommandé (présélectionné).
  const avisTexte = (locale === "en" ? avisPaiement.en || avisPaiement.fr : avisPaiement.fr || avisPaiement.en).trim();
  const choixPaiement = (
    <>
            {avisTexte && (
              <div role="alert" style={{ display: "flex", gap: 10, alignItems: "flex-start", background: "#fff7e6", border: "1.5px solid #f5b942", color: "#7a4a00", borderRadius: 12, padding: "12px 14px", marginBottom: 16, fontSize: 14, lineHeight: 1.5, fontWeight: 600 }}>
                <span aria-hidden style={{ fontSize: 18 }}>⚠️</span><span>{avisTexte}</span>
              </div>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 28 }}>
              {[
                { id: "mobile_money", label: t("checkout.payOnline"), desc: t("checkout.payOnlineDesc"), emoji: "📱", color: "#ffcc00", disabled: false },
                { id: "livraison", label: t("checkout.payOnDelivery"), desc: t("checkout.payOnDeliveryDesc"), emoji: "🚚", color: "#1f7a3a", disabled: false },
              ].map(opt => (
                <div
                  key={opt.id}
                  onClick={() => !opt.disabled && setModePaiement(opt.id as "mobile_money" | "livraison")}
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
                    <div style={{ fontWeight: 800, fontSize: isMobile ? 14 : 15, marginBottom: 4, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>{opt.label}{opt.id === "mobile_money" && <span style={{ background: "#1f7a3a", color: "#fff", fontSize: 10, fontWeight: 800, letterSpacing: 0.5, padding: "2px 8px", borderRadius: 20 }}>⭐ {t("checkout.recommended")}</span>}</div>
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

            {modePaiement && (
              <div style={{ background: "#f0faf2", border: "1px solid #c8e6d0", borderRadius: 12, padding: "20px", marginBottom: 24 }}>
                <p style={{ fontSize: 14, color: "#333", lineHeight: 1.7, marginBottom: 8 }}>
                  {modePaiement === "mobile_money" ? t("checkout.payOnlineInfo") : t("checkout.payOnDeliveryInfo")}
                </p>
                <p style={{ fontSize: 14, color: "#555", margin: 0 }}>
                  <strong>{t("checkout.amount")} : {totalAPayer.toLocaleString()} FCFA</strong>
                </p>
              </div>
            )}

    </>
  );

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
    <HydrationGuard bg="#f8f9fa" style={{ color: "#1a1a1a", minHeight: "100vh" }}>

      {/* NAVBAR */}
      <nav style={{ background: "#060f08", borderBottom: "1px solid #1a3522", padding: `0 ${px}`, height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link href="/" style={{ textDecoration: "none", flexShrink: 0 }}>
          <img src="/images/logo-homepage.png" alt="Nutrelis" style={{ height: isMobile ? 22 : 34, width: "auto" }} />
        </Link>
        {!isMobile && (
          <div className="etapes-commande" style={{ display: "flex", gap: 8, alignItems: "center" }}>
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

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: `32px ${px}`, display: "grid", gridTemplateColumns: isSmall ? "minmax(0, 1fr)" : "minmax(0, 1fr) 380px", gap: isSmall ? 24 : 40, alignItems: "start" }}>

        {/* FORMULAIRE COORDONNÉES */}
        {etape === "formulaire" && (
          <div style={{ background: "#fff", borderRadius: 20, padding: isMobile ? "24px 20px" : "40px", border: "1px solid #eee" }}>
            <h2 style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: "1.4rem", fontWeight: 800, marginBottom: 28 }}>
              {t("checkout.title")}
            </h2>



            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "minmax(0, 1fr)" : "minmax(0, 1fr) minmax(0, 1fr)", gap: 16, marginBottom: 16 }}>
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

              <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", gap: 16 }}>
                {[
                  { key: "ville", label: t("checkout.city"), placeholder: "Douala" },
                  { key: "quartier", label: t("checkout.district"), placeholder: "Akwa, Bonanjo..." },
                ].map(f => (
                  <div key={f.key}>
                    <label style={{ display: "block", fontWeight: 600, fontSize: 13, marginBottom: 8, color: "#333" }}>{f.label}</label>
                    <input
                      type="text" placeholder={f.placeholder} list={f.key === "ville" ? "villes-cm" : undefined}
                      value={(form as any)[f.key]}
                      onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                      style={{ width: "100%", padding: "13px 16px", borderRadius: 10, border: "1.5px solid #ddd", fontSize: 15, outline: "none", boxSizing: "border-box" }}
                      onFocus={e => e.currentTarget.style.borderColor = "#7D0806"}
                      onBlur={e => e.currentTarget.style.borderColor = "#ddd"}
                    />
                  </div>
                ))}
              </div>
              <datalist id="villes-cm">
                {Array.from(new Set([...(tarifs?.villes.map(v => v.ville) ?? []), "Douala", "Yaoundé", "Bafoussam", "Bamenda", "Garoua", "Maroua", "Ngaoundéré", "Bertoua", "Ebolowa", "Kribi", "Limbe", "Buea", "Edéa", "Dschang"])).map(v => <option key={v} value={v} />)}
              </datalist>
            </div>

            <h3 style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: "1.1rem", fontWeight: 800, margin: "28px 0 6px" }}>{t("checkout.paymentTitle")}</h3>
            <p style={{ color: "#888", fontSize: 13, marginBottom: 16 }}>{t("checkout.paymentDesc")}</p>
            {choixPaiement}

            {formErreur && <p style={{ color: "#e53e3e", fontSize: 13, marginBottom: 12, textAlign: "center" }}>{formErreur}</p>}

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

            {choixPaiement}

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
                disabled={!modePaiement || chargement}
                style={{ flex: 2, background: modePaiement ? "#7D0806" : "#ccc", color: "#fff", border: "none", padding: "16px", borderRadius: 12, fontSize: isMobile ? 13 : 15, fontWeight: 900, cursor: "pointer", fontFamily: "var(--font-sora), sans-serif" }}
              >
                {chargement ? (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
                    <span style={{ width: 18, height: 18, border: "3px solid rgba(255,255,255,0.3)", borderTop: "3px solid #fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.8s linear infinite" }} />
                    {t("checkout.redirecting")}
                  </span>
                ) : t("checkout.confirmPay")}
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
                {item.mode === "abonnement" && <div style={{ color: "var(--accent)", fontSize: 11, fontWeight: 700, marginTop: 4 }}>⭐ {t("product.subscription")}</div>}
              </div>
              <div style={{ fontWeight: 800, fontSize: 14, color: "#7D0806", flexShrink: 0 }}>
                {(item.prix * item.quantite).toLocaleString()} F
              </div>
            </div>
          ))}

          <div style={{ marginTop: 14 }}>
            {promo ? (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, background: "#f0faf2", border: "1px solid #c8e6d0", borderRadius: 10, padding: "10px 12px", fontSize: 13 }}>
                <span>✅ Code <strong>{promo.code}</strong> appliqué</span>
                <button onClick={() => { setPromo(null); setCodeSaisi(""); }} style={{ background: "none", border: 0, color: "#b91c1c", cursor: "pointer", fontWeight: 700, fontSize: 12 }}>Retirer</button>
              </div>
            ) : (
              <div>
                <div style={{ display: "flex", gap: 8 }}>
                  <input value={codeSaisi} onChange={(e) => setCodeSaisi(e.target.value.toUpperCase())} onKeyDown={(e) => { if (e.key === "Enter") void appliquerCode(); }} placeholder="Code promo" aria-label="Code promo" autoCapitalize="characters" style={{ flex: 1, minWidth: 0, padding: "11px 12px", borderRadius: 10, border: "1.5px solid #ddd", fontSize: 14, textTransform: "uppercase" }} />
                  <button onClick={() => void appliquerCode()} disabled={promoEnCours || !codeSaisi.trim()} style={{ background: "#7D0806", color: "#fff", border: 0, borderRadius: 10, padding: "0 16px", fontWeight: 800, fontSize: 13, cursor: "pointer", opacity: promoEnCours || !codeSaisi.trim() ? 0.5 : 1 }}>{promoEnCours ? "…" : "Appliquer"}</button>
                </div>
                {promoMsg && <p role="alert" style={{ color: "#e53e3e", fontSize: 12.5, margin: "6px 0 0" }}>{promoMsg}</p>}
              </div>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: "#555" }}>
              <span>{t("cart.subtotal")}</span><span>{totalPrix.toLocaleString()} FCFA</span>
            </div>
            {remiseCode > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: "#1f7a3a", fontWeight: 700 }}>
                <span>🏷️ {promo?.code} ({promo?.libelle})</span><span>−{remiseCode.toLocaleString()} FCFA</span>
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: "#555" }}>
              <span>{t("cart.shipping")}{tarifVille?.delai ? ` (${tarifVille.delai})` : ""}</span><span style={{ color: frais === 0 ? "var(--accent)" : "#333", fontWeight: 700 }}>{frais === 0 ? t("common.freeShipping") : `${frais.toLocaleString()} FCFA`}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 900, fontSize: 16, paddingTop: 12, borderTop: "1px solid #eee" }}>
              <span>{t("cart.total")}</span>
              <span style={{ color: "#7D0806" }}>{totalAPayer.toLocaleString()} FCFA</span>
            </div>
          </div>

          <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 6 }}>
            {[t("checkout.badgeSecure"), t("checkout.badgeShipping"), t("checkout.badgeGuarantee")].map((b, i) => (
              <div key={i} style={{ fontSize: 12, color: "#888" }}>{b}</div>
            ))}
          </div>
        </div>

      </div>
    </HydrationGuard>
  );
}
