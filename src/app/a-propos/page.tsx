"use client";
import Link from "next/link";
import NavbarCart from "@/components/NavbarCart";
import { useLocale } from "@/context/LocaleContext";
import { useScreenSize } from "@/hooks/useIsMobile";
import HydrationGuard from "@/components/HydrationGuard";

export default function APropos() {
  const { t } = useLocale();
  const screen = useScreenSize();
  const isMobile = screen === "mobile";
  const isSmall = screen === "mobile" || screen === "tablet";
  const px = isMobile ? "16px" : isSmall ? "24px" : "60px";
  return (
    <HydrationGuard bg="var(--bg-primary)" style={{ color: "var(--text-primary)", overflowX: "hidden" }}>

      {/* NAVBAR */}
      <nav style={{ background: "#060f08", borderBottom: "1px solid #1a3522", padding: isMobile ? "0 12px" : isSmall ? "0 24px" : "0 60px", height: isMobile ? 56 : 68, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
        <Link href="/" style={{ textDecoration: "none", flexShrink: 0 }}>
          <img src="/images/logo-homepage.png" alt="Nutrelis" style={{ height: isMobile ? 28 : 40, width: "auto" }} />
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
      <section style={{ background: "linear-gradient(135deg, #060f08 0%, #0a1a0d 100%)", padding: isMobile ? "48px 16px" : isSmall ? "64px 24px" : "96px 60px", textAlign: "center" }}>
        <p style={{ color: "var(--accent)", fontSize: 12, fontWeight: 700, letterSpacing: 2, marginBottom: 16 }}>{t("about.heroTag")}</p>
        <h1 style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: isMobile ? "1.6rem" : isSmall ? "2rem" : "clamp(2.2rem, 4vw, 3.6rem)", fontWeight: 900, color: "#f0fff4", lineHeight: 1.15, marginBottom: 24, maxWidth: 800, margin: "0 auto 24px" }}>
          {t("about.heroTitle1")}<br /><span style={{ color: "var(--accent)" }}>{t("about.heroTitleHighlight")}</span>
        </h1>
        <p style={{ color: "rgba(255,255,255,0.65)", fontSize: isMobile ? 14 : 16, lineHeight: 1.8, maxWidth: 680, margin: "0 auto" }}>
          {t("about.heroDesc")}
        </p>
      </section>

      {/* MISSION */}
      <section style={{ padding: `${isMobile ? "48px" : isSmall ? "64px" : "96px"} ${px}`, background: "#fff", color: "#1a1a1a" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: isMobile ? 32 : 80, alignItems: "center" }}>
          <div>
            <p style={{ color: "var(--accent)", fontSize: 12, fontWeight: 700, letterSpacing: 2, marginBottom: 16 }}>{t("about.missionTag")}</p>
            <h2 style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: isMobile ? "1.3rem" : isSmall ? "1.7rem" : "clamp(1.8rem, 3vw, 2.6rem)", fontWeight: 800, marginBottom: isMobile ? 16 : 24, lineHeight: 1.2 }}>
              {t("about.missionTitle1")}<br />{t("about.missionTitle2")}
            </h2>
            <p style={{ color: "#555", fontSize: isMobile ? 14 : 16, lineHeight: 1.8, marginBottom: 20 }}>{t("about.missionDesc1")}</p>
            <p style={{ color: "#555", fontSize: isMobile ? 14 : 16, lineHeight: 1.8, marginBottom: 20 }}>{t("about.missionDesc2")}</p>
            <p style={{ color: "#555", fontSize: isMobile ? 14 : 16, lineHeight: 1.8 }}>{t("about.missionDesc3")}</p>
          </div>
          <div style={{ background: "#f0faf2", borderRadius: isMobile ? 16 : 24, padding: isMobile ? "24px 16px" : "48px", border: "1px solid #c8e6d0" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: isMobile ? 20 : 32 }}>
              {[
                { num: t("about.stat1Num"), label: t("about.stat1Label"), desc: t("about.stat1Desc") },
                { num: t("about.stat2Num"), label: t("about.stat2Label"), desc: t("about.stat2Desc") },
                { num: t("about.stat3Num"), label: t("about.stat3Label"), desc: t("about.stat3Desc") },
                { num: t("about.stat4Num"), label: t("about.stat4Label"), desc: t("about.stat4Desc") },
              ].map((s, i) => (
                <div key={i} style={{ display: "flex", gap: isMobile ? 14 : 20, alignItems: "flex-start", paddingBottom: isMobile ? 20 : 32, borderBottom: i < 3 ? "1px solid #c8e6d0" : "none" }}>
                  <div style={{ color: "var(--accent)", fontSize: isMobile ? "1.4rem" : "2rem", fontWeight: 900, fontFamily: "var(--font-sora), sans-serif", flexShrink: 0, minWidth: isMobile ? 60 : 80 }}>{s.num}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: isMobile ? 13 : 15, marginBottom: 4 }}>{s.label}</div>
                    <div style={{ color: "#666", fontSize: isMobile ? 12 : 13 }}>{s.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* VALEURS */}
      <section style={{ padding: `${isMobile ? "48px" : isSmall ? "64px" : "96px"} ${px}`, background: "#f0faf2", color: "#1a1a1a" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: isMobile ? 32 : 64 }}>
            <p style={{ color: "var(--accent)", fontSize: 12, fontWeight: 700, letterSpacing: 2, marginBottom: 12 }}>{t("about.valuesTag")}</p>
            <h2 style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: isMobile ? "1.3rem" : isSmall ? "1.7rem" : "clamp(1.8rem, 3vw, 2.4rem)", fontWeight: 800 }}>{t("about.valuesTitle")}</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : isSmall ? "1fr 1fr" : "repeat(3, 1fr)", gap: isMobile ? 16 : 28 }}>
            {[
              { icon: "🔬", titre: t("about.value1Title"), desc: t("about.value1Desc") },
              { icon: "🌿", titre: t("about.value2Title"), desc: t("about.value2Desc") },
              { icon: "🔍", titre: t("about.value3Title"), desc: t("about.value3Desc") },
              { icon: "🎯", titre: t("about.value4Title"), desc: t("about.value4Desc") },
              { icon: "🤝", titre: t("about.value5Title"), desc: t("about.value5Desc") },
              { icon: "♻️", titre: t("about.value6Title"), desc: t("about.value6Desc") },
            ].map((v, i) => (
              <div key={i} style={{ background: "#fff", borderRadius: isMobile ? 14 : 20, padding: isMobile ? 20 : 32, border: "1px solid #c8e6d0", boxShadow: "0 2px 16px rgba(29,185,84,0.05)" }}>
                <div style={{ fontSize: isMobile ? 28 : 36, marginBottom: isMobile ? 10 : 16 }}>{v.icon}</div>
                <h3 style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: isMobile ? 15 : 18, fontWeight: 800, marginBottom: isMobile ? 8 : 12 }}>{v.titre}</h3>
                <p style={{ color: "#555", fontSize: isMobile ? 13 : 14, lineHeight: 1.75 }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FONDATEUR */}
      <section style={{ padding: `${isMobile ? "48px" : isSmall ? "64px" : "96px"} ${px}`, background: "#fff", color: "#1a1a1a" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
          <p style={{ color: "var(--accent)", fontSize: 12, fontWeight: 700, letterSpacing: 2, marginBottom: 16 }}>{t("about.founderTag")}</p>
          <h2 style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: isMobile ? "1.3rem" : isSmall ? "1.7rem" : "clamp(1.6rem, 2.5vw, 2.2rem)", fontWeight: 800, marginBottom: isMobile ? 24 : 40 }}>{t("about.founderTitle")}</h2>
          <div style={{ background: "#f0faf2", borderRadius: isMobile ? 16 : 24, padding: isMobile ? "28px 16px" : "56px", border: "1px solid #c8e6d0", position: "relative" }}>
            <div style={{ fontSize: isMobile ? 40 : 64, color: "var(--accent)", lineHeight: 1, marginBottom: isMobile ? 16 : 24, opacity: 0.3 }}>"</div>
            <p style={{ fontSize: isMobile ? 15 : 18, lineHeight: 1.9, color: "#333", marginBottom: 16, fontStyle: "italic" }}>{t("about.founderQuote1")}</p>
            <p style={{ fontSize: isMobile ? 15 : 18, lineHeight: 1.9, color: "#333", marginBottom: isMobile ? 20 : 32, fontStyle: "italic" }}>{t("about.founderQuote2")}</p>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16 }}>
              <div style={{ width: isMobile ? 44 : 56, height: isMobile ? 44 : 56, borderRadius: "50%", background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900, fontSize: isMobile ? 16 : 20 }}>A</div>
              <div style={{ textAlign: "left" }}>
                <div style={{ fontWeight: 800, fontSize: isMobile ? 13 : 15 }}>{t("about.founderName")}</div>
                <div style={{ color: "#666", fontSize: isMobile ? 12 : 13 }}>{t("about.founderRole")}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: "var(--accent)", padding: isMobile ? "48px 16px" : isSmall ? "56px 24px" : "72px 60px", textAlign: "center" }}>
        <h2 style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: isMobile ? "1.3rem" : isSmall ? "1.7rem" : "clamp(1.8rem, 3vw, 2.6rem)", fontWeight: 900, color: "#060f08", marginBottom: 16 }}>
          {t("about.ctaTitle")}
        </h2>
        <p style={{ color: "rgba(6,15,8,0.75)", fontSize: isMobile ? 14 : 16, marginBottom: isMobile ? 24 : 36 }}>{t("about.ctaDesc")}</p>
        <Link href="/produits/astaxanthine-12mg" style={{ display: "inline-block", background: "#060f08", color: "#fff", padding: isMobile ? "14px 32px" : "18px 52px", borderRadius: 12, fontSize: isMobile ? 14 : 16, fontWeight: 800, textDecoration: "none", fontFamily: "var(--font-sora), sans-serif" }}>
          {t("about.ctaBtn")}
        </Link>
      </section>

      {/* FOOTER */}
      <footer style={{ background: "#060f08", padding: isMobile ? "24px 16px" : "40px 60px", borderTop: "1px solid #1a3522" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", flexDirection: isMobile ? "column" : "row", justifyContent: "space-between", alignItems: isMobile ? "flex-start" : "center", gap: isMobile ? 12 : 0 }}>
          <span style={{ color: "rgba(255,255,255,0.4)", fontSize: isMobile ? 12 : 13 }}>{t("home.footerRights")}</span>
          <div style={{ display: "flex", gap: isMobile ? 16 : 24 }}>
            {[{ label: t("about.footerHome"), href: "/" }, { label: t("about.footerProducts"), href: "/produits/astaxanthine-12mg" }, { label: t("about.footerContact"), href: "/contact" }].map(l => (
              <Link key={l.href} href={l.href} style={{ color: "rgba(255,255,255,0.5)", fontSize: isMobile ? 12 : 13, textDecoration: "none" }}>{l.label}</Link>
            ))}
          </div>
        </div>
      </footer>

    </HydrationGuard>
  );
}
