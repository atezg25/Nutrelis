"use client";
import Link from "next/link";
import NavbarCart from "@/components/NavbarCart";
import { useLocale } from "@/context/LocaleContext";
import { useScreenSize } from "@/hooks/useIsMobile";

export default function Livraison() {
  const { t } = useLocale();
  const screen = useScreenSize();
  const isMobile = screen === "mobile";
  const isSmall = screen === "mobile" || screen === "tablet";
  return (
    <div style={{ background: "#fff", color: "#1a1a1a", overflowX: "hidden" }}>

      {/* NAVBAR */}
      <nav style={{ background: "#060f08", borderBottom: "1px solid #1a3522", padding: isMobile ? "0 12px" : isSmall ? "0 24px" : "0 60px", height: isMobile ? 56 : 68, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: isMobile ? 6 : 10, flexShrink: 0 }}>
          <div style={{ width: isMobile ? 28 : 36, height: isMobile ? 28 : 36, borderRadius: 8, background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", color: "#060f08", fontWeight: 900, fontSize: isMobile ? 13 : 16, fontFamily: "var(--font-sora), sans-serif" }}>N</div>
          {!isMobile && <span style={{ fontFamily: "var(--font-sora), sans-serif", fontWeight: 800, fontSize: isSmall ? 16 : 20, letterSpacing: 3, color: "#f0fff4" }}>NUTRELIS</span>}
        </Link>
        {!isSmall && (
          <div style={{ display: "flex", gap: 32 }}>
            {[{ label: t("nav.products"), href: "/produits/astaxanthine-12mg" }, { label: t("nav.faq"), href: "/faq" }, { label: t("shipping.footerContact"), href: "/contact" }].map(item => (
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
        <p style={{ color: "var(--accent)", fontSize: 12, fontWeight: 700, letterSpacing: 2, marginBottom: 16 }}>{t("shipping.heroTag")}</p>
        <h1 style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: "clamp(2rem, 4vw, 3.2rem)", fontWeight: 900, color: "#f0fff4", marginBottom: 16 }}>
          {t("shipping.heroTitle1")}
          <span style={{ color: "var(--accent)" }}>{t("shipping.heroTitleHighlight")}</span>
        </h1>
        <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 16 }}>{t("shipping.heroDesc")}</p>
      </section>

      {/* OPTIONS LIVRAISON */}
      <section style={{ padding: "80px 60px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <h2 style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: "1.8rem", fontWeight: 800, marginBottom: 48, textAlign: "center" }}>
            {t("shipping.optionsTitle")}
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            {[
              {
                icon: "📦",
                titre: t("shipping.standardTitle"),
                prix: t("shipping.standardPrice"),
                prixDesc: t("shipping.standardPriceDesc"),
                delai: t("shipping.standardDelay"),
                details: [t("shipping.standardDetail1"), t("shipping.standardDetail2"), t("shipping.standardDetail3"), t("shipping.standardDetail4")],
                popular: false,
              },
              {
                icon: "⚡",
                titre: t("shipping.expressTitle"),
                prix: t("shipping.expressPrice"),
                prixDesc: t("shipping.expressPriceDesc"),
                delai: t("shipping.expressDelay"),
                details: [t("shipping.expressDetail1"), t("shipping.expressDetail2"), t("shipping.expressDetail3"), t("shipping.expressDetail4")],
                popular: true,
              },
            ].map((opt, i) => (
              <div key={i} style={{ background: opt.popular ? "#f0faf2" : "#f8f9fa", border: opt.popular ? "2px solid var(--accent)" : "1px solid #e0e0e0", borderRadius: 20, padding: 36, position: "relative" }}>
                {opt.popular && (
                  <div style={{ position: "absolute", top: -12, right: 20, background: "var(--accent)", color: "#060f08", fontSize: 11, fontWeight: 800, padding: "4px 14px", borderRadius: 20, letterSpacing: 1 }}>
                    {t("shipping.recommended")}
                  </div>
                )}
                <div style={{ fontSize: 36, marginBottom: 16 }}>{opt.icon}</div>
                <h3 style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: "1.2rem", fontWeight: 800, marginBottom: 8 }}>{opt.titre}</h3>
                <div style={{ color: "var(--accent)", fontSize: "1.6rem", fontWeight: 900, marginBottom: 4 }}>{opt.prix}</div>
                <div style={{ color: "#888", fontSize: 13, marginBottom: 20 }}>{opt.prixDesc}</div>
                <div style={{ background: "var(--accent)", color: "#060f08", display: "inline-block", padding: "6px 16px", borderRadius: 20, fontSize: 14, fontWeight: 700, marginBottom: 24 }}>
                  {"⏱️ " + opt.delai}
                </div>
                <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>
                  {opt.details.map((d, j) => (
                    <li key={j} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: "#444" }}>
                      <span style={{ color: "var(--accent)", fontWeight: 700 }}>✓</span>{d}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROCESSUS */}
      <section style={{ padding: "80px 60px", background: "#f0faf2" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <h2 style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: "1.8rem", fontWeight: 800, marginBottom: 48, textAlign: "center" }}>
            {t("shipping.processTitle")}
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {[
              { num: "01", titre: t("shipping.step1Title"), desc: t("shipping.step1Desc") },
              { num: "02", titre: t("shipping.step2Title"), desc: t("shipping.step2Desc") },
              { num: "03", titre: t("shipping.step3Title"), desc: t("shipping.step3Desc") },
              { num: "04", titre: t("shipping.step4Title"), desc: t("shipping.step4Desc") },
              { num: "05", titre: t("shipping.step5Title"), desc: t("shipping.step5Desc") },
            ].map((step, i) => (
              <div key={i} style={{ display: "flex", gap: 24, padding: "28px 0", borderBottom: i < 4 ? "1px solid #c8e6d0" : "none" }}>
                <div style={{ width: 48, height: 48, borderRadius: "50%", background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", color: "#060f08", fontWeight: 900, fontSize: 15, flexShrink: 0, fontFamily: "var(--font-sora), sans-serif" }}>
                  {step.num}
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 6 }}>{step.titre}</div>
                  <div style={{ color: "#555", fontSize: 14, lineHeight: 1.6 }}>{step.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* POLITIQUE RETOURS */}
      <section style={{ padding: "80px 60px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <h2 style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: "1.8rem", fontWeight: 800, marginBottom: 16, textAlign: "center" }}>
            {t("shipping.returnsTitle")}
          </h2>
          <p style={{ color: "#555", fontSize: 16, lineHeight: 1.8, textAlign: "center", maxWidth: 680, margin: "0 auto 48px" }}>
            {t("shipping.returnsDesc")}
          </p>

          <div style={{ background: "#f0faf2", border: "2px solid var(--accent)", borderRadius: 20, padding: "40px", marginBottom: 28 }}>
            <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
              <span style={{ fontSize: 40 }}>🛡️</span>
              <div>
                <h3 style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: "1.2rem", fontWeight: 800, marginBottom: 12, color: "var(--accent)" }}>
                  {t("shipping.guaranteeTitle")}
                </h3>
                <p style={{ color: "#444", fontSize: 15, lineHeight: 1.8, marginBottom: 20 }}>
                  {t("shipping.guaranteeDesc")}
                </p>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  {[t("shipping.guaranteeBadge1"), t("shipping.guaranteeBadge2"), t("shipping.guaranteeBadge3"), t("shipping.guaranteeBadge4")].map((b, i) => (
                    <span key={i} style={{ background: "#fff", border: "1px solid #c8e6d0", padding: "6px 14px", borderRadius: 20, fontSize: 13, fontWeight: 600, color: "#333" }}>{"✅ " + b}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div style={{ background: "#f8f9fa", border: "1px solid #e0e0e0", borderRadius: 16, padding: 28 }}>
            <h3 style={{ fontWeight: 800, fontSize: 15, marginBottom: 16 }}>{t("shipping.refundTitle")}</h3>
            <ol style={{ paddingLeft: 20, display: "flex", flexDirection: "column", gap: 10, color: "#555", fontSize: 14, lineHeight: 1.6 }}>
              <li>{t("shipping.refundStep1")}</li>
              <li>{t("shipping.refundStep2")}</li>
              <li>{t("shipping.refundStep3")}</li>
              <li>{t("shipping.refundStep4")}</li>
            </ol>
          </div>
        </div>
      </section>

      {/* FAQ RAPIDE */}
      <section style={{ padding: "60px 60px", background: "#f8f9fa" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <h2 style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: "1.6rem", fontWeight: 800, marginBottom: 36, textAlign: "center" }}>
            {t("shipping.shippingFaqTitle")}
          </h2>
          {[
            { q: t("shipping.shipFaq1Q"), a: t("shipping.shipFaq1A") },
            { q: t("shipping.shipFaq2Q"), a: t("shipping.shipFaq2A") },
            { q: t("shipping.shipFaq3Q"), a: t("shipping.shipFaq3A") },
            { q: t("shipping.shipFaq4Q"), a: t("shipping.shipFaq4A") },
          ].map((faq, i) => (
            <div key={i} style={{ padding: "20px 0", borderBottom: i < 3 ? "1px solid #e0e0e0" : "none" }}>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 8 }}>{"📌 " + faq.q}</div>
              <div style={{ color: "#555", fontSize: 14, lineHeight: 1.7 }}>{faq.a}</div>
            </div>
          ))}
        </div>
      </section>

      <footer style={{ background: "#060f08", padding: "40px 60px", borderTop: "1px solid #1a3522" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>{t("home.footerRights")}</span>
          <div style={{ display: "flex", gap: 24 }}>
            {[{ label: t("shipping.footerHome"), href: "/" }, { label: t("shipping.footerFaq"), href: "/faq" }, { label: t("shipping.footerContact"), href: "/contact" }].map(l => (
              <Link key={l.href} href={l.href} style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, textDecoration: "none" }}>{l.label}</Link>
            ))}
          </div>
        </div>
      </footer>

    </div>
  );
}
