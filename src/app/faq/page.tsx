"use client";
import { useState } from "react";
import Link from "next/link";
import NavbarCart from "@/components/NavbarCart";
import { useLocale } from "@/context/LocaleContext";
import { useScreenSize } from "@/hooks/useIsMobile";

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div onClick={() => setOpen(!open)} style={{ borderBottom: "1px solid #e8e8e8", padding: "22px 0", cursor: "pointer" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
        <span style={{ fontWeight: 600, fontSize: 16, lineHeight: 1.4 }}>{q}</span>
        <div style={{ width: 32, height: 32, borderRadius: "50%", border: "1.5px solid var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: "var(--accent)", fontSize: 20, fontWeight: 700 }}>
          {open ? "−" : "+"}
        </div>
      </div>
      {open && <div style={{ color: "#555", fontSize: 15, lineHeight: 1.8, marginTop: 16, paddingRight: 48 }}>{a}</div>}
    </div>
  );
}

export default function FAQ() {
  const { t } = useLocale();
  const screen = useScreenSize();
  const isMobile = screen === "mobile";
  const isSmall = screen === "mobile" || screen === "tablet";
  const [activecat, setActivecat] = useState(0);

  const categories = [
    {
      titre: "🌿 " + t("faqPage.cat1"),
      faqs: [
        { q: t("faqPage.faq1Q"), a: t("faqPage.faq1A") },
        { q: t("faqPage.faq2Q"), a: t("faqPage.faq2A") },
        { q: t("faqPage.faq3Q"), a: t("faqPage.faq3A") },
        { q: t("faqPage.faq4Q"), a: t("faqPage.faq4A") },
        { q: t("faqPage.faq5Q"), a: t("faqPage.faq5A") },
      ]
    },
    {
      titre: "⏱️ " + t("faqPage.cat2"),
      faqs: [
        { q: t("faqPage.faq6Q"), a: t("faqPage.faq6A") },
        { q: t("faqPage.faq7Q"), a: t("faqPage.faq7A") },
        { q: t("faqPage.faq8Q"), a: t("faqPage.faq8A") },
        { q: t("faqPage.faq9Q"), a: t("faqPage.faq9A") },
      ]
    },
    {
      titre: "🔒 " + t("faqPage.cat3"),
      faqs: [
        { q: t("faqPage.faq10Q"), a: t("faqPage.faq10A") },
        { q: t("faqPage.faq11Q"), a: t("faqPage.faq11A") },
        { q: t("faqPage.faq12Q"), a: t("faqPage.faq12A") },
        { q: t("faqPage.faq13Q"), a: t("faqPage.faq13A") },
      ]
    },
    {
      titre: "📦 " + t("faqPage.cat4"),
      faqs: [
        { q: t("faqPage.faq14Q"), a: t("faqPage.faq14A") },
        { q: t("faqPage.faq15Q"), a: t("faqPage.faq15A") },
        { q: t("faqPage.faq16Q"), a: t("faqPage.faq16A") },
        { q: t("faqPage.faq17Q"), a: t("faqPage.faq17A") },
      ]
    },
    {
      titre: "↩️ " + t("faqPage.cat5"),
      faqs: [
        { q: t("faqPage.faq18Q"), a: t("faqPage.faq18A") },
        { q: t("faqPage.faq19Q"), a: t("faqPage.faq19A") },
        { q: t("faqPage.faq20Q"), a: t("faqPage.faq20A") },
      ]
    },
  ];

  return (
    <div style={{ background: "#fff", color: "#1a1a1a", overflowX: "hidden" }}>

      {/* NAVBAR */}
      <nav style={{ background: "#060f08", borderBottom: "1px solid #1a3522", padding: isMobile ? "0 12px" : isSmall ? "0 24px" : "0 60px", height: isMobile ? 56 : 68, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
        <Link href="/" style={{ textDecoration: "none", flexShrink: 0 }}>
          <img src="/images/logo-homepage.svg" alt="Nutrelis" style={{ height: isMobile ? 28 : 40, width: "auto" }} />
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
        <p style={{ color: "var(--accent)", fontSize: 12, fontWeight: 700, letterSpacing: 2, marginBottom: 16 }}>{t("faqPage.heroTag")}</p>
        <h1 style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: "clamp(2rem, 4vw, 3.2rem)", fontWeight: 900, color: "#f0fff4", marginBottom: 16 }}>
          {t("faqPage.heroTitle1")}<br /><span style={{ color: "var(--accent)" }}>{t("faqPage.heroTitleHighlight")}</span>
        </h1>
        <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 16 }}>
          {t("faqPage.heroDesc1")}
          <Link href="/contact" style={{ color: "var(--accent)", textDecoration: "none", fontWeight: 600 }}>{t("faqPage.heroDescLink")}</Link>
        </p>
      </section>

      {/* FAQ CONTENU */}
      <section style={{ padding: "72px 60px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 56 }}>
            {categories.map((cat, i) => (
              <button key={i} onClick={() => setActivecat(i)} style={{
                padding: "10px 20px", borderRadius: 24, fontSize: 14, fontWeight: 600, cursor: "pointer",
                border: "1.5px solid",
                borderColor: activecat === i ? "var(--accent)" : "#ddd",
                background: activecat === i ? "#e8f5eb" : "#fff",
                color: activecat === i ? "var(--accent)" : "#555",
                transition: "all 0.2s",
              }}>
                {cat.titre}
              </button>
            ))}
          </div>
          <div>
            {categories[activecat].faqs.map((faq, i) => (
              <FaqItem key={i} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: "#f0faf2", padding: "72px 60px", textAlign: "center", borderTop: "1px solid #c8e6d0" }}>
        <h2 style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: "clamp(1.6rem, 2.5vw, 2.2rem)", fontWeight: 800, marginBottom: 16 }}>
          {t("faqPage.ctaTitle")}
        </h2>
        <p style={{ color: "#555", fontSize: 16, marginBottom: 36 }}>{t("faqPage.ctaDesc")}</p>
        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/contact" style={{ background: "var(--accent)", color: "#060f08", padding: "16px 40px", borderRadius: 10, fontSize: 15, fontWeight: 800, textDecoration: "none" }}>
            {t("faqPage.ctaContact")}
          </Link>
          <Link href="/produits/astaxanthine-12mg" style={{ background: "#fff", color: "var(--accent)", padding: "16px 40px", borderRadius: 10, fontSize: 15, fontWeight: 700, textDecoration: "none", border: "1.5px solid var(--accent)" }}>
            {t("faqPage.ctaProduct")}
          </Link>
        </div>
      </section>

      <footer style={{ background: "#060f08", padding: "40px 60px", borderTop: "1px solid #1a3522" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>{t("home.footerRights")}</span>
          <div style={{ display: "flex", gap: 24 }}>
            {[{ label: t("faqPage.footerHome"), href: "/" }, { label: t("faqPage.footerAbout"), href: "/a-propos" }, { label: t("faqPage.footerContact"), href: "/contact" }].map(l => (
              <Link key={l.href} href={l.href} style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, textDecoration: "none" }}>{l.label}</Link>
            ))}
          </div>
        </div>
      </footer>

    </div>
  );
}
