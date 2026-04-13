"use client";
import { useState } from "react";
import Link from "next/link";
import NavbarCart from "@/components/NavbarCart";
import { useLocale } from "@/context/LocaleContext";
import { useScreenSize } from "@/hooks/useIsMobile";

export default function Contact() {
  const { t } = useLocale();
  const screen = useScreenSize();
  const isMobile = screen === "mobile";
  const isSmall = screen === "mobile" || screen === "tablet";
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ nom: "", email: "", sujet: "", message: "" });

  return (
    <div style={{ background: "#fff", color: "#1a1a1a", overflowX: "hidden" }}>

      {/* NAVBAR */}
      <nav style={{ background: "#060f08", borderBottom: "1px solid #1a3522", padding: isMobile ? "0 12px" : isSmall ? "0 24px" : "0 60px", height: isMobile ? 56 : 68, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
        <Link href="/" style={{ textDecoration: "none", flexShrink: 0 }}>
          <img src="/images/logo-homepage.svg" alt="Nutrelis" style={{ height: isMobile ? 28 : 40, width: "auto" }} />
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
        <p style={{ color: "var(--accent)", fontSize: 12, fontWeight: 700, letterSpacing: 2, marginBottom: 16 }}>{t("contactPage.heroTag")}</p>
        <h1 style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: "clamp(2rem, 4vw, 3.2rem)", fontWeight: 900, color: "#f0fff4", marginBottom: 16 }}>
          {t("contactPage.heroTitle1")}
          <span style={{ color: "var(--accent)" }}>{t("contactPage.heroTitleHighlight")}</span>
        </h1>
        <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 16 }}>{t("contactPage.heroDesc")}</p>
      </section>

      {/* CONTENU */}
      <section style={{ padding: "80px 60px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: 80 }}>

          {/* Infos contact */}
          <div>
            <h2 style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: "1.6rem", fontWeight: 800, marginBottom: 32 }}>{t("contactPage.infoTitle")}</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {[
                { icon: "📧", titre: t("contactPage.emailTitle"), val: t("contactPage.emailVal"), desc: t("contactPage.emailDesc") },
                { icon: "📱", titre: t("contactPage.whatsappTitle"), val: t("contactPage.whatsappVal"), desc: t("contactPage.whatsappDesc") },
                { icon: "📍", titre: t("contactPage.addressTitle"), val: t("contactPage.addressVal"), desc: t("contactPage.addressDesc") },
              ].map((c, i) => (
                <div key={i} style={{ display: "flex", gap: 16, padding: "20px", background: "#f8fffe", borderRadius: 14, border: "1px solid #c8e6d0" }}>
                  <span style={{ fontSize: 28, flexShrink: 0 }}>{c.icon}</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{c.titre}</div>
                    <div style={{ fontWeight: 800, fontSize: 16, color: "var(--accent)", marginBottom: 4 }}>{c.val}</div>
                    <div style={{ color: "#888", fontSize: 12 }}>{c.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 36, background: "#f0faf2", borderRadius: 16, padding: 28, border: "1px solid #c8e6d0" }}>
              <h3 style={{ fontFamily: "var(--font-sora), sans-serif", fontWeight: 800, fontSize: 15, marginBottom: 12 }}>
                {t("contactPage.faqBoxTitle")}
              </h3>
              <p style={{ color: "#555", fontSize: 14, lineHeight: 1.7, marginBottom: 16 }}>
                {t("contactPage.faqBoxDesc")}
              </p>
              <Link href="/faq" style={{ color: "var(--accent)", fontWeight: 700, fontSize: 14, textDecoration: "none" }}>
                {t("contactPage.faqBoxLink")}
              </Link>
            </div>
          </div>

          {/* Formulaire */}
          <div>
            <h2 style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: "1.6rem", fontWeight: 800, marginBottom: 32 }}>
              {t("contactPage.formTitle")}
            </h2>

            {sent ? (
              <div style={{ background: "#e8f5eb", border: "1.5px solid var(--accent)", borderRadius: 20, padding: "56px", textAlign: "center" }}>
                <div style={{ fontSize: 56, marginBottom: 20 }}>✅</div>
                <h3 style={{ fontFamily: "var(--font-sora), sans-serif", fontWeight: 800, fontSize: "1.3rem", marginBottom: 12 }}>
                  {t("contactPage.sentTitle")}
                </h3>
                <p style={{ color: "#555", fontSize: 15, marginBottom: 28 }}>
                  {t("contactPage.sentDesc")}
                </p>
                <button
                  onClick={() => { setSent(false); setForm({ nom: "", email: "", sujet: "", message: "" }); }}
                  style={{ background: "var(--accent)", color: "#060f08", border: "none", padding: "12px 28px", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer" }}
                >
                  {t("contactPage.sendAnother")}
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  {[
                    { key: "nom", label: t("contactPage.nameLabel"), type: "text", placeholder: t("contactPage.namePlaceholder") },
                    { key: "email", label: t("contactPage.emailLabel"), type: "email", placeholder: t("contactPage.emailPlaceholder") },
                  ].map(field => (
                    <div key={field.key}>
                      <label style={{ display: "block", fontWeight: 600, fontSize: 14, marginBottom: 8, color: "#333" }}>{field.label}</label>
                      <input
                        type={field.type}
                        placeholder={field.placeholder}
                        value={(form as any)[field.key]}
                        onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                        style={{ width: "100%", padding: "13px 16px", borderRadius: 10, border: "1.5px solid #ddd", fontSize: 15, outline: "none", boxSizing: "border-box" }}
                        onFocus={e => e.currentTarget.style.borderColor = "var(--accent)"}
                        onBlur={e => e.currentTarget.style.borderColor = "#ddd"}
                      />
                    </div>
                  ))}
                </div>

                <div>
                  <label style={{ display: "block", fontWeight: 600, fontSize: 14, marginBottom: 8, color: "#333" }}>{t("contactPage.subjectLabel")}</label>
                  <input
                    type="text"
                    placeholder={t("contactPage.subjectPlaceholder")}
                    value={form.sujet}
                    onChange={e => setForm({ ...form, sujet: e.target.value })}
                    style={{ width: "100%", padding: "13px 16px", borderRadius: 10, border: "1.5px solid #ddd", fontSize: 15, outline: "none", boxSizing: "border-box" }}
                    onFocus={e => e.currentTarget.style.borderColor = "var(--accent)"}
                    onBlur={e => e.currentTarget.style.borderColor = "#ddd"}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontWeight: 600, fontSize: 14, marginBottom: 8, color: "#333" }}>{t("contactPage.messageLabel")}</label>
                  <textarea
                    placeholder={t("contactPage.messagePlaceholder")}
                    rows={6}
                    value={form.message}
                    onChange={e => setForm({ ...form, message: e.target.value })}
                    style={{ width: "100%", padding: "13px 16px", borderRadius: 10, border: "1.5px solid #ddd", fontSize: 15, outline: "none", resize: "vertical", boxSizing: "border-box", fontFamily: "inherit" }}
                    onFocus={e => e.currentTarget.style.borderColor = "var(--accent)"}
                    onBlur={e => e.currentTarget.style.borderColor = "#ddd"}
                  />
                </div>

                <button
                  onClick={() => { if (form.nom && form.email && form.message) setSent(true); }}
                  style={{ background: "var(--accent)", color: "#060f08", border: "none", padding: "18px", borderRadius: 12, fontSize: 16, fontWeight: 800, cursor: "pointer", fontFamily: "var(--font-sora), sans-serif", letterSpacing: 0.3 }}
                >
                  {t("contactPage.sendBtn")}
                </button>

                <p style={{ color: "#aaa", fontSize: 12, textAlign: "center" }}>
                  {t("contactPage.privacyNote")}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      <footer style={{ background: "#060f08", padding: "40px 60px", borderTop: "1px solid #1a3522" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>{t("home.footerRights")}</span>
          <div style={{ display: "flex", gap: 24 }}>
            {[{ label: t("contactPage.footerHome"), href: "/" }, { label: t("contactPage.footerFaq"), href: "/faq" }, { label: t("contactPage.footerShipping"), href: "/livraison" }].map(l => (
              <Link key={l.href} href={l.href} style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, textDecoration: "none" }}>{l.label}</Link>
            ))}
          </div>
        </div>
      </footer>

    </div>
  );
}
