"use client";
import { use, useEffect, useState } from "react";
import Link from "next/link";
import NavbarCart from "@/components/NavbarCart";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useLocale } from "@/context/LocaleContext";
import { useScreenSize } from "@/hooks/useIsMobile";
import HydrationGuard from "@/components/HydrationGuard";

type Article = {
  slug: string; title: string; excerpt: string; body: string; category: string; image_url: string | null; external_url: string | null;
  published_at: string; product_slug: string | null; product_name: string | null; product_image: string | null;
};

/** Page d'un article du blog (texte saisi dans la console). Les paragraphes sont séparés par une ligne vide ; « ## » = intertitre. */
const CAT_EN: Record<string, string> = { Conseils: "Tips", "Beauté": "Beauty", "Santé": "Health", Utilisation: "How to use", Produit: "Product" };

export default function PageArticle({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { t, locale } = useLocale();
  const screen = useScreenSize();
  const isMobile = screen === "mobile";
  const isSmall = screen === "mobile" || screen === "tablet";
  const [article, setArticle] = useState<Article | null | undefined>(undefined);

  useEffect(() => {
    void fetch(`/api/blog/${encodeURIComponent(slug)}?lang=${locale}`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { article?: Article } | null) => setArticle(d?.article ?? null))
      .catch(() => setArticle(null));
  }, [slug, locale]);

  const blocs = (article?.body ?? "").split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);

  return (
    <HydrationGuard bg="#fff" style={{ color: "#1a1a1a", overflowX: "hidden" }}>
      <nav style={{ background: "#060f08", borderBottom: "1px solid #1a3522", padding: isMobile ? "0 12px" : isSmall ? "0 24px" : "0 60px", height: isMobile ? 56 : 68, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
        <Link href="/" style={{ textDecoration: "none", flexShrink: 0 }}>
          <img src="/images/logo-homepage.png" alt="Nutrelis" style={{ height: isMobile ? 28 : 40, width: "auto" }} />
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 8 : 12 }}>
          <LanguageSwitcher />
          <NavbarCart />
          <Link href="/#produits" style={{ background: "var(--accent)", color: "#060f08", padding: isMobile ? "8px 12px" : "10px 24px", borderRadius: 8, fontSize: isMobile ? 11 : 14, fontWeight: 800, textDecoration: "none", fontFamily: "var(--font-sora), sans-serif", whiteSpace: "nowrap" }}>
            {isMobile ? t("home.navShop") : t("home.navShopArrow")}
          </Link>
        </div>
      </nav>

      <main style={{ maxWidth: 760, margin: "0 auto", padding: isMobile ? "28px 16px 64px" : "48px 24px 96px" }}>
        <Link href="/blog" style={{ color: "var(--accent)", fontWeight: 700, fontSize: 14, textDecoration: "none" }}>{t("blogPage.back")}</Link>

        {article === undefined && <p style={{ color: "#777", marginTop: 24 }}>{locale === "fr" ? "Chargement…" : "Loading…"}</p>}
        {article === null && <p style={{ marginTop: 24, fontSize: 16 }}>{t("blogPage.notFound")}</p>}

        {article && (
          <article style={{ marginTop: 20 }}>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", marginBottom: 14 }}>
              <span style={{ background: "#e8f5eb", color: "var(--accent)", fontSize: 12, fontWeight: 700, padding: "4px 12px", borderRadius: 20 }}>{article.product_name ?? t("blogPage.general")}</span>
              <span style={{ color: "#999", fontSize: 13 }}>{locale === "fr" ? article.category : (CAT_EN[article.category] ?? article.category)} · {new Date(article.published_at).toLocaleDateString(locale === "fr" ? "fr-FR" : "en-GB", { day: "numeric", month: "long", year: "numeric" })}</span>
            </div>
            <h1 style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: isMobile ? "1.6rem" : "2.3rem", fontWeight: 900, lineHeight: 1.2, margin: "0 0 18px" }}>{article.title}</h1>
            {article.excerpt && <p style={{ fontSize: isMobile ? 16 : 19, lineHeight: 1.7, color: "#555", margin: "0 0 24px" }}>{article.excerpt}</p>}
            {article.image_url && <img src={article.image_url} alt={article.title} style={{ width: "100%", borderRadius: 18, margin: "0 0 28px", display: "block" }} />}

            {blocs.map((b, i) => b.startsWith("## ")
              ? <h2 key={i} style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: isMobile ? "1.2rem" : "1.5rem", fontWeight: 800, margin: "32px 0 12px" }}>{b.slice(3)}</h2>
              : <p key={i} style={{ fontSize: isMobile ? 16 : 17, lineHeight: 1.85, color: "#333", margin: "0 0 18px", whiteSpace: "pre-line" }}>{b}</p>)}

            {article.product_slug && (
              <div style={{ marginTop: 40, border: "1.5px solid #c8e6d0", background: "#f0faf2", borderRadius: 20, padding: isMobile ? 16 : 22, display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
                {article.product_image && <img src={article.product_image} alt={article.product_name ?? ""} style={{ height: 72, width: "auto", maxWidth: 72, objectFit: "contain" }} />}
                <div style={{ flex: 1, minWidth: 180 }}>
                  <div style={{ fontWeight: 800, fontSize: 16 }}>{article.product_name}</div>
                  <div style={{ color: "#555", fontSize: 14 }}>{t("blogPage.relatedProduct")}</div>
                </div>
                <Link href={`/produits/${article.product_slug}`} style={{ background: "var(--accent)", color: "#060f08", padding: "12px 24px", borderRadius: 10, fontWeight: 800, textDecoration: "none" }}>{t("blogPage.viewProduct")}</Link>
              </div>
            )}
          </article>
        )}
      </main>
    </HydrationGuard>
  );
}
