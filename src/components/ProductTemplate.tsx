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
};

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
  const { t, locale } = useLocale();
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
  useEffect(() => { if (!packId && defaut) setPackId(defaut.id); }, [defaut, packId]);

  const pack = packs.find((p) => p.id === packId) ?? defaut;
  const remise = (p?: PackCatalogue) => (p && p.originalPriceFcfa && p.originalPriceFcfa > p.priceFcfa ? Math.round(100 * (1 - p.priceFcfa / p.originalPriceFcfa)) : 0);
  const avis = c.avis ?? [];
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

  async function ajouter(puisCommander: boolean) {
    if (!pack || !pack.inStock) return;
    setMessage("");
    let ok = true;
    for (let i = 0; i < qte && ok; i++) {
      ok = await ajouterArticle({
        id: pack.id, nom: `${produit.name} — ${pack.label}`, description: pack.label, prix: pack.priceFcfa,
        prixOriginal: pack.originalPriceFcfa ?? pack.priceFcfa, image: images[0] ?? "", mode: "unique", variantId: pack.id,
      });
    }
    if (!ok) { setMessage(L("Ce pack est en rupture de stock.", "This pack is out of stock.")); return; }
    if (puisCommander) router.push("/checkout"); else setAjoute(true);
  }

  const bouton: React.CSSProperties = {
    display: "flex", alignItems: "center", justifyContent: "center", background: "var(--asta-accent)", color: "#fff", border: 0,
    padding: isSmall ? "16px" : "19px 52px", borderRadius: 50, fontSize: isMobile ? 13 : 15, fontWeight: 800, textDecoration: "none",
    boxShadow: "0 8px 28px rgba(125,8,6,0.35)", letterSpacing: 0.5, fontFamily: SORA, cursor: "pointer", whiteSpace: "nowrap",
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
    <HydrationGuard bg="var(--asta-bg)" style={{ color: "var(--asta-text)", overflowX: "hidden" }}>
      {/* BANDEAU */}
      <div style={{ background: "#7D0806", color: "#fff", textAlign: "center", padding: "10px 16px", fontSize: isMobile ? 12 : 13, fontWeight: 600, lineHeight: 1.5 }}>
        🚚 {L("Livraison au Cameroun", "Delivery in Cameroon")} &nbsp;·&nbsp; 🔒 {L("Paiement sécurisé Mobile Money", "Secure Mobile Money payment")}
        {garantie > 0 && <> &nbsp;·&nbsp; ✅ {L(`Satisfait ou remboursé ${garantie} jours`, `${garantie}-day money-back guarantee`)}</>}
      </div>

      {/* NAVBAR */}
      <nav style={{ position: "sticky", top: 0, zIndex: 100, background: "rgba(255,248,246,0.97)", borderBottom: "1px solid var(--asta-border)", backdropFilter: "blur(12px)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: isMobile ? "0 16px" : "0 40px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <a href="/" style={{ textDecoration: "none", flexShrink: 0 }}>
            <img src="/images/logo-product.png" alt="Nutrelis" style={{ height: isMobile ? 28 : 40, width: "auto" }} />
          </a>
          {!isSmall && (
            <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
              {[{ label: t("nav.products"), href: "/produits" }, { label: t("nav.science"), href: "/science" }, { label: t("nav.reviews"), href: "/avis-clients" }, { label: t("nav.faq"), href: "/faq" }].map((i) => (
                <a key={i.href} href={i.href} style={{ color: "var(--asta-text2)", fontSize: 14, fontWeight: 500, textDecoration: "none" }}>{i.label}</a>
              ))}
            </div>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <NavbarCart dark={false} />
            <a href="#commander" style={{ background: "var(--asta-accent)", color: "#fff", padding: isMobile ? "8px 14px" : "10px 24px", borderRadius: 8, fontSize: isMobile ? 12 : 14, fontWeight: 700, textDecoration: "none", boxShadow: "0 4px 14px rgba(125,8,6,0.25)", fontFamily: SORA, whiteSpace: "nowrap" }}>
              {isMobile ? t("nav.order") : t("nav.orderArrow")}
            </a>
          </div>
        </div>
      </nav>

      {/* HÉROS */}
      <section style={{ background: "#fff", display: "grid", gridTemplateColumns: isSmall ? "1fr" : "1fr 1fr", minHeight: isSmall ? "auto" : 540, overflow: "hidden" }}>
        <div style={{ position: "relative", background: "radial-gradient(ellipse at 50% 50%, #f7d5cf 0%, #fde8e4 40%, #fff5f3 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: isMobile ? "32px 16px" : "40px 20px", overflow: "hidden", minHeight: isSmall ? 280 : undefined }}>
          {!isMobile && <div style={{ position: "absolute", width: 420, height: 420, borderRadius: "50%", border: "1px solid rgba(125,8,6,0.06)", top: "50%", left: "50%", transform: "translate(-50%,-50%)", pointerEvents: "none" }} />}
          {garantie > 0 && (
            <div style={{ position: "absolute", top: isMobile ? 12 : 40, right: isMobile ? 16 : 52, zIndex: 40, width: isMobile ? 72 : 100, height: isMobile ? 72 : 100, borderRadius: "50%", background: "#fff", border: "3px solid var(--asta-accent)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 16px rgba(125,8,6,0.2)" }}>
              <span style={{ color: "var(--asta-accent)", fontSize: isMobile ? 20 : 28, fontWeight: 900, lineHeight: 1 }}>{garantie}</span>
              <span style={{ color: "var(--asta-accent)", fontSize: isMobile ? 8 : 11, fontWeight: 800, letterSpacing: 0.5 }}>{t("common.days")}</span>
              {!isMobile && <span style={{ color: "#888", fontSize: 7, textAlign: "center", padding: "0 6px", lineHeight: 1.3 }}>{L("satisfait ou remboursé", "money-back guarantee")}</span>}
            </div>
          )}
          {images[0]
            ? <img src={images[0]} alt={produit.name} style={{ width: isMobile ? "62%" : "58%", maxWidth: 340, height: "auto", objectFit: "contain", position: "relative", zIndex: 2, filter: "drop-shadow(0 24px 48px rgba(125,8,6,0.2))" }} />
            : <span style={{ fontSize: 96, position: "relative", zIndex: 2 }}>🌿</span>}
          {remise(defaut) > 0 && (
            <div style={{ position: "absolute", bottom: isMobile ? 20 : 64, left: isMobile ? 16 : 52, zIndex: 3, background: "var(--asta-accent)", color: "#fff", fontWeight: 900, fontSize: isMobile ? 13 : 17, padding: isMobile ? "5px 10px" : "8px 16px", borderRadius: 50, boxShadow: "0 4px 16px rgba(125,8,6,0.4)" }}>−{remise(defaut)}%</div>
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
          <h1 style={{ fontSize: isMobile ? "1.6rem" : isSmall ? "2.2rem" : "clamp(2.4rem, 3.5vw, 2.9rem)", fontWeight: 800, lineHeight: 1.15, marginBottom: 18, fontFamily: SORA, color: "#0d0d0d", letterSpacing: -0.5 }}>{titre}</h1>
          {(c.accroche ?? produit.subtitle) && <p style={{ color: "#666", fontSize: 15, lineHeight: 1.75, marginBottom: 28, maxWidth: 460 }}>{c.accroche ?? produit.subtitle}</p>}
          {points.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 32 }}>
              {points.map((p, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 22, height: 22, borderRadius: "50%", background: "#fdecea", border: "1.5px solid var(--asta-accent)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
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
        <section style={{ background: "var(--asta-bg2)", padding: isMobile ? `28px ${px}` : `${py} ${px}` }}>
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

      {/* COMMANDER */}
      <section id="commander" style={{ padding: isMobile ? `28px ${px}` : `${py} ${px}`, background: "var(--asta-bg)" }}>
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
                {images[photo] ? <img src={images[photo]} alt={produit.name} style={{ maxWidth: "100%", maxHeight: isMobile ? 280 : 400, objectFit: "contain" }} /> : <span style={{ fontSize: 80 }}>🌿</span>}
              </div>
              {images.length > 1 && (
                <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
                  {images.map((src, i) => (
                    <button key={src} onClick={() => setPhoto(i)} style={{ width: 70, height: 70, borderRadius: 12, padding: 4, background: "#fff", cursor: "pointer", border: `2px solid ${photo === i ? "var(--asta-accent)" : "var(--asta-border)"}` }}>
                      <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
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
                  {remise(pack) > 0 && <span style={{ color: "var(--asta-text2)", fontSize: 15, textDecoration: "line-through" }}>{fcfa(pack.originalPriceFcfa!)}</span>}
                  <span style={{ color: "var(--asta-accent)", fontSize: 26, fontWeight: 900, fontFamily: SORA }}>{fcfa(pack.priceFcfa)}</span>
                </div>
              )}
              {produit.description && <p style={{ color: "var(--asta-text2)", fontSize: 14, lineHeight: 1.7, marginBottom: 20, borderLeft: "3px solid var(--asta-accent)", paddingLeft: 12 }}>{produit.description}</p>}

              <p style={{ fontWeight: 700, fontSize: 13, letterSpacing: 1, marginBottom: 12 }}>{L("CHOISISSEZ VOTRE PACK", "CHOOSE YOUR PACK")}</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {packs.map((p) => {
                  const choisi = p.id === packId;
                  return (
                    <button key={p.id} onClick={() => p.inStock && setPackId(p.id)} disabled={!p.inStock}
                      style={{ position: "relative", textAlign: "left", display: "flex", alignItems: "center", gap: 14, padding: "16px 18px", borderRadius: 16, cursor: p.inStock ? "pointer" : "not-allowed", opacity: p.inStock ? 1 : 0.55, background: choisi ? "#fdecea" : "#fff", border: `2px solid ${choisi ? "var(--asta-accent)" : "var(--asta-border)"}`, transition: "all .2s" }}>
                      {p.popular && <span style={{ position: "absolute", top: -11, right: 16, background: "var(--asta-accent)", color: "#fff", fontSize: 10, fontWeight: 800, letterSpacing: 1, padding: "3px 12px", borderRadius: 20 }}>{L("LE PLUS POPULAIRE", "MOST POPULAR")}</span>}
                      <div style={{ width: 22, height: 22, borderRadius: "50%", border: `2px solid ${choisi ? "var(--asta-accent)" : "#ccc"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        {choisi && <div style={{ width: 12, height: 12, borderRadius: "50%", background: "var(--asta-accent)" }} />}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontFamily: SORA, fontWeight: 800, fontSize: 15 }}>{p.label}</div>
                        {p.description && <div style={{ color: "var(--asta-text2)", fontSize: 12, marginTop: 2 }}>{p.description}</div>}
                        {!p.inStock && <div style={{ color: "#b91c1c", fontSize: 12, fontWeight: 700, marginTop: 2 }}>{L("Rupture de stock", "Out of stock")}</div>}
                        {p.inStock && p.stockFaible && <div style={{ color: "#b45309", fontSize: 12, fontWeight: 700, marginTop: 2 }}>{L("Plus que quelques exemplaires", "Only a few left")}</div>}
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        {remise(p) > 0 && <div style={{ color: "var(--asta-text2)", fontSize: 12, textDecoration: "line-through" }}>{fcfa(p.originalPriceFcfa!)}</div>}
                        <div style={{ color: "var(--asta-accent)", fontWeight: 900, fontSize: 17, fontFamily: SORA }}>{fcfa(p.priceFcfa)}</div>
                        {remise(p) > 0 && <div style={{ color: "#1a7a3c", fontSize: 11, fontWeight: 800 }}>−{remise(p)}%</div>}
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
              {message && <p style={{ marginTop: 12, color: "#b91c1c", fontWeight: 700, fontSize: 14 }}>{message}</p>}
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

      {/* AVIS CLIENTS — uniquement de vrais avis saisis dans l'administration */}
      {avis.length > 0 && (
        <section style={{ background: "#fff", padding: isMobile ? `28px ${px}` : `${py} ${px}` }}>
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
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ */}
      {(c.faq?.length ?? 0) > 0 && (
        <section style={{ background: "var(--asta-bg)", padding: isMobile ? `28px ${px}` : `${py} ${px}` }}>
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
            <div style={{ width: isMobile ? 110 : 140, height: isMobile ? 110 : 140, borderRadius: "50%", border: "4px solid var(--asta-accent)", margin: "0 auto 20px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 28px rgba(125,8,6,0.18)" }}>
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
      <footer style={{ background: "#1a0505", padding: `64px ${px} 32px` }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : sc === "tablet" ? "1fr 1fr 1fr" : "2fr 1fr 1fr 1fr", gap: isMobile ? 24 : 48, marginBottom: 48 }}>
            <div>
              <div style={{ marginBottom: 20 }}><a href="/"><img src="/images/logo-homepage.png" alt="Nutrelis" style={{ height: isMobile ? 26 : 36, width: "auto" }} /></a></div>
              <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.8, maxWidth: 280 }}>{t("product.footerDesc")}</p>
            </div>
            {[
              { title: t("product.footerProducts"), links: [...autres.map((p) => ({ label: p.name, href: `/produits/${p.slug}` })), { label: t("product.footerAllProducts"), href: "/produits" }] },
              { title: t("product.footerInfo"), links: [{ label: t("product.footerAbout"), href: "/a-propos" }, { label: t("product.footerScience"), href: "/science" }, { label: t("product.footerBlog"), href: "/blog" }, { label: t("product.footerContact"), href: "/contact" }] },
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

      <FloatingActions accent="#7D0806" />
    </HydrationGuard>
  );
}
