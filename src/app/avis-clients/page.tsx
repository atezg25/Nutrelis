"use client";
import { useState } from "react";
import Link from "next/link";
import NavbarCart from "@/components/NavbarCart";
import { useLocale } from "@/context/LocaleContext";
import { useScreenSize } from "@/hooks/useIsMobile";

export default function AvisClients() {
  const { t } = useLocale();
  const screen = useScreenSize();
  const isMobile = screen === "mobile";
  const isSmall = screen === "mobile" || screen === "tablet";
  const [filtre, setFiltre] = useState(0);

  const avis = [
    { nom: t("reviewsPage.review1Name"), ville: t("reviewsPage.review1City"), stars: 5, titre: t("reviewsPage.review1Title"), texte: t("reviewsPage.review1Text"), semaines: t("reviewsPage.review1Weeks"), img: "/images/astaxanthine/Ast2.png", pack: t("reviewsPage.review1Pack") },
    { nom: t("reviewsPage.review2Name"), ville: t("reviewsPage.review2City"), stars: 5, titre: t("reviewsPage.review2Title"), texte: t("reviewsPage.review2Text"), semaines: t("reviewsPage.review2Weeks"), img: "/images/astaxanthine/Ast3.png", pack: t("reviewsPage.review2Pack") },
    { nom: t("reviewsPage.review3Name"), ville: t("reviewsPage.review3City"), stars: 5, titre: t("reviewsPage.review3Title"), texte: t("reviewsPage.review3Text"), semaines: t("reviewsPage.review3Weeks"), img: "/images/astaxanthine/Ast4.png", pack: t("reviewsPage.review3Pack") },
    { nom: t("reviewsPage.review4Name"), ville: t("reviewsPage.review4City"), stars: 5, titre: t("reviewsPage.review4Title"), texte: t("reviewsPage.review4Text"), semaines: t("reviewsPage.review4Weeks"), img: "/images/astaxanthine/Asta1.png", pack: t("reviewsPage.review4Pack") },
    { nom: t("reviewsPage.review5Name"), ville: t("reviewsPage.review5City"), stars: 5, titre: t("reviewsPage.review5Title"), texte: t("reviewsPage.review5Text"), semaines: t("reviewsPage.review5Weeks"), img: "/images/astaxanthine/Asta2.png", pack: t("reviewsPage.review5Pack") },
    { nom: t("reviewsPage.review6Name"), ville: t("reviewsPage.review6City"), stars: 5, titre: t("reviewsPage.review6Title"), texte: t("reviewsPage.review6Text"), semaines: t("reviewsPage.review6Weeks"), img: "/images/astaxanthine/Asta3.png", pack: t("reviewsPage.review6Pack") },
    { nom: t("reviewsPage.review7Name"), ville: t("reviewsPage.review7City"), stars: 5, titre: t("reviewsPage.review7Title"), texte: t("reviewsPage.review7Text"), semaines: t("reviewsPage.review7Weeks"), img: "/images/astaxanthine/Ast2.png", pack: t("reviewsPage.review7Pack") },
    { nom: t("reviewsPage.review8Name"), ville: t("reviewsPage.review8City"), stars: 4, titre: t("reviewsPage.review8Title"), texte: t("reviewsPage.review8Text"), semaines: t("reviewsPage.review8Weeks"), img: "/images/astaxanthine/Asta1.png", pack: t("reviewsPage.review8Pack") },
    { nom: t("reviewsPage.review9Name"), ville: t("reviewsPage.review9City"), stars: 5, titre: t("reviewsPage.review9Title"), texte: t("reviewsPage.review9Text"), semaines: t("reviewsPage.review9Weeks"), img: "/images/astaxanthine/Asta2.png", pack: t("reviewsPage.review9Pack") },
  ];

  const stats = [
    { value: "12 000+", label: t("reviewsPage.statClients") },
    { value: "4.8/5", label: t("reviewsPage.statRating") },
    { value: "96%", label: t("reviewsPage.statRecommend") },
    { value: "94%", label: t("reviewsPage.statResults") },
  ];

  const filtres = [t("reviewsPage.filterAll"), "⭐⭐⭐⭐⭐ " + t("reviewsPage.filter5Stars"), "⭐⭐⭐⭐ " + t("reviewsPage.filter4Stars")];
  const avisFiltres = filtre === 0 ? avis : avis.filter(a => a.stars === (filtre === 1 ? 5 : 4));

  return (
    <div style={{ background: "#fff", color: "#1a1a1a", overflowX: "hidden" }}>

      {/* NAVBAR */}
      <nav style={{ background: "#060f08", borderBottom: "1px solid #1a3522", padding: isMobile ? "0 12px" : isSmall ? "0 24px" : "0 60px", height: isMobile ? 56 : 68, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: isMobile ? 6 : 10, flexShrink: 0 }}>
          <div style={{ width: isMobile ? 28 : 36, height: isMobile ? 28 : 36, borderRadius: 8, background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", color: "#060f08", fontWeight: 900, fontSize: isMobile ? 13 : 16, fontFamily: "var(--font-sora), sans-serif" }}>N</div>
          <span style={{ fontFamily: "var(--font-sora), sans-serif", fontWeight: 800, fontSize: isMobile ? 13 : isSmall ? 16 : 20, letterSpacing: isMobile ? 1 : 3, color: "#f0fff4" }}>NUTRELIS</span>
        </Link>
        {!isSmall && (
          <div style={{ display: "flex", gap: 32 }}>
            {[{ label: t("nav.products"), href: "/produits/astaxanthine-12mg" }, { label: t("nav.science"), href: "/science" }, { label: t("nav.reviews"), href: "/avis-clients" }, { label: t("nav.faq"), href: "/faq" }].map(item => (
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
        <p style={{ color: "var(--accent)", fontSize: 12, fontWeight: 700, letterSpacing: 2, marginBottom: 16 }}>{t("reviewsPage.heroTag")}</p>
        <h1 style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: "clamp(2rem, 4vw, 3.2rem)", fontWeight: 900, color: "#f0fff4", marginBottom: 16 }}>
          {t("reviewsPage.heroTitle1")}
          <span style={{ color: "var(--accent)" }}>{t("reviewsPage.heroTitleHighlight")}</span>
        </h1>
        <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 16 }}>
          {t("reviewsPage.heroDesc")}
        </p>
      </section>

      {/* STATS */}
      <section style={{ background: "#f0faf2", borderBottom: "1px solid #c8e6d0" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4, 1fr)" }}>
          {stats.map((s, i) => (
            <div key={i} style={{ padding: "32px 24px", textAlign: "center", borderRight: i < 3 ? "1px solid #c8e6d0" : "none" }}>
              <div style={{ color: "var(--accent)", fontSize: "2.4rem", fontWeight: 900, fontFamily: "var(--font-sora), sans-serif", lineHeight: 1 }}>{s.value}</div>
              <div style={{ color: "#555", fontSize: 13, marginTop: 8, fontWeight: 600 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* NOTE GLOBALE */}
      <section style={{ padding: "64px 60px", background: "#fff" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "center" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "6rem", fontWeight: 900, color: "var(--accent)", fontFamily: "var(--font-sora), sans-serif", lineHeight: 1 }}>4.8</div>
            <div style={{ color: "#f5a623", fontSize: 32, margin: "12px 0 8px", letterSpacing: 4 }}>★★★★★</div>
            <div style={{ color: "#888", fontSize: 14 }}>{t("reviewsPage.verifiedReviews")}</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { stars: 5, pct: 89 },
              { stars: 4, pct: 8 },
              { stars: 3, pct: 2 },
              { stars: 2, pct: 1 },
              { stars: 1, pct: 0 },
            ].map((r, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 13, color: "#555", minWidth: 20 }}>{r.stars}★</span>
                <div style={{ flex: 1, height: 10, background: "#f0f0f0", borderRadius: 5, overflow: "hidden" }}>
                  <div style={{ width: `${r.pct}%`, height: "100%", background: r.stars >= 4 ? "var(--accent)" : "#ddd", borderRadius: 5, transition: "width 0.6s" }} />
                </div>
                <span style={{ fontSize: 13, color: "#888", minWidth: 32 }}>{r.pct}%</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FILTRES + AVIS */}
      <section style={{ padding: "0 60px 80px", background: "#f8f9fa" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "flex", gap: 12, paddingTop: 48, marginBottom: 48, flexWrap: "wrap" }}>
            {filtres.map((f, i) => (
              <button key={i} onClick={() => setFiltre(i)} style={{
                padding: "10px 20px", borderRadius: 24, fontSize: 14, fontWeight: 600, cursor: "pointer",
                border: "1.5px solid", borderColor: filtre === i ? "var(--accent)" : "#ddd",
                background: filtre === i ? "#e8f5eb" : "#fff",
                color: filtre === i ? "var(--accent)" : "#555",
                transition: "all 0.2s",
              }}>
                {f}
              </button>
            ))}
            <span style={{ marginLeft: "auto", color: "#888", fontSize: 14, alignSelf: "center" }}>
              {avisFiltres.length} {t("reviewsPage.reviewsCount")}
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
            {avisFiltres.map((a, i) => (
              <div key={i} style={{ background: "#fff", borderRadius: 20, padding: 28, border: "1px solid #eee", boxShadow: "0 2px 16px rgba(0,0,0,0.04)", transition: "all 0.3s" }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 12px 40px rgba(29,185,84,0.1)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 16px rgba(0,0,0,0.04)";
                }}
              >
                <div style={{ color: "#f5a623", fontSize: 16, marginBottom: 12, letterSpacing: 2 }}>{"★".repeat(a.stars)}</div>
                <h3 style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: 15, fontWeight: 800, marginBottom: 10, lineHeight: 1.4 }}>{a.titre}</h3>
                <p style={{ color: "#666", fontSize: 13, lineHeight: 1.7, marginBottom: 20, fontStyle: "italic" }}>"{a.texte}"</p>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 40, height: 40, borderRadius: "50%", overflow: "hidden", border: "2px solid var(--accent)", flexShrink: 0 }}>
                      <img src={a.img} alt={a.nom} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13 }}>{a.nom}</div>
                      <div style={{ color: "#aaa", fontSize: 11 }}>{"📍 " + a.ville}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ background: "#e8f5eb", color: "var(--accent)", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, marginBottom: 4 }}>
                      {"✅ " + t("reviewsPage.verified")}
                    </div>
                    <div style={{ color: "#bbb", fontSize: 11 }}>{a.semaines}</div>
                  </div>
                </div>
                <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid #f0f0f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "#aaa", fontSize: 11 }}>{t("reviewsPage.packBought")}</span>
                  <span style={{ color: "#555", fontSize: 12, fontWeight: 600 }}>{a.pack}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: "var(--accent)", padding: "72px 60px", textAlign: "center" }}>
        <h2 style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: "clamp(1.8rem, 3vw, 2.6rem)", fontWeight: 900, color: "#060f08", marginBottom: 16 }}>
          {t("reviewsPage.ctaTitle")}
        </h2>
        <p style={{ color: "rgba(6,15,8,0.75)", fontSize: 16, marginBottom: 36 }}>
          {t("reviewsPage.ctaDesc")}
        </p>
        <Link href="/produits/astaxanthine-12mg" style={{ display: "inline-block", background: "#060f08", color: "#fff", padding: "18px 52px", borderRadius: 12, fontSize: 16, fontWeight: 800, textDecoration: "none", fontFamily: "var(--font-sora), sans-serif" }}>
          {t("reviewsPage.ctaBtn")}
        </Link>
      </section>

      <footer style={{ background: "#060f08", padding: "40px 60px", borderTop: "1px solid #1a3522" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>{t("home.footerRights")}</span>
          <div style={{ display: "flex", gap: 24 }}>
            {[{ label: t("reviewsPage.footerHome"), href: "/" }, { label: t("reviewsPage.footerProducts"), href: "/produits/astaxanthine-12mg" }, { label: t("reviewsPage.footerContact"), href: "/contact" }].map(l => (
              <Link key={l.href} href={l.href} style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, textDecoration: "none" }}>{l.label}</Link>
            ))}
          </div>
        </div>
      </footer>

    </div>
  );
}
