"use client";
import { useCart } from "@/context/CartContext";
import NavbarCart from "@/components/NavbarCart";
import { useState, useEffect, useRef } from "react";
import { useScreenSize } from "@/hooks/useIsMobile";
import HydrationGuard from "@/components/HydrationGuard";
import { useLocale } from "@/context/LocaleContext";
import FloatingActions from "@/components/FloatingActions";
import { fetchProductByHandle, getVariantPrice, type MedusaProduct } from "@/lib/medusa-products";
import { sanitizeHtml } from "@/lib/sanitize";
import { prixAbonne } from "@/lib/abonnement";

function Navbar({ avis }: { avis: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const sc = useScreenSize();
  const isMobile = sc === "mobile";
  const isSmall = sc === "mobile" || sc === "tablet";
  const { t } = useLocale();
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);
  return (
    <nav style={{
      position: "sticky",
      top: 0,
      zIndex: 100,
      background: "rgba(255,248,241,0.97)",
      borderBottom: "1px solid var(--gel-border)",
      backdropFilter: "blur(12px)",
      boxShadow: scrolled ? "0 2px 20px rgba(212,86,10,0.08)" : "none",
      transition: "background 0.3s, box-shadow 0.3s, border-color 0.3s",
    }}>
      <div style={{
        maxWidth: 1280,
        margin: "0 auto",
        padding: isMobile ? "0 16px" : "0 40px",
        height: 60,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <a href="/" style={{ textDecoration: "none", flexShrink: 0 }}>
          <img src="/images/logo-product.png" alt="Nutrelis" style={{ height: isMobile ? 28 : 40, width: "auto" }} />
        </a>
        {!isSmall && (
          <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
            {[
              { label: t("gel.navProduct"), href: "#commander" },
              { label: t("gel.navRoutine"), href: "#routine" },
              ...(avis ? [{ label: t("gel.navReviews"), href: "#avis" }] : []),
              { label: t("gel.navFaq"), href: "#faq" },
            ].map((item) => (
              <a key={item.href} href={item.href} style={{
                color: "var(--gel-text2)",
                fontSize: 14,
                fontWeight: 500,
                textDecoration: "none",
              }}>
                {item.label}
              </a>
            ))}
          </div>
        )}
       <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <NavbarCart dark={false} />
          <a href="#commander" style={{
            background: "var(--gel-accent)",
            color: "#fff",
            padding: isMobile ? "8px 14px" : "10px 24px",
            borderRadius: 8,
            fontSize: isMobile ? 12 : 14,
            fontWeight: 700,
            textDecoration: "none",
            boxShadow: "0 4px 14px rgba(212,86,10,0.25)",
            fontFamily: "var(--font-sora), sans-serif",
            whiteSpace: "nowrap",
          }}>
            {isMobile ? t("nav.order") : t("nav.orderArrow")}
          </a>
        </div>
      </div>
    </nav>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      onClick={() => setOpen(!open)}
      style={{
        borderBottom: "1px solid var(--gel-border)",
        padding: "20px 0",
        cursor: "pointer",
      }}
    >
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 16,
      }}>
        <span style={{ fontWeight: 600, fontSize: 16, color: "var(--gel-text)" }}>
          {q}
        </span>
        <div style={{
          width: 30,
          height: 30,
          borderRadius: "50%",
          border: "1.5px solid var(--gel-accent)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          color: "var(--gel-accent)",
          fontSize: 20,
          fontWeight: 700,
        }}>
          {open ? "−" : "+"}
        </div>
      </div>
      {open && (
        <p style={{
          color: "var(--gel-text2)",
          fontSize: 15,
          lineHeight: 1.8,
          marginTop: 14,
          paddingRight: 46,
        }}>
          {a}
        </p>
      )}
    </div>
  );
}

function PackSelector({ onPackChange, medusaProduct }: { onPackChange?: (prix: number, original: number, mode: string) => void; medusaProduct?: MedusaProduct | null }) {
  const [mode, setMode] = useState("unique");
  const [selected, setSelected] = useState(2);
  const [toast, setToast] = useState(false);
  const [stockError, setStockError] = useState(false);
  const { ajouterArticle } = useCart();
  const scPS = useScreenSize();
  const isMobilePS = scPS === "mobile";
  const { t } = useLocale();

  // Mapping SKU → variant Medusa pour récupérer les prix dynamiques
  const skuPriceMap: Record<string, number> = {};
  if (medusaProduct?.variants) {
    for (const v of medusaProduct.variants) {
      if (v.sku) skuPriceMap[v.sku] = getVariantPrice(v);
    }
  }

  // Prix : ceux du catalogue (console). « Ancien prix » = le prix du même nombre de gels achetés à l'unité (calcul exact, pas un faux rabais).
  const unite = skuPriceMap["GEL-ORANGE-1"] || 10000;
  const variantes = medusaProduct?.variants ?? [];
  const construire = (id: number, sku: string, qte: number, label: string, defaut: number, popular: boolean, img: string) => {
    const prix = skuPriceMap[sku] || defaut;
    const ancien = unite * qte;
    return {
      id,
      label,
      capsules: t("gel.capsules" + qte),
      cure: `${t("gel.perGelPre")} ${Math.round(prix / qte).toLocaleString("fr-FR")} FCFA ${t("gel.perGelPost")}`,
      perCycle: t("gel.perDelivery"),
      prix,
      ancien: ancien > prix ? ancien : prix,
      aboPrix: prixAbonne(prix),
      eco: ancien > prix ? (ancien - prix).toLocaleString("fr-FR") + " FCFA" : null,
      popular,
      img,
      variantId: variantes.find(v => v.sku === sku)?.id || "",
      sku,
    };
  };
  const packs = [
    construire(1, "GEL-ORANGE-1", 1, t("gel.packDiscovery"), 10000, false, "/images/gel/P_01.png"),
    construire(2, "GEL-ORANGE-2", 2, t("gel.packResults"), 18000, false, "/images/gel/P_02.png"),
    construire(3, "GEL-ORANGE-3", 3, t("gel.packTransformation"), 24000, true, "/images/gel/P_03.png"),
  ];

useEffect(() => {
    const pack = packs.find(p => p.id === selected)!;
    if (onPackChange) onPackChange(
      mode === "abonnement" ? pack.aboPrix : pack.prix,
      mode === "abonnement" ? pack.prix : pack.ancien,
      mode
    );
  }, [selected, mode]);

  const current = packs.find((p) => p.id === selected)!;

  return (
    <div>
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        background: "#fdeedd",
        borderRadius: 12,
        padding: 5,
        marginBottom: 24,
        border: "1px solid var(--gel-border)",
      }}>
        {[
          { id: "unique", label: t("gel.oneTimePurchase") },
          { id: "abonnement", label: "⭐ " + t("gel.subscription") },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
  setMode(tab.id);
  const pack = packs.find(p => p.id === selected)!;
  if (onPackChange) onPackChange(
    tab.id === "abonnement" ? pack.aboPrix : pack.prix,
    tab.id === "abonnement" ? pack.prix : pack.ancien,
    tab.id
  );
}}
            style={{
              padding: isMobilePS ? "12px 8px" : "14px 10px",
              background: mode === tab.id ? "var(--gel-accent)" : "transparent",
              color: mode === tab.id ? "#fff" : "var(--gel-text2)",
              border: "none",
              borderRadius: 8,
              fontWeight: 700,
              fontSize: isMobilePS ? 13 : 15,
              cursor: "pointer",
              transition: "all 0.2s",
              fontFamily: "var(--font-sora), sans-serif",
              whiteSpace: "nowrap",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {mode === "abonnement" && (
        <div style={{
          background: "#ffe9d6",
          border: "1px solid var(--gel-accent)",
          borderRadius: 10,
          padding: isMobilePS ? "8px 12px" : "10px 14px",
          marginBottom: 16,
          fontSize: isMobilePS ? 11 : 14,
          color: "var(--gel-text2)",
          lineHeight: 1.5,
        }}>
          📦{" "}
          <strong style={{ color: "var(--gel-text)" }}>
            {t("gel.autoDelivery")}
          </strong>{" "}
          via ATEZ Express &nbsp;·&nbsp; 💰{" "}
          <strong style={{ color: "var(--gel-text)" }}>{t("gel.lifetimeDiscount")}</strong>
          &nbsp;·&nbsp; ✅{" "}
          <strong style={{ color: "var(--gel-text)" }}>
            {t("gel.cancelAnytime")}
          </strong>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: isMobilePS ? 8 : 12, marginBottom: isMobilePS ? 16 : 24 }}>
        {packs.map((pack) => (
          <div
            key={pack.id}
            onClick={() => {
  setSelected(pack.id);
  if (onPackChange) onPackChange(
    mode === "abonnement" ? pack.aboPrix : pack.prix,
    mode === "abonnement" ? pack.prix : pack.ancien,
    mode
  );
}}
            style={{
              display: "flex",
              alignItems: "center",
              gap: isMobilePS ? 8 : 16,
              background: selected === pack.id ? "#ffe9d6" : "#fff",
              border: `2px solid ${selected === pack.id ? "var(--gel-accent)" : "var(--gel-border)"}`,
              borderRadius: 12,
              padding: isMobilePS ? "10px 10px" : "16px 20px",
              minHeight: isMobilePS ? 70 : 90,
              cursor: "pointer",
              transition: "all 0.2s",
              position: "relative",
            }}
          >
            {pack.popular && (
              <div style={{
                position: "absolute",
                top: -10,
                right: 16,
                background: "var(--gel-accent)",
                color: "#fff",
                fontSize: 10,
                fontWeight: 800,
                letterSpacing: 1,
                padding: "3px 10px",
                borderRadius: 20,
                zIndex: 2,
                whiteSpace: "nowrap",
              }}>
                {t("gel.mostPopular")}
              </div>
            )}
            <div style={{
              width: 20,
              height: 20,
              borderRadius: "50%",
              flexShrink: 0,
              border: `2px solid ${selected === pack.id ? "var(--gel-accent)" : "#ccc"}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
              {selected === pack.id && (
                <div style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: "var(--gel-accent)",
                }} />
              )}
            </div>
            <img
              src={pack.img}
              alt={pack.label}
              style={{ width: isMobilePS ? 36 : 56, height: isMobilePS ? 36 : 56, objectFit: "contain", flexShrink: 0 }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 800, fontSize: isMobilePS ? 12 : 15, color: "var(--gel-text)", lineHeight: 1.3 }}>
                {pack.capsules}
              </div>
              <div style={{ fontSize: isMobilePS ? 10 : 12, color: "var(--gel-text2)", marginTop: 2 }}>
                {pack.cure}
              </div>
              {pack.eco && mode === "unique" && (
                <span style={{
                  display: "inline-block",
                  background: "var(--gel-accent)",
                  color: "#fff",
                  fontSize: isMobilePS ? 9 : 11,
                  fontWeight: 700,
                  padding: isMobilePS ? "2px 6px" : "3px 10px",
                  borderRadius: 20,
                  marginTop: 4,
                  whiteSpace: "nowrap",
                }}>
                  {t("gel.save")} {pack.eco}
                </span>
              )}
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <div style={{ color: "var(--gel-accent)", fontSize: isMobilePS ? 15 : 22, fontWeight: 900, lineHeight: 1 }}>
                {(mode === "abonnement" ? pack.aboPrix : pack.prix).toLocaleString("fr-FR")}
                <span style={{ fontSize: 12 }}> FCFA</span>
              </div>
              {pack.ancien > pack.prix && (
                <div style={{ color: "#aaa", fontSize: 12, textDecoration: "line-through" }}>
                  {pack.ancien.toLocaleString("fr-FR")} F
                </div>
              )}
              {mode === "abonnement" && (
                <div style={{ fontSize: 11, color: "var(--gel-gold)", fontWeight: 700 }}>
                  {pack.perCycle}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={async () => {
          const pack = packs.find(p => p.id === selected)!;
          setStockError(false);
          if (!pack.variantId) return;
          const ok = await ajouterArticle({
            id: `gel-pack-${pack.id}-${mode}`,
            variantId: pack.variantId,
            nom: `NUTRELIS Gel exfoliant à l’orange`,
            description: pack.capsules,
            prix: mode === "abonnement" ? pack.aboPrix : pack.prix,
            prixOriginal: pack.ancien,
            image: pack.img,
            mode: mode as "unique" | "abonnement",
          });
          if (!ok) { setStockError(true); setTimeout(() => setStockError(false), 4000); return; }
          window.location.href = "/checkout";
        }}
        style={{
          width: "100%",
          background: "var(--gel-accent)",
          color: "#fff",
          border: "none",
          padding: isMobilePS ? "16px" : "18px",
          borderRadius: 12,
          fontSize: isMobilePS ? 14 : 15,
          fontWeight: 900,
          cursor: "pointer",
          letterSpacing: 0.5,
          marginBottom: 10,
          fontFamily: "var(--font-sora), sans-serif",
          boxShadow: "0 6px 24px rgba(212,86,10,0.3)",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          transition: "all 0.3s",
          whiteSpace: "nowrap",
        }}>
        {`⚡ ${mode === "abonnement" ? t("common.subscribe") : t("common.buyNow")}`}
      </button>

      <button
        onClick={async () => {
          const pack = packs.find(p => p.id === selected)!;
          setStockError(false);
          if (!pack.variantId) return;
          const ok = await ajouterArticle({
            id: `gel-pack-${pack.id}-${mode}`,
            variantId: pack.variantId,
            nom: `NUTRELIS Gel exfoliant à l’orange`,
            description: pack.capsules,
            prix: mode === "abonnement" ? pack.aboPrix : pack.prix,
            prixOriginal: pack.ancien,
            image: pack.img,
            mode: mode as "unique" | "abonnement",
          });
          if (!ok) { setStockError(true); setTimeout(() => setStockError(false), 4000); return; }
          setToast(true);
          setTimeout(() => setToast(false), 2500);
        }}
        style={{
          width: "100%", background: "transparent", color: "var(--gel-accent)",
          border: "2px solid var(--gel-accent)", padding: isMobilePS ? "14px" : "16px", borderRadius: 12,
          fontSize: isMobilePS ? 14 : 15, fontWeight: 800, cursor: "pointer",
          letterSpacing: 0.5, marginBottom: 14,
          fontFamily: "var(--font-sora), sans-serif",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          whiteSpace: "nowrap",
        }}>
        🛒 {t("common.addToCart")}
      </button>

      {/* Toast confirmation */}
      {toast && (
        <div style={{
          position: "fixed", top: isMobilePS ? 66 : 80, left: "50%", transform: "translateX(-50%)",
          background: "#1db954", color: "#fff",
          padding: isMobilePS ? "10px 20px" : "12px 28px",
          borderRadius: 10, fontSize: isMobilePS ? 13 : 14, fontWeight: 700,
          boxShadow: "0 6px 24px rgba(0,0,0,0.2)",
          zIndex: 200, display: "flex", alignItems: "center", gap: 8,
          animation: "fadeInDown 0.3s ease-out",
        }}>
          ✓ {t("common.addedToCart")}
        </div>
      )}
      {stockError && (
        <div style={{
          position: "fixed", top: isMobilePS ? 66 : 80, left: "50%", transform: "translateX(-50%)",
          background: "#e74c3c", color: "#fff",
          padding: isMobilePS ? "10px 20px" : "12px 28px",
          borderRadius: 10, fontSize: isMobilePS ? 13 : 14, fontWeight: 700,
          boxShadow: "0 6px 24px rgba(0,0,0,0.2)",
          zIndex: 200, display: "flex", alignItems: "center", gap: 8,
          animation: "fadeInDown 0.3s ease-out",
        }}>
          {t("common.outOfStock")}
        </div>
      )}

      <div style={{
        display: "flex",
        justifyContent: "center",
        gap: 20,
        fontSize: 12,
        color: "var(--gel-text2)",
        flexWrap: "wrap",
      }}>
        <span>{t("common.securePaymentIcon")}</span>
        <span>{t("common.deliveryIcon")}</span>
        <span>{t("common.guarantee90Icon")}</span>
      </div>
    </div>
  );
}

function RaisonsSection() {
  const [active, setActive] = useState<number | null>(null);
  const scR = useScreenSize();
  const isMobileR = scR === "mobile";
  const isTabletR = scR === "tablet";
  const colsR = isMobileR ? "1fr" : isTabletR ? "repeat(3, 1fr)" : "repeat(5, 1fr)";
  const { t } = useLocale();
  const raisons = [
    {
      num: "01",
      title: t("gel.reason1Title"),
      text: t("gel.reason1Text"),
      img: "/images/gel/raison1.jpg",
    },
    {
      num: "02",
      title: t("gel.reason2Title"),
      text: t("gel.reason2Text"),
      img: "/images/gel/raison2.jpg",
    },
    {
      num: "03",
      title: t("gel.reason3Title"),
      text: t("gel.reason3Text"),
      img: "/images/gel/raison3.jpg",
    },
    {
      num: "04",
      title: t("gel.reason4Title"),
      text: t("gel.reason4Text"),
      img: "/images/gel/raison4.jpg",
    },
    {
      num: "05",
      title: t("gel.reason5Title"),
      text: t("gel.reason5Text"),
      img: "/images/gel/raison5.jpg",
    },
  ];

  const titleSize = isMobileR ? 11 : isTabletR ? 13 : 14;
  const textSize = isMobileR ? 10 : 13;
  const btnSize = isMobileR ? 10 : 13;
  const R = 24;

  return (
    <div style={{ display: "grid", gridTemplateColumns: colsR, gap: isMobileR ? 10 : 16 }}>
      {raisons.map((r, i) => {
        const isOpen = active === i;
        return (
        <div
          key={i}
          onClick={() => setActive(isOpen ? null : i)}
          style={{
            background: "#fff",
            borderRadius: R,
            border: `2px solid ${isOpen ? "var(--gel-accent)" : "var(--gel-border)"}`,
            cursor: "pointer",
            transition: "all 0.3s ease",
            boxShadow: isOpen ? "0 8px 32px rgba(212,86,10,0.18)" : "0 2px 8px rgba(0,0,0,0.05)",
            overflow: "hidden",
          }}
        >
          {!isOpen && (
            <>
              <div style={{ aspectRatio: "1 / 1", overflow: "hidden", background: "#ffb15c" }}>
                <img src={r.img} alt={r.title} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              </div>
              <div style={{ padding: isMobileR ? "8px 8px 10px" : "16px 18px 20px", textAlign: "center" }}>
                <div style={{
                  display: "inline-block",
                  background: "var(--gel-bg2)", color: "var(--gel-accent)",
                  fontSize: isMobileR ? 8 : 11, fontWeight: 700, letterSpacing: 1,
                  padding: isMobileR ? "2px 6px" : "3px 10px", borderRadius: 50, marginBottom: isMobileR ? 4 : 10,
                  border: "1px solid var(--gel-border)",
                }}>
                  {t("gel.reason")} {r.num}
                </div>
                <h3 style={{
                  fontSize: titleSize, fontWeight: 700,
                  fontFamily: "var(--font-sora), sans-serif",
                  lineHeight: 1.3, color: "var(--gel-text)", textAlign: "center",
                }}>
                  {r.title}
                </h3>
                <div style={{ textAlign: "center", marginTop: isMobileR ? 4 : 8, color: "var(--gel-text2)", fontSize: isMobileR ? 10 : 16 }}>▼</div>
              </div>
            </>
          )}

          {isOpen && (
            <div style={{
              padding: isMobileR ? "12px 10px 10px" : "20px 16px",
              display: "flex", flexDirection: "column",
              gap: isMobileR ? 6 : 12,
            }}>
              <div style={{
                display: "inline-block", width: "fit-content",
                background: "var(--gel-accent)", color: "#fff",
                fontSize: isMobileR ? 8 : 11, fontWeight: 700, letterSpacing: 1,
                padding: isMobileR ? "2px 6px" : "3px 10px", borderRadius: 50,
              }}>
                {t("gel.reason")} {r.num}
              </div>
              <h3 style={{
                fontSize: titleSize, fontWeight: 800,
                fontFamily: "var(--font-sora), sans-serif",
                lineHeight: 1.3, color: "var(--gel-text)",
              }}>
                {r.title}
              </h3>
              <p style={{ color: "var(--gel-text2)", fontSize: textSize, lineHeight: 1.5 }}>
                {r.text}
              </p>
              <a href="#commander"
                onClick={(e) => e.stopPropagation()}
                style={{
                  display: "block", textAlign: "center",
                  background: "var(--gel-accent)", color: "#fff",
                  padding: isMobileR ? "7px" : "10px", borderRadius: 50,
                  fontSize: btnSize, fontWeight: 800, textDecoration: "none",
                  fontFamily: "var(--font-sora), sans-serif",
                }}
              >
                {t("gel.orderArrow")}
              </a>
              <div style={{ textAlign: "center", color: "var(--gel-text2)", fontSize: isMobileR ? 10 : 16, transform: "rotate(180deg)" }}>▼</div>
            </div>
          )}
        </div>
        );
      })}
    </div>
  );
}
function ProductFaqItem({ icon, q, a, open, onToggle }: { icon: string; q: string; a: React.ReactNode; open: boolean; onToggle: () => void }) {
  const scFaqP = useScreenSize();
  const isMobileFaqP = scFaqP === "mobile";
  return (
    <div
      onClick={onToggle}
      style={{
        borderBottom: "1px solid var(--gel-border)",
        cursor: "pointer",
        transition: "all 0.2s",
      }}
    >
      <div style={{
        display: "flex", alignItems: "center", gap: isMobileFaqP ? 8 : 14,
        padding: isMobileFaqP ? "10px 0" : "16px 0",
      }}>
        <div style={{
          width: isMobileFaqP ? 30 : 42, height: isMobileFaqP ? 30 : 42, borderRadius: "50%",
          background: open
            ? "var(--gel-accent)"
            : "linear-gradient(135deg, #ffe9d6, #fbdcbd)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: isMobileFaqP ? 13 : 18, flexShrink: 0,
          transition: "all 0.3s",
          boxShadow: open ? "0 4px 12px rgba(212,86,10,0.25)" : "none",
        }}>
          {icon}
        </div>
        <span style={{
          flex: 1,
          fontWeight: 600, fontSize: isMobileFaqP ? 12 : 14,
          color: open ? "var(--gel-accent)" : "var(--gel-text)",
          fontFamily: "var(--font-sora), sans-serif",
          transition: "color 0.2s",
        }}>
          {q}
        </span>
        <div style={{
          width: isMobileFaqP ? 22 : 28, height: isMobileFaqP ? 22 : 28, borderRadius: "50%",
          background: open ? "var(--gel-accent)" : "var(--gel-bg2)",
          border: `1.5px solid ${open ? "var(--gel-accent)" : "var(--gel-border)"}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: open ? "#fff" : "var(--gel-text2)",
          fontSize: isMobileFaqP ? 13 : 16, fontWeight: 700, flexShrink: 0,
          transition: "all 0.3s",
          transform: open ? "rotate(45deg)" : "rotate(0deg)",
        }}>
          +
        </div>
      </div>
      {open && (
        <div style={{
          marginLeft: isMobileFaqP ? 38 : 56,
          marginBottom: isMobileFaqP ? 10 : 16,
          padding: isMobileFaqP ? "10px 12px" : "16px 20px",
          background: "linear-gradient(135deg, #fff8f1, #ffe9d6)",
          borderRadius: 12,
          border: "1px solid var(--gel-border)",
          borderLeft: "3px solid var(--gel-accent)",
        }}>
          <p style={{
            color: "var(--gel-text2)", fontSize: isMobileFaqP ? 11 : 13,
            lineHeight: 1.7, margin: 0,
          }}>
            {a}
          </p>
        </div>
      )}
    </div>
  );
}
function ProductGallery() {
  const [main, setMain] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const { t } = useLocale();
  // 1re image : le tube détouré ; ensuite les visuels fournis (galerie-N.jpg + vignette galerie-N-t.jpg)
  const images = [
    { src: "/images/gel/img_transparent.png", thumb: "/images/gel/img_transparent.png", detoure: true },
    ...Array.from({ length: 12 }, (_, k) => ({ src: `/images/gel/galerie-${k + 1}.jpg`, thumb: `/images/gel/galerie-${k + 1}-t.jpg`, detoure: false })),
  ];
  const aller = (d: number) => setMain((m) => (m + d + images.length) % images.length);

  const scGallery = useScreenSize();
  const isSmallGallery = scGallery === "mobile" || scGallery === "tablet";
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, position: isSmallGallery ? "relative" : "sticky", top: isSmallGallery ? 0 : 80 }}>
      {/* Image principale */}
      <div style={{
        position: "relative",
        background: "radial-gradient(ellipse at 50% 50%, #ffe6cf, #fff4e8)",
        borderRadius: 20,
        overflow: "hidden",
        border: "1px solid var(--gel-border)",
        aspectRatio: "1/1",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        <div style={{
          position: "absolute", top: 16, right: 16, zIndex: 2,
          background: "var(--gel-accent)", color: "#fff",
          fontWeight: 900, fontSize: 15, padding: "6px 12px",
          borderRadius: 8,
        }}>
          {t("gel.badgeUpTo")}
        </div>
        <div style={{
          position: "absolute", bottom: 16, left: 16, zIndex: 2,
          background: "rgba(0,0,0,0.6)", color: "#fff",
          fontSize: 12, fontWeight: 600, padding: "6px 12px",
          borderRadius: 20,
        }}>
          {t("gel.soldToday")}
        </div>
        {!images[main].detoure && (
          <img src={images[main].src} alt="" aria-hidden="true" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", filter: "blur(26px) saturate(1.1)", transform: "scale(1.15)", opacity: 0.85 }} />
        )}
        <img
          key={images[main].src}
          src={images[main].src}
          alt={`NUTRELIS Gel exfoliant à l’orange, visuel ${main + 1} sur ${images.length}`}
          style={{
            position: "relative",
            width: images[main].detoure ? "85%" : "100%", height: images[main].detoure ? "85%" : "100%",
            objectFit: "contain",
            filter: images[main].detoure ? "drop-shadow(0 8px 24px rgba(212,86,10,0.15))" : "none",
          }}
        />
        {(["‹", "›"] as const).map((fl, k) => (
          <button key={fl} type="button" aria-label={k === 0 ? "Visuel précédent" : "Visuel suivant"} onClick={() => aller(k === 0 ? -1 : 1)} style={{
            position: "absolute", top: "50%", transform: "translateY(-50%)", [k === 0 ? "left" : "right"]: 10, zIndex: 3,
            width: 38, height: 38, borderRadius: "50%", border: "1px solid var(--gel-border)", background: "rgba(255,255,255,0.92)",
            color: "var(--gel-accent)", fontSize: 24, lineHeight: 1, cursor: "pointer", boxShadow: "0 4px 14px rgba(0,0,0,0.18)",
          }}>{fl}</button>
        ))}
      </div>

      {/* Thumbnails en dessous */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(64px, 1fr))",
        gap: isSmallGallery ? 8 : 10,
      }}>
        {images.map((img, i) => (
          <div
            key={i}
            onClick={() => setMain(i)}
            style={{
              aspectRatio: "1/1",
              borderRadius: 10,
              overflow: "hidden",
              cursor: "pointer",
              border: `2px solid ${main === i ? "var(--gel-accent)" : "var(--gel-border)"}`,
              background: "#fff6ec",
              opacity: main === i ? 1 : 0.7,
              transition: "all 0.2s",
            }}
          >
            <img src={img.thumb} alt="" loading="lazy" style={{ width: "100%", height: "100%", objectFit: img.detoure ? "contain" : "cover", padding: img.detoure ? 4 : 0 }} />
          </div>
        ))}
      </div>
      {/* FAQ accordéon produit */}
      <div style={{ marginTop: 8 }}>
       {[
          {
            icon: "🍊",
            q: t("gel.gFaq1Q"),
            a: (
              <div>
                <p style={{ marginBottom: 10 }} dangerouslySetInnerHTML={{ __html: sanitizeHtml(t("gel.gFaq1Intro")) }} />
                <p style={{ marginBottom: 8, fontWeight: 700, color: "var(--gel-accent)" }}>{t("gel.gFaq1Label")}</p>
                <ul style={{ paddingLeft: 0, listStyle: "none", marginBottom: 10 }}>
                  {(t("gel.gFaq1Items") as unknown as string[]).map((item: string, i: number) => (
                    <li key={i} style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                      <span style={{ color: "var(--gel-accent)", fontWeight: 700 }}>➡️</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <p>{t("gel.gFaq1Outro")}</p>
              </div>
            ),
          },
          {
            icon: "📅",
            q: t("gel.gFaq2Q"),
            a: (
              <div>
                <p style={{ marginBottom: 12 }} dangerouslySetInnerHTML={{ __html: sanitizeHtml(t("gel.gFaq2Intro")) }} />
                <div style={{ marginBottom: 12 }}>
                  <p style={{ fontWeight: 700, color: "var(--gel-accent)", marginBottom: 6 }}>{t("gel.gFaq2P1Label")}</p>
                  {(t("gel.gFaq2P1Items") as unknown as string[]).map((item: string, i: number) => (
                    <div key={i} style={{ display: "flex", gap: 8, marginBottom: 4 }}>
                      <span style={{ color: "#1db954" }}>✅</span><span>{item}</span>
                    </div>
                  ))}
                </div>
                <div>
                  <p style={{ fontWeight: 700, color: "var(--gel-accent)", marginBottom: 6 }}>{t("gel.gFaq2P2Label")}</p>
                  {(t("gel.gFaq2P2Items") as unknown as string[]).map((item: string, i: number) => (
                    <div key={i} style={{ display: "flex", gap: 8, marginBottom: 4 }}>
                      <span style={{ color: "#1db954" }}>✅</span><span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            ),
          },
          {
            icon: "🛡️",
            q: t("gel.gFaq3Q"),
            a: (
              <div>
                <p dangerouslySetInnerHTML={{ __html: sanitizeHtml(t("gel.gFaq3A")) }} />
              </div>
            ),
          },
          {
            icon: "✨",
            q: t("gel.gFaq4Q"),
            a: (
              <div>
                {[
                  { titre: t("gel.gFaq4C1T"), items: t("gel.gFaq4C1") as unknown as string[] },
                  { titre: t("gel.gFaq4C2T"), items: t("gel.gFaq4C2") as unknown as string[] },
                  { titre: t("gel.gFaq4C3T"), items: t("gel.gFaq4C3") as unknown as string[] },
                  { titre: t("gel.gFaq4C4T"), items: t("gel.gFaq4C4") as unknown as string[] },
                ].map((section, i) => (
                  <div key={i} style={{ marginBottom: 12 }}>
                    <p style={{ fontWeight: 700, color: "var(--gel-accent)", marginBottom: 6 }}>{section.titre}</p>
                    {section.items.map((item: string, j: number) => (
                      <div key={j} style={{ display: "flex", gap: 8, marginBottom: 4 }}>
                        <span style={{ color: "#1db954" }}>✓</span><span>{item}</span>
                      </div>
                    ))}
                  </div>
                ))}
                <div style={{ marginTop: 12, padding: "12px 16px", background: "rgba(212,86,10,0.06)", borderRadius: 8, border: "1px solid var(--gel-border)" }}>
                  <p style={{ fontWeight: 800, marginBottom: 6 }}>{t("gel.gFaq4WhyT")}</p>
                  {(t("gel.gFaq4Why") as unknown as string[]).map((item: string, i: number) => (
                    <div key={i} style={{ display: "flex", gap: 8, marginBottom: 4 }}>
                      <span style={{ color: "var(--gel-accent)", fontWeight: 700 }}>•</span><span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            ),
          },
          {
            icon: "🔬",
            q: t("gel.gFaq5Q"),
            a: (
              <div>
                <p dangerouslySetInnerHTML={{ __html: sanitizeHtml(t("gel.gFaq5A")) }} />
              </div>
            ),
          },
          {
            icon: "📦",
            q: t("gel.galleryFaq6Q"),
            a: (
              <div>
                <div style={{ marginBottom: 12 }}>
                  <p style={{ fontWeight: 700, color: "var(--gel-accent)", marginBottom: 6 }}>{t("gel.galleryFaq6A_stdLabel")}</p>
                  <p style={{ marginBottom: 4 }} dangerouslySetInnerHTML={{ __html: sanitizeHtml(t("gel.galleryFaq6A_stdLine1")) }} />
                  <p dangerouslySetInnerHTML={{ __html: sanitizeHtml(t("gel.galleryFaq6A_stdLine2")) }} />
                </div>
                <div style={{ marginBottom: 12 }}>
                  <p style={{ fontWeight: 700, color: "var(--gel-accent)", marginBottom: 6 }}>{t("gel.galleryFaq6A_expLabel")}</p>
                  <p style={{ marginBottom: 4 }} dangerouslySetInnerHTML={{ __html: sanitizeHtml(t("gel.galleryFaq6A_expLine1")) }} />
                  <p dangerouslySetInnerHTML={{ __html: sanitizeHtml(t("gel.galleryFaq6A_expLine2")) }} />
                </div>
                <div style={{ padding: "10px 14px", background: "rgba(212,86,10,0.06)", borderRadius: 8, border: "1px solid var(--gel-border)" }}>
                  <p style={{ fontSize: 12, color: "var(--gel-text2)" }}>{t("gel.galleryFaq6A_warning")}</p>
                </div>
              </div>
            ),
          },
        ].map((item, i) => (
          <ProductFaqItem key={i} icon={item.icon} q={item.q} a={item.a} open={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} />
        ))}
      </div>
    </div>
  );
}
function StatsSection() {
  const [progress, setProgress] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const scSt = useScreenSize();
  const { t } = useLocale();

  useEffect(() => {
    const handleScroll = () => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const elementCenter = rect.top + rect.height / 2;
      const distanceFromCenter = Math.abs(windowHeight / 2 - elementCenter);
      const maxDistance = windowHeight / 2 + rect.height / 2;
      const p = Math.max(0, Math.min(1, 1 - distanceFromCenter / maxDistance));
      setProgress(p);
    };
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const stats = [
    { value: 60, suffix: " s", label: t("gel.stat1Label"), desc: t("gel.stat1Desc") },
    { value: 3, suffix: " ×", label: t("gel.stat2Label"), desc: t("gel.stat2Desc") },
    { value: 90, suffix: " j", label: t("gel.stat3Label"), desc: t("gel.stat3Desc") },
    { value: 24, suffix: " h", label: t("gel.stat4Label"), desc: t("gel.stat4Desc") },
  ];

  return (
    <div ref={ref} style={{ display: "grid", gridTemplateColumns: scSt === "mobile" ? "1fr 1fr" : "1fr 1fr", gap: scSt === "mobile" ? "14px" : "40px 80px" }}>
      {stats.map((stat, i) => (
        <div key={i}>
          <div style={{
            color: "var(--gel-accent)",
            fontSize: scSt === "mobile" ? "1.4rem" : "2.8rem",
            fontWeight: 900,
            fontFamily: "var(--font-sora), sans-serif",
            lineHeight: 1,
            marginBottom: scSt === "mobile" ? 4 : 8,
          }}>
            {stat.value}
            <span style={{ fontSize: scSt === "mobile" ? "0.7rem" : "1.4rem" }}>{stat.suffix}</span>
          </div>
          <div style={{ fontWeight: 700, fontSize: scSt === "mobile" ? 11 : 15, marginBottom: scSt === "mobile" ? 2 : 4, color: "var(--gel-text)" }}>
            {stat.label}
          </div>
          <div style={{ color: "var(--gel-text2)", fontSize: scSt === "mobile" ? 10 : 13, marginBottom: scSt === "mobile" ? 6 : 12 }}>
            {stat.desc}
          </div>
        </div>
      ))}
    </div>
  );
}

function FaqItemWhite({ icon, q, a, open, onToggle }: { icon: string; q: string; a: string; open: boolean; onToggle: () => void }) {
  const scFaq = useScreenSize();
  const isMobileFaq = scFaq === "mobile";
  return (
    <div
      onClick={onToggle}
      style={{
        background: "#fff",
        borderRadius: 12,
        padding: isMobileFaq ? "12px 14px" : "16px 20px",
        cursor: "pointer",
        transition: "all 0.2s",
        boxShadow: open ? "0 4px 20px rgba(0,0,0,0.1)" : "none",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: isMobileFaq ? 8 : 12 }}>
        <div style={{
          width: isMobileFaq ? 30 : 38, height: isMobileFaq ? 30 : 38, borderRadius: "50%",
          background: "linear-gradient(135deg, #D4560A, #F08A24)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: isMobileFaq ? 13 : 16, flexShrink: 0,
        }}>
          {icon}
        </div>
        <span style={{
          flex: 1, fontWeight: 600, fontSize: isMobileFaq ? 12 : 14,
          color: "#2b1606",
          fontFamily: "var(--font-sora), sans-serif",
        }}>
          {q}
        </span>
        <span style={{
          color: open ? "var(--gel-accent)" : "#999",
          fontSize: isMobileFaq ? 16 : 20, fontWeight: 300, flexShrink: 0,
          transition: "all 0.2s",
          transform: open ? "rotate(45deg)" : "rotate(0deg)",
          display: "inline-block",
        }}>
          +
        </span>
      </div>
      {open && (
        <p style={{
          color: "#666", fontSize: isMobileFaq ? 11 : 13, lineHeight: 1.7,
          marginTop: isMobileFaq ? 8 : 12, paddingLeft: isMobileFaq ? 38 : 50,
        }}>
          {a}
        </p>
      )}
    </div>
  );
}

function BarreAchatMobile({ prix, libelle }: { prix: number; libelle: string }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const cible = document.getElementById("commander");
    const maj = () => {
      const passeHero = window.scrollY > 520;
      const r = cible?.getBoundingClientRect();
      const surCommande = !!r && r.top < window.innerHeight * 0.85 && r.bottom > 0;
      setVisible(passeHero && !surCommande);
    };
    window.addEventListener("scroll", maj, { passive: true });
    maj();
    return () => window.removeEventListener("scroll", maj);
  }, []);
  return (
    <div style={{
      position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 90,
      transform: visible ? "translateY(0)" : "translateY(110%)", transition: "transform 0.25s ease",
      background: "#fff", borderTop: "1px solid var(--gel-border)", boxShadow: "0 -6px 24px rgba(212,86,10,0.14)",
      padding: "10px 84px calc(10px + env(safe-area-inset-bottom, 0px)) 16px",
      display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
    }}>
      <div style={{ lineHeight: 1.2 }}>
        <div style={{ fontSize: 11, color: "var(--gel-text2)" }}>{libelle}</div>
        <div style={{ fontSize: 18, fontWeight: 900, color: "var(--gel-accent)", fontFamily: "var(--font-sora), sans-serif" }}>{prix.toLocaleString("fr-FR")} FCFA</div>
      </div>
      <a href="#commander" style={{ background: "var(--gel-accent)", color: "#fff", padding: "12px 20px", borderRadius: 50, fontWeight: 800, fontSize: 13, textDecoration: "none", whiteSpace: "nowrap", fontFamily: "var(--font-sora), sans-serif" }}>
        {libelle ? "Commander" : "Commander"}
      </a>
    </div>
  );
}

export default function GelExfoliantOrange() {
  const [prixAffiche, setPrixAffiche] = useState(18000);
  const [prixOriginal, setPrixOriginal] = useState(20000);
  const [selectedPack, setSelectedPack] = useState(2);
  const [mode, setMode] = useState<"unique" | "abonnement">("unique");
  const [medusaProduct, setMedusaProduct] = useState<MedusaProduct | null>(null);
  const [contenu, setContenu] = useState<{ videos?: { url: string; titre?: string }[] } | null>(null);
  const [avisVerifies, setAvisVerifies] = useState<{ rating: number; body: string; display_name: string; city: string | null; created_at: string }[]>([]);
  const [openFaqBottom, setOpenFaqBottom] = useState<number | null>(null);
  const sc = useScreenSize();
  const isMobile = sc === "mobile";
  const isSmall = sc === "mobile" || sc === "tablet";
  const { t } = useLocale();
  const px = isMobile ? "16px" : sc === "tablet" ? "28px" : "60px";
  const py = isMobile ? "48px" : sc === "tablet" ? "64px" : "96px";

  // Charger les données produit depuis Medusa
  useEffect(() => {
    fetchProductByHandle("gel-exfoliant-orange").then(p => {
      if (p) setMedusaProduct(p);
    });
    // Vidéos et avis vérifiés viennent de la console (jamais écrits en dur dans la page).
    fetch("/api/catalog", { cache: "no-store" }).then(r => (r.ok ? r.json() : null)).then(d => {
      const p = d?.products?.find((x: { slug: string }) => x.slug === "gel-exfoliant-orange");
      if (p) { setContenu(p.content ?? null); setAvisVerifies(p.avisVerifies ?? []); }
    }).catch(() => undefined);
  }, []);

  // Prix dynamiques depuis Medusa (fallback hardcodé)
  const skuPriceMap: Record<string, number> = {};
  if (medusaProduct?.variants) {
    for (const v of medusaProduct.variants) {
      if (v.sku) skuPriceMap[v.sku] = getVariantPrice(v);
    }
  }

  const unite = skuPriceMap["GEL-ORANGE-1"] || 10000;
  const construire = (id: number, sku: string, qte: number, defaut: number) => {
    const prix = skuPriceMap[sku] || defaut;
    return { id, prix, original: Math.max(prix, unite * qte) };
  };
  const packs = [construire(1, "GEL-ORANGE-1", 1, 10000), construire(2, "GEL-ORANGE-2", 2, 18000), construire(3, "GEL-ORANGE-3", 3, 24000)];

  const currentPack = packs.find(p => p.id === selectedPack)!;
  const currentPrice = mode === "abonnement" ? prixAbonne(currentPack.prix) : currentPack.prix;
  const originalPrice = mode === "abonnement" ? currentPack.prix : currentPack.original;

  return (
    <HydrationGuard bg="var(--gel-bg)" style={{ color: "var(--gel-text)", overflowX: "hidden" }}>

      {/* BANDEAU PROMO */}
      <div style={{
        background: "#D4560A",
        color: "#fff",
        textAlign: "center",
        padding: "10px 16px",
        fontSize: isMobile ? 12 : 13,
        fontWeight: 600,
        lineHeight: 1.5,
      }}>
        {isMobile
          ? <>🚚 {t("gel.promoShort")}</>
          : <>🚚 {t("gel.promoText")}</>
        }
      </div>

      {/* NAVBAR */}
      <Navbar avis={avisVerifies.length > 0} />

      {/* HERO */}
      <section style={{
        background: "#fff",
        display: "grid",
        gridTemplateColumns: isSmall ? "1fr" : "1.05fr 1fr",
        minHeight: isSmall ? "auto" : 620,
        overflow: "hidden",
      }}>
        {/* Côté gauche : la photo produit, dans un cadre arrondi aux bords nets */}
        <div style={{
          background: "var(--gel-bg)",
          padding: isMobile ? "16px 16px 4px" : sc === "tablet" ? "24px 28px 8px" : "40px 24px 40px 40px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
          <div style={{
            position: "relative",
            width: "100%",
            maxWidth: isSmall ? 560 : 640,
            aspectRatio: "1 / 1",
            borderRadius: isMobile ? 20 : 28,
            overflow: "hidden",
            background: "#e8710a",
            boxShadow: "0 18px 48px rgba(184,69,8,0.28), 0 0 0 1px rgba(212,86,10,0.18)",
          }}>
            <img
              src="/images/gel/hero.jpg"
              alt="NUTRELIS Gel exfoliant à l’orange"
              fetchPriority="high"
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
            {/* léger voile haut/bas : lisibilité des pastilles sans toucher au produit */}
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(120,40,0,0.18) 0%, rgba(120,40,0,0) 28%, rgba(120,40,0,0) 72%, rgba(120,40,0,0.22) 100%)", pointerEvents: "none" }} />
            <div style={{
              position: "absolute", top: isMobile ? 12 : 20, right: isMobile ? 12 : 20, zIndex: 3,
              width: isMobile ? 64 : 88, height: isMobile ? 64 : 88, borderRadius: "50%",
              background: "#fff", border: "3px solid var(--gel-accent)",
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              boxShadow: "0 6px 20px rgba(0,0,0,0.22)",
            }}>
              <span style={{ color: "var(--gel-accent)", fontSize: isMobile ? 20 : 28, fontWeight: 900, lineHeight: 1 }}>90</span>
              <span style={{ color: "var(--gel-accent)", fontSize: isMobile ? 8 : 10, fontWeight: 800, letterSpacing: 0.5 }}>{t("common.days")}</span>
            </div>
            <div style={{
              position: "absolute", bottom: isMobile ? 12 : 20, left: isMobile ? 12 : 20, zIndex: 3,
              background: "rgba(255,255,255,0.96)", color: "var(--gel-accent)", fontWeight: 800,
              fontSize: isMobile ? 11 : 13, padding: isMobile ? "6px 12px" : "8px 16px", borderRadius: 50,
              boxShadow: "0 6px 18px rgba(0,0,0,0.2)",
            }}>
              {t("gel.badgeUpTo")} · packs
            </div>
          </div>
        </div>

        {/* Côté droit : promesse, prix, action */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: isMobile ? "28px 16px 36px" : sc === "tablet" ? "36px 28px" : "48px 56px 48px 48px",
          background: "#fff",
        }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8, marginBottom: isMobile ? 16 : 22,
            background: "var(--gel-bg)", borderRadius: 50, padding: "7px 16px", width: "fit-content",
            border: "1px solid var(--gel-border)",
          }}>
            <span style={{ color: "var(--gel-accent)", fontSize: 13, fontWeight: 700 }}>🍊 {t("gel.heroPill")}</span>
          </div>

          <h1 style={{
            fontSize: isMobile ? "1.85rem" : isSmall ? "2.3rem" : "clamp(2.2rem, 3.2vw, 2.9rem)",
            fontWeight: 800, lineHeight: 1.12, marginBottom: 18,
            fontFamily: "var(--font-sora), sans-serif", color: "var(--gel-text)", letterSpacing: -0.5,
          }}>
            {t("gel.heroTitle")}{" "}
            <span style={{ color: "var(--gel-accent)" }}>{t("gel.heroHighlight")}</span>{" "}
            {t("gel.heroTitleEnd")}
          </h1>

          <p style={{ color: "var(--gel-text2)", fontSize: isMobile ? 15 : 16, lineHeight: 1.7, marginBottom: 24, maxWidth: 480 }}>
            {t("gel.heroDesc")}{" "}
            <strong style={{ color: "var(--gel-text)" }}>{t("gel.heroStrong")}</strong>{t("gel.heroDescEnd")}
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 26 }}>
            {[t("gel.point1"), t("gel.point2"), t("gel.point3")].map((point, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 22, height: 22, borderRadius: "50%", background: "#ffe9d6", border: "1.5px solid var(--gel-accent)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ color: "var(--gel-accent)", fontSize: 11, fontWeight: 900 }}>✓</span>
                </div>
                <span style={{ color: "var(--gel-text)", fontSize: 14.5, fontWeight: 500 }}>{point}</span>
              </div>
            ))}
          </div>

          {/* Les trois packs et leur prix, visibles sans défiler */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: isMobile ? 8 : 10, marginBottom: 20, maxWidth: 480 }}>
            {packs.map((pk, i) => (
              <a key={pk.id} href="#commander" style={{
                textDecoration: "none", textAlign: "center",
                border: `1.5px solid ${i === 2 ? "var(--gel-accent)" : "var(--gel-border)"}`,
                background: i === 2 ? "#ffe9d6" : "#fff",
                borderRadius: 14, padding: isMobile ? "10px 4px" : "12px 8px", color: "var(--gel-text)",
              }}>
                <div style={{ fontSize: isMobile ? 11 : 12, color: "var(--gel-text2)", fontWeight: 600 }}>{pk.id === 1 ? "1 gel" : `${pk.id} gels`}</div>
                <div style={{ fontSize: isMobile ? 14 : 17, fontWeight: 900, color: "var(--gel-accent)", fontFamily: "var(--font-sora), sans-serif", whiteSpace: "nowrap" }}>{pk.prix.toLocaleString("fr-FR")} F</div>
                {pk.id > 1 && <div style={{ fontSize: 10.5, color: "var(--gel-text2)" }}>{Math.round(pk.prix / pk.id).toLocaleString("fr-FR")} F / gel</div>}
              </a>
            ))}
          </div>

          <a href="#commander" style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "var(--gel-accent)", color: "#fff",
            padding: isSmall ? "17px" : "19px 52px", borderRadius: 50,
            fontSize: isMobile ? 14 : 15, fontWeight: 800, textDecoration: "none",
            boxShadow: "0 10px 28px rgba(212,86,10,0.35)", letterSpacing: 0.5,
            width: isSmall ? "100%" : "fit-content",
            fontFamily: "var(--font-sora), sans-serif", whiteSpace: "nowrap",
          }}>
            {isMobile ? t("gel.ctaOrderShort") : t("gel.ctaOrder")}
          </a>

          <div style={{ display: "flex", gap: 18, marginTop: 16, fontSize: 12, color: "var(--gel-text2)", flexWrap: "wrap" }}>
            <span>{t("common.securePaymentIcon")}</span>
            <span>{t("common.deliveryIcon")}</span>
            <span>{t("common.guarantee90Refunded")}</span>
          </div>
        </div>
      </section>

      {/* BADGES CONFIANCE */}
      <div style={{ background: "var(--gel-accent)" }}>
        <div style={{
          maxWidth: 1280,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
        }}>
          {[
            { label: t("gel.badge1"), svg: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
            { label: t("gel.badge2"), svg: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
            { label: t("gel.badge3"), svg: "M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064" },
          ].map((b, i) => (
            <div key={i} style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 14,
              padding: isMobile ? "14px 16px" : "22px 28px",
              borderRight: (!isMobile && i < 2) ? "1px solid rgba(255,255,255,0.2)" : "none",
              borderBottom: (isMobile && i < 2) ? "1px solid rgba(255,255,255,0.2)" : "none",
            }}>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: 50,
                border: "1.5px solid rgba(255,255,255,0.4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                background: "rgba(255,255,255,0.08)",
              }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                  stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d={b.svg} />
                </svg>
              </div>
              <span style={{ color: "#fff", fontSize: 13, fontWeight: 700, letterSpacing: 0.8 }}>
                {b.label}
              </span>
            </div>
          ))}
        </div>
      </div>

     {/* SECTION PRODUIT CENTRÉ */}
      <section style={{ background: "#fff", padding: isMobile ? `28px ${px}` : `${py} ${px}` }}>
        <div style={{ maxWidth: isSmall ? 600 : 1040, margin: "0 auto", textAlign: "center" }}>
          <p style={{ color: "var(--gel-gold)", fontSize: isMobile ? 10 : 13, fontWeight: 700, letterSpacing: 2, marginBottom: isMobile ? 8 : 12 }}>
            🍊 {t("gel.heroPill")}
          </p>
          <h2 style={{ fontSize: isMobile ? "1.1rem" : isSmall ? "1.7rem" : "clamp(1.8rem, 2.5vw, 2.2rem)", fontWeight: 800, fontFamily: "var(--font-sora), sans-serif", marginBottom: isMobile ? 20 : 40 }}>
            {t("gel.discoverTitle")}
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: isSmall ? "1fr" : "1fr 1fr", gap: isMobile ? 16 : 28, alignItems: "stretch" }}>
          {/* Carte produit */}
          <div style={{
            display: "flex", flexDirection: "column", justifyContent: "center",
            position: "relative",
            background: "var(--gel-bg2)",
            borderRadius: isMobile ? 16 : 24,
            padding: isMobile ? "36px 16px 24px" : "48px 28px 40px",
            border: "1px solid var(--gel-border)",
            boxShadow: "0 8px 40px rgba(212,86,10,0.1)",
            overflow: "hidden",
          }}>
            {/* Ruban -70% */}
            <div style={{
              position: "absolute", top: 0, left: 0,
              width: 0, height: 0,
              borderStyle: "solid",
              borderWidth: isMobile ? "70px 70px 0 0" : "100px 100px 0 0",
              borderColor: "var(--gel-accent) transparent transparent transparent",
            }} />
            <div style={{
              position: "absolute", top: isMobile ? 13 : 20, left: isMobile ? 2 : 4,
              color: "#fff", fontWeight: 900, fontSize: isMobile ? 12 : 16,
              transform: "rotate(-45deg)",
              fontFamily: "var(--font-sora), sans-serif",
            }}>
              {t("gel.ribbon")}
            </div>

            {/* Badge 90 jours */}
            <div style={{
              position: "absolute", top: isMobile ? 12 : 24, right: isMobile ? 12 : 24,
              width: isMobile ? 60 : 90, height: isMobile ? 60 : 90, borderRadius: "50%",
              background: "linear-gradient(135deg, #c8940a, #f5c842)",
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 16px rgba(184,134,11,0.4)",
            }}>
              <span style={{ color: "#fff", fontSize: isMobile ? 5 : 7, fontWeight: 800 }}>MONEY BACK</span>
              <span style={{ color: "#fff", fontSize: isMobile ? 16 : 24, fontWeight: 900, lineHeight: 1 }}>90</span>
              <span style={{ color: "#fff", fontSize: isMobile ? 6 : 9, fontWeight: 900 }}>DAYS</span>
            </div>

            {/* Image produit */}
            <img
              src="/images/gel/img_transparent.png"
              alt="NUTRELIS Gel exfoliant à l’orange"
              style={{
                width: isMobile ? "50%" : "55%", maxWidth: isMobile ? 180 : 240,
                height: "auto", objectFit: "contain",
                filter: "drop-shadow(0 20px 40px rgba(212,86,10,0.2))",
                margin: isMobile ? "0 auto 20px" : "0 auto 32px",
              }}
            />

            {/* Info produit */}
            <div style={{ marginBottom: isMobile ? 14 : 20 }}>
              <p style={{ color: "var(--gel-text2)", fontSize: isMobile ? 12 : 13, marginBottom: 8 }}>
                NUTRELIS Gel exfoliant à l’orange — {t("gel.productSubtitle")}
              </p>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: isMobile ? 8 : 12, flexWrap: "wrap" }}>
                <span style={{ color: "var(--gel-accent)", fontSize: isMobile ? 24 : 36, fontWeight: 900, fontFamily: "var(--font-sora), sans-serif" }}>
                  {packs[0].prix.toLocaleString("fr-FR")} FCFA
                </span>
              </div>
            </div>

            {/* Badges */}
            <div style={{ display: "flex", justifyContent: "center", gap: isMobile ? 4 : 8, marginBottom: isMobile ? 20 : 28, flexWrap: isMobile ? "nowrap" : isSmall ? "wrap" : "nowrap" }}>
              {[t("gel.badgeA"), t("gel.badgeB"), t("gel.badgeC"), t("gel.badgeD")].map((b, i) => (
                <span key={i} style={{
                  background: "#fff", border: "1px solid var(--gel-border)",
                  borderRadius: 20, padding: isMobile ? "3px 6px" : "4px 8px",
                  fontSize: isMobile ? 9 : 10.5, color: "var(--gel-text2)", fontWeight: 600,
                  whiteSpace: "nowrap",
                }}>
                  {b}
                </span>
              ))}
            </div>

            {/* CTA */}
            <a href="#commander" style={{
              display: "block",
              background: "var(--gel-accent)", color: "#fff",
              padding: isMobile ? "14px" : "18px", borderRadius: 50,
              fontSize: isMobile ? 13 : 15, fontWeight: 900, textDecoration: "none",
              boxShadow: "0 6px 24px rgba(212,86,10,0.35)",
              fontFamily: "var(--font-sora), sans-serif",
              letterSpacing: 0.5,
              whiteSpace: "nowrap",
              textAlign: "center",
            }}>
              {isMobile ? t("gel.ctaOrderShort") : t("gel.ctaOrder")}
            </a>

            <p style={{ color: "#aaa", fontSize: isMobile ? 11 : 12, marginTop: isMobile ? 12 : 16 }}>
              {t("common.securePaymentIcon")} &nbsp;|&nbsp; {t("gel.guarantee90Full")}
            </p>
          </div>

          {/* Photo : même cadre (rayon, bordure, hauteur) que la carte */}
          <div style={{
            position: "relative", overflow: "hidden",
            borderRadius: isMobile ? 16 : 24,
            border: "1px solid var(--gel-border)",
            boxShadow: "0 8px 40px rgba(212,86,10,0.1)",
            minHeight: isSmall ? (isMobile ? 380 : 480) : undefined,
          }}>
            <img
              src="/images/gel/ambiance.jpg"
              alt="Application du gel exfoliant NUTRELIS"
              loading="lazy"
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 30%" }}
            />
          </div>
          </div>
        </div>
      </section>

      {/* AVIS CLIENTS : n'apparaît que s'il existe des avis vérifiés */}
      {avisVerifies.length > 0 && (
      <section id="avis" style={{ padding: `${isMobile ? "28px" : py} ${px}`, background: "var(--gel-bg)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: isMobile ? 20 : 56 }}>
            <p style={{ color: "var(--gel-gold)", fontSize: isMobile ? 10 : 12, fontWeight: 700, letterSpacing: 2, marginBottom: isMobile ? 8 : 12 }}>
              {t("gel.reviewsTag")}
            </p>
            <h2 style={{ fontSize: isMobile ? "1.1rem" : isSmall ? "1.7rem" : "clamp(1.8rem, 3vw, 2.6rem)", fontWeight: 800, fontFamily: "var(--font-sora), sans-serif" }}>
              {t("gel.reviewsTitle")}{" "}
              <span style={{ color: "var(--gel-accent)" }}>{t("gel.reviewsHighlight")}</span>
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : sc === "tablet" ? "repeat(2, 1fr)" : "repeat(3, 1fr)", gap: isMobile ? 14 : 28 }}>
            {avisVerifies.slice(0, 6).map((a) => ({
              name: a.display_name + (a.city ? " · " + a.city : ""),
              semaines: new Date(a.created_at).toLocaleDateString("fr-FR", { month: "long", year: "numeric" }),
              titre: a.rating + "/5",
              text: a.body,
              note: a.rating,
            })).map((avis, i) => (
              <div key={i} style={{
                background: "#fff",
                border: "1px solid var(--gel-border)",
                borderRadius: 20,
                padding: isMobile ? 16 : 32,
                boxShadow: "0 2px 20px rgba(212,86,10,0.06)",
              }}>
                <div style={{ color: "#f5a623", fontSize: isMobile ? 14 : 18, marginBottom: isMobile ? 8 : 12 }}>{"★".repeat(avis.note)}</div>
                <h3 style={{ fontSize: isMobile ? 14 : 17, fontWeight: 800, marginBottom: isMobile ? 8 : 12, fontFamily: "var(--font-sora), sans-serif" }}>
                  {avis.titre}
                </h3>
                <p style={{ color: "var(--gel-text2)", fontSize: isMobile ? 12 : 14, lineHeight: 1.7, marginBottom: isMobile ? 14 : 24, fontStyle: "italic" }}>
                  &quot;{avis.text}&quot;
                </p>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 8 : 12 }}>
                    <div style={{
                      width: isMobile ? 36 : 48,
                      height: isMobile ? 36 : 48,
                      borderRadius: "50%",
                      overflow: "hidden",
                      border: "2.5px solid var(--gel-accent)",
                      flexShrink: 0,
                    }}>
                      <span style={{ display: "flex", width: "100%", height: "100%", alignItems: "center", justifyContent: "center", background: "var(--gel-bg2)", color: "var(--gel-accent)", fontWeight: 800 }}>{avis.name.charAt(0).toUpperCase()}</span>
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: isMobile ? 12 : 14 }}>{avis.name}</div>
                      <div style={{ color: "var(--gel-text2)", fontSize: isMobile ? 10 : 12 }}>✅ {t("gel.verifiedClient")}</div>
                    </div>
                  </div>
                  <div style={{
                    background: "#ffe9d6",
                    color: "var(--gel-text2)",
                    fontSize: isMobile ? 9 : 11,
                    fontWeight: 600,
                    padding: isMobile ? "3px 8px" : "4px 10px",
                    borderRadius: 20,
                    whiteSpace: "nowrap",
                  }}>
                    {avis.semaines}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* POURQUOI NUTRELIS */}
      <section style={{ background: "var(--gel-accent)", padding: isMobile ? `20px ${px}` : `${py} ${px}` }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: isMobile ? 14 : 52 }}>
            <p style={{ color: "rgba(255,255,255,0.65)", fontSize: isMobile ? 9 : 12, fontWeight: 700, letterSpacing: 2, marginBottom: isMobile ? 6 : 12 }}>
              {t("gel.whyTag")}
            </p>
            <h2 style={{ fontSize: isMobile ? "1rem" : isSmall ? "1.7rem" : "clamp(1.8rem, 3vw, 2.4rem)", fontWeight: 800, fontFamily: "var(--font-sora), sans-serif", color: "#fff" }}>
              {t("gel.whyTitle")}
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : sc === "tablet" ? "repeat(2, 1fr)" : "repeat(4, 1fr)", gap: isMobile ? 8 : 24 }}>
            {[
              { icon: "🍊", label: t("gel.whyA"), desc: t("gel.whyADesc") },
              { icon: "🌿", label: t("gel.whyB"), desc: t("gel.whyBDesc") },
              { icon: "🚚", label: t("gel.whyC"), desc: t("gel.whyCDesc") },
              { icon: "✅", label: t("gel.whyD"), desc: t("gel.whyDDesc") },
            ].map((item, i) => (
              <div key={i} style={{
                background: "rgba(255,255,255,0.12)",
                borderRadius: isMobile ? 10 : 18,
                padding: isMobile ? "10px 8px" : "32px 24px",
                border: "1px solid rgba(255,255,255,0.2)",
                textAlign: "center",
              }}>
                <div style={{ fontSize: isMobile ? 18 : 36, marginBottom: isMobile ? 4 : 16 }}>{item.icon}</div>
                <div style={{ color: "#fff", fontWeight: 800, fontSize: isMobile ? 10 : 16, marginBottom: isMobile ? 2 : 8 }}>{item.label}</div>
                <div style={{ color: "rgba(255,255,255,0.7)", fontSize: isMobile ? 9 : 13, lineHeight: 1.5 }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5 RAISONS */}
      <section style={{ padding: isMobile ? `28px ${px} 0` : `${py} ${px} 0`, background: "var(--gel-bg2)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: isMobile ? 20 : 52 }}>
            <p style={{ color: "var(--gel-gold)", fontSize: isMobile ? 10 : 12, fontWeight: 700, letterSpacing: 2, marginBottom: isMobile ? 8 : 12 }}>
              {t("gel.fiveReasonsTag")}
            </p>
            <h2 style={{ fontSize: isMobile ? "1.1rem" : isSmall ? "1.7rem" : "clamp(1.8rem, 3vw, 2.4rem)", fontWeight: 800, fontFamily: "var(--font-sora), sans-serif" }}>
              {t("gel.fiveReasonsTitle")}
            </h2>
          </div>
          <RaisonsSection />
        </div>
      </section>

      {/* CTA APRÈS 5 RAISONS */}
      <div style={{
        textAlign: "center",
        padding: isMobile ? `16px ${px} 28px` : `24px ${px} 60px`,
        background: "var(--gel-bg2)",
      }}>
        <a href="#commander" style={{
          display: isMobile ? "block" : "inline-block",
          background: "var(--gel-accent)",
          color: "#fff",
          padding: isMobile ? "14px 20px" : "18px 52px",
          borderRadius: 50,
          fontSize: isMobile ? 12 : 15,
          fontWeight: 900,
          textDecoration: "none",
          boxShadow: "0 6px 24px rgba(212,86,10,0.3)",
          fontFamily: "var(--font-sora), sans-serif",
          marginBottom: 16,
          whiteSpace: "nowrap",
          textAlign: "center",
        }}>
          {t("gel.tryRiskFree")}
        </a>
        <p style={{ color: "var(--gel-text2)", fontSize: 13 }}>
          <span>{t("gel.guarantee90Full")}</span>
        </p>
      </div>

      {/* VIDÉOS : celles ajoutées dans la console pour ce produit */}
      {(contenu?.videos?.length ?? 0) > 0 && (
      <section style={{ padding: isMobile ? `28px ${px} 0` : `${py} ${px} 0`, background: "var(--gel-bg)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: isMobile ? 20 : 56 }}>
            <p style={{ color: "var(--gel-gold)", fontSize: isMobile ? 10 : 12, fontWeight: 700, letterSpacing: 2, marginBottom: isMobile ? 8 : 12 }}>
              {t("gel.videoTestimonials")}
            </p>
            <h2 style={{ fontSize: isMobile ? "1.1rem" : isSmall ? "1.7rem" : "clamp(1.8rem, 3vw, 2.4rem)", fontWeight: 800, fontFamily: "var(--font-sora), sans-serif" }}>
              {t("gel.trueStoriesTitle")}{" "}
              <span style={{ color: "var(--gel-accent)" }}>{t("gel.trueStoriesHighlight")}</span>
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : (contenu?.videos?.length ?? 0) === 4 || sc === "tablet" ? "repeat(2, 1fr)" : "repeat(3, 1fr)", gap: isMobile ? 10 : 20, maxWidth: (contenu?.videos?.length ?? 0) === 4 && !isMobile ? 900 : undefined, margin: "0 auto" }}>
            {(contenu?.videos ?? []).map((v) => ({ name: v.titre || "", file: v.url })).map((v, i) => (
              <div key={i} data-video-card style={{
                borderRadius: isMobile ? 12 : 20,
                overflow: "hidden",
                border: "1px solid var(--gel-border)",
                background: "#fff",
                boxShadow: "0 2px 16px rgba(212,86,10,0.06)",
              }}>
                <div style={{ position: "relative", background: "#000", cursor: "pointer" }}
                  onClick={(e) => {
                    const video = (e.currentTarget as HTMLDivElement).querySelector("video");
                    if (!video) return;
                    if (video.paused) {
                      const videos = document.querySelectorAll("video");
                      videos.forEach((vid) => { if (vid !== video) vid.pause(); });
                      video.play();
                    } else {
                      video.pause();
                    }
                  }}
                >
                  <video
                    playsInline
                    preload="metadata"
                    style={{ width: "100%", display: "block", maxHeight: isMobile ? 200 : 400, objectFit: "cover", background: "#000" }}
                  >
                    <source src={v.file + "#t=0.6"} type="video/mp4" />
                  </video>
                </div>
                <div style={{ padding: isMobile ? "8px 10px" : "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontWeight: 800, fontSize: isMobile ? 11 : 14 }}>{v.name}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 6 : 8 }}>
                    <span
                      style={{
                        width: isMobile ? 20 : 24,
                        height: isMobile ? 20 : 24,
                        borderRadius: "50%",
                        background: "var(--gel-accent)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        flexShrink: 0,
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        const card = (e.currentTarget as HTMLElement).closest("[data-video-card]");
                        const video = card?.querySelector("video");
                        if (!video) return;
                        if (video.paused) {
                          const videos = document.querySelectorAll("video");
                          videos.forEach((vid) => { if (vid !== video) vid.pause(); });
                          video.play();
                        } else {
                          video.pause();
                        }
                      }}
                    >
                      <svg width={isMobile ? 8 : 10} height={isMobile ? 8 : 10} viewBox="0 0 10 12" fill="none">
                        <path d="M0 0L10 6L0 12V0Z" fill="#fff" />
                      </svg>
                    </span>
                    <span style={{
                      background: "#ffe9d6",
                      color: "var(--gel-accent)",
                      fontSize: isMobile ? 7 : 10,
                      fontWeight: 700,
                      letterSpacing: isMobile ? 0.5 : 1,
                      padding: isMobile ? "2px 6px" : "3px 10px",
                      borderRadius: 10,
                    }}>
                      {t("gel.clientVerified")}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      )}
      
      {/* CTA APRÈS VIDÉOS */}
      <div style={{
        textAlign: "center",
        padding: isMobile ? `16px ${px} 28px` : `24px ${px} 40px`,
        background: "var(--gel-bg)",
      }}>
        <a href="#commander" style={{
          display: isMobile ? "block" : "inline-block",
          background: "var(--gel-accent)",
          color: "#fff",
          padding: isMobile ? "14px 20px" : "18px 52px",
          borderRadius: 50,
          fontSize: isMobile ? 12 : 15,
          fontWeight: 900,
          textDecoration: "none",
          boxShadow: "0 6px 24px rgba(212,86,10,0.3)",
          fontFamily: "var(--font-sora), sans-serif",
          marginBottom: 16,
          whiteSpace: "nowrap",
          textAlign: "center",
        }}>
          {t("gel.tryRiskFree")}
        </a>
        <p style={{ color: "var(--gel-text2)", fontSize: 13 }}>
          <span>{t("gel.guarantee90Full")}</span>
        </p>
      </div>

     {/* PROBLÈME → SOLUTION */}
      <section style={{
        background: "linear-gradient(135deg, #D4560A 0%, #E06A12 40%, #F4A85E 80%, #ffedda 100%)",
        padding: isMobile ? `28px ${px} 0` : `${py} ${px} 0`,
        overflow: "hidden",
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>

          {/* Badge */}
          <div style={{ textAlign: "center", marginBottom: isMobile ? 8 : 24 }}>
            <span style={{
              background: "rgba(255,255,255,0.15)",
              border: "1px solid rgba(255,255,255,0.3)",
              color: "#fff",
              fontSize: isMobile ? 10 : 11,
              fontWeight: 700,
              letterSpacing: 2,
              padding: isMobile ? "4px 10px" : "6px 16px",
              borderRadius: 20,
            }}>
              {t("gel.cellProtection")}
            </span>
          </div>

          {/* Titre */}
          <h2 style={{
            textAlign: "center",
            color: "#fff",
            fontSize: isMobile ? "1.1rem" : isSmall ? "1.5rem" : "clamp(1.6rem, 2.5vw, 2.2rem)",
            fontWeight: 800,
            fontFamily: "var(--font-sora), sans-serif",
            marginBottom: isMobile ? 20 : 48,
            lineHeight: 1.2,
          }}>
            {t("gel.tiredToEnergized")}
          </h2>

          {/* Deux colonnes */}
          <div style={{
            display: "grid",
            gridTemplateColumns: isSmall ? "1fr" : "1fr 1fr",
            gap: isMobile ? 10 : 20,
            marginBottom: isMobile ? 20 : 48,
          }}>
            {/* Problème */}
            <div style={{
              background: "rgba(110,45,0,0.5)",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: isMobile ? 10 : 16,
              padding: isMobile ? "14px 16px" : "28px 32px",
            }}>
              <p style={{
                color: "#fff",
                fontSize: isMobile ? 11 : 13,
                fontWeight: 800,
                letterSpacing: 1.5,
                marginBottom: isMobile ? 10 : 20,
              }}>
                {t("gel.yourProblem")}
              </p>
              {[
                t("gel.problem1"),
                t("gel.problem2"),
                t("gel.problem3"),
              ].map((p, i) => (
                <div key={i} style={{
                  display: "flex",
                  alignItems: "center",
                  gap: isMobile ? 8 : 12,
                  padding: isMobile ? "6px 0" : "10px 0",
                  borderBottom: i < 2 ? "1px solid rgba(255,255,255,0.1)" : "none",
                }}>
                  <span style={{ color: "rgba(255,255,255,0.5)", fontSize: isMobile ? 13 : 16, flexShrink: 0 }}>✗</span>
                  <span style={{ color: "rgba(255,255,255,0.85)", fontSize: isMobile ? 12 : 15 }}>{p}</span>
                </div>
              ))}
            </div>

            {/* Solution */}
            <div style={{
              background: "rgba(255,255,255,0.92)",
              borderRadius: isMobile ? 10 : 16,
              padding: isMobile ? "14px 16px" : "28px 32px",
            }}>
              <p style={{
                color: "var(--gel-accent)",
                fontSize: isMobile ? 11 : 13,
                fontWeight: 800,
                letterSpacing: 1.5,
                marginBottom: isMobile ? 10 : 20,
              }}>
                {t("gel.ourSolution")}
              </p>
              {[
                t("gel.solution1"),
                t("gel.solution2"),
                t("gel.solution3"),
              ].map((s, i) => (
                <div key={i} style={{
                  display: "flex",
                  alignItems: "center",
                  gap: isMobile ? 8 : 12,
                  padding: isMobile ? "6px 0" : "10px 0",
                  borderBottom: i < 2 ? "1px solid var(--gel-border)" : "none",
                }}>
                  <span style={{ color: "#1db954", fontSize: 16, flexShrink: 0 }}>✓</span>
                  <span style={{ color: "var(--gel-text)", fontSize: 15, fontWeight: 500 }}>{s}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Image avant/après */}
          <div style={{ textAlign: "center" }}>
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(255,255,255,0.9)",
              borderRadius: 20,
              padding: isMobile ? "4px 10px" : "6px 16px",
              marginBottom: isMobile ? 8 : 16,
              fontSize: isMobile ? 11 : 13,
              fontWeight: 700,
              color: "var(--gel-accent)",
            }}>
              {t("gel.from2Months")}
            </div>
            <img
              src="/images/gel/3-etapes.webp"
              alt="Le geste NUTRELIS en 3 étapes : appliquez, massez, essuyez ou rincez"
              loading="lazy"
              style={{
                maxWidth: isMobile ? 420 : 1040,
                width: "100%",
                height: "auto",
                display: "block",
                margin: "0 auto",
                objectFit: "contain",
                filter: "drop-shadow(0 18px 28px rgba(110,45,0,0.30))",
              }}
            />
          </div>
        </div>
      </section>

      {/* STATS */}
      <section style={{ padding: isMobile ? `28px ${px}` : `${py} ${px}`, background: "#fff" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: isMobile ? 20 : 52 }}>
            <p style={{ color: "var(--gel-gold)", fontSize: isMobile ? 10 : 12, fontWeight: 700, letterSpacing: 2, marginBottom: isMobile ? 8 : 12 }}>
              {t("gel.statsTag")}
            </p>
            <h2 style={{ fontSize: isMobile ? "1.1rem" : isSmall ? "1.7rem" : "clamp(1.8rem, 3vw, 2.4rem)", fontWeight: 800, fontFamily: "var(--font-sora), sans-serif", marginBottom: isMobile ? 8 : 16 }}>
              {t("gel.statsTitle")}
            </h2>
            <p style={{ color: "var(--gel-text2)", fontSize: isMobile ? 12 : 15 }}>
              {t("gel.statsDesc")}
            </p>
          </div>
          <StatsSection />
        </div>
      </section>

     {/* NUTRELIS VS AUTRES */}
      <section style={{
        background: "linear-gradient(135deg, #D4560A 0%, #E06A12 40%, #F4A85E 80%, #ffedda 100%)",
        padding: isMobile ? `28px ${px}` : `${py} ${px}`,
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: isSmall ? "1fr" : "1fr 1fr", gap: isSmall ? (isMobile ? 20 : 40) : 80, alignItems: "center" }}>

          {/* Gauche — comparaison */}
          <div>

            {/* Tableau comparatif */}
            {/* Image produit au-dessus de NUTRELIS */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: isMobile ? 8 : 16 }}>
              <div style={{ textAlign: "center" }}>
                <img
                  src="/images/gel/img_transparent.png"
                  alt="NUTRELIS"
                  style={{
                    width: isMobile ? 64 : 96,
                    height: "auto",
                    objectFit: "contain",
                    filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.2))",
                    marginBottom: isMobile ? 4 : 8,
                  }}
                />
              </div>
              <div />
            </div>

            {/* Tableau comparatif — même grille, même alignement */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: isMobile ? 8 : 16 }}>
              {/* NUTRELIS */}
              <div style={{
                background: "rgba(110,45,0,0.6)",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: isMobile ? 10 : 14,
                padding: isMobile ? "14px 12px" : "32px 20px",
              }}>
                <p style={{ color: "#fff", fontWeight: 800, fontSize: isMobile ? 12 : 15, textAlign: "center", marginBottom: isMobile ? 10 : 20, letterSpacing: 1 }}>
                  NUTRELIS
                </p>
                {[t("gel.nutrelisPremium"), t("gel.nutrelisVegan")].map((item, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: isMobile ? 6 : 10, padding: isMobile ? "5px 0" : "8px 0", borderBottom: i < 1 ? "1px solid rgba(255,255,255,0.1)" : "none" }}>
                    <span style={{ color: "#1db954", fontSize: isMobile ? 13 : 16, flexShrink: 0 }}>✓</span>
                    <span style={{ color: "rgba(255,255,255,0.9)", fontSize: isMobile ? 10 : 13 }}>{item}</span>
                  </div>
                ))}
              </div>

              {/* Autres marques */}
              <div style={{
                background: "rgba(255,255,255,0.85)",
                borderRadius: isMobile ? 10 : 14,
                padding: isMobile ? "14px 12px" : "32px 20px",
              }}>
                <p style={{ color: "var(--gel-text)", fontWeight: 800, fontSize: isMobile ? 12 : 15, textAlign: "center", marginBottom: isMobile ? 10 : 20, letterSpacing: 1 }}>
                  {t("gel.otherBrands")}
                </p>
                {[t("gel.otherAbsorption"), t("gel.otherAdditives")].map((item, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: isMobile ? 6 : 10, padding: isMobile ? "5px 0" : "8px 0", borderBottom: i < 1 ? "1px solid var(--gel-border)" : "none" }}>
                    <span style={{ color: "#e53e3e", fontSize: isMobile ? 13 : 16, flexShrink: 0 }}>✗</span>
                    <span style={{ color: "var(--gel-text2)", fontSize: isMobile ? 10 : 13 }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Droite — points clés + CTA */}
          <div>
            <h2 style={{
              fontFamily: "var(--font-sora), sans-serif",
              fontSize: isMobile ? "1.1rem" : isSmall ? "1.4rem" : "clamp(1.4rem, 2.2vw, 1.9rem)",
              fontWeight: 800,
              marginBottom: isMobile ? 16 : 32,
              lineHeight: 1.2,
            }}>
              <span style={{ color: "#fff" }}>NUTRELIS</span>
              <span style={{ color: "#fff" }}> {t("gel.nutrelisVsOthers")}</span>
            </h2>

            <div style={{ marginBottom: isMobile ? 20 : 40 }}>
              {[
                t("gel.vsClean"),
                t("gel.vsResults"),
                t("gel.vsDurable"),
              ].map((item, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: isMobile ? 8 : 12,
                  padding: isMobile ? "8px 0" : "12px 0",
                  borderBottom: i < 2 ? "1px solid rgba(255,255,255,0.15)" : "none",
                }}>
                  <span style={{ color: "#1db954", fontSize: isMobile ? 16 : 20, flexShrink: 0 }}>✓</span>
                  <span style={{ color: "#fff", fontSize: isMobile ? 12 : 16, fontWeight: 600 }}>{item}</span>
                </div>
              ))}
            </div>

            <a href="#commander" style={{
              display: isMobile ? "block" : "inline-block",
              background: "rgba(255,255,255,0.15)",
              border: "2px solid #fff",
              color: "#fff",
              padding: isMobile ? "12px 16px" : "16px 40px",
              borderRadius: 50,
              fontSize: isMobile ? 12 : 15,
              fontWeight: 800,
              textDecoration: "none",
              fontFamily: "var(--font-sora), sans-serif",
              marginBottom: 14,
              whiteSpace: "nowrap",
              textAlign: "center",
            }}>
              {t("gel.tryRiskFree")}
            </a>
            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: isMobile ? 11 : 13 }}>
              <span>{t("gel.guarantee90Full")}</span>
            </p>
          </div>
        </div>
      </section>

      {/* COMMANDER */}
      <section id="commander" style={{ padding: isMobile ? `28px ${px}` : `${py} ${px}`, background: "var(--gel-bg)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: isMobile ? 20 : 52 }}>
            <p style={{ color: "var(--gel-gold)", fontSize: isMobile ? 10 : 12, fontWeight: 700, letterSpacing: 2, marginBottom: isMobile ? 8 : 12 }}>
              {t("gel.orderNow")}
            </p>
            <h2 style={{ fontSize: isMobile ? "1.1rem" : isSmall ? "1.7rem" : "clamp(1.8rem, 3vw, 2.6rem)", fontWeight: 800, fontFamily: "var(--font-sora), sans-serif", marginBottom: isMobile ? 8 : 12 }}>
              {t("gel.chooseFormula")}
            </h2>
            <p style={{ color: "var(--gel-text2)", fontSize: isMobile ? 12 : 15 }}>
              {t("gel.chooseFormulaDesc")}
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: isSmall ? "1fr" : "1fr 1fr", gap: isSmall ? 24 : 60, alignItems: "start" }}>

            {/* Gauche — Galerie images (2e sur mobile) */}
            <div style={{ order: isSmall ? 2 : 1 }}>
              <ProductGallery />
            </div>

            {/* Droite — Sélecteur de pack (1er sur mobile) */}
            <div style={{ order: isSmall ? 1 : 2 }}>
              {/* Note */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <span style={{ color: "var(--gel-text2)", fontSize: 13 }}>🍊 {t("gel.heroPill")}</span>
              </div>

              {/* Titre produit */}
              <h3 style={{ fontFamily: "var(--font-sora), sans-serif", fontWeight: 800, fontSize: 20, marginBottom: 8, lineHeight: 1.3 }}>
                NUTRELIS GEL EXFOLIANT À L’ORANGE — {t("gel.antiAgeComplex")}
              </h3>

              {/* Prix */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                <span style={{ color: "var(--gel-text2)", fontSize: 15, textDecoration: "line-through" }}>
                  {prixOriginal.toLocaleString("fr-FR")} FCFA
                </span>
                <span style={{ color: "var(--gel-accent)", fontSize: 26, fontWeight: 900, fontFamily: "var(--font-sora), sans-serif" }}>
                  {prixAffiche.toLocaleString("fr-FR")} FCFA
                </span>
              </div>

              {/* Description courte */}
              <p style={{ color: "var(--gel-text2)", fontSize: 14, lineHeight: 1.7, marginBottom: 20, borderLeft: "3px solid var(--gel-accent)", paddingLeft: 12 }}>
                {t("gel.productLongDesc")}
              </p>

              {/* Bénéfices */}
              <div style={{ marginBottom: 24 }}>
                <p style={{ fontWeight: 700, fontSize: 13, letterSpacing: 1, marginBottom: 12, color: "var(--gel-text)" }}>
                  {t("gel.chooseYourPack")}
                </p>
              </div>

              {/* Pack Selector */}
             <PackSelector medusaProduct={medusaProduct} onPackChange={(prix, original) => {
                setPrixAffiche(prix);
                setPrixOriginal(original);
              }} />

              {/* Bénéfices liste */}
              <div style={{ marginTop: 24, padding: "16px 20px", background: "var(--gel-bg2)", borderRadius: 12, border: "1px solid var(--gel-border)" }}>
                <p style={{ fontSize: 13, color: "var(--gel-text2)", marginBottom: 12, fontWeight: 600 }}>
                  {t("gel.benefitIntro")}
                </p>
                {[
                  t("gel.benefit1"),
                  t("gel.benefit2"),
                  t("gel.benefit3"),
                  t("gel.benefit4"),
                  t("gel.benefit5"),
                ].map((b, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 8 }}>
                    <span style={{ color: "#1db954", fontSize: 14, flexShrink: 0, marginTop: 2 }}>✓</span>
                    <span style={{ color: "var(--gel-text2)", fontSize: 13 }}>{b}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION MÉDECIN — TIMELINE */}
      <section id="routine" style={{
        background: "linear-gradient(135deg, #fff8f1 0%, #ffe9d6 50%, #fff8f1 100%)",
        padding: isMobile ? `28px ${px}` : `${py} ${px}`,
        overflow: "hidden",
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: isSmall ? "1fr" : "1fr 1fr", gap: isSmall ? 20 : 80, alignItems: "center" }}>

          {/* Image médecin */}
          <div style={{ position: "relative" }}>
            <div style={{
              position: "absolute", inset: 0,
              background: "radial-gradient(ellipse at 60% 50%, #ffe6cf 0%, transparent 70%)",
              borderRadius: 24,
            }} />
            <img
              src="/images/gel/Medecin.png"
              alt={t("gel.altDoctor")}
              style={{
                width: isMobile ? "70%" : "100%", height: "auto",
                objectFit: "contain",
                position: "relative", zIndex: 1,
                filter: "drop-shadow(0 20px 40px rgba(212,86,10,0.15))",
                margin: isMobile ? "0 auto" : undefined,
                display: "block",
              }}
            />
          </div>

          {/* Timeline droite */}
          <div>
            {/* Titre */}
            <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 8 : 12, marginBottom: isMobile ? 16 : 32 }}>
              <div style={{
                width: isMobile ? 34 : 48, height: isMobile ? 34 : 48, borderRadius: "50%",
                background: "var(--gel-accent)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: isMobile ? 16 : 22, flexShrink: 0,
                boxShadow: "0 4px 16px rgba(212,86,10,0.3)",
              }}>
                🌿
              </div>
              <h2 style={{
                fontFamily: "var(--font-sora), sans-serif",
                fontSize: isMobile ? "1.1rem" : isSmall ? "1.4rem" : "clamp(1.4rem, 2vw, 1.8rem)",
                fontWeight: 800, color: "var(--gel-accent)",
                lineHeight: 1.3,
              }}>
                {t("gel.timelineTitle")}
              </h2>
            </div>

            {/* Items timeline */}
            <div style={{ display: "flex", flexDirection: "column", gap: isMobile ? 8 : 12 }}>
              {[
                {
                  icon: "🧴",
                  bg: "#D4560A",
                  titre: t("gel.timeline1Title"),
                  desc: t("gel.timeline1Desc"),
                },
                {
                  icon: "🔄",
                  bg: "#F08A24",
                  titre: t("gel.timeline2Title"),
                  desc: t("gel.timeline2Desc"),
                },
                {
                  icon: "💧",
                  bg: "#B84508",
                  titre: t("gel.timeline3Title"),
                  desc: t("gel.timeline3Desc"),
                },
                {
                  icon: "📅",
                  bg: "#D4560A",
                  titre: t("gel.timeline4Title"),
                  desc: t("gel.timeline4Desc"),
                },
                {
                  icon: "🧪",
                  bg: "#F08A24",
                  titre: t("gel.timeline5Title"),
                  desc: t("gel.timeline5Desc"),
                },
                {
                  icon: "👁️",
                  bg: "#B84508",
                  titre: t("gel.timeline6Title"),
                  desc: t("gel.timeline6Desc"),
                },
              ].map((item, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: isMobile ? 10 : 16,
                  background: "#fff",
                  borderRadius: 14,
                  padding: isMobile ? "10px 12px" : "14px 20px",
                  border: "1px solid var(--gel-border)",
                  boxShadow: "0 2px 12px rgba(212,86,10,0.06)",
                  transition: "all 0.2s",
                }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = "translateX(6px)";
                    e.currentTarget.style.boxShadow = "0 4px 20px rgba(212,86,10,0.12)";
                    e.currentTarget.style.borderColor = "var(--gel-accent)";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = "translateX(0)";
                    e.currentTarget.style.boxShadow = "0 2px 12px rgba(212,86,10,0.06)";
                    e.currentTarget.style.borderColor = "var(--gel-border)";
                  }}
                >
                  <div style={{
                    width: isMobile ? 30 : 38, height: isMobile ? 30 : 38, borderRadius: 10,
                    background: item.bg,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: isMobile ? 14 : 18, flexShrink: 0,
                    boxShadow: `0 4px 12px ${item.bg}55`,
                  }}>
                    {item.icon}
                  </div>
                  <div>
                    <p style={{
                      fontWeight: 800, fontSize: isMobile ? 11 : 12,
                      color: "var(--gel-accent)",
                      letterSpacing: 0.5, marginBottom: 2,
                      fontFamily: "var(--font-sora), sans-serif",
                    }}>
                      {item.titre}
                    </p>
                    <p style={{ color: "var(--gel-text2)", fontSize: isMobile ? 10 : 12, lineHeight: 1.5 }}>
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* GARANTIE */}
      <section style={{
        background: "#fff",
        padding: isMobile ? `28px ${px}` : `${py} ${px}`,
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: isSmall ? "1fr" : "1fr 1fr", gap: isSmall ? 20 : 80, alignItems: "center" }}>

          {/* Gauche — contenu */}
          <div style={{ textAlign: "center" }}>
            <img
              src="/images/gel/261-Converti-1.png"
              alt={t("gel.altGuarantee")}
              style={{ width: isMobile ? 100 : 200, height: "auto", marginBottom: isMobile ? 10 : 20, display: "block", margin: isMobile ? "0 auto 10px" : "0 auto 20px" }}
            />
            <p style={{ color: "var(--gel-accent)", fontSize: isMobile ? 10 : 12, fontWeight: 700, letterSpacing: 2, marginBottom: isMobile ? 8 : 12 }}>
              {t("gel.feelDifference")}
            </p>
            <h2 style={{
              fontFamily: "var(--font-sora), sans-serif",
              fontSize: isMobile ? "1.1rem" : isSmall ? "1.7rem" : "2rem", fontWeight: 800, marginBottom: isMobile ? 10 : 20,
            }}>
              {t("gel.guarantee")}
            </h2>
            <p style={{
              color: "var(--gel-text2)", fontSize: isMobile ? 12 : 15,
              lineHeight: 1.7, maxWidth: 400, margin: isMobile ? "0 auto 20px" : "0 auto 32px",
            }}>
              {t("gel.guaranteeDesc")}
            </p>
            <a href="#commander" style={{
              display: isMobile ? "block" : "inline-block",
              background: "var(--gel-accent)", color: "#fff",
              padding: isMobile ? "14px 20px" : "18px 48px", borderRadius: 50,
              fontSize: isMobile ? 12 : 15, fontWeight: 900, textDecoration: "none",
              boxShadow: "0 6px 24px rgba(212,86,10,0.3)",
              fontFamily: "var(--font-sora), sans-serif",
              marginBottom: 24,
              whiteSpace: "nowrap",
              textAlign: "center",
            }}>
              {t("gel.tryRiskFree")}
            </a>
            <p style={{ color: "var(--gel-text2)", fontSize: 13 }}>
              <span>{t("gel.guarantee90Full")}</span>
            </p>
          </div>

          {/* Droite — image femme avec badge */}
          <div style={{ position: "relative" }}>
            <img
              src="/images/gel/BadgesA.png"
              alt={t("gel.altResults")}
              style={{
                width: "100%", height: "auto",
                objectFit: "contain",
                borderRadius: 24,
              }}
            />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" style={{
        background: "var(--gel-accent)",
        padding: isMobile ? `28px ${px}` : `${py} ${px}`,
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: isMobile ? 20 : 52 }}>
            <h2 style={{
              fontFamily: "var(--font-sora), sans-serif",
              fontSize: isMobile ? "1.1rem" : isSmall ? "1.2rem" : "clamp(1.4rem, 2vw, 1.8rem)",
              fontWeight: 800, color: "#fff",
              letterSpacing: isMobile ? 2 : 4,
            }}>
              {t("gel.faqTitle")}
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: isSmall ? "1fr" : "1fr 1fr", gap: isMobile ? 8 : 16 }}>
            {[
              {
                icon: "🌿",
                q: t("gel.faq1Q"),
                a: t("gel.faq1A"),
              },
              {
                icon: "👁️",
                q: t("gel.faq2Q"),
                a: t("gel.faq2A"),
              },
              {
                icon: "✨",
                q: t("gel.faq3Q"),
                a: t("gel.faq3A"),
              },
              {
                icon: "🌸",
                q: t("gel.faq4Q"),
                a: t("gel.faq4A"),
              },
              {
                icon: "☀️",
                q: t("gel.faq5Q"),
                a: t("gel.faq5A"),
              },
              {
                icon: "💊",
                q: t("gel.faq6Q"),
                a: t("gel.faq6A"),
              },
              {
                icon: "🔬",
                q: t("gel.faq7Q"),
                a: t("gel.faq7A"),
              },
              {
                icon: "📦",
                q: t("gel.faq8Q"),
                a: t("gel.faq8A"),
              },
            ].map((faq, i) => (
              <FaqItemWhite key={i} icon={faq.icon} q={faq.q} a={faq.a} open={openFaqBottom === i} onToggle={() => setOpenFaqBottom(openFaqBottom === i ? null : i)} />
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: "#2b1606", padding: `64px ${px} 32px` }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : sc === "tablet" ? "1fr 1fr 1fr" : "2fr 1fr 1fr 1fr", gap: isMobile ? 24 : 48, marginBottom: 48 }}>
            <div>
              <div style={{ marginBottom: 20 }}>
                <a href="/">
                  <img src="/images/logo-homepage.png" alt="Nutrelis" style={{ height: isMobile ? 26 : 36, width: "auto" }} />
                </a>
              </div>
              <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.8, marginBottom: 24, maxWidth: 280 }}>
                {t("gel.footerDesc")}
              </p>
            </div>
            {[
              { title: t("gel.footerProducts"), links: [
                { label: "Astaxanthine 12mg", href: "/produits/astaxanthine-12mg" },
                { label: "Gel exfoliant à l’orange", href: "/produits/gel-exfoliant-orange" },
                { label: t("gel.footerAllProducts"), href: "/#produits" },
              ]},
              { title: t("gel.footerInfo"), links: [
                { label: t("gel.footerAbout"), href: "/a-propos" },
                { label: t("gel.footerBlog"), href: "/blog" },
                { label: t("gel.footerContact"), href: "/contact" },
              ]},
              { title: t("gel.footerService"), links: [
                { label: t("gel.footerFaq"), href: "/faq" },
                { label: t("gel.footerShipping"), href: "/livraison" },
                { label: t("gel.footerRefunds"), href: "/retours" },
                { label: t("gel.footerTerms"), href: "/cgv" },
              ]},
            ].map((col, i) => (
              <div key={i}>
                <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: 700, letterSpacing: 2, marginBottom: 20 }}>
                  {col.title}
                </p>
                {col.links.map((link, j) => (
                  <a key={j} href={link.href} style={{ display: "block", color: "rgba(255,255,255,0.65)", fontSize: 14, textDecoration: "none", marginBottom: 12 }}>
                    {link.label}
                  </a>
                ))}
              </div>
            ))}
          </div>
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 24, display: "flex", flexDirection: isMobile ? "column" : "row", justifyContent: isMobile ? "center" : "space-between", alignItems: "center", gap: isMobile ? 6 : 0, textAlign: isMobile ? "center" : undefined }}>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: isMobile ? 11 : 13 }}>
              {t("gel.footerRights")}
            </p>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: isMobile ? 11 : 13 }}>
              {t("gel.footerDelivery")}
            </p>
          </div>
        </div>
      </footer>

      {isMobile && <BarreAchatMobile prix={prixAffiche} libelle={t("gel.stickyLabel")} />}
      <FloatingActions accent="#D4560A" />
    </HydrationGuard>
  );
}