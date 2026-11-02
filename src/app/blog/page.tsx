"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import NavbarCart from "@/components/NavbarCart";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useLocale } from "@/context/LocaleContext";
import { useScreenSize } from "@/hooks/useIsMobile";
import HydrationGuard from "@/components/HydrationGuard";

type Article = {
  slug: string; title: string; excerpt: string; category: string; image_url: string | null; external_url: string | null;
  has_body: boolean; published_at: string; product_slug: string | null; product_name: string | null;
};

/** Blog : les articles viennent de la console (onglet Blog) ; chacun peut être rattaché à un produit. Les filtres suivent les produits. */
const CAT_EN: Record<string, string> = { Conseils: "Tips", "Beauté": "Beauty", "Santé": "Health", Utilisation: "How to use", Produit: "Product" };

export default function Blog() {
  const { t, locale } = useLocale();
  const screen = useScreenSize();
  const isMobile = screen === "mobile";
  const isSmall = screen === "mobile" || screen === "tablet";
  const px = isMobile ? "16px" : isSmall ? "24px" : "60px";
  const [articles, setArticles] = useState<Article[] | null>(null);
  const [filtre, setFiltre] = useState("tous");

  useEffect(() => {
    void fetch(`/api/blog?lang=${locale}`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { articles: [] }))
      .then((d: { articles?: Article[] }) => setArticles(d.articles ?? []))
      .catch(() => setArticles([]));
  }, [locale]);

  const tous = articles ?? [];
  // Filtres : « Tous », un par produit ayant au moins un article, et « Conseils généraux » s'il y en a.
  const produits = Array.from(new Map(tous.filter((a) => a.product_slug).map((a) => [a.product_slug as string, a.product_name as string])).entries());
  const aGeneraux = tous.some((a) => !a.product_slug);
  const visibles = tous.filter((a) => filtre === "tous" || (filtre === "general" ? !a.product_slug : a.product_slug === filtre));
  const vedette = visibles[0];
  const reste = visibles.slice(1);
  const lien = (a: Article) => (a.has_body ? `/blog/${a.slug}` : a.external_url ?? "#");
  const externe = (a: Article) => !a.has_body && !!a.external_url;
  const date = (iso: string) => new Date(iso).toLocaleDateString(locale === "fr" ? "fr-FR" : "en-GB", { day: "numeric", month: "long", year: "numeric" });
  const puce = (a: Article) => a.product_name ?? t("blogPage.general");

  const carte = (a: Article, grande = false) => (
    <a key={a.slug} href={lien(a)} target={externe(a) ? "_blank" : undefined} rel={externe(a) ? "noopener noreferrer" : undefined}
      style={{ display: "flex", flexDirection: grande && !isSmall ? "row" : "column", background: "#fff", border: "1px solid #e8e8e8", borderRadius: 22, overflow: "hidden", textDecoration: "none", color: "inherit", boxShadow: "0 2px 16px rgba(0,0,0,0.04)" }}>
      <div style={{ background: "#0a1a0d", flex: grande && !isSmall ? "0 0 48%" : undefined, aspectRatio: grande && !isSmall ? undefined : "16 / 9", minHeight: grande && !isSmall ? 300 : undefined, position: "relative" }}>
        {a.image_url
          ? <img src={a.image_url} alt={a.title} loading="lazy" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
          : <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48, opacity: 0.5 }}>📰</div>}
      </div>
      <div style={{ padding: grande ? (isMobile ? "22px 18px" : "36px 34px") : "22px", display: "flex", flexDirection: "column", justifyContent: "center", gap: 10, flex: 1 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ background: "#e8f5eb", color: "var(--accent)", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, letterSpacing: 0.5 }}>{puce(a)}</span>
          <span style={{ color: "#999", fontSize: 12 }}>{locale === "fr" ? a.category : (CAT_EN[a.category] ?? a.category)} · {date(a.published_at)}</span>
        </div>
        <h2 style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: grande ? (isMobile ? "1.15rem" : "1.5rem") : "1.05rem", fontWeight: 800, lineHeight: 1.35, margin: 0 }}>{a.title}</h2>
        {a.excerpt && <p style={{ color: "#555", fontSize: grande ? 15 : 14, lineHeight: 1.7, margin: 0 }}>{a.excerpt}</p>}
        <span style={{ color: "var(--accent)", fontWeight: 700, fontSize: 14, marginTop: 4 }}>{t("blogPage.readArticle")}{externe(a) ? " ↗" : ""}</span>
      </div>
    </a>
  );

  return (
    <HydrationGuard bg="#fff" style={{ color: "#1a1a1a", overflowX: "hidden" }}>
      {/* NAVBAR */}
      <nav style={{ background: "#060f08", borderBottom: "1px solid #1a3522", padding: isMobile ? "0 12px" : isSmall ? "0 24px" : "0 60px", height: isMobile ? 56 : 68, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
        <Link href="/" style={{ textDecoration: "none", flexShrink: 0 }}>
          <img src="/images/logo-homepage.png" alt="Nutrelis" style={{ height: isMobile ? 28 : 40, width: "auto" }} />
        </Link>
        {!isSmall && (
          <div style={{ display: "flex", gap: 32 }}>
            {[{ label: t("nav.products"), href: "/#produits" }, { label: t("nav.faq"), href: "/faq" }].map((item) => (
              <Link key={item.href} href={item.href} style={{ color: "rgba(255,255,255,0.65)", fontSize: 14, fontWeight: 500, textDecoration: "none" }}>{item.label}</Link>
            ))}
          </div>
        )}
        <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 8 : 12 }}>
          <LanguageSwitcher />
          <NavbarCart />
          <Link href="/#produits" style={{ background: "var(--accent)", color: "#060f08", padding: isMobile ? "8px 12px" : "10px 24px", borderRadius: 8, fontSize: isMobile ? 11 : 14, fontWeight: 800, textDecoration: "none", fontFamily: "var(--font-sora), sans-serif", whiteSpace: "nowrap" }}>
            {isMobile ? t("home.navShop") : t("home.navShopArrow")}
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ background: "linear-gradient(135deg, #060f08, #0a1a0d)", padding: isMobile ? "40px 16px" : isSmall ? "56px 24px" : "72px 60px", textAlign: "center" }}>
        <p style={{ color: "var(--accent)", fontSize: 12, fontWeight: 700, letterSpacing: 2, marginBottom: 16 }}>{t("blogPage.heroTag")}</p>
        <h1 style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: isMobile ? "1.6rem" : isSmall ? "2rem" : "clamp(2rem, 4vw, 3.2rem)", fontWeight: 900, color: "#f0fff4", marginBottom: 16 }}>
          {t("blogPage.heroTitle1")}<span style={{ color: "var(--accent)" }}>{t("blogPage.heroTitleHighlight")}</span>
        </h1>
        <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 16, maxWidth: 560, margin: "0 auto" }}>{t("blogPage.heroDesc")}</p>
      </section>

      {/* ARTICLES */}
      <section style={{ padding: isMobile ? "32px 16px 56px" : isSmall ? "48px 24px 72px" : "64px 60px 88px" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto" }}>
          {articles === null && <p style={{ textAlign: "center", color: "#777" }}>{locale === "fr" ? "Chargement…" : "Loading…"}</p>}
          {articles !== null && tous.length === 0 && <p style={{ textAlign: "center", color: "#666", fontSize: 16 }}>{t("blogPage.empty")}</p>}

          {tous.length > 0 && (
            <>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 36 }}>
                {[{ cle: "tous", nom: t("blogPage.filterAllProducts") }, ...produits.map(([cle, nom]) => ({ cle, nom })), ...(aGeneraux ? [{ cle: "general", nom: t("blogPage.general") }] : [])].map((f) => (
                  <button key={f.cle} onClick={() => setFiltre(f.cle)} style={{
                    padding: "10px 18px", borderRadius: 24, fontSize: 14, fontWeight: 600, cursor: "pointer", border: "1.5px solid",
                    borderColor: filtre === f.cle ? "var(--accent)" : "#ddd", background: filtre === f.cle ? "#e8f5eb" : "#fff", color: filtre === f.cle ? "var(--accent)" : "#555",
                  }}>{f.nom}</button>
                ))}
              </div>

              {vedette && <div style={{ marginBottom: 28 }}>{carte(vedette, true)}</div>}
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "minmax(0, 1fr)" : isSmall ? "repeat(2, minmax(0, 1fr))" : "repeat(3, minmax(0, 1fr))", gap: isMobile ? 18 : 26 }}>
                {reste.map((a) => carte(a))}
              </div>
            </>
          )}
        </div>
      </section>

      <footer style={{ background: "#030a04", padding: isMobile ? "28px 16px" : "36px 60px", textAlign: "center" }}>
        <div style={{ display: "flex", gap: 24, justifyContent: "center", flexWrap: "wrap" }}>
          {[{ label: t("blogPage.footerHome"), href: "/" }, { label: t("blogPage.footerProducts"), href: "/#produits" }, { label: t("blogPage.footerContact"), href: "/contact" }].map((l) => (
            <Link key={l.href} href={l.href} style={{ color: "rgba(255,255,255,0.5)", fontSize: isMobile ? 11 : 13, textDecoration: "none" }}>{l.label}</Link>
          ))}
        </div>
      </footer>
    </HydrationGuard>
  );
}
