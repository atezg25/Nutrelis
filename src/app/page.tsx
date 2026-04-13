"use client";
import NavbarCart from "@/components/NavbarCart";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useScreenSize } from "@/hooks/useIsMobile";
import { useLocale } from "@/context/LocaleContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";

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
      transition: "all 0.3s",
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
            { label: t("nav.products"), href: "/produits/astaxanthine-12mg" },
            { label: t("nav.science"), href: "/science" },
            { label: t("nav.reviews"), href: "/avis-clients" },
            { label: t("nav.faq"), href: "/faq" },
          ].map((item) => (
            <Link key={item.label} href={item.href} style={{ color: "rgba(255,255,255,0.75)", fontSize: 14, fontWeight: 500, textDecoration: "none" }}>
              {item.label}
            </Link>
          ))}
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <LanguageSwitcher />
        <NavbarCart />
        <Link href="/produits/astaxanthine-12mg" style={{
          background: "var(--accent)", color: "#fff",
          padding: isMobile ? "8px 14px" : "10px 20px",
          borderRadius: 8, fontSize: isMobile ? 12 : 14, fontWeight: 700, textDecoration: "none",
          fontFamily: "var(--font-sora), sans-serif",
          whiteSpace: "nowrap",
        }}>
          {isMobile ? t("nav.order") : t("nav.orderArrow")}
        </Link>
      </div>
    </nav>
  );
}

export default function Homepage() {
  const screen = useScreenSize();
  const isMobile = screen === "mobile";
  const isTablet = screen === "tablet";
  const isDesktop = screen === "desktop";
  const { t } = useLocale();

  const px = isMobile ? "16px" : isTablet ? "32px" : "60px";
  const py = isMobile ? "56px" : isTablet ? "72px" : "100px";

  return (
    <main style={{ background: "var(--bg-primary)", color: "#fff", overflowX: "hidden" }}>
      <Navbar />

      {/* HERO */}
      <section style={{
        background: "radial-gradient(ellipse at 30% 50%, rgba(29,185,84,0.12) 0%, transparent 60%), var(--bg-primary)",
        display: "flex", alignItems: "center",
        padding: isMobile ? `80px ${px} 52px` : isTablet ? `100px ${px} 64px` : `120px ${px} 80px`,
        position: "relative", overflow: "hidden",
      }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", width: "100%" }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: isDesktop ? "1fr 1fr" : "1fr",
            gap: isMobile ? 32 : isTablet ? 48 : 80,
            alignItems: "center",
          }}>
            {/* Image */}
            <div style={{ position: "relative", display: "flex", justifyContent: "center", order: isMobile ? 1 : 1 }}>
              <div style={{ position: "absolute", inset: "10%", background: "radial-gradient(circle, rgba(29,185,84,0.15) 0%, transparent 70%)", borderRadius: "50%" }} />
              <div style={{
                position: "absolute", top: "8%", left: isMobile ? "2%" : "5%", zIndex: 2,
                width: isMobile ? 62 : isTablet ? 76 : 90,
                height: isMobile ? 62 : isTablet ? 76 : 90,
                borderRadius: "50%", background: "#fff", border: "3px solid var(--accent)",
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                boxShadow: "0 4px 16px rgba(29,185,84,0.25)",
              }}>
                <span style={{ fontSize: isMobile ? 14 : 18 }}>🌿</span>
                <span style={{ color: "#1a7a3c", fontSize: isMobile ? 6 : 8, fontWeight: 800, textAlign: "center" }}>{t("common.natural100").split("\n").map((line, i, arr) => <span key={i}>{line}{i < arr.length - 1 && <br />}</span>)}</span>
              </div>
              <div style={{
                position: "absolute", top: "8%", right: isMobile ? "2%" : "5%", zIndex: 2,
                width: isMobile ? 62 : isTablet ? 76 : 90,
                height: isMobile ? 62 : isTablet ? 76 : 90,
                borderRadius: "50%", background: "#fff", border: "3px solid var(--accent)",
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                boxShadow: "0 4px 16px rgba(29,185,84,0.25)",
              }}>
                <span style={{ color: "var(--accent)", fontSize: isMobile ? 16 : 22, fontWeight: 900, lineHeight: 1 }}>90</span>
                <span style={{ color: "var(--accent)", fontSize: isMobile ? 6 : 8, fontWeight: 800 }}>{t("common.days")}</span>
                <span style={{ color: "#888", fontSize: 6, textAlign: "center" }}>{t("common.satisfiedOrRefunded").split("\n").map((line, i, arr) => <span key={i}>{line}{i < arr.length - 1 && <br />}</span>)}</span>
              </div>
              <img
                src="/images/astaxanthine/img_transparent.png"
                alt="NUTRELIS Astaxanthine"
                style={{
                  width: isMobile ? "60%" : isTablet ? "50%" : "70%",
                  maxWidth: isMobile ? 220 : 320,
                  height: "auto", objectFit: "contain", position: "relative", zIndex: 1,
                  filter: "drop-shadow(0 20px 60px rgba(29,185,84,0.2))",
                }}
              />
            </div>

            {/* Texte */}
            <div style={{ order: isMobile ? 2 : 2, textAlign: isMobile ? "center" : "left" }}>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: "rgba(29,185,84,0.1)", border: "1px solid rgba(29,185,84,0.3)",
                borderRadius: 20, padding: "6px 14px", marginBottom: 20,
              }}>
                <span style={{ color: "var(--accent)", fontSize: isMobile ? 10 : 12, fontWeight: 700, letterSpacing: 1 }}>
                  {t("home.ratedBadge")}
                </span>
              </div>

              <h1 style={{
                fontFamily: "var(--font-sora), sans-serif",
                fontSize: isMobile ? "1.75rem" : isTablet ? "2.4rem" : "clamp(2.4rem, 4vw, 3.8rem)",
                fontWeight: 900, lineHeight: 1.15,
                marginBottom: 18, letterSpacing: -0.5,
              }}>
                {t("home.heroTitlePart1")}{" "}
                <span style={{ color: "var(--accent)" }}>{t("home.heroTitleHighlight")}</span>
                {" "}{t("home.heroTitlePart2")}
              </h1>

              <p style={{
                color: "rgba(255,255,255,0.65)",
                fontSize: isMobile ? 14 : isTablet ? 16 : 18,
                lineHeight: 1.8, marginBottom: 28,
                maxWidth: isMobile ? "100%" : 480,
                margin: isMobile ? "0 auto 28px" : "0 0 28px 0",
              }}>
                {t("home.heroShortDesc")}
              </p>

              <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 32, justifyContent: isMobile ? "center" : "flex-start", flexWrap: "wrap" }}>
                <Link href="/produits/astaxanthine-12mg" style={{
                  background: "var(--accent)", color: "#fff",
                  padding: isMobile ? "14px 24px" : "18px 40px", borderRadius: 12,
                  fontSize: isMobile ? 14 : 16, fontWeight: 900, textDecoration: "none",
                  fontFamily: "var(--font-sora), sans-serif",
                  boxShadow: "0 8px 32px rgba(29,185,84,0.35)",
                }}>
                  {t("home.discoverProducts")}
                </Link>
              </div>

              <div style={{ display: "flex", gap: isMobile ? 20 : 40, justifyContent: isMobile ? "center" : "flex-start", flexWrap: "wrap" }}>
                {[
                  { val: "12 000+", label: t("home.statClients") },
                  { val: "4.8/5", label: t("home.statRating") },
                  { val: "90j", label: t("home.statGuarantee") },
                ].map((stat, i) => (
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
            { icon: "🔬", label: isMobile ? t("home.clinicalFormulaShort") : t("home.clinicalFormula") },
            { icon: "✅", label: isMobile ? t("home.certifiedShort") : t("home.certified") },
            { icon: "🌿", label: t("home.naturalIngredients") },
            { icon: "🚚", label: isMobile ? t("home.expressDeliveryShort") : t("home.expressDeliveryLabel") },
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
            <h2 style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: isMobile ? "1.4rem" : isTablet ? "1.8rem" : "clamp(1.8rem, 3vw, 2.6rem)", fontWeight: 800 }}>
              {t("home.scienceNature")}
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : isTablet ? "1fr 1fr" : "repeat(3, 1fr)", gap: isMobile ? 20 : 24 }}>
            {/* Produit vedette */}
            <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(29,185,84,0.3)", borderRadius: 24, overflow: "hidden" }}>
              <div style={{ background: "radial-gradient(ellipse at 50% 60%, rgba(29,185,84,0.12) 0%, rgba(6,15,8,0.8) 100%)", padding: "32px", textAlign: "center", position: "relative" }}>
                <div style={{ position: "absolute", top: 16, right: 16, background: "var(--accent)", color: "#fff", fontSize: 12, fontWeight: 800, padding: "4px 12px", borderRadius: 20 }}>−20%</div>
                <img src="/images/astaxanthine/img_transparent.png" alt="Astaxanthine"
                  style={{ width: "55%", maxWidth: 160, height: "auto", objectFit: "contain", margin: "16px auto 0", display: "block" }} />
              </div>
              <div style={{ padding: isMobile ? "20px" : "28px" }}>
                <p style={{ color: "var(--accent)", fontSize: 11, fontWeight: 700, letterSpacing: 1.5, marginBottom: 8 }}>{t("home.premiumAntioxidant")}</p>
                <h3 style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: isMobile ? 18 : 20, fontWeight: 800, marginBottom: 10, lineHeight: 1.3 }}>{t("home.astaxanthin12mg")}</h3>
                <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 16 }}>
                  {t("home.astaxanthinDesc")}
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
                  {[t("home.tagSkin"), t("home.tagEyes"), t("home.tagEnergy"), t("home.tagAntiAge")].map((tag, i) => (
                    <span key={i} style={{ background: "rgba(29,185,84,0.1)", color: "var(--accent)", fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 20, border: "1px solid rgba(29,185,84,0.2)" }}>{tag}</span>
                  ))}
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                  <div>
                    <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, textDecoration: "line-through", marginRight: 6 }}>18 750 F</span>
                    <span style={{ color: "var(--accent)", fontSize: isMobile ? 18 : 22, fontWeight: 900, fontFamily: "var(--font-sora), sans-serif" }}>15 000 FCFA</span>
                  </div>
                  <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 12 }}>★★★★★</div>
                </div>
                <Link href="/produits/astaxanthine-12mg" style={{ display: "block", textAlign: "center", background: "var(--accent)", color: "#fff", padding: "14px", borderRadius: 10, fontSize: 14, fontWeight: 800, textDecoration: "none", fontFamily: "var(--font-sora), sans-serif" }}>
                  {t("home.discover")}
                </Link>
              </div>
            </div>

            {/* Produits à venir */}
            {[
              { nom: t("home.collagenName"), desc: t("home.collagenDesc"), emoji: "🧴" },
              { nom: t("home.omega3Name"), desc: t("home.omega3Desc"), emoji: "🫀" },
            ].map((p, i) => (
              <div key={i} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 24, overflow: "hidden", opacity: 0.6, position: "relative" }}>
                <div style={{ position: "absolute", top: 16, left: "50%", transform: "translateX(-50%)", background: "rgba(255,255,255,0.1)", color: "#fff", fontSize: 10, fontWeight: 700, padding: "4px 14px", borderRadius: 20, zIndex: 2, whiteSpace: "nowrap" }}>{t("home.comingSoon")}</div>
                <div style={{ padding: "40px", textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", height: 200 }}>
                  <span style={{ fontSize: 56, opacity: 0.3 }}>{p.emoji}</span>
                </div>
                <div style={{ padding: isMobile ? "20px" : "28px" }}>
                  <h3 style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: isMobile ? 17 : 20, fontWeight: 800, marginBottom: 10 }}>{p.nom}</h3>
                  <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, lineHeight: 1.7, marginBottom: 16 }}>{p.desc}</p>
                  <button style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.4)", padding: "13px", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "not-allowed" }}>{t("home.comingSoonBtn")}</button>
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
            <h2 style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: isMobile ? "1.4rem" : isTablet ? "1.8rem" : "clamp(1.8rem, 3vw, 2.6rem)", fontWeight: 800 }}>
              {t("home.whyChoose")}
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : isTablet ? "1fr 1fr" : "repeat(4, 1fr)", gap: isMobile ? 14 : 24 }}>
            {[
              { icon: "🔬", titre: t("home.clinicalDosage"), desc: t("home.clinicalDosageDesc") },
              { icon: "🌿", titre: t("home.natural"), desc: t("home.naturalDesc") },
              { icon: "✅", titre: t("home.testedCertified"), desc: t("home.testedCertifiedDesc") },
              { icon: "🛡️", titre: t("home.guaranteed90"), desc: t("home.guaranteed90Desc") },
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

      {/* AVIS CLIENTS */}
      <section style={{ padding: `${py} ${px}` }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: isMobile ? 32 : 48 }}>
            <p style={{ color: "var(--accent)", fontSize: 12, fontWeight: 700, letterSpacing: 2, marginBottom: 12 }}>{t("home.testimonialsTag")}</p>
            <h2 style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: isMobile ? "1.4rem" : isTablet ? "1.8rem" : "clamp(1.8rem, 3vw, 2.6rem)", fontWeight: 800 }}>
              {t("home.transformedHealth")}
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : isTablet ? "1fr 1fr" : "repeat(3, 1fr)", gap: isMobile ? 16 : 24 }}>
            {[
              { nom: "Marie Ange", img: "/images/astaxanthine/designfreek-ai-generated-8702314-1.jpg", texte: t("home.review1Text"), semaines: t("home.review1Weeks") },
              { nom: "Christine", img: "/images/astaxanthine/counselling-woman-628928-1.jpg", texte: t("home.review2Text"), semaines: t("home.review2Weeks") },
              { nom: "Audrey", img: "/images/astaxanthine/awala-bride-5521283-1.jpg", texte: t("home.review3Text"), semaines: t("home.review3Weeks") },
            ].map((avis, i) => (
              <div key={i} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(29,185,84,0.15)", borderRadius: 20, padding: isMobile ? "20px" : "28px" }}>
                <div style={{ color: "var(--accent)", fontSize: 16, marginBottom: 12 }}>★★★★★</div>
                <p style={{ color: "rgba(255,255,255,0.75)", fontSize: isMobile ? 14 : 15, lineHeight: 1.8, marginBottom: 20, fontStyle: "italic" }}>&ldquo;{avis.texte}&rdquo;</p>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 40, height: 40, borderRadius: "50%", overflow: "hidden", border: "2px solid var(--accent)", flexShrink: 0 }}>
                      <img src={avis.img} alt={avis.nom} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                    <div>
                      <p style={{ fontWeight: 700, fontSize: 13 }}>{avis.nom}</p>
                      <p style={{ color: "var(--accent)", fontSize: 11, fontWeight: 600 }}>✓ {t("home.verifiedClient")}</p>
                    </div>
                  </div>
                  <span style={{ background: "rgba(29,185,84,0.1)", color: "var(--accent)", fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 20, flexShrink: 0 }}>{avis.semaines}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section style={{ padding: `${py} ${px}`, background: "radial-gradient(ellipse at 50% 50%, rgba(29,185,84,0.12) 0%, transparent 70%)", textAlign: "center", borderTop: "1px solid rgba(29,185,84,0.1)" }}>
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <p style={{ color: "var(--accent)", fontSize: 12, fontWeight: 700, letterSpacing: 2, marginBottom: 16 }}>{t("home.startToday")}</p>
          <h2 style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: isMobile ? "1.6rem" : isTablet ? "2rem" : "clamp(2rem, 3.5vw, 3rem)", fontWeight: 900, marginBottom: 20, lineHeight: 1.2 }}>
            {t("home.transformHealth")}
          </h2>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: isMobile ? 14 : 17, lineHeight: 1.8, marginBottom: 32 }}>
            {t("home.join12000")}
          </p>
          <Link href="/produits/astaxanthine-12mg" style={{
            display: "inline-block", background: "var(--accent)", color: "#fff",
            padding: isMobile ? "15px 28px" : "20px 56px", borderRadius: 14,
            fontSize: isMobile ? 14 : 17, fontWeight: 900, textDecoration: "none",
            fontFamily: "var(--font-sora), sans-serif",
            boxShadow: "0 8px 40px rgba(29,185,84,0.4)", marginBottom: 16,
          }}>
            {t("home.orderNow70")}
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
                <img src="/images/logo-homepage.png" alt="Nutrelis" style={{ height: 36, width: "auto" }} />
              </div>
              <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 13, lineHeight: 1.8, maxWidth: 280 }}>
                {t("home.footerShortDesc")}
              </p>
            </div>
            {[
              { titre: t("home.footerProducts"), liens: [{ label: t("home.astaxanthin12mg"), href: "/produits/astaxanthine-12mg" }, { label: t("home.collagenName"), href: "#" }, { label: t("home.omega3Name"), href: "#" }] },
              { titre: t("home.footerCompany"), liens: [{ label: t("home.footerAbout"), href: "/a-propos" }, { label: t("home.footerScience"), href: "/science" }, { label: t("home.footerBlog"), href: "/blog" }] },
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
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 18, textAlign: "center" }}>
            <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 11 }}>{t("home.footerCopyright")}</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
