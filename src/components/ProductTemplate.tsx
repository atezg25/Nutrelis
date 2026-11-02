"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useScreenSize } from "@/hooks/useIsMobile";
import { useLocale } from "@/context/LocaleContext";
import HydrationGuard from "@/components/HydrationGuard";
import NavbarCart from "@/components/NavbarCart";
import FloatingActions from "@/components/FloatingActions";
import type { ContenuProduit } from "@/lib/contenu";

/**
 * FICHE PRODUIT — même charte que la page de l'Astaxanthine (couleurs `--asta-*`, police Sora, bandeau, héros, bandeau de
 * confiance, raisons, bloc de commande avec packs, avis, FAQ, garantie, pied de page). Tout le contenu vient de la base :
 * une section sans contenu n'est pas affichée, et les avis ne sont JAMAIS inventés.
 */
export type PackCatalogue = {
  id: string; sku: string; label: string; priceFcfa: number; originalPriceFcfa: number | null;
  description: string | null; popular: boolean; inStock: boolean; stockFaible: boolean;
};
export type ProduitCatalogue = {
  id: string; slug: string; name: string; subtitle: string | null; description: string | null; imageUrl: string | null;
  content: ContenuProduit; variants: PackCatalogue[];
  avisVerifies?: { rating: number; body: string; display_name: string; city: string | null; shop_reply: string | null; created_at: string }[];
};

/** Palette « violet » (Bleach Darkening) : surcharge les variables --asta-* de la charte pour cette fiche seulement. */
const THEME_VIOLET = {
  "--asta-bg": "#fffaf3", "--asta-bg2": "#f6ecfb", "--asta-accent": "#6B1B8F", "--asta-hover": "#7e22a8", "--asta-soft": "#f3e6fa",
  "--asta-gold": "#b8860b", "--asta-text": "#24102e", "--asta-text2": "#5e3b72", "--asta-border": "#e3cdf0",
  "--asta-rgb": "107, 27, 143", "--asta-tint": "#f1e2fa", "--asta-deep": "#4a0f66", "--asta-nav": "rgba(255,250,243,0.97)",
} as React.CSSProperties;

const SORA = "var(--font-sora), sans-serif";
const fcfa = (n: number) => `${n.toLocaleString("fr-FR")} FCFA`;

function Etoiles({ note, taille = 15 }: { note: number; taille?: number }) {
  return <span style={{ color: "#f5a623", fontSize: taille, letterSpacing: -1 }}>{"★".repeat(Math.round(note))}{"☆".repeat(5 - Math.round(note))}</span>;
}

function Question({ q, a, ouvert, onClic }: { q: string; a: string; ouvert: boolean; onClic: () => void }) {
  return (
    <div style={{ background: "#fff", border: `1.5px solid ${ouvert ? "var(--asta-accent)" : "var(--asta-border)"}`, borderRadius: 16, overflow: "hidden", transition: "border-color .2s" }}>
      <button onClick={onClic} style={{ width: "100%", textAlign: "left", background: "none", border: 0, padding: "18px 20px", display: "flex", justifyContent: "space-between", gap: 12, cursor: "pointer", fontFamily: SORA, fontWeight: 700, fontSize: 15, color: "var(--asta-text)" }}>
        <span>{q}</span>
        <span style={{ color: "var(--asta-accent)", fontSize: 20, lineHeight: 1 }}>{ouvert ? "−" : "+"}</span>
      </button>
      {ouvert && <div style={{ padding: "0 20px 18px", color: "var(--asta-text2)", fontSize: 14, lineHeight: 1.75, whiteSpace: "pre-line" }}>{a}</div>}
    </div>
  );
}

export default function ProductTemplate({ produit, autres }: { produit: ProduitCatalogue; autres: ProduitCatalogue[] }) {
  const { t, locale, abonnement } = useLocale();
  const fr = locale === "fr";
  const L = (f: string, e: string) => (fr ? f : e);
  const sc = useScreenSize();
  const isMobile = sc === "mobile";
  const isSmall = sc === "mobile" || sc === "tablet";
  const px = isMobile ? "16px" : sc === "tablet" ? "28px" : "60px";
  const py = isMobile ? "48px" : sc === "tablet" ? "64px" : "96px";
  const router = useRouter();
  const { ajouterArticle } = useCart();

  const c = produit.content ?? {};
  const images = useMemo(() => (c.images?.length ? c.images : produit.imageUrl ? [produit.imageUrl] : []), [c.images, produit.imageUrl]);
  const packs = produit.variants;
  const defaut = packs.find((p) => p.popular && p.inStock) ?? packs.find((p) => p.inStock) ?? packs[0];
  const [packId, setPackId] = useState<string | undefined>(defaut?.id);
  const [qte, setQte] = useState(1);
  const [photo, setPhoto] = useState(0);
  const [faqOuverte, setFaqOuverte] = useState<number | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [ajoute, setAjoute] = useState(false);
  const [mode, setMode] = useState<"unique" | "abonnement">("unique");
  // Barre de commande fixe sur mobile : visible une fois le héros passé, masquée quand le bloc de commande est à l'écran.
  const [barre, setBarre] = useState(false);
  useEffect(() => {
    if (!isSmall) { setBarre(false); return; }
    const el = document.getElementById("commander");
    let enVue = false;
    const maj = () => setBarre(window.scrollY > 500 && !enVue);
    const io = el ? new IntersectionObserver(([e]) => { enVue = !!e?.isIntersecting; maj(); }, { threshold: 0.12 }) : null;
    if (el && io) io.observe(el);
    window.addEventListener("scroll", maj, { passive: true });
    maj();
    return () => { io?.disconnect(); window.removeEventListener("scroll", maj); };
  }, [isSmall]);
  useEffect(() => { if (!packId && defaut) setPackId(defaut.id); }, [defaut, packId]);

  const pack = packs.find((p) => p.id === packId) ?? defaut;
  const abo = abonnement.actif && c.abonnement !== false;
  const modeEff = abo ? mode : "unique";
  // Prix d'abonnement : même calcul que le serveur (`prixAbonne`), qui refacture de toute façon à ce tarif.
  const prixDe = (p?: PackCatalogue) => (p ? (modeEff === "abonnement" ? Math.round((p.priceFcfa * (100 - abonnement.pct)) / 100) : p.priceFcfa) : 0);
  const remiseM = (p?: PackCatalogue) => { const a = ancienDe(p); return p && a && a > prixDe(p) ? Math.round(100 * (1 - prixDe(p) / a)) : 0; };
  const ancienDe = (p?: PackCatalogue) => (p ? (modeEff === "abonnement" ? p.priceFcfa : p.originalPriceFcfa ?? null) : null);
  const remise = (p?: PackCatalogue) => (p && p.originalPriceFcfa && p.originalPriceFcfa > p.priceFcfa ? Math.round(100 * (1 - p.priceFcfa / p.originalPriceFcfa)) : 0);
  // Avis vérifiés (acheteurs dont le colis est livré, validés par la boutique) d'abord ; avis saisis à la main ensuite.
  const verifies = (produit.avisVerifies ?? []).map((a) => ({ nom: a.display_name, ville: a.city ?? undefined, note: a.rating, texte: a.body, reponse: a.shop_reply ?? undefined, verifie: true }));
  const avis: { nom: string; ville?: string; note: number; texte: string; reponse?: string; verifie: boolean }[] = [...verifies, ...(c.avis ?? []).map((a) => ({ ...a, verifie: false }))];
  const moyenne = avis.length ? avis.reduce((a, r) => a + r.note, 0) / avis.length : 0;
  const garantie = c.garantieJours ?? 90;
  const enStock = packs.some((p) => p.inStock);
  const points = (c.avantages ?? []).slice(0, 3);

  const titre = (() => {
    const m = c.miseEnAvant;
    if (m && produit.name.includes(m)) {
      const i = produit.name.indexOf(m);
      return <>{produit.name.slice(0, i)}<span style={{ color: "var(--asta-accent)" }}>{m}</span>{produit.name.slice(i + m.length)}</>;
    }
    return <>{produit.name}</>;
  })();

  const liens = [
    c.raisons?.length ? ["avantages", L("Pourquoi", "Why")] : null,
    c.etapes?.length ? ["routine", L("Routine", "Routine")] : null,
    ["commander", L("Commander", "Order")],
    c.videos?.length ? ["videos", L("Vidéos", "Videos")] : null,
    avis.length ? ["avis", L("Avis", "Reviews")] : null,
    c.faq?.length ? ["faq", "FAQ"] : null,
  ].filter((x): x is string[] => x !== null);

  async function ajouter(puisCommander: boolean) {
    if (!pack || !pack.inStock) return;
    setMessage("");
    let ok = true;
    for (let i = 0; i < qte && ok; i++) {
      ok = await ajouterArticle({
        id: pack.id, nom: `${produit.name} — ${pack.label}`, description: pack.label, prix: prixDe(pack),
        prixOriginal: modeEff === "abonnement" ? pack.priceFcfa : pack.originalPriceFcfa ?? pack.priceFcfa, image: c.imagesPacks?.[pack.sku] ?? images[0] ?? "", mode: modeEff, variantId: pack.id,
      });
    }
    if (!ok) { setMessage(L("Ce pack est en rupture de stock.", "This pack is out of stock.")); return; }
    if (puisCommander) router.push("/checkout"); else setAjoute(true);
  }

  const bouton: React.CSSProperties = {
    display: "flex", alignItems: "center", justifyContent: "center", background: "var(--asta-accent)", color: "#fff", border: 0,
    padding: isSmall ? "16px" : "19px 52px", borderRadius: 50, fontSize: isMobile ? 13 : 15, fontWeight: 800, textDecoration: "none",
    boxShadow: "0 8px 28px rgba(var(--asta-rgb),0.35)", letterSpacing: 0.5, fontFamily: SORA, cursor: "pointer", whiteSpace: "nowrap",
  };
  const surtitre: React.CSSProperties = { color: "var(--asta-gold)", fontSize: isMobile ? 10 : 12, fontWeight: 700, letterSpacing: 2, marginBottom: isMobile ? 8 : 12 };
  const h2: React.CSSProperties = { fontSize: isMobile ? "1.3rem" : isSmall ? "1.7rem" : "clamp(1.8rem, 3vw, 2.4rem)", fontWeight: 800, fontFamily: SORA, marginBottom: 12 };

  const blocsInfo = [
    { id: "description", titre: L("Description", "Description"), texte: c.description },
    { id: "ingredients", titre: L("Composition", "Ingredients"), texte: c.ingredients },
    { id: "utilisation", titre: L("Conseils d'utilisation", "How to use"), texte: c.utilisation },
    { id: "precautions", titre: L("Précautions", "Precautions"), texte: c.precautions },
  ].filter((b) => b.texte);

  return (
    <HydrationGuard bg="var(--asta-bg)" style={{ color: "var(--asta-text)", overflowX: "hidden", ...(c.theme === "violet" ? THEME_VIOLET : {}) }}>
      {/* BANDEAU */}
      <div style={{ background: "var(--asta-deep)", color: "#fff", textAlign: "center", padding: "10px 16px", fontSize: isMobile ? 12 : 13, fontWeight: 600, lineHeight: 1.5 }}>
        🚚 {L("Livraison au Cameroun", "Delivery in Cameroon")} &nbsp;·&nbsp; 🔒 {L("Paiement sécurisé Mobile Money", "Secure Mobile Money payment")}
        {garantie > 0 && <> &nbsp;·&nbsp; ✅ {L(`Satisfait ou remboursé ${garantie} jours`, `${garantie}-day money-back guarantee`)}</>}
      </div>

      {/* NAVBAR */}
      <nav style={{ position: "sticky", top: 0, zIndex: 100, background: "var(--asta-nav)", borderBottom: "1px solid var(--asta-border)", backdropFilter: "blur(12px)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: isMobile ? "0 16px" : "0 40px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <a href="/" style={{ textDecoration: "none", flexShrink: 0 }}>
            <img src="/images/logo-product.png" alt="Nutrelis" style={{ height: isMobile ? 28 : 40, width: "auto" }} />
          </a>
          {!isSmall && (
            <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
              {[{ label: t("nav.products"), href: "/produits" }, { label: t("nav.reviews"), href: "/avis-clients" }, { label: t("nav.faq"), href: "/faq" }].map((i) => (
                <a key={i.href} href={i.href} style={{ color: "var(--asta-text2)", fontSize: 14, fontWeight: 500, textDecoration: "none" }}>{i.label}</a>
              ))}
            </div>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <NavbarCart dark={false} />
            <a href="#commander" style={{ background: "var(--asta-accent)", color: "#fff", padding: isMobile ? "8px 14px" : "10px 24px", borderRadius: 8, fontSize: isMobile ? 12 : 14, fontWeight: 700, textDecoration: "none", boxShadow: "0 4px 14px rgba(var(--asta-rgb),0.25)", fontFamily: SORA, whiteSpace: "nowrap" }}>
              {isMobile ? t("nav.order") : t("nav.orderArrow")}
            </a>
          </div>
        </div>
      </nav>

      {/* NAVIGATION ENTRE SECTIONS */}
      {liens.length >= 4 && (
        <div style={{ position: "sticky", top: 60, zIndex: 90, background: "rgba(255,255,255,0.97)", borderBottom: "1px solid var(--asta-border)", backdropFilter: "blur(10px)" }}>
          <nav aria-label={L("Sections de la page", "Page sections")} style={{ maxWidth: 1280, margin: "0 auto", padding: isMobile ? "0 12px" : "0 40px", display: "flex", gap: 4, overflowX: "auto", scrollbarWidth: "none" }}>
            {liens.map(([id, nom]) => (
              <a key={id} href={`#${id}`} style={{ flexShrink: 0, padding: "11px 14px", fontSize: 13, fontWeight: 700, color: "var(--asta-text2)", textDecoration: "none", whiteSpace: "nowrap" }}>{nom}</a>
            ))}
          </nav>
        </div>
      )}

      {/* HÉROS */}
      <section style={{ background: "#fff", display: "grid", gridTemplateColumns: isSmall ? "1fr" : "1fr 1fr", minHeight: isSmall ? "auto" : 540, overflow: "hidden" }}>
        <div style={{ position: "relative", background: "radial-gradient(ellipse at 50% 50%, #f7d5cf 0%, #fde8e4 40%, #fff5f3 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: isMobile ? "32px 16px" : "40px 20px", overflow: "hidden", minHeight: isSmall ? 280 : undefined }}>
          {!isMobile && <div style={{ position: "absolute", width: 420, height: 420, borderRadius: "50%", border: "1px solid rgba(var(--asta-rgb),0.06)", top: "50%", left: "50%", transform: "translate(-50%,-50%)", pointerEvents: "none" }} />}
          {garantie > 0 && (
            <div style={{ position: "absolute", top: isMobile ? 12 : 40, right: isMobile ? 16 : 52, zIndex: 40, width: isMobile ? 72 : 100, height: isMobile ? 72 : 100, borderRadius: "50%", background: "#fff", border: "3px solid var(--asta-accent)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 16px rgba(var(--asta-rgb),0.2)" }}>
              <span style={{ color: "var(--asta-accent)", fontSize: isMobile ? 20 : 28, fontWeight: 900, lineHeight: 1 }}>{garantie}</span>
              <span style={{ color: "var(--asta-accent)", fontSize: isMobile ? 8 : 11, fontWeight: 800, letterSpacing: 0.5 }}>{t("common.days")}</span>
              {!isMobile && <span style={{ color: "#888", fontSize: 7, textAlign: "center", padding: "0 6px", lineHeight: 1.3 }}>{L("satisfait ou remboursé", "money-back guarantee")}</span>}
            </div>
          )}
          {images[0]
            ? <img src={images[0]} alt={produit.name} style={{ width: isMobile ? "62%" : "58%", maxWidth: 340, height: "auto", objectFit: "contain", position: "relative", zIndex: 2, filter: "drop-shadow(0 24px 48px rgba(var(--asta-rgb),0.2))" }} />
            : <span style={{ fontSize: 96, position: "relative", zIndex: 2 }}>🌿</span>}
          {remise(defaut) > 0 && (
            <div style={{ position: "absolute", bottom: isMobile ? 20 : 64, left: isMobile ? 16 : 52, zIndex: 3, background: "var(--asta-accent)", color: "#fff", fontWeight: 900, fontSize: isMobile ? 13 : 17, padding: isMobile ? "5px 10px" : "8px 16px", borderRadius: 50, boxShadow: "0 4px 16px rgba(var(--asta-rgb),0.4)" }}>−{remise(defaut)}%</div>
          )}
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 5, background: "linear-gradient(90deg, transparent, var(--asta-accent) 30%, var(--asta-accent) 70%, transparent)" }} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", padding: isMobile ? "28px 16px" : sc === "tablet" ? "32px 28px" : "40px 48px 40px 40px", background: "#fff" }}>
          {avis.length > 0 && (
            <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 24, background: "#f9f9f9", borderRadius: 50, padding: "8px 18px", width: "fit-content", border: "1px solid #eee", flexWrap: "wrap" }}>
              <span style={{ color: "#00b67a", fontSize: 15, letterSpacing: -1 }}>{"★".repeat(Math.round(moyenne))}</span>
              <span style={{ color: "#333", fontSize: 13, fontWeight: 600 }}>{moyenne.toFixed(1)}/5</span>
              <span style={{ color: "#ccc" }}>|</span>
              <span style={{ color: "#555", fontSize: 13 }}>{avis.length} {avis.length > 1 ? L("avis clients", "customer reviews") : L("avis client", "customer review")}</span>
            </div>
          )}
          {c.categorie && <span style={{ alignSelf: "flex-start", marginBottom: 14, background: "var(--asta-soft)", color: "var(--asta-accent)", fontSize: 11, fontWeight: 800, letterSpacing: 1.5, padding: "5px 14px", borderRadius: 50, border: "1px solid var(--asta-border)", textTransform: "uppercase" }}>{c.categorie}</span>}
          <h1 style={{ fontSize: isMobile ? "1.6rem" : isSmall ? "2.2rem" : "clamp(2.4rem, 3.5vw, 2.9rem)", fontWeight: 800, lineHeight: 1.15, marginBottom: 18, fontFamily: SORA, color: "#0d0d0d", letterSpacing: -0.5 }}>{titre}</h1>
          {(c.accroche ?? produit.subtitle) && <p style={{ color: "#666", fontSize: 15, lineHeight: 1.75, marginBottom: 28, maxWidth: 460 }}>{c.accroche ?? produit.subtitle}</p>}
          {points.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 32 }}>
              {points.map((p, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 22, height: 22, borderRadius: "50%", background: "var(--asta-tint)", border: "1.5px solid var(--asta-accent)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ color: "var(--asta-accent)", fontSize: 11, fontWeight: 900 }}>✓</span>
                  </div>
                  <span style={{ color: "#444", fontSize: 14, fontWeight: 500 }}>{p}</span>
                </div>
              ))}
            </div>
          )}
          <a href="#commander" style={{ ...bouton, width: isSmall ? "100%" : "fit-content" }}>{enStock ? L("COMMANDER MAINTENANT →", "ORDER NOW →") : L("VOIR LE PRODUIT →", "VIEW PRODUCT →")}</a>
          <div style={{ display: "flex", gap: 20, marginTop: 16, fontSize: 12, color: "#999", flexWrap: "wrap" }}>
            <span>🔒 {L("Paiement sécurisé", "Secure payment")}</span>
            <span>🚚 {L("Livraison au Cameroun", "Delivery in Cameroon")}</span>
            {garantie > 0 && <span>✅ {L(`Garantie ${garantie} jours`, `${garantie}-day guarantee`)}</span>}
          </div>
        </div>
      </section>

      {/* BANDEAU DE CONFIANCE */}
      <div style={{ background: "var(--asta-accent)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)" }}>
          {[
            { label: L("PAIEMENT SÉCURISÉ MOBILE MONEY", "SECURE MOBILE MONEY PAYMENT"), svg: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
            { label: L("LIVRAISON AU CAMEROUN", "DELIVERY IN CAMEROON"), svg: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
            { label: garantie > 0 ? L(`SATISFAIT OU REMBOURSÉ ${garantie} JOURS`, `${garantie}-DAY MONEY-BACK GUARANTEE`) : L("QUALITÉ NUTRELIS", "NUTRELIS QUALITY"), svg: "M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064" },
          ].map((b, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, padding: isMobile ? "14px 16px" : "22px 28px", borderRight: !isMobile && i < 2 ? "1px solid rgba(255,255,255,0.2)" : "none", borderBottom: isMobile && i < 2 ? "1px solid rgba(255,255,255,0.2)" : "none" }}>
              <div style={{ width: 44, height: 44, borderRadius: 50, border: "1.5px solid rgba(255,255,255,0.4)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, background: "rgba(255,255,255,0.08)" }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={b.svg} /></svg>
              </div>
              <span style={{ color: "#fff", fontSize: 13, fontWeight: 700, letterSpacing: 0.8 }}>{b.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* RAISONS */}
      {(c.raisons?.length ?? 0) > 0 && (
        <section id="avantages" style={{ scrollMarginTop: 120, background: "var(--asta-bg2)", padding: isMobile ? `28px ${px}` : `${py} ${px}` }}>
          <div style={{ maxWidth: 1280, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: isMobile ? 20 : 48 }}>
              <p style={{ ...surtitre, color: "var(--asta-accent)" }}>{L("POURQUOI NUTRELIS", "WHY NUTRELIS")}</p>
              <h2 style={h2}>{L("Les raisons de choisir", "Reasons to choose")} {produit.name}</h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : `repeat(${Math.min(c.raisons!.length, sc === "tablet" ? 3 : 5)}, 1fr)`, gap: isMobile ? 10 : 16 }}>
              {c.raisons!.map((r, i) => (
                <div key={i} style={{ background: "#fff", borderRadius: 24, border: "2px solid var(--asta-border)", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                  {r.image && <div style={{ height: isMobile ? 120 : 170, overflow: "hidden" }}><img src={r.image} alt={r.titre} style={{ width: "100%", height: "100%", objectFit: "cover" }} /></div>}
                  <div style={{ padding: isMobile ? "12px" : "20px", textAlign: "center" }}>
                    <div style={{ display: "inline-block", background: "var(--asta-bg2)", color: "var(--asta-accent)", fontSize: isMobile ? 9 : 11, fontWeight: 700, letterSpacing: 1, padding: "3px 10px", borderRadius: 20, marginBottom: 8 }}>{String(i + 1).padStart(2, "0")}</div>
                    <div style={{ fontFamily: SORA, fontWeight: 800, fontSize: isMobile ? 12 : 15, marginBottom: 6 }}>{r.titre}</div>
                    <div style={{ color: "var(--asta-text2)", fontSize: isMobile ? 11 : 13, lineHeight: 1.6 }}>{r.texte}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ROUTINE EN ÉTAPES */}
      {(c.etapes?.length ?? 0) > 0 && (
        <section id="routine" style={{ scrollMarginTop: 120, background: "#fff", padding: isMobile ? `28px ${px}` : `${py} ${px}` }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: isMobile ? 20 : 44 }}>
              <p style={surtitre}>{L("COMMENT L'UTILISER", "HOW TO USE")}</p>
              <h2 style={h2}>{L(`Une routine en ${c.etapes!.length} étape${c.etapes!.length > 1 ? "s" : ""}`, `A ${c.etapes!.length}-step routine`)}</h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : `repeat(${Math.min(c.etapes!.length, 3)}, 1fr)`, gap: 18 }}>
              {c.etapes!.map((e, i) => (
                <div key={i} style={{ background: "var(--asta-bg)", border: "1.5px solid var(--asta-border)", borderRadius: 22, padding: 24 }}>
                  <div style={{ width: 40, height: 40, borderRadius: "50%", background: "var(--asta-accent)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontFamily: SORA, marginBottom: 12 }}>{i + 1}</div>
                  <div style={{ fontFamily: SORA, fontWeight: 800, fontSize: 16, marginBottom: 6 }}>{e.titre}</div>
                  <div style={{ color: "var(--asta-text2)", fontSize: 14, lineHeight: 1.7 }}>{e.texte}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CHIFFRES CLÉS — toujours accompagnés de leur source */}
      {(c.chiffres?.length ?? 0) > 0 && c.sourceChiffres && (
        <section style={{ background: "var(--asta-accent)", padding: isMobile ? `28px ${px}` : `56px ${px}` }}>
          <div style={{ maxWidth: 1100, margin: "0 auto", textAlign: "center" }}>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : `repeat(${c.chiffres!.length}, 1fr)`, gap: 24 }}>
              {c.chiffres!.map((x, i) => (
                <div key={i}>
                  <div style={{ color: "#fff", fontFamily: SORA, fontWeight: 900, fontSize: isMobile ? "2rem" : "2.8rem", lineHeight: 1.1 }}>{x.valeur}</div>
                  <div style={{ color: "rgba(255,255,255,0.85)", fontSize: isMobile ? 12 : 14, marginTop: 6 }}>{x.libelle}</div>
                </div>
              ))}
            </div>
            <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 12, marginTop: 20 }}>{L("Source", "Source")} : {c.sourceChiffres}</p>
          </div>
        </section>
      )}

      {/* COMMANDER */}
      <section id="commander" style={{ scrollMarginTop: 120, padding: isMobile ? `28px ${px}` : `${py} ${px}`, background: "var(--asta-bg)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: isMobile ? 20 : 52 }}>
            <p style={surtitre}>{L("COMMANDEZ MAINTENANT", "ORDER NOW")}</p>
            <h2 style={h2}>{L("Choisissez votre formule", "Choose your pack")}</h2>
            <p style={{ color: "var(--asta-text2)", fontSize: isMobile ? 12 : 15 }}>{L("Paiement sécurisé par Mobile Money ou à la livraison.", "Secure payment by Mobile Money or on delivery.")}</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: isSmall ? "1fr" : "1fr 1fr", gap: isSmall ? 24 : 60, alignItems: "start" }}>
            {/* Galerie */}
            <div style={{ order: isSmall ? 2 : 1 }}>
              <div style={{ background: "radial-gradient(ellipse at 50% 50%, #f7d5cf 0%, #fde8e4 45%, #fff5f3 100%)", borderRadius: 24, border: "1px solid var(--asta-border)", display: "flex", alignItems: "center", justifyContent: "center", minHeight: isMobile ? 280 : 440, padding: 24 }}>
                {images[photo] ? <img src={images[photo]} alt={produit.name} loading="lazy" decoding="async" style={{ maxWidth: "100%", maxHeight: isMobile ? 280 : 400, objectFit: "contain" }} /> : <span style={{ fontSize: 80 }}>🌿</span>}
              </div>
              {images.length > 1 && (
                <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
                  {images.map((src, i) => (
                    <button key={src} onClick={() => setPhoto(i)} style={{ width: 70, height: 70, borderRadius: 12, padding: 4, background: "#fff", cursor: "pointer", border: `2px solid ${photo === i ? "var(--asta-accent)" : "var(--asta-border)"}` }}>
                      <img src={src} alt="" loading="lazy" decoding="async" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Packs */}
            <div style={{ order: isSmall ? 1 : 2 }}>
              {avis.length > 0 && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  <Etoiles note={moyenne} taille={16} />
                  <span style={{ color: "var(--asta-text2)", fontSize: 13 }}>{moyenne.toFixed(1)}/5 · {avis.length} {L("avis", "reviews")}</span>
                </div>
              )}
              <h3 style={{ fontFamily: SORA, fontWeight: 800, fontSize: 20, marginBottom: 8, lineHeight: 1.3 }}>{produit.name.toUpperCase()}{produit.subtitle ? ` — ${produit.subtitle}` : ""}</h3>
              {pack && (
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8, flexWrap: "wrap" }}>
                  {remiseM(pack) > 0 && <span style={{ color: "var(--asta-text2)", fontSize: 15, textDecoration: "line-through" }}>{fcfa(ancienDe(pack)!)}</span>}
                  <span style={{ color: "var(--asta-accent)", fontSize: 26, fontWeight: 900, fontFamily: SORA }}>{fcfa(prixDe(pack))}</span>
                </div>
              )}
              {produit.description && <p style={{ color: "var(--asta-text2)", fontSize: 14, lineHeight: 1.7, marginBottom: 20, borderLeft: "3px solid var(--asta-accent)", paddingLeft: 12 }}>{produit.description}</p>}

              {abo && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", gap: 6, background: "var(--asta-bg2)", border: "1.5px solid var(--asta-border)", borderRadius: 12, padding: 5 }}>
                    {([["unique", L("Achat unique", "One-time purchase")], ["abonnement", `⭐ ${L(`Abonnement −${abonnement.pct}%`, `Subscribe −${abonnement.pct}%`)}`]] as const).map(([id, nom]) => (
                      <button key={id} onClick={() => setMode(id)} aria-pressed={modeEff === id} style={{ padding: "12px 8px", border: 0, borderRadius: 8, fontWeight: 700, fontSize: isMobile ? 13 : 14, fontFamily: SORA, cursor: "pointer", background: modeEff === id ? "var(--asta-accent)" : "transparent", color: modeEff === id ? "#fff" : "var(--asta-text2)", lineHeight: 1.25 }}>{nom}</button>
                    ))}
                  </div>
                  {modeEff === "abonnement" && (
                    <div style={{ marginTop: 10, background: "var(--asta-tint)", border: "1px solid var(--asta-accent)", borderRadius: 10, padding: "10px 14px", fontSize: isMobile ? 12 : 13.5, color: "var(--asta-text2)", lineHeight: 1.6 }}>
                      📦 <strong style={{ color: "var(--asta-text)" }}>{L("Livraison régulière", "Regular delivery")}</strong> &nbsp;·&nbsp; 💰 <strong style={{ color: "var(--asta-text)" }}>{L(`−${abonnement.pct}% à chaque livraison`, `−${abonnement.pct}% on every delivery`)}</strong> &nbsp;·&nbsp; ✅ <strong style={{ color: "var(--asta-text)" }}>{L("Annulable à tout moment", "Cancel anytime")}</strong>
                    </div>
                  )}
                </div>
              )}
              <p style={{ fontWeight: 700, fontSize: 13, letterSpacing: 1, marginBottom: 12 }}>{L("CHOISISSEZ VOTRE PACK", "CHOOSE YOUR PACK")}</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {packs.map((p) => {
                  const choisi = p.id === packId;
                  return (
                    <button key={p.id} onClick={() => p.inStock && setPackId(p.id)} disabled={!p.inStock} aria-pressed={choisi}
                      style={{ position: "relative", textAlign: "left", display: "flex", alignItems: "center", gap: isMobile ? 8 : 16, padding: isMobile ? "10px 10px" : "16px 20px", borderRadius: 12, cursor: p.inStock ? "pointer" : "not-allowed", opacity: p.inStock ? 1 : 0.55, background: choisi ? "var(--asta-tint)" : "#fff", border: `2px solid ${choisi ? "var(--asta-accent)" : "var(--asta-border)"}`, transition: "all .2s" }}>
                      {p.popular && <span style={{ position: "absolute", top: -11, right: 16, background: "var(--asta-accent)", color: "#fff", fontSize: isMobile ? 8 : 10, fontWeight: 800, letterSpacing: 1, padding: isMobile ? "2px 8px" : "3px 10px", borderRadius: 20 }}>{L("LE PLUS POPULAIRE", "MOST POPULAR")}</span>}
                      <div style={{ width: 22, height: 22, borderRadius: "50%", border: `2px solid ${choisi ? "var(--asta-accent)" : "#ccc"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        {choisi && <div style={{ width: 12, height: 12, borderRadius: "50%", background: "var(--asta-accent)" }} />}
                      </div>
                      {c.imagesPacks?.[p.sku] && <img src={c.imagesPacks[p.sku]} alt="" loading="lazy" decoding="async" style={{ height: isMobile ? 48 : 60, width: "auto", flexShrink: 0, objectFit: "contain" }} />}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontFamily: SORA, fontWeight: 800, fontSize: isMobile ? 12 : 15, lineHeight: 1.3 }}>{p.label}</div>
                        {p.description && <div style={{ color: "var(--asta-text2)", fontSize: isMobile ? 10 : 12, marginTop: 2 }}>{p.description}</div>}
                        {!p.inStock && <div style={{ color: "#b91c1c", fontSize: 12, fontWeight: 700, marginTop: 2 }}>{L("Rupture de stock", "Out of stock")}</div>}
                        {p.inStock && p.stockFaible && <div style={{ color: "#b45309", fontSize: 12, fontWeight: 700, marginTop: 2 }}>{L("Plus que quelques exemplaires", "Only a few left")}</div>}
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <div style={{ color: "var(--asta-accent)", fontSize: isMobile ? 15 : 22, fontWeight: 900, lineHeight: 1, fontFamily: SORA }}>
                          {prixDe(p).toLocaleString("fr-FR")}<span style={{ fontSize: 12 }}> FCFA</span>
                        </div>
                        {remiseM(p) > 0 && <div style={{ color: "#aaa", fontSize: 12, textDecoration: "line-through" }}>{ancienDe(p)!.toLocaleString("fr-FR")} F</div>}
                        {remiseM(p) > 0 && <div style={{ color: "#1a7a3c", fontSize: isMobile ? 9 : 11, fontWeight: 800 }}>−{remiseM(p)}%</div>}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 20, flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "center", border: "1.5px solid var(--asta-border)", borderRadius: 50, background: "#fff" }}>
                  <button onClick={() => setQte(Math.max(1, qte - 1))} aria-label={L("Moins", "Less")} style={{ width: 44, height: 48, background: "none", border: 0, fontSize: 20, cursor: "pointer", color: "var(--asta-accent)" }}>−</button>
                  <span style={{ minWidth: 28, textAlign: "center", fontWeight: 800 }}>{qte}</span>
                  <button onClick={() => setQte(Math.min(10, qte + 1))} aria-label={L("Plus", "More")} style={{ width: 44, height: 48, background: "none", border: 0, fontSize: 20, cursor: "pointer", color: "var(--asta-accent)" }}>+</button>
                </div>
                <button onClick={() => void ajouter(true)} disabled={!pack?.inStock} style={{ ...bouton, flex: 1, minWidth: 200, opacity: pack?.inStock ? 1 : 0.5, cursor: pack?.inStock ? "pointer" : "not-allowed" }}>
                  {pack?.inStock ? L("COMMANDER MAINTENANT", "ORDER NOW") : L("RUPTURE DE STOCK", "OUT OF STOCK")}
                </button>
              </div>
              <button onClick={() => void ajouter(false)} disabled={!pack?.inStock} style={{ marginTop: 10, width: "100%", background: "#fff", color: "var(--asta-accent)", border: "2px solid var(--asta-accent)", padding: "13px", borderRadius: 50, fontWeight: 800, fontSize: 14, fontFamily: SORA, cursor: pack?.inStock ? "pointer" : "not-allowed", opacity: pack?.inStock ? 1 : 0.5 }}>
                {L("Ajouter au panier", "Add to cart")}
              </button>
              <p style={{ marginTop: 10, color: "var(--asta-text2)", fontSize: 12.5, textAlign: "center" }}>🔒 {L("Paiement Mobile Money sécurisé ou à la livraison", "Secure Mobile Money payment or pay on delivery")}{garantie > 0 ? ` · ✅ ${L(`Garantie ${garantie} jours`, `${garantie}-day guarantee`)}` : ""}</p>
              {message && <p role="alert" style={{ marginTop: 12, color: "#b91c1c", fontWeight: 700, fontSize: 14 }}>{message}</p>}
              {ajoute && <p style={{ marginTop: 12, fontWeight: 700, fontSize: 14 }}>✓ {L("Ajouté au panier.", "Added to cart.")} <a href="/panier" style={{ color: "var(--asta-accent)" }}>{L("Voir le panier", "View cart")}</a></p>}

              {(c.avantages?.length ?? 0) > 0 && (
                <div style={{ marginTop: 24, padding: "16px 20px", background: "var(--asta-bg2)", borderRadius: 12, border: "1px solid var(--asta-border)" }}>
                  <p style={{ fontSize: 13, color: "var(--asta-text2)", marginBottom: 12, fontWeight: 600 }}>{L("Ce que vous obtenez :", "What you get:")}</p>
                  {c.avantages!.map((b, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 8 }}>
                      <span style={{ color: "#1db954", fontSize: 14, flexShrink: 0, marginTop: 2 }}>✓</span>
                      <span style={{ color: "var(--asta-text2)", fontSize: 13 }}>{b}</span>
                    </div>
                  ))}
                </div>
              )}

              {blocsInfo.length > 0 && (
                <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 10 }}>
                  {blocsInfo.map((b) => (
                    <Question key={b.id} q={b.titre} a={b.texte!} ouvert={info === b.id} onClic={() => setInfo(info === b.id ? null : b.id)} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* VIDÉOS */}
      {(c.videos?.length ?? 0) > 0 && (
        <section id="videos" style={{ scrollMarginTop: 120, background: "var(--asta-bg)", padding: isMobile ? `28px ${px}` : `${py} ${px}` }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: isMobile ? 20 : 40 }}>
              <p style={surtitre}>{L("EN VIDÉO", "WATCH")}</p>
              <h2 style={h2}>{L("Découvrez le produit", "Discover the product")}</h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: isSmall || c.videos!.length === 1 ? "1fr" : "1fr 1fr", gap: 20, maxWidth: c.videos!.length === 1 ? 760 : undefined, margin: "0 auto" }}>
              {c.videos!.map((v) => (
                <div key={v.url}>
                  <div style={{ position: "relative", paddingTop: "56.25%", borderRadius: 20, overflow: "hidden", border: "1.5px solid var(--asta-border)", background: "#000" }}>
                    {v.url.startsWith("/api/media/")
                      ? <video src={v.url} controls playsInline preload="metadata" aria-label={v.titre ?? produit.name} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain", background: "#000" }} />
                      : <iframe src={v.url} title={v.titre ?? produit.name} loading="lazy" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }} />}
                  </div>
                  {v.titre && <p style={{ textAlign: "center", color: "var(--asta-text2)", fontSize: 13, marginTop: 8 }}>{v.titre}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* COMPARATIF */}
      {(c.comparatif?.length ?? 0) > 0 && (
        <section style={{ background: "var(--asta-bg2)", padding: isMobile ? `28px ${px}` : `${py} ${px}` }}>
          <div style={{ maxWidth: 860, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: isMobile ? 20 : 36 }}>
              <p style={{ ...surtitre, color: "var(--asta-accent)" }}>{L("COMPARATIF", "COMPARISON")}</p>
              <h2 style={h2}>{produit.name} {L("face aux autres solutions", "vs. other solutions")}</h2>
            </div>
            <div style={{ background: "#fff", borderRadius: 20, border: "1.5px solid var(--asta-border)", overflow: "hidden" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr 1fr", background: "var(--asta-accent)", color: "#fff", fontWeight: 800, fontSize: isMobile ? 12 : 14, fontFamily: SORA }}>
                <div style={{ padding: "14px 16px" }} />
                <div style={{ padding: "14px 16px", textAlign: "center" }}>NUTRELIS</div>
                <div style={{ padding: "14px 16px", textAlign: "center" }}>{L("Autres", "Others")}</div>
              </div>
              {c.comparatif!.map((r, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr 1fr", borderTop: "1px solid var(--asta-border)", fontSize: isMobile ? 12 : 14 }}>
                  <div style={{ padding: "14px 16px", fontWeight: 700 }}>{r.critere}</div>
                  <div style={{ padding: "14px 16px", textAlign: "center", color: "#1a7a3c", fontWeight: 700 }}>✓ {r.nous}</div>
                  <div style={{ padding: "14px 16px", textAlign: "center", color: "var(--asta-text2)" }}>{r.autres}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* PHOTOS DE RÉSULTATS — uniquement avec l'accord des personnes */}
      {(c.resultats?.length ?? 0) > 0 && (
        <section style={{ background: "#fff", padding: isMobile ? `28px ${px}` : `${py} ${px}` }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: isMobile ? 20 : 40 }}>
              <p style={surtitre}>{L("RÉSULTATS", "RESULTS")}</p>
              <h2 style={h2}>{L("Photos de clientes", "Customer photos")}</h2>
              <p style={{ color: "var(--asta-text2)", fontSize: 13 }}>{L("Publiées avec l'accord des personnes. Les résultats varient d'une personne à l'autre.", "Published with the consent of the people shown. Results vary from person to person.")}</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)", gap: 14 }}>
              {c.resultats!.map((src) => <img key={src} src={src} alt="" loading="lazy" decoding="async" style={{ width: "100%", aspectRatio: "1 / 1", objectFit: "cover", borderRadius: 18, border: "1.5px solid var(--asta-border)" }} />)}
            </div>
          </div>
        </section>
      )}

      {/* AVIS CLIENTS — uniquement de vrais avis saisis dans l'administration */}
      {avis.length > 0 && (
        <section id="avis" style={{ scrollMarginTop: 120, background: "#fff", padding: isMobile ? `28px ${px}` : `${py} ${px}` }}>
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: isMobile ? 20 : 44 }}>
              <p style={surtitre}>{L("AVIS CLIENTS", "CUSTOMER REVIEWS")}</p>
              <h2 style={h2}>{L("Ils ont essayé", "They tried it")} {produit.name}</h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : sc === "tablet" ? "1fr 1fr" : "repeat(3, 1fr)", gap: 18 }}>
              {avis.map((r, i) => (
                <div key={i} style={{ background: "var(--asta-bg)", border: "1px solid var(--asta-border)", borderRadius: 20, padding: 22 }}>
                  <Etoiles note={r.note} />
                  <p style={{ color: "var(--asta-text)", fontSize: 14, lineHeight: 1.7, margin: "10px 0 14px", whiteSpace: "pre-line" }}>« {r.texte} »</p>
                  <div style={{ fontWeight: 800, fontSize: 13 }}>{r.nom}{r.ville ? <span style={{ color: "var(--asta-text2)", fontWeight: 500 }}> · {r.ville}</span> : null}</div>
                  {r.verifie && <div style={{ color: "#1a7a3c", fontSize: 12, fontWeight: 700, marginTop: 4 }}>✓ {L("Achat vérifié", "Verified purchase")}</div>}
                  {r.reponse && <div style={{ marginTop: 10, paddingLeft: 12, borderLeft: "3px solid var(--asta-accent)", color: "var(--asta-text2)", fontSize: 13, lineHeight: 1.6 }}><strong>{L("Réponse de la boutique", "Reply from the shop")} :</strong> {r.reponse}</div>}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ */}
      {(c.faq?.length ?? 0) > 0 && (
        <section id="faq" style={{ scrollMarginTop: 120, background: "var(--asta-bg)", padding: isMobile ? `28px ${px}` : `${py} ${px}` }}>
          <div style={{ maxWidth: 820, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: isMobile ? 20 : 40 }}>
              <p style={surtitre}>FAQ</p>
              <h2 style={h2}>{L("Vos questions", "Your questions")}</h2>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {c.faq!.map((f, i) => <Question key={i} q={f.q} a={f.a} ouvert={faqOuverte === i} onClic={() => setFaqOuverte(faqOuverte === i ? null : i)} />)}
            </div>
          </div>
        </section>
      )}

      {/* GARANTIE */}
      {garantie > 0 && (
        <section style={{ background: "#fff", padding: isMobile ? `28px ${px}` : `${py} ${px}` }}>
          <div style={{ maxWidth: 640, margin: "0 auto", textAlign: "center" }}>
            <div style={{ width: isMobile ? 110 : 140, height: isMobile ? 110 : 140, borderRadius: "50%", border: "4px solid var(--asta-accent)", margin: "0 auto 20px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 28px rgba(var(--asta-rgb),0.18)" }}>
              <span style={{ color: "var(--asta-accent)", fontSize: isMobile ? 34 : 44, fontWeight: 900, lineHeight: 1, fontFamily: SORA }}>{garantie}</span>
              <span style={{ color: "var(--asta-accent)", fontSize: isMobile ? 12 : 14, fontWeight: 800 }}>{t("common.days")}</span>
            </div>
            <p style={{ ...surtitre, color: "var(--asta-accent)" }}>{L("SENTEZ LA DIFFÉRENCE", "FEEL THE DIFFERENCE")}</p>
            <h2 style={{ ...h2, marginBottom: 16 }}>{L("Satisfait ou remboursé", "Money-back guarantee")}</h2>
            <p style={{ color: "var(--asta-text2)", fontSize: isMobile ? 13 : 15, lineHeight: 1.7, maxWidth: 440, margin: "0 auto 28px" }}>
              {L(`Essayez ${produit.name} pendant ${garantie} jours. Si vous n'êtes pas satisfait, contactez-nous : nous vous remboursons.`, `Try ${produit.name} for ${garantie} days. If you are not satisfied, contact us and we will refund you.`)}
            </p>
            <a href="#commander" style={{ ...bouton, display: "inline-flex" }}>{L("ESSAYER SANS RISQUE", "TRY RISK-FREE")}</a>
          </div>
        </section>
      )}

      {/* PIED DE PAGE */}
      <footer style={{ background: "#1a0505", padding: `64px ${px} ${isSmall ? 96 : 32}px` }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : sc === "tablet" ? "1fr 1fr 1fr" : "2fr 1fr 1fr 1fr", gap: isMobile ? 24 : 48, marginBottom: 48 }}>
            <div>
              <div style={{ marginBottom: 20 }}><a href="/"><img src="/images/logo-homepage.png" alt="Nutrelis" style={{ height: isMobile ? 26 : 36, width: "auto" }} /></a></div>
              <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.8, maxWidth: 280 }}>{t("product.footerDesc")}</p>
            </div>
            {[
              { title: t("product.footerProducts"), links: [...autres.map((p) => ({ label: p.name, href: `/produits/${p.slug}` })), { label: t("product.footerAllProducts"), href: "/produits" }] },
              { title: t("product.footerInfo"), links: [{ label: t("product.footerAbout"), href: "/a-propos" }, { label: t("product.footerBlog"), href: "/blog" }, { label: t("product.footerContact"), href: "/contact" }] },
              { title: t("product.footerService"), links: [{ label: t("product.footerFaq"), href: "/faq" }, { label: t("product.footerShipping"), href: "/livraison" }, { label: t("product.footerRefunds"), href: "/retours" }, { label: t("product.footerTerms"), href: "/cgv" }] },
            ].map((col, i) => (
              <div key={i}>
                <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: 700, letterSpacing: 2, marginBottom: 20 }}>{col.title}</p>
                {col.links.map((l, j) => <a key={j} href={l.href} style={{ display: "block", color: "rgba(255,255,255,0.65)", fontSize: 14, textDecoration: "none", marginBottom: 12 }}>{l.label}</a>)}
              </div>
            ))}
          </div>
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 24, display: "flex", flexDirection: isMobile ? "column" : "row", justifyContent: "space-between", gap: 8 }}>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: isMobile ? 11 : 13 }}>{t("product.footerRights")}</p>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: isMobile ? 11 : 13 }}>{t("product.footerDelivery")}</p>
          </div>
        </div>
      </footer>

      {isSmall && barre && pack && (
        <div style={{ position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 95, background: "rgba(255,255,255,0.98)", borderTop: "1px solid var(--asta-border)", boxShadow: "0 -6px 24px rgba(0,0,0,0.10)", padding: "10px 14px calc(10px + env(safe-area-inset-bottom, 0px))", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: 13, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{produit.name}</div>
            <div style={{ color: "var(--asta-accent)", fontWeight: 900, fontFamily: SORA, fontSize: 16 }}>{fcfa(pack.priceFcfa)}</div>
          </div>
          {pack.inStock
            ? <button onClick={() => void ajouter(true)} style={{ ...bouton, padding: "13px 22px", fontSize: 13, flexShrink: 0 }}>{L("COMMANDER", "ORDER")}</button>
            : <span style={{ color: "#b91c1c", fontWeight: 800, fontSize: 13 }}>{L("Rupture de stock", "Out of stock")}</span>}
        </div>
      )}

      <FloatingActions accent="#7D0806" />
    </HydrationGuard>
  );
}
