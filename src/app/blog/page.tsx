"use client";
import Link from "next/link";
import NavbarCart from "@/components/NavbarCart";
import { useLocale } from "@/context/LocaleContext";
import { useScreenSize } from "@/hooks/useIsMobile";

const couleurCategorie: Record<string, string> = {
  Science: "#1db954",
  Beauté: "#e91e8c",
  Santé: "#2196f3",
  Témoignage: "#ff9800",
};

export default function Blog() {
  const { t } = useLocale();
  const screen = useScreenSize();
  const isMobile = screen === "mobile";
  const isSmall = screen === "mobile" || screen === "tablet";

  const articles = [
    {
      slug: "astaxanthine-guide-complet",
      categorie: "Science",
      titre: t("blogPage.art1Title"),
      extrait: t("blogPage.art1Excerpt"),
      date: t("blogPage.art1Date"),
      duree: t("blogPage.art1Duration"),
      img: "/images/astaxanthine/NUT2.png",
      vedette: true,
    },
    {
      slug: "peau-lumineuse-naturellement",
      categorie: "Beauté",
      titre: t("blogPage.art2Title"),
      extrait: t("blogPage.art2Excerpt"),
      date: t("blogPage.art2Date"),
      duree: t("blogPage.art2Duration"),
      img: "/images/astaxanthine/NUT3.png",
    },
    {
      slug: "antioxydants-comparaison",
      categorie: "Science",
      titre: t("blogPage.art3Title"),
      extrait: t("blogPage.art3Excerpt"),
      date: t("blogPage.art3Date"),
      duree: t("blogPage.art3Duration"),
      img: "/images/astaxanthine/NUT4.png",
    },
    {
      slug: "complement-alimentaire-bien-choisir",
      categorie: "Santé",
      titre: t("blogPage.art4Title"),
      extrait: t("blogPage.art4Excerpt"),
      date: t("blogPage.art4Date"),
      duree: t("blogPage.art4Duration"),
      img: "/images/astaxanthine/NUT5.png",
    },
    {
      slug: "temoignage-marie-ange",
      categorie: "Témoignage",
      titre: t("blogPage.art5Title"),
      extrait: t("blogPage.art5Excerpt"),
      date: t("blogPage.art5Date"),
      duree: t("blogPage.art5Duration"),
      img: "/images/astaxanthine/Ast2.png",
    },
    {
      slug: "astaxanthine-yeux-ecrans",
      categorie: "Santé",
      titre: t("blogPage.art6Title"),
      extrait: t("blogPage.art6Excerpt"),
      date: t("blogPage.art6Date"),
      duree: t("blogPage.art6Duration"),
      img: "/images/astaxanthine/img4A.png",
    },
  ];

  const vedette = articles[0];
  const reste = articles.slice(1);

  return (
    <div style={{ background: "#fff", color: "#1a1a1a", overflowX: "hidden" }}>

      {/* NAVBAR */}
      <nav style={{ background: "#060f08", borderBottom: "1px solid #1a3522", padding: isMobile ? "0 12px" : isSmall ? "0 24px" : "0 60px", height: isMobile ? 56 : 68, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
        <Link href="/" style={{ textDecoration: "none", flexShrink: 0 }}>
          <img src="/images/logo-homepage.png" alt="Nutrelis" style={{ height: isMobile ? 28 : 40, width: "auto" }} />
        </Link>
        {!isSmall && (
          <div style={{ display: "flex", gap: 32 }}>
            {[{ label: t("nav.products"), href: "/produits/astaxanthine-12mg" }, { label: t("nav.science"), href: "/science" }, { label: t("nav.faq"), href: "/faq" }].map(item => (
              <Link key={item.href} href={item.href} style={{ color: "rgba(255,255,255,0.65)", fontSize: 14, fontWeight: 500, textDecoration: "none" }}>{item.label}</Link>
            ))}
          </div>
        )}
        <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 8 : 12 }}>
          <NavbarCart />
          <Link href="/produits/astaxanthine-12mg" style={{ background: "var(--accent)", color: "#060f08", padding: isMobile ? "8px 12px" : "10px 24px", borderRadius: 8, fontSize: isMobile ? 11 : 14, fontWeight: 800, textDecoration: "none", fontFamily: "var(--font-sora), sans-serif", whiteSpace: "nowrap" }}>
            {isMobile ? t("nav.order") : t("nav.orderArrow")}
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ background: "linear-gradient(135deg, #060f08, #0a1a0d)", padding: "72px 60px", textAlign: "center" }}>
        <p style={{ color: "var(--accent)", fontSize: 12, fontWeight: 700, letterSpacing: 2, marginBottom: 16 }}>{t("blogPage.heroTag")}</p>
        <h1 style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: "clamp(2rem, 4vw, 3.2rem)", fontWeight: 900, color: "#f0fff4", marginBottom: 16 }}>
          {t("blogPage.heroTitle1")}
          <span style={{ color: "var(--accent)" }}>{t("blogPage.heroTitleHighlight")}</span>
        </h1>
        <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 16 }}>
          {t("blogPage.heroDesc")}
        </p>
      </section>

      {/* ARTICLE EN VEDETTE */}
      <section style={{ padding: "72px 60px", background: "#f0faf2" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <p style={{ color: "var(--accent)", fontSize: 12, fontWeight: 700, letterSpacing: 2, marginBottom: 24 }}>{t("blogPage.featuredTag")}</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0, background: "#fff", borderRadius: 24, overflow: "hidden", border: "1px solid #c8e6d0", boxShadow: "0 4px 32px rgba(29,185,84,0.06)" }}>
            <div style={{ background: "#fdf5f3", display: "flex", alignItems: "center", justifyContent: "center", minHeight: 320, padding: 48 }}>
              <img src={vedette.img} alt={vedette.titre} style={{ width: "100%", maxWidth: 300, objectFit: "contain" }} />
            </div>
            <div style={{ padding: "52px 48px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <span style={{ background: "#e8f5eb", color: "var(--accent)", fontSize: 12, fontWeight: 700, padding: "4px 12px", borderRadius: 20, letterSpacing: 1, display: "inline-block", width: "fit-content", marginBottom: 20 }}>
                {vedette.categorie.toUpperCase()}
              </span>
              <h2 style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: "clamp(1.4rem, 2.5vw, 1.8rem)", fontWeight: 800, marginBottom: 16, lineHeight: 1.3 }}>
                {vedette.titre}
              </h2>
              <p style={{ color: "#555", fontSize: 15, lineHeight: 1.75, marginBottom: 28 }}>
                {vedette.extrait}
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 32 }}>
                <span style={{ color: "#888", fontSize: 13 }}>{"📅 " + vedette.date}</span>
                <span style={{ color: "#888", fontSize: 13 }}>{"⏱️ " + vedette.duree + " " + t("blogPage.readTime")}</span>
              </div>
              <Link href={`/blog/${vedette.slug}`} style={{ background: "var(--accent)", color: "#060f08", padding: "14px 32px", borderRadius: 10, fontSize: 14, fontWeight: 800, textDecoration: "none", display: "inline-block", width: "fit-content" }}>
                {t("blogPage.readArticle")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* TOUS LES ARTICLES */}
      <section style={{ padding: "72px 60px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 48, flexWrap: "wrap", gap: 20 }}>
            <h2 style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: "1.8rem", fontWeight: 800 }}>
              {t("blogPage.allArticles")}
            </h2>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {[t("blogPage.filterAll"), t("blogPage.filterScience"), t("blogPage.filterBeauty"), t("blogPage.filterHealth"), t("blogPage.filterTestimonial")].map((cat, i) => (
                <span key={i} style={{ padding: "8px 18px", borderRadius: 20, border: "1.5px solid", borderColor: i === 0 ? "var(--accent)" : "#ddd", background: i === 0 ? "#e8f5eb" : "#fff", color: i === 0 ? "var(--accent)" : "#555", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                  {cat}
                </span>
              ))}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 28 }}>
            {reste.map((art, i) => (
              <div key={i} style={{ background: "#fff", border: "1px solid #eee", borderRadius: 20, overflow: "hidden", boxShadow: "0 2px 16px rgba(0,0,0,0.04)", transition: "all 0.3s" }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 12px 40px rgba(29,185,84,0.1)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 16px rgba(0,0,0,0.04)";
                }}
              >
                <div style={{ background: "#fdf5f3", height: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
                  <img src={art.img} alt={art.titre} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                </div>
                <div style={{ padding: "24px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <span style={{ background: "#e8f5eb", color: couleurCategorie[art.categorie] ?? "var(--accent)", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, letterSpacing: 1 }}>
                      {art.categorie.toUpperCase()}
                    </span>
                    <span style={{ color: "#bbb", fontSize: 12 }}>{"⏱️ " + art.duree}</span>
                  </div>
                  <h3 style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: 15, fontWeight: 800, marginBottom: 10, lineHeight: 1.4 }}>
                    {art.titre}
                  </h3>
                  <p style={{ color: "#666", fontSize: 13, lineHeight: 1.6, marginBottom: 20 }}>{art.extrait}</p>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ color: "#aaa", fontSize: 12 }}>{"📅 " + art.date}</span>
                    <Link href={`/blog/${art.slug}`} style={{ color: "var(--accent)", fontWeight: 700, fontSize: 13, textDecoration: "none" }}>
                      {t("blogPage.read")}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NEWSLETTER */}
      <section style={{ background: "#f0faf2", padding: "72px 60px", textAlign: "center", borderTop: "1px solid #c8e6d0" }}>
        <p style={{ color: "var(--accent)", fontSize: 12, fontWeight: 700, letterSpacing: 2, marginBottom: 12 }}>{t("blogPage.newsletterTag")}</p>
        <h2 style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: "1.8rem", fontWeight: 800, marginBottom: 12 }}>
          {t("blogPage.newsletterTitle")}
        </h2>
        <p style={{ color: "#555", fontSize: 15, marginBottom: 36 }}>{t("blogPage.newsletterDesc")}</p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", maxWidth: 480, margin: "0 auto" }}>
          <input
            type="email"
            placeholder={t("blogPage.newsletterPlaceholder")}
            style={{ flex: 1, padding: "14px 18px", borderRadius: 10, border: "1.5px solid #c8e6d0", fontSize: 15, outline: "none" }}
            onFocus={e => e.currentTarget.style.borderColor = "var(--accent)"}
            onBlur={e => e.currentTarget.style.borderColor = "#c8e6d0"}
          />
          <button style={{ background: "var(--accent)", color: "#060f08", border: "none", padding: "14px 28px", borderRadius: 10, fontSize: 14, fontWeight: 800, cursor: "pointer", whiteSpace: "nowrap", fontFamily: "var(--font-sora), sans-serif" }}>
            {t("blogPage.newsletterBtn")}
          </button>
        </div>
      </section>

      <footer style={{ background: "#060f08", padding: "40px 60px", borderTop: "1px solid #1a3522" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>{t("home.footerRights")}</span>
          <div style={{ display: "flex", gap: 24 }}>
            {[{ label: t("blogPage.footerHome"), href: "/" }, { label: t("blogPage.footerProducts"), href: "/produits/astaxanthine-12mg" }, { label: t("blogPage.footerContact"), href: "/contact" }].map(l => (
              <Link key={l.href} href={l.href} style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, textDecoration: "none" }}>{l.label}</Link>
            ))}
          </div>
        </div>
      </footer>

    </div>
  );
}
