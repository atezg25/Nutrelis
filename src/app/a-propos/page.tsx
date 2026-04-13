"use client";
import Link from "next/link";
import NavbarCart from "@/components/NavbarCart";
import { useLocale } from "@/context/LocaleContext";
import { useScreenSize } from "@/hooks/useIsMobile";

export default function APropos() {
  const { t } = useLocale();
  const screen = useScreenSize();
  const isMobile = screen === "mobile";
  const isSmall = screen === "mobile" || screen === "tablet";
  return (
    <div style={{ background: "var(--bg-primary)", color: "var(--text-primary)", overflowX: "hidden" }}>

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
      <section style={{ background: "linear-gradient(135deg, #060f08 0%, #0a1a0d 100%)", padding: "96px 60px", textAlign: "center" }}>
        <p style={{ color: "var(--accent)", fontSize: 12, fontWeight: 700, letterSpacing: 2, marginBottom: 16 }}>{t("about.heroTag")}</p>
        <h1 style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: "clamp(2.2rem, 4vw, 3.6rem)", fontWeight: 900, color: "#f0fff4", lineHeight: 1.15, marginBottom: 24, maxWidth: 800, margin: "0 auto 24px" }}>
          {t("about.heroTitle1")}<br /><span style={{ color: "var(--accent)" }}>{t("about.heroTitleHighlight")}</span>
        </h1>
        <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 16, lineHeight: 1.8, maxWidth: 680, margin: "0 auto" }}>
          {t("about.heroDesc")}
        </p>
      </section>

      {/* MISSION */}
      <section style={{ padding: "96px 60px", background: "#fff" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>
          <div>
            <p style={{ color: "var(--accent)", fontSize: 12, fontWeight: 700, letterSpacing: 2, marginBottom: 16 }}>{t("about.missionTag")}</p>
            <h2 style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: "clamp(1.8rem, 3vw, 2.6rem)", fontWeight: 800, marginBottom: 24, lineHeight: 1.2 }}>
              {t("about.missionTitle1")}<br />{t("about.missionTitle2")}
            </h2>
            <p style={{ color: "#555", fontSize: 16, lineHeight: 1.8, marginBottom: 20 }}>{t("about.missionDesc1")}</p>
            <p style={{ color: "#555", fontSize: 16, lineHeight: 1.8, marginBottom: 20 }}>{t("about.missionDesc2")}</p>
            <p style={{ color: "#555", fontSize: 16, lineHeight: 1.8 }}>{t("about.missionDesc3")}</p>
          </div>
          <div style={{ background: "#f0faf2", borderRadius: 24, padding: "48px", border: "1px solid #c8e6d0" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
              {[
                { num: t("about.stat1Num"), label: t("about.stat1Label"), desc: t("about.stat1Desc") },
                { num: t("about.stat2Num"), label: t("about.stat2Label"), desc: t("about.stat2Desc") },
                { num: t("about.stat3Num"), label: t("about.stat3Label"), desc: t("about.stat3Desc") },
                { num: t("about.stat4Num"), label: t("about.stat4Label"), desc: t("about.stat4Desc") },
              ].map((s, i) => (
                <div key={i} style={{ display: "flex", gap: 20, alignItems: "flex-start", paddingBottom: 32, borderBottom: i < 3 ? "1px solid #c8e6d0" : "none" }}>
                  <div style={{ color: "var(--accent)", fontSize: "2rem", fontWeight: 900, fontFamily: "var(--font-sora), sans-serif", flexShrink: 0, minWidth: 80 }}>{s.num}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{s.label}</div>
                    <div style={{ color: "#666", fontSize: 13 }}>{s.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* VALEURS */}
      <section style={{ padding: "96px 60px", background: "#f0faf2" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <p style={{ color: "var(--accent)", fontSize: 12, fontWeight: 700, letterSpacing: 2, marginBottom: 12 }}>{t("about.valuesTag")}</p>
            <h2 style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: "clamp(1.8rem, 3vw, 2.4rem)", fontWeight: 800 }}>{t("about.valuesTitle")}</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 28 }}>
            {[
              { icon: "🔬", titre: t("about.value1Title"), desc: t("about.value1Desc") },
              { icon: "🌿", titre: t("about.value2Title"), desc: t("about.value2Desc") },
              { icon: "🔍", titre: t("about.value3Title"), desc: t("about.value3Desc") },
              { icon: "🎯", titre: t("about.value4Title"), desc: t("about.value4Desc") },
              { icon: "🤝", titre: t("about.value5Title"), desc: t("about.value5Desc") },
              { icon: "♻️", titre: t("about.value6Title"), desc: t("about.value6Desc") },
            ].map((v, i) => (
              <div key={i} style={{ background: "#fff", borderRadius: 20, padding: 32, border: "1px solid #c8e6d0", boxShadow: "0 2px 16px rgba(29,185,84,0.05)" }}>
                <div style={{ fontSize: 36, marginBottom: 16 }}>{v.icon}</div>
                <h3 style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: 18, fontWeight: 800, marginBottom: 12 }}>{v.titre}</h3>
                <p style={{ color: "#555", fontSize: 14, lineHeight: 1.75 }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FONDATEUR */}
      <section style={{ padding: "96px 60px", background: "#fff" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
          <p style={{ color: "var(--accent)", fontSize: 12, fontWeight: 700, letterSpacing: 2, marginBottom: 16 }}>{t("about.founderTag")}</p>
          <h2 style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: "clamp(1.6rem, 2.5vw, 2.2rem)", fontWeight: 800, marginBottom: 40 }}>{t("about.founderTitle")}</h2>
          <div style={{ background: "#f0faf2", borderRadius: 24, padding: "56px", border: "1px solid #c8e6d0", position: "relative" }}>
            <div style={{ fontSize: 64, color: "var(--accent)", lineHeight: 1, marginBottom: 24, opacity: 0.3 }}>"</div>
            <p style={{ fontSize: 18, lineHeight: 1.9, color: "#333", marginBottom: 16, fontStyle: "italic" }}>{t("about.founderQuote1")}</p>
            <p style={{ fontSize: 18, lineHeight: 1.9, color: "#333", marginBottom: 32, fontStyle: "italic" }}>{t("about.founderQuote2")}</p>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16 }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900, fontSize: 20 }}>A</div>
              <div style={{ textAlign: "left" }}>
                <div style={{ fontWeight: 800, fontSize: 15 }}>{t("about.founderName")}</div>
                <div style={{ color: "#666", fontSize: 13 }}>{t("about.founderRole")}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: "var(--accent)", padding: "72px 60px", textAlign: "center" }}>
        <h2 style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: "clamp(1.8rem, 3vw, 2.6rem)", fontWeight: 900, color: "#060f08", marginBottom: 16 }}>
          {t("about.ctaTitle")}
        </h2>
        <p style={{ color: "rgba(6,15,8,0.75)", fontSize: 16, marginBottom: 36 }}>{t("about.ctaDesc")}</p>
        <Link href="/produits/astaxanthine-12mg" style={{ display: "inline-block", background: "#060f08", color: "#fff", padding: "18px 52px", borderRadius: 12, fontSize: 16, fontWeight: 800, textDecoration: "none", fontFamily: "var(--font-sora), sans-serif" }}>
          {t("about.ctaBtn")}
        </Link>
      </section>

      {/* FOOTER */}
      <footer style={{ background: "#060f08", padding: "40px 60px", borderTop: "1px solid #1a3522" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>{t("home.footerRights")}</span>
          <div style={{ display: "flex", gap: 24 }}>
            {[{ label: t("about.footerHome"), href: "/" }, { label: t("about.footerProducts"), href: "/produits/astaxanthine-12mg" }, { label: t("about.footerContact"), href: "/contact" }].map(l => (
              <Link key={l.href} href={l.href} style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, textDecoration: "none" }}>{l.label}</Link>
            ))}
          </div>
        </div>
      </footer>

    </div>
  );
}
