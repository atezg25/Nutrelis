"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import NavbarCart from "@/components/NavbarCart";
import { useLocale } from "@/context/LocaleContext";
import { useScreenSize } from "@/hooks/useIsMobile";
import HydrationGuard from "@/components/HydrationGuard";

type AvisVerifie = { rating: number; body: string; display_name: string; city: string | null; shop_reply: string | null; created_at: string };
type Temoignage = { nom: string; ville?: string; note: number; texte: string };
type Produit = { id: string; slug: string; name: string; imageUrl: string | null; avisVerifies?: AvisVerifie[]; content?: { avis?: Temoignage[] } };

/** Avis clients, classés par produit : uniquement des avis vérifiés (commande livrée) et validés dans la console. */
export default function AvisClients() {
  const { t, locale } = useLocale();
  const screen = useScreenSize();
  const isMobile = screen === "mobile";
  const isSmall = screen === "mobile" || screen === "tablet";
  const px = isMobile ? "16px" : isSmall ? "24px" : "60px";
  const [produits, setProduits] = useState<Produit[] | null>(null);
  const [filtre, setFiltre] = useState<string>("tous");

  useEffect(() => {
    void fetch(`/api/catalog?lang=${locale}`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { products: [] }))
      .then((d: { products?: Produit[] }) => setProduits(d.products ?? []))
      .catch(() => setProduits([]));
  }, [locale]);

  const nbAvis = (p: Produit) => (p.avisVerifies?.length ?? 0) + (p.content?.avis?.length ?? 0);
  const avecAvis = (produits ?? []).filter((p) => nbAvis(p) > 0);
  const visibles = filtre === "tous" ? avecAvis : avecAvis.filter((p) => p.slug === filtre);
  const total = avecAvis.reduce((n, p) => n + nbAvis(p), 0);
  const moyenne = (p: Produit) => {
    const notes = [...(p.avisVerifies ?? []).map((x) => x.rating), ...(p.content?.avis ?? []).map((x) => x.note)];
    return notes.length ? notes.reduce((n, x) => n + x, 0) / notes.length : 0;
  };
  const date = (iso: string) => new Date(iso).toLocaleDateString(locale === "fr" ? "fr-FR" : "en-GB", { month: "long", year: "numeric" });

  return (
    <HydrationGuard bg="#fff" style={{ color: "#1a1a1a", overflowX: "hidden" }}>
      {/* NAVBAR */}
      <nav style={{ background: "#060f08", borderBottom: "1px solid #1a3522", padding: isMobile ? "0 12px" : isSmall ? "0 24px" : "0 60px", height: isMobile ? 56 : 68, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
        <Link href="/" style={{ textDecoration: "none", flexShrink: 0 }}>
          <img src="/images/logo-homepage.png" alt="Nutrelis" style={{ height: isMobile ? 28 : 40, width: "auto" }} />
        </Link>
        {!isSmall && (
          <div style={{ display: "flex", gap: 32 }}>
            {[{ label: t("nav.products"), href: "/#produits" }, { label: t("nav.reviews"), href: "/avis-clients" }, { label: t("nav.faq"), href: "/faq" }].map((item) => (
              <Link key={item.href} href={item.href} style={{ color: "rgba(255,255,255,0.65)", fontSize: 14, fontWeight: 500, textDecoration: "none" }}>{item.label}</Link>
            ))}
          </div>
        )}
        <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 8 : 12 }}>
          <NavbarCart />
          <Link href="/#produits" style={{ background: "var(--accent)", color: "#060f08", padding: isMobile ? "8px 12px" : "10px 24px", borderRadius: 8, fontSize: isMobile ? 11 : 14, fontWeight: 800, textDecoration: "none", fontFamily: "var(--font-sora), sans-serif", whiteSpace: "nowrap" }}>
            {isMobile ? t("home.navShop") : t("home.navShopArrow")}
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ background: "linear-gradient(135deg, #060f08, #0a1a0d)", padding: isMobile ? "40px 16px" : isSmall ? "56px 24px" : "72px 60px", textAlign: "center" }}>
        <p style={{ color: "var(--accent)", fontSize: 12, fontWeight: 700, letterSpacing: 2, marginBottom: 16 }}>{t("reviewsPage.heroTag")}</p>
        <h1 style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: isMobile ? "1.6rem" : isSmall ? "2rem" : "clamp(2rem, 4vw, 3.2rem)", fontWeight: 900, color: "#f0fff4", marginBottom: 16 }}>
          {t("reviewsPage.heroTitle1")}<br /><span style={{ color: "var(--accent)" }}>{t("reviewsPage.heroTitleHighlight")}</span>
        </h1>
        <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 16, maxWidth: 560, margin: "0 auto" }}>{t("reviewsPage.heroDesc")}</p>
      </section>

      {/* AVIS PAR PRODUIT */}
      <section style={{ padding: isMobile ? "32px 16px 56px" : isSmall ? "48px 24px 72px" : "64px 60px 88px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          {produits === null && <p style={{ textAlign: "center", color: "#777" }}>{t("reviewsPage.loading")}</p>}

          {produits !== null && avecAvis.length === 0 && (
            <div style={{ textAlign: "center", padding: "24px 0 8px" }}>
              <h2 style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: isMobile ? "1.2rem" : "1.6rem", fontWeight: 800, marginBottom: 12 }}>{t("reviewsPage.emptyTitle")}</h2>
              <p style={{ color: "#666", fontSize: 15, lineHeight: 1.7, maxWidth: 520, margin: "0 auto 28px" }}>{t("reviewsPage.emptyDesc")}</p>
              <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                <Link href="/avis" style={{ background: "var(--accent)", color: "#060f08", padding: "14px 28px", borderRadius: 10, fontWeight: 800, textDecoration: "none" }}>{t("reviewsPage.leave")}</Link>
                <Link href="/#produits" style={{ border: "1.5px solid #ddd", color: "#333", padding: "14px 28px", borderRadius: 10, fontWeight: 700, textDecoration: "none" }}>{t("reviewsPage.shop")}</Link>
              </div>
            </div>
          )}

          {avecAvis.length > 0 && (
            <>
              {/* Filtre par produit */}
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 40 }}>
                {[{ slug: "tous", name: (locale === "fr" ? "Tous les produits" : "All products") + ` (${total})` }, ...avecAvis.map((p) => ({ slug: p.slug, name: `${p.name} (${nbAvis(p)})` }))].map((f) => (
                  <button key={f.slug} onClick={() => setFiltre(f.slug)} style={{
                    padding: "10px 18px", borderRadius: 24, fontSize: 14, fontWeight: 600, cursor: "pointer", border: "1.5px solid",
                    borderColor: filtre === f.slug ? "var(--accent)" : "#ddd", background: filtre === f.slug ? "#e8f5eb" : "#fff",
                    color: filtre === f.slug ? "var(--accent)" : "#555",
                  }}>{f.name}</button>
                ))}
              </div>

              {visibles.map((p) => (
                <div key={p.id} style={{ marginBottom: 56 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20, flexWrap: "wrap" }}>
                    {p.imageUrl && <img src={p.imageUrl} alt={p.name} style={{ height: 64, width: "auto", maxWidth: 64, objectFit: "contain" }} />}
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <h2 style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: isMobile ? "1.15rem" : "1.5rem", fontWeight: 800, margin: 0 }}>{p.name}</h2>
                      <div style={{ color: "#555", fontSize: 14, marginTop: 4 }}>
                        <span style={{ color: "#f5a623", letterSpacing: 1 }}>{"★".repeat(Math.round(moyenne(p)))}{"☆".repeat(5 - Math.round(moyenne(p)))}</span>{" "}
                        {moyenne(p).toFixed(1).replace(".", locale === "fr" ? "," : ".")} / 5 · {nbAvis(p)} {locale === "fr" ? "avis" : nbAvis(p) > 1 ? "reviews" : "review"} ({p.avisVerifies?.length ?? 0} {locale === "fr" ? ((p.avisVerifies?.length ?? 0) > 1 ? "vérifiés" : "vérifié") : "verified"})
                      </div>
                    </div>
                    <Link href={`/produits/${p.slug}`} style={{ border: "1.5px solid var(--accent)", color: "var(--accent)", padding: "10px 20px", borderRadius: 10, fontWeight: 700, fontSize: 14, textDecoration: "none" }}>{locale === "fr" ? "Voir le produit" : "View product"}</Link>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: isMobile ? "minmax(0, 1fr)" : "repeat(auto-fill, minmax(min(100%, 300px), 1fr))", gap: 16 }}>
                    {(p.avisVerifies ?? []).map((a, i) => (
                      <div key={i} style={{ border: "1px solid #e8e8e8", borderRadius: 16, padding: 20, background: "#fff" }}>
                        <div style={{ color: "#f5a623", fontSize: 16, marginBottom: 8 }}>{"★".repeat(a.rating)}{"☆".repeat(5 - a.rating)}</div>
                        <p style={{ color: "#333", fontSize: 15, lineHeight: 1.7, margin: "0 0 14px", fontStyle: "italic" }}>&ldquo;{a.body}&rdquo;</p>
                        <div style={{ fontWeight: 700, fontSize: 14 }}>{a.display_name}{a.city ? ` · ${a.city}` : ""}</div>
                        <div style={{ color: "var(--accent)", fontSize: 12, fontWeight: 600, marginTop: 2 }}>✓ {t("reviewsPage.verified")} · {date(a.created_at)}</div>
                        {a.shop_reply && (
                          <div style={{ marginTop: 12, padding: "10px 12px", background: "#f6f7f5", borderRadius: 10, fontSize: 13, color: "#555", lineHeight: 1.6 }}>
                            <strong>NUTRELIS :</strong> {a.shop_reply}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  {(p.content?.avis?.length ?? 0) > 0 && (
                    <div style={{ marginTop: 28 }}>
                      <h3 style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: "1.05rem", fontWeight: 800, margin: "0 0 4px" }}>{t("reviewsPage.testimonialsTitle")}</h3>
                      <p style={{ color: "#888", fontSize: 13, margin: "0 0 14px" }}>{t("reviewsPage.testimonialsNote")}</p>
                      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "minmax(0, 1fr)" : "repeat(auto-fill, minmax(min(100%, 300px), 1fr))", gap: 16 }}>
                        {(p.content?.avis ?? []).map((a, i) => (
                          <div key={i} style={{ border: "1px solid #e8e8e8", borderRadius: 16, padding: 20, background: "#fff" }}>
                            <div style={{ color: "#f5a623", fontSize: 16, marginBottom: 8 }}>{"★".repeat(a.note)}{"☆".repeat(5 - a.note)}</div>
                            <p style={{ color: "#333", fontSize: 15, lineHeight: 1.7, margin: "0 0 14px", fontStyle: "italic" }}>&ldquo;{a.texte}&rdquo;</p>
                            <div style={{ fontWeight: 700, fontSize: 14 }}>{a.nom}{a.ville ? ` · ${a.ville}` : ""}</div>
                            <div style={{ color: "#888", fontSize: 12, fontWeight: 600, marginTop: 2 }}>{t("reviewsPage.testimonial")}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              <div style={{ textAlign: "center", marginTop: 8 }}>
                <Link href="/avis" style={{ color: "var(--accent)", fontWeight: 700, textDecoration: "none" }}>{t("reviewsPage.leave")} →</Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* PIED */}
      <footer style={{ background: "#030a04", padding: isMobile ? "28px 16px" : "36px 60px", textAlign: "center" }}>
        <div style={{ display: "flex", gap: 24, justifyContent: "center", flexWrap: "wrap" }}>
          {[{ label: t("faqPage.footerHome"), href: "/" }, { label: t("nav.products"), href: "/#produits" }, { label: t("nav.faq"), href: "/faq" }, { label: t("faqPage.footerContact"), href: "/contact" }].map((l) => (
            <Link key={l.href} href={l.href} style={{ color: "rgba(255,255,255,0.5)", fontSize: isMobile ? 11 : 13, textDecoration: "none" }}>{l.label}</Link>
          ))}
        </div>
      </footer>
    </HydrationGuard>
  );
}
