"use client";
import NavbarCart from "@/components/NavbarCart";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useScreenSize } from "@/hooks/useIsMobile";
import { useLocale } from "@/context/LocaleContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import HydrationGuard from "@/components/HydrationGuard";
import FloatingActions from "@/components/FloatingActions";
import { fetchProducts, getVariantPrice, type MedusaProduct } from "@/lib/medusa-products";

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const screen = useScreenSize();
  const isMobile = screen === "mobile";
  const isTablet = screen === "tablet";
  const isSmall = isMobile || isTablet;
  const { t } = useLocale();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      background: "rgba(6,15,8,0.95)",
      backdropFilter: "blur(12px)",
      borderBottom: "1px solid rgba(29,185,84,0.1)",
      transition: "background 0.3s, border-color 0.3s",
      padding: isMobile ? "0 16px" : isTablet ? "0 32px" : "0 60px",
      height: isMobile ? 58 : isTablet ? 64 : 70,
      display: "flex", alignItems: "center", justifyContent: "space-between",
    }}>
      <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", flexShrink: 0 }}>
        <img src="/images/logo-homepage.png" alt="Nutrelis" style={{ height: isMobile ? 28 : isTablet ? 34 : 40, width: "auto" }} />
      </Link>

      {!isSmall && (
        <div style={{ display: "flex", gap: 32, alignItems: "center" }}>
          {[
            { label: t("home.navProducts"), href: "#produits" },
            { label: t("home.footerShipping"), href: "/livraison" },
            { label: t("home.footerAbout"), href: "/a-propos" },
            { label: t("home.footerContact"), href: "/contact" },
          ].map((item) => (
            <Link key={item.label} href={item.href} style={{ color: "rgba(255,255,255,0.75)", fontSize: 14, fontWeight: 500, textDecoration: "none" }}>
              {item.label}
            </Link>
          ))}
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 6 : 8 }}>
        {!isMobile && <LanguageSwitcher />}
        <NavbarCart />
        <Link href="#produits" style={{
          background: "var(--accent)", color: "#fff",
          padding: isMobile ? "7px 10px" : "10px 20px",
          borderRadius: 8, fontSize: isMobile ? 11 : 14, fontWeight: 700, textDecoration: "none",
          fontFamily: "var(--font-sora), sans-serif",
          whiteSpace: "nowrap",
        }}>
          {isMobile ? t("home.navShop") : t("home.navShopArrow")}
        </Link>
      </div>
    </nav>
  );
}

/**
 * Carrousel de la boutique : une bannière par produit. L'image est celle saisie dans la console (fiche du produit, « image du
 * carrousel ») ; sans image, la photo principale du produit est montrée sur un fond neutre. Un produit ajouté dans la console y
 * apparaît tout seul. Défilement automatique (durée réglable dans Paramètres, 0 = arrêté), en pause au survol et au clavier,
 * arrêté si le visiteur a demandé moins d'animations ; flèches, points et balayage au doigt.
 */
function CarrouselProduits({ produits, bannieres, secondes }: { produits: MedusaProduct[]; bannieres: Record<string, string>; secondes: number }) {
  const { locale } = useLocale();
  const ecran = useScreenSize();
  const isMobile = ecran === "mobile";
  const diapos = produits.filter((p) => bannieres[p.id] || p.thumbnail);
  const n = diapos.length;
  const [i, setI] = useState(0);
  const [pause, setPause] = useState(false);
  const depart = useRef<number | null>(null);

  useEffect(() => { if (i >= n) setI(0); }, [n, i]);
  useEffect(() => {
    if (n < 2 || secondes <= 0 || pause) return;
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setI((k) => (k + 1) % n), secondes * 1000);
    return () => clearInterval(id);
  }, [n, secondes, pause]);

  if (n === 0) return <div style={{ width: "100%", aspectRatio: "16 / 9" }} />;
  const aller = (d: number) => setI((k) => (k + d + n) % n);
  const fr = locale === "fr";
  const fleche = (cote: "left" | "right", d: number, symbole: string, nom: string) => (
    <button type="button" aria-label={nom} onClick={() => aller(d)} style={{
      position: "absolute", top: "50%", transform: "translateY(-50%)", [cote]: 10, zIndex: 3, width: isMobile ? 34 : 42, height: isMobile ? 34 : 42, borderRadius: "50%",
      border: "1px solid rgba(255,255,255,0.35)", background: "rgba(6,15,8,0.55)", color: "#fff", fontSize: 22, lineHeight: 1, cursor: "pointer", backdropFilter: "blur(4px)",
    }}>{symbole}</button>
  );

  return (
    <div
      role="region" aria-roledescription="carrousel" aria-label={fr ? "Nos produits" : "Our products"}
      onMouseEnter={() => setPause(true)} onMouseLeave={() => setPause(false)}
      onFocus={() => setPause(true)} onBlur={() => setPause(false)}
      onPointerDown={(e) => { depart.current = e.clientX; }}
      onPointerUp={(e) => { if (depart.current !== null) { const dx = e.clientX - depart.current; if (Math.abs(dx) > 40) aller(dx < 0 ? 1 : -1); depart.current = null; } }}
      style={{
        position: "relative", width: "100%", aspectRatio: "16 / 9", borderRadius: isMobile ? 18 : 26, overflow: "hidden", touchAction: "pan-y",
        background: "radial-gradient(ellipse at 50% 60%, #12331a 0%, #060f08 100%)",
        boxShadow: "0 24px 60px rgba(0,0,0,0.45), 0 0 0 1px rgba(29,185,84,0.25)",
      }}
    >
      {diapos.map((p, k) => {
        const prix = Math.min(...p.variants.map(getVariantPrice).filter((x) => x > 0));
        const banniere = bannieres[p.id];
        return (
          <Link key={p.id} href={`/produits/${p.handle}`} aria-hidden={k !== i} tabIndex={k === i ? 0 : -1}
            aria-label={`${p.title}${Number.isFinite(prix) ? ` — ${prix.toLocaleString("fr-FR")} FCFA` : ""}`}
            style={{ position: "absolute", inset: 0, display: "block", textDecoration: "none", color: "#fff", opacity: k === i ? 1 : 0, transition: "opacity 0.7s ease", pointerEvents: k === i ? "auto" : "none" }}>
            {banniere
              ? <img src={banniere} alt={p.title} draggable={false} loading={k === 0 ? "eager" : "lazy"} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
              : <img src={p.thumbnail as string} alt={p.title} draggable={false} style={{ position: "absolute", left: "50%", top: "46%", transform: "translate(-50%, -50%)", height: "72%", width: "auto", maxWidth: "70%", objectFit: "contain", filter: "drop-shadow(0 18px 36px rgba(29,185,84,0.25))" }} />}
            <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: isMobile ? "28px 14px 14px" : "52px 24px 22px", background: "linear-gradient(0deg, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0) 100%)", display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12 }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontFamily: "var(--font-sora), sans-serif", fontWeight: 800, fontSize: isMobile ? 15 : 20, textShadow: "0 2px 8px rgba(0,0,0,0.5)" }}>{p.title}</div>
                {Number.isFinite(prix) && (
                  <div style={{ color: "#fff", opacity: 0.9, fontWeight: 600, fontSize: isMobile ? 12 : 14, marginTop: 2 }}>
                    {p.variants.length > 1 ? (fr ? "À partir de " : "From ") : ""}{prix.toLocaleString("fr-FR")} FCFA
                  </div>
                )}
              </div>
              <span style={{ background: "var(--accent)", color: "#fff", fontWeight: 800, fontSize: isMobile ? 12 : 14, padding: isMobile ? "8px 14px" : "11px 22px", borderRadius: 50, whiteSpace: "nowrap", fontFamily: "var(--font-sora), sans-serif" }}>{fr ? "Découvrir" : "Discover"}</span>
            </div>
          </Link>
        );
      })}
      {n > 1 && fleche("left", -1, "‹", fr ? "Produit précédent" : "Previous product")}
      {n > 1 && fleche("right", 1, "›", fr ? "Produit suivant" : "Next product")}
      {n > 1 && (
        <div style={{ position: "absolute", left: 0, right: 0, top: 12, display: "flex", justifyContent: "center", gap: 8, zIndex: 3 }}>
          {diapos.map((p, k) => (
            <button key={p.id} type="button" aria-label={p.title} aria-current={k === i} onClick={() => setI(k)}
              style={{ width: k === i ? 24 : 9, height: 9, borderRadius: 9, border: "none", cursor: "pointer", background: k === i ? "#fff" : "rgba(255,255,255,0.45)", transition: "all 0.25s", padding: 0 }} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Homepage() {
  const screen = useScreenSize();
  const isMobile = screen === "mobile";
  const isTablet = screen === "tablet";
  const isDesktop = screen === "desktop";
  const { t, locale, boutique } = useLocale();
  const fr = locale === "fr";
  // Catalogue : tous les produits actifs de la boutique (null tant qu'il n'est pas chargé).
  const [produits, setProduits] = useState<MedusaProduct[] | null>(null);
  // Avis vérifiés (achat livré, validés dans la console), tous produits confondus.
  const [bannieres, setBannieres] = useState<Record<string, string>>({});
  const [avisBoutique, setAvisBoutique] = useState<{ rating: number; body: string; display_name: string; city: string | null; produit: string }[]>([]);

  useEffect(() => {
    fetchProducts().then(setProduits);
    void fetch("/api/catalog", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        const tous: { rating: number; body: string; display_name: string; city: string | null; produit: string }[] = [];
        for (const p of d?.products ?? []) for (const a of p.avisVerifies ?? []) tous.push({ ...a, produit: p.name });
        setAvisBoutique(tous.slice(0, 6));
        setBannieres(Object.fromEntries((d?.products ?? []).filter((p: { content?: { banniere?: string } }) => p.content?.banniere).map((p: { id: string; content: { banniere: string } }) => [p.id, p.content.banniere])));
      })
      .catch(() => undefined);
  }, []);

  const px = isMobile ? "16px" : isTablet ? "32px" : "60px";
  const py = isMobile ? "56px" : isTablet ? "72px" : "100px";

  return (
    <HydrationGuard bg="var(--bg-primary)" style={{ color: "#fff", overflowX: "hidden" }}>
      <Navbar />

      {/* Badge langue fixe — mobile uniquement */}
      {isMobile && (
        <div style={{
          position: "fixed",
          left: 0,
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 99,
        }}>
          <LanguageSwitcher variant="badge" />
        </div>
      )}

      {/* HERO : la boutique, tous les produits (aucun produit n'est mis en avant ici) */}
      <section style={{
        background: "radial-gradient(ellipse at 30% 50%, rgba(29,185,84,0.12) 0%, transparent 60%), var(--bg-primary)",
        display: "flex", alignItems: "center",
        padding: isMobile ? `80px ${px} 52px` : isTablet ? `100px ${px} 64px` : `120px ${px} 80px`,
        position: "relative", overflow: "hidden",
      }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", width: "100%" }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: isDesktop ? "minmax(0, 1.15fr) minmax(0, 1fr)" : "minmax(0, 1fr)",
            gap: isMobile ? 32 : isTablet ? 48 : 80,
            alignItems: "center",
          }}>
            {/* Tous les produits de la boutique, côte à côte */}
            <div style={{ position: "relative", display: "flex", justifyContent: "center", alignItems: "center" }}>
              <div style={{ position: "absolute", inset: "6%", background: "radial-gradient(circle, rgba(29,185,84,0.15) 0%, transparent 70%)", borderRadius: "50%" }} />
              <CarrouselProduits produits={produits ?? []} bannieres={bannieres} secondes={boutique.carrousel} />
            </div>

            {/* Texte */}
            <div style={{ textAlign: isMobile ? "center" : "left" }}>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: "rgba(29,185,84,0.1)", border: "1px solid rgba(29,185,84,0.3)",
                borderRadius: 20, padding: "6px 14px", marginBottom: 20,
              }}>
                <span style={{ color: "var(--accent)", fontSize: isMobile ? 10 : 12, fontWeight: 700, letterSpacing: 1 }}>
                  {t("home.shopPill")}
                </span>
              </div>

              <h1 style={{
                fontFamily: "var(--font-sora), sans-serif",
                fontSize: isMobile ? "1.6rem" : isTablet ? "2.2rem" : "clamp(2.4rem, 4vw, 3.8rem)",
                fontWeight: 900, lineHeight: 1.15, marginBottom: 18, letterSpacing: -0.5,
              }}>
                {boutique.titre ? boutique.titre : <>{t("home.shopTitle1")}{" "}
                <span style={{ color: "var(--accent)" }}>{t("home.shopTitleHighlight")}</span></>}
              </h1>

              <p style={{
                color: "rgba(255,255,255,0.65)", fontSize: isMobile ? 14 : isTablet ? 16 : 18, lineHeight: 1.8,
                maxWidth: isMobile ? "100%" : 520, margin: isMobile ? "0 auto 28px" : "0 0 28px 0",
              }}>
                {boutique.description || t("home.shopDesc")}
              </p>

              <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 32, justifyContent: isMobile ? "center" : "flex-start", flexWrap: "wrap" }}>
                <Link href="#produits" style={{
                  background: "var(--accent)", color: "#fff",
                  padding: isMobile ? "14px 24px" : "18px 40px", borderRadius: 12,
                  fontSize: isMobile ? 14 : 16, fontWeight: 900, textDecoration: "none",
                  fontFamily: "var(--font-sora), sans-serif", boxShadow: "0 8px 32px rgba(29,185,84,0.35)",
                }}>
                  {t("home.shopCta")}
                </Link>
              </div>

              <div style={{ display: "flex", gap: isMobile ? 20 : 40, justifyContent: isMobile ? "center" : "flex-start", flexWrap: "wrap" }}>
                {[
                  { val: String((produits ?? []).length || ""), label: t("home.statProducts") },
                  { val: "24 h", label: t("home.statShip") },
                  { val: "90 j", label: t("home.statWarranty") },
                ].filter((s) => s.val !== "").map((stat, i) => (
                  <div key={i} style={{ textAlign: isMobile ? "center" : "left" }}>
                    <div style={{ color: "var(--accent)", fontSize: isMobile ? 17 : 22, fontWeight: 900, fontFamily: "var(--font-sora), sans-serif" }}>{stat.val}</div>
                    <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 11 }}>{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BADGES CONFIANCE */}
      <section style={{ background: "rgba(29,185,84,0.08)", borderTop: "1px solid rgba(29,185,84,0.15)", borderBottom: "1px solid rgba(29,185,84,0.15)", padding: `18px ${px}` }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", display: "flex", justifyContent: "center", gap: isMobile ? 12 : 40, flexWrap: "wrap" }}>
          {[
            { icon: "🚚", label: t("home.trustDelivery") },
            { icon: "📱", label: t("home.trustPay") },
            { icon: "✅", label: t("home.trustGuarantee") },
            { icon: "📦", label: t("home.trustShip") },
          ].map((b, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: isMobile ? 14 : 18 }}>{b.icon}</span>
              <span style={{ color: "rgba(255,255,255,0.8)", fontSize: isMobile ? 11 : 13, fontWeight: 600 }}>{b.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* PRODUITS */}
      <section id="produits" style={{ padding: `${py} ${px}` }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: isMobile ? 36 : 56 }}>
            <p style={{ color: "var(--accent)", fontSize: 12, fontWeight: 700, letterSpacing: 2, marginBottom: 12 }}>{t("home.productsTag")}</p>
            <h2 style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: isMobile ? "1.3rem" : isTablet ? "1.7rem" : "clamp(1.8rem, 3vw, 2.4rem)", fontWeight: 800 }}>
              {t("home.scienceNature")}
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : isTablet ? "1fr 1fr" : "repeat(3, 1fr)", gap: isMobile ? 20 : 24 }}>
            {/* Tous les produits de la boutique, ajoutés depuis la console : ils apparaissent ici tout seuls */}
            {(produits ?? []).map((p) => {
              const prix = Math.min(...p.variants.map(getVariantPrice));
              const plusieurs = p.variants.length > 1;
              // Remise = la meilleure économie réelle d'un pack (prix du pack vs prix barré de CE pack), pas prix mini vs barré maxi.
              const remise = Math.max(0, ...p.variants.map((v) => {
                const o = Number((v.metadata as { originalPrice?: number } | null)?.originalPrice ?? 0);
                const pv = getVariantPrice(v);
                return o > 0 && pv > 0 ? Math.round(100 * (1 - pv / o)) : 0;
              }));
              const dispo = p.variants.some((v) => v.inStock !== false);
              return (
                <div key={p.id} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(29,185,84,0.3)", borderRadius: isMobile ? 16 : 24, overflow: "hidden" }}>
                  <div style={{ background: "radial-gradient(ellipse at 50% 60%, rgba(29,185,84,0.12) 0%, rgba(6,15,8,0.8) 100%)", padding: isMobile ? "24px 20px" : "32px", textAlign: "center", position: "relative" }}>
                    {remise > 0 && <div style={{ position: "absolute", top: 12, right: 12, background: "var(--accent)", color: "#fff", fontSize: 11, fontWeight: 800, padding: "4px 10px", borderRadius: 20 }}>−{remise}%</div>}
                    {p.thumbnail
                      ? <img src={p.thumbnail} alt={p.title} loading="lazy" style={{ height: isMobile ? 250 : 340, width: "auto", maxWidth: "80%", objectFit: "contain", margin: "12px auto 0", display: "block" }} />
                      : <span style={{ fontSize: isMobile ? 48 : 64, opacity: 0.5 }}>🌿</span>}
                  </div>
                  <div style={{ padding: isMobile ? "16px" : "28px" }}>
                    {p.subtitle && <p style={{ color: "var(--accent)", fontSize: 11, fontWeight: 700, letterSpacing: 1.5, marginBottom: 8, textTransform: "uppercase" }}>{p.subtitle}</p>}
                    <h3 style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: isMobile ? 16 : 20, fontWeight: 800, marginBottom: 10, lineHeight: 1.3 }}>{p.title}</h3>
                    {p.description && <p style={{ color: "rgba(255,255,255,0.55)", fontSize: isMobile ? 13 : 14, lineHeight: 1.7, marginBottom: 14, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{p.description}</p>}
                    <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
                      {prix > 0
                        ? <><span style={{ color: "rgba(255,255,255,0.45)", fontSize: 12 }}>{plusieurs ? (fr ? "À partir de" : "From") : ""}</span>
                          <span style={{ color: "var(--accent)", fontSize: isMobile ? 16 : 22, fontWeight: 900, fontFamily: "var(--font-sora), sans-serif" }}>{prix.toLocaleString("fr-FR")} FCFA</span></>
                        : null}
                      {!dispo && <span style={{ color: "#f87171", fontSize: 12, fontWeight: 700 }}>{fr ? "Rupture de stock" : "Out of stock"}</span>}
                    </div>
                    <Link href={`/produits/${p.handle}`} style={{ display: "block", textAlign: "center", background: "var(--accent)", color: "#fff", padding: isMobile ? "12px" : "14px", borderRadius: 10, fontSize: isMobile ? 13 : 14, fontWeight: 800, textDecoration: "none", fontFamily: "var(--font-sora), sans-serif" }}>
                      {t("home.discover")}
                    </Link>
                  </div>
                </div>
              );
            })}

            {/* Produits à venir : aucun pour l'instant (liste vide) ; ajouter { nom, desc, emoji } pour afficher une carte « Bientôt disponible » */}
            {[
            ].slice(0, Math.max(0, 3 - (produits === null ? 1 : produits.length))).map((p, i) => (
              <div key={i} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: isMobile ? 16 : 24, overflow: "hidden", opacity: 0.6, position: "relative" }}>
                <div style={{ position: "absolute", top: 12, left: "50%", transform: "translateX(-50%)", background: "rgba(255,255,255,0.1)", color: "#fff", fontSize: 10, fontWeight: 700, padding: "4px 14px", borderRadius: 20, zIndex: 2, whiteSpace: "nowrap" }}>{t("home.comingSoon")}</div>
                <div style={{ padding: isMobile ? "28px 20px" : "40px", textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", height: isMobile ? 140 : 200 }}>
                  <span style={{ fontSize: isMobile ? 40 : 56, opacity: 0.3 }}>{p.emoji}</span>
                </div>
                <div style={{ padding: isMobile ? "16px" : "28px" }}>
                  <h3 style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: isMobile ? 15 : 20, fontWeight: 800, marginBottom: 8 }}>{p.nom}</h3>
                  <p style={{ color: "rgba(255,255,255,0.4)", fontSize: isMobile ? 13 : 14, lineHeight: 1.7, marginBottom: 14 }}>{p.desc}</p>
                  <button style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.4)", padding: isMobile ? "11px" : "13px", borderRadius: 10, fontSize: isMobile ? 13 : 14, fontWeight: 700, cursor: "not-allowed" }}>{t("home.comingSoonBtn")}</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* POURQUOI NUTRELIS */}
      <section style={{ padding: `${py} ${px}`, background: "rgba(29,185,84,0.04)", borderTop: "1px solid rgba(29,185,84,0.1)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: isMobile ? 32 : 48 }}>
            <p style={{ color: "var(--accent)", fontSize: 12, fontWeight: 700, letterSpacing: 2, marginBottom: 12 }}>{t("home.philosophyTag")}</p>
            <h2 style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: isMobile ? "1.3rem" : isTablet ? "1.7rem" : "clamp(1.8rem, 3vw, 2.4rem)", fontWeight: 800 }}>
              {t("home.whyChoose")}
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : isTablet ? "1fr 1fr" : "repeat(4, 1fr)", gap: isMobile ? 14 : 24 }}>
            {[
              { icon: "🚚", titre: t("home.whyDelivery"), desc: t("home.whyDeliveryDesc") },
              { icon: "📱", titre: t("home.whyPay"), desc: t("home.whyPayDesc") },
              { icon: "🛡️", titre: t("home.whyWarranty"), desc: t("home.whyWarrantyDesc") },
              { icon: "💬", titre: t("home.whySupport"), desc: t("home.whySupportDesc") },
            ].map((item, i) => (
              <div key={i} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(29,185,84,0.15)", borderRadius: isMobile ? 16 : 20, padding: isMobile ? "16px 14px" : "32px 28px" }}>
                <div style={{ width: isMobile ? 40 : 52, height: isMobile ? 40 : 52, borderRadius: 12, background: "rgba(29,185,84,0.1)", border: "1px solid rgba(29,185,84,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: isMobile ? 18 : 24, marginBottom: 14 }}>{item.icon}</div>
                <h3 style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: isMobile ? 13 : 17, fontWeight: 800, marginBottom: 8 }}>{item.titre}</h3>
                <p style={{ color: "rgba(255,255,255,0.55)", fontSize: isMobile ? 11 : 14, lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AVIS CLIENTS : uniquement les avis vérifiés (achat livré, validés dans la console) ; la section n'existe pas sans avis */}
      {avisBoutique.length > 0 && (
      <section style={{ padding: `${py} ${px}` }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: isMobile ? 32 : 48 }}>
            <p style={{ color: "var(--accent)", fontSize: 12, fontWeight: 700, letterSpacing: 2, marginBottom: 12 }}>{t("home.shopReviewsTag")}</p>
            <h2 style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: isMobile ? "1.3rem" : isTablet ? "1.7rem" : "clamp(1.8rem, 3vw, 2.4rem)", fontWeight: 800 }}>
              {t("home.shopReviewsTitle")}
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "minmax(0, 1fr)" : isTablet ? "repeat(2, minmax(0, 1fr))" : "repeat(3, minmax(0, 1fr))", gap: isMobile ? 16 : 24 }}>
            {avisBoutique.map((avis, i) => (
              <div key={i} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(29,185,84,0.15)", borderRadius: 20, padding: isMobile ? "20px" : "28px" }}>
                <div style={{ color: "var(--accent)", fontSize: 16, marginBottom: 12 }}>{"★".repeat(avis.rating)}</div>
                <p style={{ color: "rgba(255,255,255,0.75)", fontSize: isMobile ? 14 : 15, lineHeight: 1.8, marginBottom: 20, fontStyle: "italic" }}>&ldquo;{avis.body}&rdquo;</p>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: 13 }}>{avis.display_name}{avis.city ? ` · ${avis.city}` : ""}</p>
                    <p style={{ color: "var(--accent)", fontSize: 11, fontWeight: 600 }}>✓ {t("home.verifiedClient")}</p>
                  </div>
                  <span style={{ background: "rgba(29,185,84,0.1)", color: "var(--accent)", fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 20, flexShrink: 0 }}>{avis.produit}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* CTA FINAL */}
      <section style={{ padding: `${py} ${px}`, background: "radial-gradient(ellipse at 50% 50%, rgba(29,185,84,0.12) 0%, transparent 70%)", textAlign: "center", borderTop: "1px solid rgba(29,185,84,0.1)" }}>
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <p style={{ color: "var(--accent)", fontSize: 12, fontWeight: 700, letterSpacing: 2, marginBottom: 16 }}>{t("home.startToday")}</p>
          <h2 style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: isMobile ? "1.5rem" : isTablet ? "1.8rem" : "clamp(2rem, 3vw, 2.8rem)", fontWeight: 900, marginBottom: 20, lineHeight: 1.2 }}>
            {t("home.shopCtaTitle")}
          </h2>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: isMobile ? 14 : 17, lineHeight: 1.8, marginBottom: 32 }}>
            {t("home.shopCtaDesc")}
          </p>
          <Link href="#produits" style={{
            display: "inline-block", background: "var(--accent)", color: "#fff",
            padding: isMobile ? "15px 28px" : "20px 56px", borderRadius: 14,
            fontSize: isMobile ? 14 : 17, fontWeight: 900, textDecoration: "none",
            fontFamily: "var(--font-sora), sans-serif",
            boxShadow: "0 8px 40px rgba(29,185,84,0.4)", marginBottom: 16,
          }}>
            {t("home.shopCtaBtn")}
          </Link>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 12 }}>
            {t("home.guarantee90Free")}
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: "#030a04", borderTop: "1px solid rgba(29,185,84,0.1)", padding: isMobile ? "40px 16px 24px" : isTablet ? "48px 32px 28px" : "60px 60px 40px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : isTablet ? "1fr 1fr 1fr" : "2fr 1fr 1fr 1fr", gap: isMobile ? 28 : 48, marginBottom: 36 }}>
            <div style={{ gridColumn: isMobile ? "1 / -1" : "auto" }}>
              <div style={{ marginBottom: 14 }}>
                <Link href="/">
                  <img src="/images/logo-homepage.png" alt="Nutrelis" style={{ height: isMobile ? 26 : 36, width: "auto" }} />
                </Link>
              </div>
              <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 13, lineHeight: 1.8, maxWidth: 280 }}>
                {t("home.footerShortDesc")}
              </p>
            </div>
            {[
              { titre: t("home.footerProducts"), liens: [...(produits ?? []).map((p) => ({ label: p.title, href: `/produits/${p.handle}` })), { label: t("home.navShop"), href: "#produits" }] },
              { titre: t("home.footerCompany"), liens: [{ label: t("home.footerAbout"), href: "/a-propos" }, { label: t("home.footerBlog"), href: "/blog" }] },
              { titre: t("home.footerSupport"), liens: [{ label: t("home.footerFaq"), href: "/faq" }, { label: t("home.footerContact"), href: "/contact" }, { label: t("home.footerShipping"), href: "/livraison" }] },
            ].map((col, i) => (
              <div key={i}>
                <p style={{ color: "#fff", fontWeight: 700, fontSize: 13, marginBottom: 14 }}>{col.titre}</p>
                {col.liens.map((lien, j) => (
                  <Link key={j} href={lien.href} style={{ display: "block", color: "rgba(255,255,255,0.45)", fontSize: 13, marginBottom: 10, textDecoration: "none" }}>{lien.label}</Link>
                ))}
              </div>
            ))}
          </div>
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 18, display: "flex", flexDirection: isMobile ? "column" : "row", justifyContent: isMobile ? "center" : "space-between", alignItems: "center", gap: isMobile ? 6 : 0, textAlign: isMobile ? "center" : undefined }}>
            <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 11 }}>{t("home.footerRights")}</p>
            <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 11 }}>{t("home.footerDelivery")}</p>
          </div>
        </div>
      </footer>

      <FloatingActions accent="var(--accent)" />
    </HydrationGuard>
  );
}
