"use client";
import Link from "next/link";
import NavbarCart from "@/components/NavbarCart";
import { useLocale } from "@/context/LocaleContext";
import { useScreenSize } from "@/hooks/useIsMobile";
import HydrationGuard from "@/components/HydrationGuard";

export default function Science() {
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
        <p style={{ color: "var(--accent)", fontSize: 12, fontWeight: 700, letterSpacing: 2, marginBottom: 16 }}>{t("sciencePage.heroTag")}</p>
        <h1 style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: isMobile ? "1.6rem" : isSmall ? "2rem" : "clamp(2.2rem, 4vw, 3.6rem)", fontWeight: 900, color: "#f0fff4", lineHeight: 1.15, marginBottom: 24, maxWidth: 800, margin: "0 auto 24px" }}>
          {t("sciencePage.heroTitle1")}<br /><span style={{ color: "var(--accent)" }}>{t("sciencePage.heroTitleHighlight")}</span>
        </h1>
        <p style={{ color: "rgba(255,255,255,0.65)", fontSize: isMobile ? 14 : 16, lineHeight: 1.8, maxWidth: 680, margin: "0 auto" }}>
          {t("sciencePage.heroDesc")}
        </p>
      </section>

      {/* QU'EST-CE QUE L'ASTAXANTHINE */}
      <section style={{ padding: `${isMobile ? "48px" : isSmall ? "64px" : "96px"} ${px}`, background: "#fff", color: "#1a1a1a" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: isMobile ? 32 : 64 }}>
            <p style={{ color: "var(--accent)", fontSize: 12, fontWeight: 700, letterSpacing: 2, marginBottom: 12 }}>{t("sciencePage.basicsTag")}</p>
            <h2 style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: isMobile ? "1.3rem" : isSmall ? "1.7rem" : "clamp(1.8rem, 3vw, 2.4rem)", fontWeight: 800, marginBottom: 20 }}>{t("sciencePage.basicsTitle")}</h2>
            <p style={{ color: "#555", fontSize: isMobile ? 14 : 16, lineHeight: 1.8, maxWidth: 720, margin: "0 auto" }}>
              {t("sciencePage.basicsDesc")}
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)", gap: isMobile ? 12 : 20 }}>
            {[
              { power: "6 000×", vs: t("sciencePage.vs1"), color: "#e74c3c" },
              { power: "1 800×", vs: t("sciencePage.vs2"), color: "#e67e22" },
              { power: "800×", vs: t("sciencePage.vs3"), color: "#8e44ad" },
              { power: "550×", vs: t("sciencePage.vs4"), color: "#27ae60" },
            ].map((s, i) => (
              <div key={i} style={{ background: "#f8f9fa", borderRadius: isMobile ? 12 : 16, padding: isMobile ? "20px 14px" : "28px 20px", textAlign: "center", border: "1px solid #eee" }}>
                <div style={{ color: s.color, fontSize: isMobile ? "1.6rem" : "2.4rem", fontWeight: 900, fontFamily: "var(--font-sora), sans-serif", lineHeight: 1 }}>{s.power}</div>
                <div style={{ color: "#555", fontSize: isMobile ? 11 : 13, marginTop: 8, fontWeight: 600 }}>{t("sciencePage.morePowerful")}</div>
                <div style={{ color: "#999", fontSize: isMobile ? 10 : 12, marginTop: 4 }}>{s.vs}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MÉCANISME D'ACTION */}
      <section style={{ padding: `${isMobile ? "48px" : isSmall ? "64px" : "96px"} ${px}`, background: "#f0faf2", color: "#1a1a1a" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: isMobile ? 32 : 64 }}>
            <p style={{ color: "var(--accent)", fontSize: 12, fontWeight: 700, letterSpacing: 2, marginBottom: 12 }}>{t("sciencePage.mechanismTag")}</p>
            <h2 style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: isMobile ? "1.3rem" : isSmall ? "1.7rem" : "clamp(1.8rem, 3vw, 2.4rem)", fontWeight: 800 }}>{t("sciencePage.mechanismTitle")}</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : isSmall ? "1fr 1fr" : "repeat(3, 1fr)", gap: isMobile ? 16 : 28 }}>
            {[
              { icon: "🧬", titre: t("sciencePage.mech1Title"), desc: t("sciencePage.mech1Desc") },
              { icon: "🧠", titre: t("sciencePage.mech2Title"), desc: t("sciencePage.mech2Desc") },
              { icon: "⚡", titre: t("sciencePage.mech3Title"), desc: t("sciencePage.mech3Desc") },
            ].map((m, i) => (
              <div key={i} style={{ background: "#fff", borderRadius: isMobile ? 14 : 20, padding: isMobile ? 20 : 32, border: "1px solid #c8e6d0" }}>
                <div style={{ fontSize: isMobile ? 32 : 40, marginBottom: isMobile ? 14 : 20 }}>{m.icon}</div>
                <h3 style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: isMobile ? 15 : 17, fontWeight: 800, marginBottom: 14, lineHeight: 1.3 }}>{m.titre}</h3>
                <p style={{ color: "#555", fontSize: isMobile ? 13 : 14, lineHeight: 1.75 }}>{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BÉNÉFICES CLINIQUES */}
      <section style={{ padding: `${isMobile ? "48px" : isSmall ? "64px" : "96px"} ${px}`, background: "#fff", color: "#1a1a1a" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: isMobile ? 32 : 64 }}>
            <p style={{ color: "var(--accent)", fontSize: 12, fontWeight: 700, letterSpacing: 2, marginBottom: 12 }}>{t("sciencePage.benefitsTag")}</p>
            <h2 style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: isMobile ? "1.3rem" : isSmall ? "1.7rem" : "clamp(1.8rem, 3vw, 2.4rem)", fontWeight: 800 }}>{t("sciencePage.benefitsTitle")}</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: isMobile ? 16 : 24 }}>
            {[
              { icon: "🌟", categorie: t("sciencePage.cat1Title"), points: t("sciencePage.cat1Points").split("|") },
              { icon: "⚡", categorie: t("sciencePage.cat2Title"), points: t("sciencePage.cat2Points").split("|") },
              { icon: "👁️", categorie: t("sciencePage.cat3Title"), points: t("sciencePage.cat3Points").split("|") },
              { icon: "🧠", categorie: t("sciencePage.cat4Title"), points: t("sciencePage.cat4Points").split("|") },
            ].map((b, i) => (
              <div key={i} style={{ background: "#f8fffe", border: "1px solid #c8e6d0", borderRadius: isMobile ? 14 : 20, padding: isMobile ? "20px 16px" : "32px 28px" }}>
                <h3 style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: isMobile ? 15 : 17, fontWeight: 800, marginBottom: isMobile ? 14 : 20 }}>{b.icon} {b.categorie}</h3>
                <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: isMobile ? 8 : 12 }}>
                  {b.points.map((p, j) => (
                    <li key={j} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: isMobile ? 13 : 14, color: "#444", lineHeight: 1.5 }}>
                      <span style={{ color: "var(--accent)", flexShrink: 0, marginTop: 2 }}>✓</span>{p}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* POURQUOI 12MG */}
      <section style={{ padding: `${isMobile ? "48px" : isSmall ? "64px" : "96px"} ${px}`, background: "#f0faf2", color: "#1a1a1a" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
          <p style={{ color: "var(--accent)", fontSize: 12, fontWeight: 700, letterSpacing: 2, marginBottom: 16 }}>{t("sciencePage.dosageTag")}</p>
          <h2 style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: isMobile ? "1.3rem" : isSmall ? "1.7rem" : "clamp(1.8rem, 3vw, 2.4rem)", fontWeight: 800, marginBottom: isMobile ? 16 : 24 }}>{t("sciencePage.dosageTitle")}</h2>
          <p style={{ color: "#555", fontSize: isMobile ? 14 : 16, lineHeight: 1.8, maxWidth: 700, margin: isMobile ? "0 auto 28px" : "0 auto 48px" }}>
            {t("sciencePage.dosageDesc")}
          </p>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: isMobile ? 16 : 24, maxWidth: 700, margin: "0 auto" }}>
            <div style={{ background: "#fff", border: "1px solid #e0e0e0", borderRadius: isMobile ? 14 : 20, padding: isMobile ? "20px" : "28px" }}>
              <div style={{ color: "#e53e3e", fontSize: 13, fontWeight: 700, letterSpacing: 1, marginBottom: 12 }}>{"❌ " + t("sciencePage.otherBrands")}</div>
              <div style={{ fontSize: isMobile ? "1.5rem" : "2rem", fontWeight: 900, color: "#e53e3e", marginBottom: 8 }}>{t("sciencePage.otherDose")}</div>
              <div style={{ color: "#888", fontSize: 13 }}>{t("sciencePage.otherDoseDesc")}</div>
            </div>
            <div style={{ background: "#e8f5eb", border: "2px solid var(--accent)", borderRadius: isMobile ? 14 : 20, padding: isMobile ? "20px" : "28px" }}>
              <div style={{ color: "var(--accent)", fontSize: 13, fontWeight: 700, letterSpacing: 1, marginBottom: 12 }}>✅ NUTRELIS</div>
              <div style={{ fontSize: isMobile ? "1.5rem" : "2rem", fontWeight: 900, color: "var(--accent)", marginBottom: 8 }}>{t("sciencePage.nutrielisDose")}</div>
              <div style={{ color: "#444", fontSize: 13 }}>{t("sciencePage.nutrielisDoseDesc")}</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: "var(--accent)", padding: isMobile ? "48px 16px" : isSmall ? "56px 24px" : "72px 60px", textAlign: "center" }}>
        <h2 style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: isMobile ? "1.3rem" : isSmall ? "1.7rem" : "clamp(1.8rem, 3vw, 2.6rem)", fontWeight: 900, color: "#060f08", marginBottom: 16 }}>
          {t("sciencePage.ctaTitle")}
        </h2>
        <p style={{ color: "rgba(6,15,8,0.75)", fontSize: isMobile ? 14 : 16, marginBottom: isMobile ? 24 : 36 }}>{t("sciencePage.ctaDesc")}</p>
        <Link href="/produits/astaxanthine-12mg" style={{ display: "inline-block", background: "#060f08", color: "#fff", padding: isMobile ? "14px 32px" : "18px 52px", borderRadius: 12, fontSize: isMobile ? 14 : 16, fontWeight: 800, textDecoration: "none", fontFamily: "var(--font-sora), sans-serif" }}>
          {t("sciencePage.ctaBtn")}
        </Link>
      </section>

      <footer style={{ background: "#060f08", padding: isMobile ? "24px 16px" : "40px 60px", borderTop: "1px solid #1a3522" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", flexDirection: isMobile ? "column" : "row", justifyContent: "space-between", alignItems: isMobile ? "flex-start" : "center", gap: isMobile ? 12 : 0 }}>
          <span style={{ color: "rgba(255,255,255,0.4)", fontSize: isMobile ? 12 : 13 }}>{t("home.footerRights")}</span>
          <div style={{ display: "flex", gap: isMobile ? 16 : 24 }}>
            {[{ label: t("sciencePage.footerHome"), href: "/" }, { label: t("sciencePage.footerAbout"), href: "/a-propos" }, { label: t("sciencePage.footerContact"), href: "/contact" }].map(l => (
              <Link key={l.href} href={l.href} style={{ color: "rgba(255,255,255,0.5)", fontSize: isMobile ? 12 : 13, textDecoration: "none" }}>{l.label}</Link>
            ))}
          </div>
        </div>
      </footer>

    </HydrationGuard>
  );
}
