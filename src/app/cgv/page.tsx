"use client";
import Link from "next/link";
import NavbarCart from "@/components/NavbarCart";
import { useLocale } from "@/context/LocaleContext";
import { useScreenSize } from "@/hooks/useIsMobile";
import HydrationGuard from "@/components/HydrationGuard";

export default function CGV() {
  const { t } = useLocale();
  const screen = useScreenSize();
  const isMobile = screen === "mobile";
  const isSmall = screen === "mobile" || screen === "tablet";
  const px = isMobile ? "16px" : isSmall ? "24px" : "60px";

  const articles = [
    { title: t("cgv.article1Title"), content: t("cgv.article1Content") },
    { title: t("cgv.article2Title"), content: t("cgv.article2Content") },
    { title: t("cgv.article3Title"), content: t("cgv.article3Content") },
    { title: t("cgv.article4Title"), content: t("cgv.article4Content") },
    { title: t("cgv.article5Title"), content: t("cgv.article5Content") },
    { title: t("cgv.article6Title"), content: t("cgv.article6Content") },
    { title: t("cgv.article7Title"), content: t("cgv.article7Content") },
    { title: t("cgv.article8Title"), content: t("cgv.article8Content") },
    { title: t("cgv.article9Title"), content: t("cgv.article9Content") },
    { title: t("cgv.article10Title"), content: t("cgv.article10Content") },
  ];

  return (
    <HydrationGuard bg="#fff" style={{ color: "#1a1a1a", overflowX: "hidden" }}>

      {/* NAVBAR */}
      <nav style={{ background: "#060f08", borderBottom: "1px solid #1a3522", padding: isMobile ? "0 12px" : isSmall ? "0 24px" : "0 60px", height: isMobile ? 56 : 68, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
        <Link href="/" style={{ textDecoration: "none", flexShrink: 0 }}>
          <img src="/images/logo-homepage.png" alt="Nutrelis" style={{ height: isMobile ? 28 : 40, width: "auto" }} />
        </Link>
        {!isSmall && (
          <div style={{ display: "flex", gap: 32 }}>
            {[{ label: t("nav.products"), href: "/produits/astaxanthine-12mg" }, { label: t("nav.faq"), href: "/faq" }, { label: t("cgv.footerContact"), href: "/contact" }].map(item => (
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
      <section style={{ background: "linear-gradient(135deg, #060f08, #0a1a0d)", padding: isMobile ? "48px 16px" : isSmall ? "56px 24px" : "72px 60px", textAlign: "center" }}>
        <p style={{ color: "var(--accent)", fontSize: 12, fontWeight: 700, letterSpacing: 2, marginBottom: 16 }}>{t("cgv.heroTag")}</p>
        <h1 style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: isMobile ? "1.6rem" : isSmall ? "2rem" : "clamp(2rem, 4vw, 3.2rem)", fontWeight: 900, color: "#f0fff4", marginBottom: 16 }}>
          {t("cgv.heroTitle")}
        </h1>
        <p style={{ color: "rgba(255,255,255,0.6)", fontSize: isMobile ? 14 : 16 }}>{t("cgv.heroDesc")}</p>
      </section>

      {/* ARTICLES */}
      {articles.map((article, i) => (
        <section key={i} style={{ padding: `${isMobile ? "36px" : isSmall ? "48px" : "56px"} ${px}`, background: i % 2 === 0 ? "#fff" : "#f8f9fa" }}>
          <div style={{ maxWidth: 900, margin: "0 auto" }}>
            <h2 style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: isMobile ? "1.05rem" : isSmall ? "1.2rem" : "1.35rem", fontWeight: 800, marginBottom: isMobile ? 12 : 16, color: "#1a1a1a" }}>
              {article.title}
            </h2>
            <p style={{ color: "#555", fontSize: isMobile ? 14 : 15, lineHeight: 1.8 }}>
              {article.content}
            </p>
          </div>
        </section>
      ))}

      {/* FOOTER */}
      <footer style={{ background: "#060f08", padding: isMobile ? "24px 16px" : "40px 60px", borderTop: "1px solid #1a3522" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", flexDirection: isMobile ? "column" : "row", justifyContent: isMobile ? "center" : "space-between", alignItems: "center", gap: isMobile ? 10 : 0, textAlign: isMobile ? "center" : undefined }}>
          <span style={{ color: "rgba(255,255,255,0.4)", fontSize: isMobile ? 12 : 13 }}>{t("home.footerRights")}</span>
          <div style={{ display: "flex", gap: isMobile ? 16 : 24 }}>
            {[{ label: t("cgv.footerHome"), href: "/" }, { label: t("cgv.footerFaq"), href: "/faq" }, { label: t("cgv.footerContact"), href: "/contact" }].map(l => (
              <Link key={l.href} href={l.href} style={{ color: "rgba(255,255,255,0.5)", fontSize: isMobile ? 12 : 13, textDecoration: "none" }}>{l.label}</Link>
            ))}
          </div>
        </div>
      </footer>

    </HydrationGuard>
  );
}
