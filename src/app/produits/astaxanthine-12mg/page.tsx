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

function Countdown() {
  const [time, setTime] = useState({ h: 5, m: 47, s: 59 });
  useEffect(() => {
    const t = setInterval(() => {
      setTime(prev => {
        let { h, m, s } = prev;
        s--;
        if (s < 0) { s = 59; m--; }
        if (m < 0) { m = 59; h--; }
        if (h < 0) { h = 5; m = 59; s = 59; }
        return { h, m, s };
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);
  const p = (n) => String(n).padStart(2, "0");
  return (
    <span style={{ fontWeight: 900, letterSpacing: 2 }}>
      {p(time.h)}:{p(time.m)}:{p(time.s)}
    </span>
  );
}

function Navbar() {
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
      background: "rgba(255,248,246,0.97)",
      borderBottom: "1px solid var(--asta-border)",
      backdropFilter: "blur(12px)",
      boxShadow: scrolled ? "0 2px 20px rgba(125,8,6,0.08)" : "none",
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
              { label: t("nav.products"), href: "/produits/astaxanthine-12mg" },
              { label: t("nav.science"), href: "/science" },
              { label: t("nav.reviews"), href: "/avis-clients" },
              { label: t("nav.faq"), href: "/faq" },
            ].map((item) => (
              <a key={item.href} href={item.href} style={{
                color: "var(--asta-text2)",
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
            background: "var(--asta-accent)",
            color: "#fff",
            padding: isMobile ? "8px 14px" : "10px 24px",
            borderRadius: 8,
            fontSize: isMobile ? 12 : 14,
            fontWeight: 700,
            textDecoration: "none",
            boxShadow: "0 4px 14px rgba(125,8,6,0.25)",
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
        borderBottom: "1px solid var(--asta-border)",
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
        <span style={{ fontWeight: 600, fontSize: 16, color: "var(--asta-text)" }}>
          {q}
        </span>
        <div style={{
          width: 30,
          height: 30,
          borderRadius: "50%",
          border: "1.5px solid var(--asta-accent)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          color: "var(--asta-accent)",
          fontSize: 20,
          fontWeight: 700,
        }}>
          {open ? "−" : "+"}
        </div>
      </div>
      {open && (
        <p style={{
          color: "var(--asta-text2)",
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

  const packs = [
    {
      id: 1,
      label: t("product.packDiscovery"),
      capsules: t("product.capsules1"),
      cure: t("product.cure1"),
      perCycle: t("product.perCycle1"),
      prix: skuPriceMap["NUT-AX-1P"] || 15000,
      ancien: Math.round((skuPriceMap["NUT-AX-1P"] || 15000) * 1.25),
      aboPrix: Math.round((skuPriceMap["NUT-AX-1P"] || 15000) * 0.95),
      eco: null,
      popular: false,
      img: "/images/astaxanthine/P_01.png",
      variantId: medusaProduct?.variants?.find(v => v.sku === "NUT-AX-1P")?.id || "variant_01KNX844AZ8E2VAQS6T6QH7CWA",
      sku: "NUT-AX-1P",
    },
    {
      id: 2,
      label: t("product.packResults"),
      capsules: t("product.capsules2"),
      cure: t("product.cure2"),
      perCycle: t("product.perCycle2"),
      prix: skuPriceMap["NUT-AX-2P"] || 27000,
      ancien: Math.round((skuPriceMap["NUT-AX-2P"] || 27000) * 1.25),
      aboPrix: Math.round((skuPriceMap["NUT-AX-2P"] || 27000) * 0.95),
      eco: ((skuPriceMap["NUT-AX-1P"] || 15000) * 2 - (skuPriceMap["NUT-AX-2P"] || 27000)).toLocaleString("fr-FR") + " FCFA",
      popular: true,
      img: "/images/astaxanthine/P_02.png",
      variantId: medusaProduct?.variants?.find(v => v.sku === "NUT-AX-2P")?.id || "variant_01KNX844B0HJWBPJTS7P0M27SK",
      sku: "NUT-AX-2P",
    },
    {
      id: 3,
      label: t("product.packTransformation"),
      capsules: t("product.capsules3"),
      cure: t("product.cure3"),
      perCycle: t("product.perCycle3"),
      prix: skuPriceMap["NUT-AX-3P"] || 36000,
      ancien: Math.round((skuPriceMap["NUT-AX-3P"] || 36000) * 1.25),
      aboPrix: Math.round((skuPriceMap["NUT-AX-3P"] || 36000) * 0.95),
      eco: ((skuPriceMap["NUT-AX-1P"] || 15000) * 3 - (skuPriceMap["NUT-AX-3P"] || 36000)).toLocaleString("fr-FR") + " FCFA",
      popular: false,
      img: "/images/astaxanthine/P_03.png",
      variantId: medusaProduct?.variants?.find(v => v.sku === "NUT-AX-3P")?.id || "variant_01KNX844B0HJWBPJTS7P0M27SK",
      sku: "NUT-AX-3P",
    },
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
        background: "#f5ebe8",
        borderRadius: 12,
        padding: 5,
        marginBottom: 24,
        border: "1px solid var(--asta-border)",
      }}>
        {[
          { id: "unique", label: t("product.oneTimePurchase") },
          { id: "abonnement", label: "⭐ " + t("product.subscription") },
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
              background: mode === tab.id ? "var(--asta-accent)" : "transparent",
              color: mode === tab.id ? "#fff" : "var(--asta-text2)",
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
          background: "#fdecea",
          border: "1px solid var(--asta-accent)",
          borderRadius: 10,
          padding: isMobilePS ? "8px 12px" : "10px 14px",
          marginBottom: 16,
          fontSize: isMobilePS ? 11 : 14,
          color: "var(--asta-text2)",
          lineHeight: 1.5,
        }}>
          📦{" "}
          <strong style={{ color: "var(--asta-text)" }}>
            {t("product.autoDelivery")}
          </strong>{" "}
          via ATEZ Express &nbsp;·&nbsp; 💰{" "}
          <strong style={{ color: "var(--asta-text)" }}>{t("product.lifetimeDiscount")}</strong>
          &nbsp;·&nbsp; ✅{" "}
          <strong style={{ color: "var(--asta-text)" }}>
            {t("product.cancelAnytime")}
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
              background: selected === pack.id ? "#fdecea" : "#fff",
              border: `2px solid ${selected === pack.id ? "var(--asta-accent)" : "var(--asta-border)"}`,
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
                background: "var(--asta-accent)",
                color: "#fff",
                fontSize: 10,
                fontWeight: 800,
                letterSpacing: 1,
                padding: "3px 10px",
                borderRadius: 20,
                zIndex: 2,
                whiteSpace: "nowrap",
              }}>
                {t("product.mostPopular")}
              </div>
            )}
            <div style={{
              width: 20,
              height: 20,
              borderRadius: "50%",
              flexShrink: 0,
              border: `2px solid ${selected === pack.id ? "var(--asta-accent)" : "#ccc"}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
              {selected === pack.id && (
                <div style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: "var(--asta-accent)",
                }} />
              )}
            </div>
            <img
              src={pack.img}
              alt={pack.label}
              style={{ width: isMobilePS ? 36 : 56, height: isMobilePS ? 36 : 56, objectFit: "contain", flexShrink: 0 }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 800, fontSize: isMobilePS ? 12 : 15, color: "var(--asta-text)", lineHeight: 1.3 }}>
                {pack.capsules}
              </div>
              <div style={{ fontSize: isMobilePS ? 10 : 12, color: "var(--asta-text2)", marginTop: 2 }}>
                {pack.cure}
              </div>
              {pack.eco && mode === "unique" && (
                <span style={{
                  display: "inline-block",
                  background: "var(--asta-accent)",
                  color: "#fff",
                  fontSize: isMobilePS ? 9 : 11,
                  fontWeight: 700,
                  padding: isMobilePS ? "2px 6px" : "3px 10px",
                  borderRadius: 20,
                  marginTop: 4,
                  whiteSpace: "nowrap",
                }}>
                  {t("product.save")} {pack.eco}
                </span>
              )}
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <div style={{ color: "var(--asta-accent)", fontSize: isMobilePS ? 15 : 22, fontWeight: 900, lineHeight: 1 }}>
                {(mode === "abonnement" ? pack.aboPrix : pack.prix).toLocaleString()}
                <span style={{ fontSize: 12 }}> FCFA</span>
              </div>
              <div style={{ color: "#aaa", fontSize: 12, textDecoration: "line-through" }}>
                {pack.ancien.toLocaleString()} F
              </div>
              {mode === "abonnement" && (
                <div style={{ fontSize: 11, color: "var(--asta-gold)", fontWeight: 700 }}>
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
          const ok = await ajouterArticle({
            id: `asta-pack-${pack.id}-${mode}`,
            variantId: pack.variantId,
            nom: `NUTRELIS Astaxanthine 12mg`,
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
          background: "var(--asta-accent)",
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
          boxShadow: "0 6px 24px rgba(125,8,6,0.3)",
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
          const ok = await ajouterArticle({
            id: `asta-pack-${pack.id}-${mode}`,
            variantId: pack.variantId,
            nom: `NUTRELIS Astaxanthine 12mg`,
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
          width: "100%", background: "transparent", color: "var(--asta-accent)",
          border: "2px solid var(--asta-accent)", padding: isMobilePS ? "14px" : "16px", borderRadius: 12,
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
        color: "var(--asta-text2)",
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
  const colsR = isMobileR ? "repeat(2, 1fr)" : isTabletR ? "repeat(3, 1fr)" : "repeat(5, 1fr)";
  const { t } = useLocale();
  const raisons = [
    {
      num: "01",
      title: t("product.reason1Title"),
      text: t("product.reason1Text"),
      img: "/images/astaxanthine/Sld2.png",
    },
    {
      num: "02",
      title: t("product.reason2Title"),
      text: t("product.reason2Text"),
      img: "/images/astaxanthine/Sld3.webp",
    },
    {
      num: "03",
      title: t("product.reason3Title"),
      text: t("product.reason3Text"),
      img: "/images/astaxanthine/Sld4.webp",
    },
    {
      num: "04",
      title: t("product.reason4Title"),
      text: t("product.reason4Text"),
      img: "/images/astaxanthine/Sld5.webp",
    },
    {
      num: "05",
      title: t("product.reason5Title"),
      text: t("product.reason5Text"),
      img: "/images/astaxanthine/img_sla.png",
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
            border: `2px solid ${isOpen ? "var(--asta-accent)" : "var(--asta-border)"}`,
            cursor: "pointer",
            transition: "all 0.3s ease",
            boxShadow: isOpen ? "0 8px 32px rgba(125,8,6,0.18)" : "0 2px 8px rgba(0,0,0,0.05)",
            overflow: "hidden",
          }}
        >
          {!isOpen && (
            <>
              <div style={{ height: isMobileR ? 130 : isTabletR ? 150 : 180, overflow: "hidden" }}>
                <img src={r.img} alt={r.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              <div style={{ padding: isMobileR ? "8px 8px 10px" : "16px 18px 20px", textAlign: "center" }}>
                <div style={{
                  display: "inline-block",
                  background: "var(--asta-bg2)", color: "var(--asta-accent)",
                  fontSize: isMobileR ? 8 : 11, fontWeight: 700, letterSpacing: 1,
                  padding: isMobileR ? "2px 6px" : "3px 10px", borderRadius: 50, marginBottom: isMobileR ? 4 : 10,
                  border: "1px solid var(--asta-border)",
                }}>
                  {t("product.reason")} {r.num}
                </div>
                <h3 style={{
                  fontSize: titleSize, fontWeight: 700,
                  fontFamily: "var(--font-sora), sans-serif",
                  lineHeight: 1.3, color: "var(--asta-text)", textAlign: "center",
                }}>
                  {r.title}
                </h3>
                <div style={{ textAlign: "center", marginTop: isMobileR ? 4 : 8, color: "var(--asta-text2)", fontSize: isMobileR ? 10 : 16 }}>▼</div>
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
                background: "var(--asta-accent)", color: "#fff",
                fontSize: isMobileR ? 8 : 11, fontWeight: 700, letterSpacing: 1,
                padding: isMobileR ? "2px 6px" : "3px 10px", borderRadius: 50,
              }}>
                {t("product.reason")} {r.num}
              </div>
              <h3 style={{
                fontSize: titleSize, fontWeight: 800,
                fontFamily: "var(--font-sora), sans-serif",
                lineHeight: 1.3, color: "var(--asta-text)",
              }}>
                {r.title}
              </h3>
              <p style={{ color: "var(--asta-text2)", fontSize: textSize, lineHeight: 1.5 }}>
                {r.text}
              </p>
              <a href="#commander"
                onClick={(e) => e.stopPropagation()}
                style={{
                  display: "block", textAlign: "center",
                  background: "var(--asta-accent)", color: "#fff",
                  padding: isMobileR ? "7px" : "10px", borderRadius: 50,
                  fontSize: btnSize, fontWeight: 800, textDecoration: "none",
                  fontFamily: "var(--font-sora), sans-serif",
                }}
              >
                {t("product.orderArrow")}
              </a>
              <div style={{ textAlign: "center", color: "var(--asta-text2)", fontSize: isMobileR ? 10 : 16, transform: "rotate(180deg)" }}>▼</div>
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
        borderBottom: "1px solid var(--asta-border)",
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
            ? "var(--asta-accent)"
            : "linear-gradient(135deg, #fdecea, #f5e0dd)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: isMobileFaqP ? 13 : 18, flexShrink: 0,
          transition: "all 0.3s",
          boxShadow: open ? "0 4px 12px rgba(125,8,6,0.25)" : "none",
        }}>
          {icon}
        </div>
        <span style={{
          flex: 1,
          fontWeight: 600, fontSize: isMobileFaqP ? 12 : 14,
          color: open ? "var(--asta-accent)" : "var(--asta-text)",
          fontFamily: "var(--font-sora), sans-serif",
          transition: "color 0.2s",
        }}>
          {q}
        </span>
        <div style={{
          width: isMobileFaqP ? 22 : 28, height: isMobileFaqP ? 22 : 28, borderRadius: "50%",
          background: open ? "var(--asta-accent)" : "var(--asta-bg2)",
          border: `1.5px solid ${open ? "var(--asta-accent)" : "var(--asta-border)"}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: open ? "#fff" : "var(--asta-text2)",
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
          background: "linear-gradient(135deg, #fff8f6, #fdecea)",
          borderRadius: 12,
          border: "1px solid var(--asta-border)",
          borderLeft: "3px solid var(--asta-accent)",
        }}>
          <p style={{
            color: "var(--asta-text2)", fontSize: isMobileFaqP ? 11 : 13,
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
  const images = [
    "/images/astaxanthine/img_transparent.png",
    "/images/astaxanthine/img1A.png",
    "/images/astaxanthine/NUT2.png",
    "/images/astaxanthine/img4A.png",
    "/images/astaxanthine/img5A.png",
    "/images/astaxanthine/NUT3.png",
    "/images/astaxanthine/NUT4.png",
  ];

  const scGallery = useScreenSize();
  const isSmallGallery = scGallery === "mobile" || scGallery === "tablet";
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, position: isSmallGallery ? "relative" : "sticky", top: isSmallGallery ? 0 : 80 }}>
      {/* Image principale */}
      <div style={{
        position: "relative",
        background: "radial-gradient(ellipse at 50% 50%, #fde8e4, #fff5f3)",
        borderRadius: 20,
        overflow: "hidden",
        border: "1px solid var(--asta-border)",
        aspectRatio: "1/1",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        <div style={{
          position: "absolute", top: 16, right: 16, zIndex: 2,
          background: "var(--asta-accent)", color: "#fff",
          fontWeight: 900, fontSize: 15, padding: "6px 12px",
          borderRadius: 8,
        }}>
          −20%
        </div>
        <div style={{
          position: "absolute", bottom: 16, left: 16, zIndex: 2,
          background: "rgba(0,0,0,0.6)", color: "#fff",
          fontSize: 12, fontWeight: 600, padding: "6px 12px",
          borderRadius: 20,
        }}>
          {t("product.soldToday")}
        </div>
        <img
          src={images[main]}
          alt="NUTRELIS Astaxanthine"
          style={{
            width: "85%", height: "85%",
            objectFit: "contain",
            transition: "all 0.3s",
            filter: "drop-shadow(0 8px 24px rgba(125,8,6,0.15))",
          }}
        />
      </div>

      {/* Thumbnails en dessous */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(7, 1fr)",
        gap: isSmallGallery ? 4 : 8,
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
              border: `2px solid ${main === i ? "var(--asta-accent)" : "var(--asta-border)"}`,
              background: "#fdf5f3",
              opacity: main === i ? 1 : 0.7,
              transition: "all 0.2s",
            }}
          >
            <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "contain", padding: 4 }} />
          </div>
        ))}
      </div>
      {/* FAQ accordéon produit */}
      <div style={{ marginTop: 8 }}>
       {[
          {
            icon: "💊",
            q: t("product.galleryFaq1Q"),
            a: (
              <div>
                <p style={{ marginBottom: 10 }} dangerouslySetInnerHTML={{ __html: sanitizeHtml(t("product.galleryFaq1A_intro")) }} />
                <p style={{ marginBottom: 8, fontWeight: 700, color: "var(--asta-accent)" }}>{t("product.galleryFaq1A_label")}</p>
                <ul style={{ paddingLeft: 0, listStyle: "none", marginBottom: 10 }}>
                  {(t("product.galleryFaq1A_items") as unknown as string[]).map((item: string, i: number) => (
                    <li key={i} style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                      <span style={{ color: "var(--asta-accent)", fontWeight: 700 }}>➡️</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <p>{t("product.galleryFaq1A_outro")}</p>
              </div>
            ),
          },
          {
            icon: "📅",
            q: t("product.galleryFaq2Q"),
            a: (
              <div>
                <p style={{ marginBottom: 12 }} dangerouslySetInnerHTML={{ __html: sanitizeHtml(t("product.galleryFaq2A_intro")) }} />
                <div style={{ marginBottom: 12 }}>
                  <p style={{ fontWeight: 700, color: "var(--asta-accent)", marginBottom: 6 }}>{t("product.galleryFaq2A_phase1Label")}</p>
                  {(t("product.galleryFaq2A_phase1Items") as unknown as string[]).map((item: string, i: number) => (
                    <div key={i} style={{ display: "flex", gap: 8, marginBottom: 4 }}>
                      <span style={{ color: "#1db954" }}>✅</span><span>{item}</span>
                    </div>
                  ))}
                </div>
                <div>
                  <p style={{ fontWeight: 700, color: "var(--asta-accent)", marginBottom: 6 }}>{t("product.galleryFaq2A_phase2Label")}</p>
                  {(t("product.galleryFaq2A_phase2Items") as unknown as string[]).map((item: string, i: number) => (
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
            q: t("product.galleryFaq3Q"),
            a: (
              <div>
                <p dangerouslySetInnerHTML={{ __html: sanitizeHtml(t("product.galleryFaq3A")) }} />
              </div>
            ),
          },
          {
            icon: "✨",
            q: t("product.galleryFaq4Q"),
            a: (
              <div>
                {[
                  { titre: t("product.galleryFaq4A_cat1Title"), items: t("product.galleryFaq4A_cat1Items") as unknown as string[] },
                  { titre: t("product.galleryFaq4A_cat2Title"), items: t("product.galleryFaq4A_cat2Items") as unknown as string[] },
                  { titre: t("product.galleryFaq4A_cat3Title"), items: t("product.galleryFaq4A_cat3Items") as unknown as string[] },
                  { titre: t("product.galleryFaq4A_cat4Title"), items: t("product.galleryFaq4A_cat4Items") as unknown as string[] },
                ].map((section, i) => (
                  <div key={i} style={{ marginBottom: 12 }}>
                    <p style={{ fontWeight: 700, color: "var(--asta-accent)", marginBottom: 6 }}>{section.titre}</p>
                    {section.items.map((item: string, j: number) => (
                      <div key={j} style={{ display: "flex", gap: 8, marginBottom: 4 }}>
                        <span style={{ color: "#1db954" }}>✓</span><span>{item}</span>
                      </div>
                    ))}
                  </div>
                ))}
                <div style={{ marginTop: 12, padding: "12px 16px", background: "rgba(125,8,6,0.06)", borderRadius: 8, border: "1px solid var(--asta-border)" }}>
                  <p style={{ fontWeight: 800, marginBottom: 6 }}>{t("product.galleryFaq4A_whyTitle")}</p>
                  {(t("product.galleryFaq4A_whyItems") as unknown as string[]).map((item: string, i: number) => (
                    <div key={i} style={{ display: "flex", gap: 8, marginBottom: 4 }}>
                      <span style={{ color: "var(--asta-accent)", fontWeight: 700 }}>•</span><span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            ),
          },
          {
            icon: "🔬",
            q: t("product.galleryFaq5Q"),
            a: (
              <div>
                <p dangerouslySetInnerHTML={{ __html: sanitizeHtml(t("product.galleryFaq5A")) }} />
              </div>
            ),
          },
          {
            icon: "📦",
            q: t("product.galleryFaq6Q"),
            a: (
              <div>
                <div style={{ marginBottom: 12 }}>
                  <p style={{ fontWeight: 700, color: "var(--asta-accent)", marginBottom: 6 }}>{t("product.galleryFaq6A_stdLabel")}</p>
                  <p style={{ marginBottom: 4 }} dangerouslySetInnerHTML={{ __html: sanitizeHtml(t("product.galleryFaq6A_stdLine1")) }} />
                  <p dangerouslySetInnerHTML={{ __html: sanitizeHtml(t("product.galleryFaq6A_stdLine2")) }} />
                </div>
                <div style={{ marginBottom: 12 }}>
                  <p style={{ fontWeight: 700, color: "var(--asta-accent)", marginBottom: 6 }}>{t("product.galleryFaq6A_expLabel")}</p>
                  <p style={{ marginBottom: 4 }} dangerouslySetInnerHTML={{ __html: sanitizeHtml(t("product.galleryFaq6A_expLine1")) }} />
                  <p dangerouslySetInnerHTML={{ __html: sanitizeHtml(t("product.galleryFaq6A_expLine2")) }} />
                </div>
                <div style={{ padding: "10px 14px", background: "rgba(125,8,6,0.06)", borderRadius: 8, border: "1px solid var(--asta-border)" }}>
                  <p style={{ fontSize: 12, color: "var(--asta-text2)" }}>{t("product.galleryFaq6A_warning")}</p>
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
    { value: 94, label: t("product.stat1Label"), desc: t("product.stat1Desc") },
    { value: 96, label: t("product.stat2Label"), desc: t("product.stat2Desc") },
    { value: 92, label: t("product.stat3Label"), desc: t("product.stat3Desc") },
    { value: 89, label: t("product.stat4Label"), desc: t("product.stat4Desc") },
  ];

  return (
    <div ref={ref} style={{ display: "grid", gridTemplateColumns: scSt === "mobile" ? "1fr 1fr" : "1fr 1fr", gap: scSt === "mobile" ? "14px" : "40px 80px" }}>
      {stats.map((stat, i) => (
        <div key={i}>
          <div style={{
            color: "var(--asta-accent)",
            fontSize: scSt === "mobile" ? "1.4rem" : "2.8rem",
            fontWeight: 900,
            fontFamily: "var(--font-sora), sans-serif",
            lineHeight: 1,
            marginBottom: scSt === "mobile" ? 4 : 8,
          }}>
            {Math.round(stat.value * progress)}
            <span style={{ fontSize: scSt === "mobile" ? "0.7rem" : "1.4rem" }}>%</span>
          </div>
          <div style={{ fontWeight: 700, fontSize: scSt === "mobile" ? 11 : 15, marginBottom: scSt === "mobile" ? 2 : 4, color: "var(--asta-text)" }}>
            {stat.label}
          </div>
          <div style={{ color: "var(--asta-text2)", fontSize: scSt === "mobile" ? 10 : 13, marginBottom: scSt === "mobile" ? 6 : 12 }}>
            {stat.desc}
          </div>
          {/* Barre de progression */}
          <div style={{
            height: 6,
            background: "#f0e8e8",
            borderRadius: 6,
            overflow: "hidden",
          }}>
            <div style={{
              height: "100%",
              width: `${stat.value * progress}%`,
              background: "linear-gradient(90deg, var(--asta-accent), #c0392b)",
              borderRadius: 6,
              transition: "width 0.1s ease",
            }} />
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
          background: "linear-gradient(135deg, #7D0806, #c0392b)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: isMobileFaq ? 13 : 16, flexShrink: 0,
        }}>
          {icon}
        </div>
        <span style={{
          flex: 1, fontWeight: 600, fontSize: isMobileFaq ? 12 : 14,
          color: "#1a0505",
          fontFamily: "var(--font-sora), sans-serif",
        }}>
          {q}
        </span>
        <span style={{
          color: open ? "var(--asta-accent)" : "#999",
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

export default function Astaxanthine() {
  const [prixAffiche, setPrixAffiche] = useState(27000);
  const [prixOriginal, setPrixOriginal] = useState(33750);
  const [selectedPack, setSelectedPack] = useState(2);
  const [mode, setMode] = useState<"unique" | "abonnement">("unique");
  const [medusaProduct, setMedusaProduct] = useState<MedusaProduct | null>(null);
  const [openFaqBottom, setOpenFaqBottom] = useState<number | null>(null);
  const sc = useScreenSize();
  const isMobile = sc === "mobile";
  const isSmall = sc === "mobile" || sc === "tablet";
  const { t } = useLocale();
  const px = isMobile ? "16px" : sc === "tablet" ? "28px" : "60px";
  const py = isMobile ? "48px" : sc === "tablet" ? "64px" : "96px";

  // Charger les données produit depuis Medusa
  useEffect(() => {
    fetchProductByHandle("astaxanthine-12mg").then(p => {
      if (p) setMedusaProduct(p);
    });
  }, []);

  // Prix dynamiques depuis Medusa (fallback hardcodé)
  const skuPriceMap: Record<string, number> = {};
  if (medusaProduct?.variants) {
    for (const v of medusaProduct.variants) {
      if (v.sku) skuPriceMap[v.sku] = getVariantPrice(v);
    }
  }

  const packs = [
    { id: 1, label: t("product.packLabel1"), desc: t("product.packDesc1"), prix: skuPriceMap["NUT-AX-1P"] || 15000, original: Math.round((skuPriceMap["NUT-AX-1P"] || 15000) * 1.25) },
    { id: 2, label: t("product.packLabel2"), desc: t("product.packDesc2"), prix: skuPriceMap["NUT-AX-2P"] || 27000, original: Math.round((skuPriceMap["NUT-AX-2P"] || 27000) * 1.25), eco: ((skuPriceMap["NUT-AX-1P"] || 15000) * 2 - (skuPriceMap["NUT-AX-2P"] || 27000)).toLocaleString("fr-FR") + " FCFA", popular: true },
    { id: 3, label: t("product.packLabel3"), desc: t("product.packDesc3"), prix: skuPriceMap["NUT-AX-3P"] || 36000, original: Math.round((skuPriceMap["NUT-AX-3P"] || 36000) * 1.25), eco: ((skuPriceMap["NUT-AX-1P"] || 15000) * 3 - (skuPriceMap["NUT-AX-3P"] || 36000)).toLocaleString("fr-FR") + " FCFA" },
  ];

  const currentPack = packs.find(p => p.id === selectedPack)!;
  const currentPrice = mode === "abonnement" ? Math.round(currentPack.prix * 0.95) : currentPack.prix;
  const originalPrice = mode === "abonnement" ? currentPack.prix : currentPack.original;
  const clientPhotos = [
    "/images/astaxanthine/Ast2.png",
    "/images/astaxanthine/Ast3.png",
    "/images/astaxanthine/Ast4.png",
    "/images/astaxanthine/Asta1.png",
    "/images/astaxanthine/Asta2.png",
    "/images/astaxanthine/Asta3.png",
  ];

  return (
    <HydrationGuard bg="var(--asta-bg)" style={{ color: "var(--asta-text)", overflowX: "hidden" }}>

      {/* BANDEAU PROMO */}
      <div style={{
        background: "#7D0806",
        color: "#fff",
        textAlign: "center",
        padding: "10px 16px",
        fontSize: isMobile ? 12 : 13,
        fontWeight: 600,
        lineHeight: 1.5,
      }}>
        {isMobile
          ? <>🎉 {t("product.promoShort")} <Countdown /></>
          : <>🎉 {t("product.promoText")} &nbsp;·&nbsp; {t("product.expiresIn")} <Countdown /></>
        }
      </div>

      {/* NAVBAR */}
      <Navbar />

      {/* HERO */}
      <section style={{
        background: "#fff",
        display: "grid",
        gridTemplateColumns: isSmall ? "1fr" : "1fr 1fr",
        minHeight: isSmall ? "auto" : 540,
        overflow: "hidden",
      }}>
        {/* Côté gauche — Image */}
        <div style={{
          position: "relative",
          background: "radial-gradient(ellipse at 50% 50%, #f7d5cf 0%, #fde8e4 40%, #fff5f3 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: isMobile ? "32px 16px" : "40px 20px",
          overflow: "hidden",
          minHeight: isSmall ? 280 : undefined,
        }}>
          {!isMobile && <div style={{
            position: "absolute",
            width: 420,
            height: 420,
            borderRadius: "50%",
            border: "1px solid rgba(125,8,6,0.06)",
            top: "50%",
            left: "50%",
            transform: "translate(-50%,-50%)",
            pointerEvents: "none",
          }} />}
          {!isMobile && <div style={{
            position: "absolute",
            width: 560,
            height: 560,
            borderRadius: "50%",
            border: "1px solid rgba(125,8,6,0.03)",
            top: "50%",
            left: "50%",
            transform: "translate(-50%,-50%)",
            pointerEvents: "none",
          }} />}
          <div style={{
            position: "absolute",
            top: isMobile ? 12 : 40, right: isMobile ? 16 : 52, zIndex: 40,
            width: isMobile ? 72 : 100, height: isMobile ? 72 : 100, borderRadius: "50%",
            background: "#fff",
            border: "3px solid var(--asta-accent)",
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 16px rgba(125,8,6,0.2)",
          }}>
            <span style={{ color: "var(--asta-accent)", fontSize: isMobile ? 20 : 28, fontWeight: 900, lineHeight: 1 }}>90</span>
            <span style={{ color: "var(--asta-accent)", fontSize: isMobile ? 8 : 11, fontWeight: 800, letterSpacing: 0.5 }}>{t("common.days")}</span>
            {!isMobile && <span style={{ color: "#888", fontSize: 7, textAlign: "center", padding: "0 6px", lineHeight: 1.3 }}>
              {t("common.satisfiedOrRefunded").split("\n").map((line: string, i: number) => <span key={i}>{i > 0 && <br />}{line}</span>)}
            </span>}
          </div>
          <div style={{
            position: "absolute",
            top: isMobile ? 12 : 40, left: isMobile ? 16 : 60, zIndex: 3,
            width: isMobile ? 64 : 90, height: isMobile ? 64 : 90, borderRadius: "50%",
            background: "#fff",
            border: "3px solid #1db954",
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
          }}>
            <span style={{ fontSize: isMobile ? 14 : 20 }}>🌿</span>
            <span style={{ color: "#1a7a3c", fontSize: isMobile ? 7 : 9, fontWeight: 800, textAlign: "center", lineHeight: 1.3, padding: "0 6px" }}>
              {t("common.natural100").split("\n").map((line: string, i: number) => <span key={i}>{i > 0 && <br />}{line}</span>)}
            </span>
          </div>
          <img
            src="/images/astaxanthine/img_transparent.png"
            alt="NUTRELIS Astaxanthine 12mg"
            style={{
              width: isMobile ? "55%" : "58%",
              maxWidth: 320,
              height: "auto",
              objectFit: "contain",
              position: "relative",
              zIndex: 2,
              filter: "drop-shadow(0 24px 48px rgba(125,8,6,0.2))",
              mixBlendMode: "normal",
            }}
          />
          <div style={{
            position: "absolute",
            bottom: isMobile ? 20 : 64,
            left: isMobile ? 16 : 52,
            zIndex: 3,
            background: "var(--asta-accent)",
            color: "#fff",
            fontWeight: 900,
            fontSize: isMobile ? 13 : 17,
            padding: isMobile ? "5px 10px" : "8px 16px",
            borderRadius: 50,
            boxShadow: "0 4px 16px rgba(125,8,6,0.4)",
          }}>
            −20%
          </div>
          <div style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 5,
            background: "linear-gradient(90deg, transparent, var(--asta-accent) 30%, var(--asta-accent) 70%, transparent)",
          }} />
        </div>

        {/* Côté droit — Texte */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: isMobile ? "28px 16px" : sc === "tablet" ? "32px 28px" : "40px 48px 40px 40px",
          background: "#fff",
          borderRadius: 24,
        }}>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 24,
            background: "#f9f9f9",
            borderRadius: 50,
            padding: "8px 18px",
            width: "fit-content",
            border: "1px solid #eee",
          }}>
            <span style={{ color: "#00b67a", fontSize: 15, letterSpacing: -1 }}>★★★★★</span>
            <span style={{ color: "#333", fontSize: 13, fontWeight: 600 }}>{t("product.rated")}</span>
            <span style={{ color: "#ccc" }}>|</span>
            <span style={{ color: "#555", fontSize: 13 }}>
              {t("product.approvedBy")}{" "}
              <strong style={{ color: "#0d0d0d" }}>12 000+</strong> {t("product.clients")}
            </span>
          </div>

          <h1 style={{
            fontSize: isMobile ? "1.6rem" : isSmall ? "2.2rem" : "clamp(2.4rem, 3.5vw, 2.9rem)",
            fontWeight: 800,
            lineHeight: 1.15,
            marginBottom: 18,
            fontFamily: "var(--font-sora), sans-serif",
            color: "#0d0d0d",
            letterSpacing: -0.5,
          }}>
            {t("product.heroTitle")}{" "}
            <span style={{ color: "var(--asta-accent)" }}>{t("product.heroHighlight")}</span>{" "}
            {t("product.heroTitleEnd")}
          </h1>

          <p style={{
            color: "#666",
            fontSize: 15,
            lineHeight: 1.75,
            marginBottom: 28,
            maxWidth: 460,
          }}>
            {t("product.heroDesc")}{" "}
            <strong style={{ color: "#0d0d0d" }}>12mg</strong>{t("product.heroDescEnd")}
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 32 }}>
            {[
              t("product.point1"),
              t("product.point2"),
              t("product.point3"),
            ].map((point, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  background: "#fdecea",
                  border: "1.5px solid var(--asta-accent)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}>
                  <span style={{ color: "var(--asta-accent)", fontSize: 11, fontWeight: 900 }}>✓</span>
                </div>
                <span style={{ color: "#444", fontSize: 14, fontWeight: 500 }}>{point}</span>
              </div>
            ))}
          </div>

          <a href="#commander" style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "var(--asta-accent)",
            color: "#fff",
            padding: isSmall ? "16px" : "19px 52px",
            borderRadius: 50,
            fontSize: isMobile ? 13 : 15,
            fontWeight: 800,
            textDecoration: "none",
            boxShadow: "0 8px 28px rgba(125,8,6,0.35)",
            letterSpacing: 0.5,
            width: isSmall ? "100%" : "fit-content",
            fontFamily: "var(--font-sora), sans-serif",
            whiteSpace: "nowrap",
          }}>
            {isMobile ? t("product.ctaOrderShort") : t("product.ctaOrder")}
          </a>

          <div style={{
            display: "flex",
            gap: 20,
            marginTop: 16,
            fontSize: 12,
            color: "#999",
            flexWrap: "wrap",
          }}>
            <span>{t("common.securePaymentIcon")}</span>
            <span>{t("common.deliveryIcon")}</span>
            <span>{t("common.guarantee90Refunded")}</span>
          </div>
        </div>
      </section>

      {/* BADGES CONFIANCE */}
      <div style={{ background: "var(--asta-accent)" }}>
        <div style={{
          maxWidth: 1280,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
        }}>
          {[
            { label: t("product.badge1"), svg: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
            { label: t("product.badge2"), svg: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
            { label: t("product.badge3"), svg: "M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064" },
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

      {/* DÉFILEMENT PHOTOS */}
      <div style={{
        padding: "44px 0",
        overflow: "hidden",
        borderBottom: "1px solid var(--asta-border)",
        background: "#fff",
      }}>
        <p style={{
          textAlign: "center",
          marginBottom: 20,
          color: "var(--asta-gold)",
          fontWeight: 700,
          fontSize: 13,
          letterSpacing: 2,
        }}>
          ★★★★★ &nbsp; {t("product.realStories")}
        </p>
        <div style={{ overflow: "hidden" }}>
          <div style={{
            display: "flex",
            gap: 16,
            animation: "scrollLeft 30s linear infinite",
            width: "max-content",
          }}>
            {[...clientPhotos, ...clientPhotos, ...clientPhotos, ...clientPhotos, ...clientPhotos].map((photo, i) => (
              <div key={i} style={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                overflow: "hidden",
                border: "3px solid #fff",
                boxShadow: "0 2px 12px rgba(125,8,6,0.15)",
                flexShrink: 0,
              }}>
                <img src={photo} alt="client"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
            ))}
          </div>
        </div>
      </div>

     {/* SECTION PRODUIT CENTRÉ */}
      <section style={{ background: "#fff", padding: isMobile ? `28px ${px}` : `${py} ${px}` }}>
        <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center" }}>
          <p style={{ color: "var(--asta-gold)", fontSize: isMobile ? 10 : 13, fontWeight: 700, letterSpacing: 2, marginBottom: isMobile ? 8 : 12 }}>
            ★★★★★ {t("product.rated")} | {t("product.approvedBy")} 12 000+ {t("product.clients")}
          </p>
          <h2 style={{ fontSize: isMobile ? "1.1rem" : isSmall ? "1.7rem" : "clamp(1.8rem, 2.5vw, 2.2rem)", fontWeight: 800, fontFamily: "var(--font-sora), sans-serif", marginBottom: isMobile ? 20 : 40 }}>
            {t("product.discoverTitle")}
          </h2>

          {/* Carte produit */}
          <div style={{
            position: "relative",
            background: "var(--asta-bg2)",
            borderRadius: isMobile ? 16 : 24,
            padding: isMobile ? "36px 16px 24px" : "48px 40px 40px",
            border: "1px solid var(--asta-border)",
            boxShadow: "0 8px 40px rgba(125,8,6,0.1)",
            overflow: "hidden",
          }}>
            {/* Ruban -70% */}
            <div style={{
              position: "absolute", top: 0, left: 0,
              width: 0, height: 0,
              borderStyle: "solid",
              borderWidth: isMobile ? "70px 70px 0 0" : "100px 100px 0 0",
              borderColor: "var(--asta-accent) transparent transparent transparent",
            }} />
            <div style={{
              position: "absolute", top: isMobile ? 13 : 20, left: isMobile ? 2 : 4,
              color: "#fff", fontWeight: 900, fontSize: isMobile ? 12 : 16,
              transform: "rotate(-45deg)",
              fontFamily: "var(--font-sora), sans-serif",
            }}>
              70% OFF
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
              src="/images/astaxanthine/img_transparent.png"
              alt="NUTRELIS Astaxanthine 12mg"
              style={{
                width: isMobile ? "50%" : "55%", maxWidth: isMobile ? 180 : 280,
                height: "auto", objectFit: "contain",
                filter: "drop-shadow(0 20px 40px rgba(125,8,6,0.2))",
                margin: isMobile ? "0 auto 20px" : "0 auto 32px",
              }}
            />

            {/* Info produit */}
            <div style={{ marginBottom: isMobile ? 14 : 20 }}>
              <p style={{ color: "var(--asta-text2)", fontSize: isMobile ? 12 : 13, marginBottom: 8 }}>
                NUTRELIS Astaxanthine 12mg — {t("product.productSubtitle")}
              </p>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: isMobile ? 8 : 12, flexWrap: "wrap" }}>
                <span style={{ color: "var(--asta-accent)", fontSize: isMobile ? 24 : 36, fontWeight: 900, fontFamily: "var(--font-sora), sans-serif" }}>
                  15 000 FCFA
                </span>
                <span style={{ color: "#aaa", fontSize: isMobile ? 14 : 18, textDecoration: "line-through" }}>
                  18 750 FCFA
                </span>
              </div>
            </div>

            {/* Badges */}
            <div style={{ display: "flex", justifyContent: "center", gap: isMobile ? 4 : 16, marginBottom: isMobile ? 20 : 28, flexWrap: isMobile ? "nowrap" : "wrap" }}>
              {[t("product.badgeVegan"), t("product.badgeGlutenFree"), t("product.badgeNatural"), t("product.badgeNonGMO")].map((b, i) => (
                <span key={i} style={{
                  background: "#fff", border: "1px solid var(--asta-border)",
                  borderRadius: 20, padding: isMobile ? "3px 6px" : "5px 14px",
                  fontSize: isMobile ? 9 : 12, color: "var(--asta-text2)", fontWeight: 600,
                  whiteSpace: "nowrap",
                }}>
                  {b}
                </span>
              ))}
            </div>

            {/* CTA */}
            <a href="#commander" style={{
              display: "block",
              background: "var(--asta-accent)", color: "#fff",
              padding: isMobile ? "14px" : "18px", borderRadius: 50,
              fontSize: isMobile ? 13 : 15, fontWeight: 900, textDecoration: "none",
              boxShadow: "0 6px 24px rgba(125,8,6,0.35)",
              fontFamily: "var(--font-sora), sans-serif",
              letterSpacing: 0.5,
              whiteSpace: "nowrap",
              textAlign: "center",
            }}>
              {isMobile ? t("product.ctaOrderShort") : t("product.ctaOrder")}
            </a>

            <p style={{ color: "#aaa", fontSize: isMobile ? 11 : 12, marginTop: isMobile ? 12 : 16 }}>
              {t("common.securePaymentIcon")} &nbsp;|&nbsp; {t("product.guarantee90Full")}
            </p>
          </div>
        </div>
      </section>

      {/* AVIS CLIENTS */}
      <section style={{ padding: `${isMobile ? "28px" : py} ${px}`, background: "var(--asta-bg)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: isMobile ? 20 : 56 }}>
            <p style={{ color: "var(--asta-gold)", fontSize: isMobile ? 10 : 12, fontWeight: 700, letterSpacing: 2, marginBottom: isMobile ? 8 : 12 }}>
              {t("product.reviewsTag")}
            </p>
            <h2 style={{ fontSize: isMobile ? "1.1rem" : isSmall ? "1.7rem" : "clamp(1.8rem, 3vw, 2.6rem)", fontWeight: 800, fontFamily: "var(--font-sora), sans-serif" }}>
              {t("product.reviewsTitle")}{" "}
              <span style={{ color: "var(--asta-accent)" }}>{t("product.reviewsHighlight")}</span>
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : sc === "tablet" ? "repeat(2, 1fr)" : "repeat(3, 1fr)", gap: isMobile ? 14 : 28 }}>
            {[
              { name: t("product.review1Name"), semaines: t("product.review1Weeks"), titre: t("product.review1Title"), text: t("product.review1Text"), img: "/images/astaxanthine/Ast2.png" },
              { name: t("product.review2Name"), semaines: t("product.review2Weeks"), titre: t("product.review2Title"), text: t("product.review2Text"), img: "/images/astaxanthine/Ast3.png" },
              { name: t("product.review3Name"), semaines: t("product.review3Weeks"), titre: t("product.review3Title"), text: t("product.review3Text"), img: "/images/astaxanthine/Ast4.png" },
            ].map((avis, i) => (
              <div key={i} style={{
                background: "#fff",
                border: "1px solid var(--asta-border)",
                borderRadius: 20,
                padding: isMobile ? 16 : 32,
                boxShadow: "0 2px 20px rgba(125,8,6,0.06)",
              }}>
                <div style={{ color: "#f5a623", fontSize: isMobile ? 14 : 18, marginBottom: isMobile ? 8 : 12 }}>★★★★★</div>
                <h3 style={{ fontSize: isMobile ? 14 : 17, fontWeight: 800, marginBottom: isMobile ? 8 : 12, fontFamily: "var(--font-sora), sans-serif" }}>
                  {avis.titre}
                </h3>
                <p style={{ color: "var(--asta-text2)", fontSize: isMobile ? 12 : 14, lineHeight: 1.7, marginBottom: isMobile ? 14 : 24, fontStyle: "italic" }}>
                  &quot;{avis.text}&quot;
                </p>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 8 : 12 }}>
                    <div style={{
                      width: isMobile ? 36 : 48,
                      height: isMobile ? 36 : 48,
                      borderRadius: "50%",
                      overflow: "hidden",
                      border: "2.5px solid var(--asta-accent)",
                      flexShrink: 0,
                    }}>
                      <img src={avis.img} alt={avis.name}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: isMobile ? 12 : 14 }}>{avis.name}</div>
                      <div style={{ color: "var(--asta-text2)", fontSize: isMobile ? 10 : 12 }}>✅ {t("product.verifiedClient")}</div>
                    </div>
                  </div>
                  <div style={{
                    background: "#fdecea",
                    color: "var(--asta-text2)",
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

      {/* POURQUOI NUTRELIS */}
      <section style={{ background: "var(--asta-accent)", padding: isMobile ? `20px ${px}` : `${py} ${px}` }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: isMobile ? 14 : 52 }}>
            <p style={{ color: "rgba(255,255,255,0.65)", fontSize: isMobile ? 9 : 12, fontWeight: 700, letterSpacing: 2, marginBottom: isMobile ? 6 : 12 }}>
              {t("product.whyTag")}
            </p>
            <h2 style={{ fontSize: isMobile ? "1rem" : isSmall ? "1.7rem" : "clamp(1.8rem, 3vw, 2.4rem)", fontWeight: 800, fontFamily: "var(--font-sora), sans-serif", color: "#fff" }}>
              {t("product.whyTitle")}
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : sc === "tablet" ? "repeat(2, 1fr)" : "repeat(4, 1fr)", gap: isMobile ? 8 : 24 }}>
            {[
              { icon: "🔬", label: t("product.whyClinical"), desc: t("product.whyClinicalDesc") },
              { icon: "🌺", label: t("product.whyHawaii"), desc: t("product.whyHawaiiDesc") },
              { icon: "🧪", label: t("product.whyLab"), desc: t("product.whyLabDesc") },
              { icon: "💊", label: t("product.whyBio"), desc: t("product.whyBioDesc") },
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
      <section style={{ padding: isMobile ? `28px ${px} 0` : `${py} ${px} 0`, background: "var(--asta-bg2)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: isMobile ? 20 : 52 }}>
            <p style={{ color: "var(--asta-gold)", fontSize: isMobile ? 10 : 12, fontWeight: 700, letterSpacing: 2, marginBottom: isMobile ? 8 : 12 }}>
              {t("product.fiveReasonsTag")}
            </p>
            <h2 style={{ fontSize: isMobile ? "1.1rem" : isSmall ? "1.7rem" : "clamp(1.8rem, 3vw, 2.4rem)", fontWeight: 800, fontFamily: "var(--font-sora), sans-serif" }}>
              {t("product.fiveReasonsTitle")}
            </h2>
          </div>
          <RaisonsSection />
        </div>
      </section>

      {/* CTA APRÈS 5 RAISONS */}
      <div style={{
        textAlign: "center",
        padding: isMobile ? `16px ${px} 28px` : `24px ${px} 60px`,
        background: "var(--asta-bg2)",
      }}>
        <a href="#commander" style={{
          display: isMobile ? "block" : "inline-block",
          background: "var(--asta-accent)",
          color: "#fff",
          padding: isMobile ? "14px 20px" : "18px 52px",
          borderRadius: 50,
          fontSize: isMobile ? 12 : 15,
          fontWeight: 900,
          textDecoration: "none",
          boxShadow: "0 6px 24px rgba(125,8,6,0.3)",
          fontFamily: "var(--font-sora), sans-serif",
          marginBottom: 16,
          whiteSpace: "nowrap",
          textAlign: "center",
        }}>
          {t("product.tryRiskFree")}
        </a>
        <p style={{ color: "var(--asta-text2)", fontSize: 13 }}>
          <span>{t("product.guarantee90Full")}</span>
        </p>
      </div>

      {/* VIDÉOS */}
      <section style={{ padding: isMobile ? `28px ${px} 0` : `${py} ${px} 0`, background: "var(--asta-bg)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: isMobile ? 20 : 56 }}>
            <p style={{ color: "var(--asta-gold)", fontSize: isMobile ? 10 : 12, fontWeight: 700, letterSpacing: 2, marginBottom: isMobile ? 8 : 12 }}>
              {t("product.videoTestimonials")}
            </p>
            <h2 style={{ fontSize: isMobile ? "1.1rem" : isSmall ? "1.7rem" : "clamp(1.8rem, 3vw, 2.4rem)", fontWeight: 800, fontFamily: "var(--font-sora), sans-serif" }}>
              {t("product.trueStoriesTitle")}{" "}
              <span style={{ color: "var(--asta-accent)" }}>{t("product.trueStoriesHighlight")}</span>
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : sc === "tablet" ? "repeat(2, 1fr)" : "repeat(4, 1fr)", gap: isMobile ? 10 : 20 }}>
            {[
              { name: "VINCENT", file: "video1.mp4" },
              { name: "CHRISTIAN", file: "video2.mp4" },
              { name: "MIRIANNE", file: "video3.mp4" },
              { name: "ALEX", file: "video4.mp4" },
            ].map((v, i) => (
              <div key={i} data-video-card style={{
                borderRadius: isMobile ? 12 : 20,
                overflow: "hidden",
                border: "1px solid var(--asta-border)",
                background: "#fff",
                boxShadow: "0 2px 16px rgba(125,8,6,0.06)",
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
                    style={{ width: "100%", display: "block", maxHeight: isMobile ? 200 : 400, objectFit: "cover", background: "#000" }}
                  >
                    <source src={`/videos/${v.file}`} type="video/mp4" />
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
                        background: "var(--asta-accent)",
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
                      background: "#fdecea",
                      color: "var(--asta-accent)",
                      fontSize: isMobile ? 7 : 10,
                      fontWeight: 700,
                      letterSpacing: isMobile ? 0.5 : 1,
                      padding: isMobile ? "2px 6px" : "3px 10px",
                      borderRadius: 10,
                    }}>
                      {t("product.clientVerified")}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA APRÈS VIDÉOS */}
      <div style={{
        textAlign: "center",
        padding: isMobile ? `16px ${px} 28px` : `24px ${px} 40px`,
        background: "var(--asta-bg)",
      }}>
        <a href="#commander" style={{
          display: isMobile ? "block" : "inline-block",
          background: "var(--asta-accent)",
          color: "#fff",
          padding: isMobile ? "14px 20px" : "18px 52px",
          borderRadius: 50,
          fontSize: isMobile ? 12 : 15,
          fontWeight: 900,
          textDecoration: "none",
          boxShadow: "0 6px 24px rgba(125,8,6,0.3)",
          fontFamily: "var(--font-sora), sans-serif",
          marginBottom: 16,
          whiteSpace: "nowrap",
          textAlign: "center",
        }}>
          {t("product.tryRiskFree")}
        </a>
        <p style={{ color: "var(--asta-text2)", fontSize: 13 }}>
          <span>{t("product.guarantee90Full")}</span>
        </p>
      </div>

     {/* PROBLÈME → SOLUTION */}
      <section style={{
        background: "linear-gradient(135deg, #7D0806 0%, #a01010 40%, #d4817e 80%, #f5e8e5 100%)",
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
              {t("product.cellProtection")}
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
            {t("product.tiredToEnergized")}
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
              background: "rgba(80,0,0,0.5)",
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
                {t("product.yourProblem")}
              </p>
              {[
                t("product.problem1"),
                t("product.problem2"),
                t("product.problem3"),
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
                color: "var(--asta-accent)",
                fontSize: isMobile ? 11 : 13,
                fontWeight: 800,
                letterSpacing: 1.5,
                marginBottom: isMobile ? 10 : 20,
              }}>
                {t("product.ourSolution")}
              </p>
              {[
                t("product.solution1"),
                t("product.solution2"),
                t("product.solution3"),
              ].map((s, i) => (
                <div key={i} style={{
                  display: "flex",
                  alignItems: "center",
                  gap: isMobile ? 8 : 12,
                  padding: isMobile ? "6px 0" : "10px 0",
                  borderBottom: i < 2 ? "1px solid var(--asta-border)" : "none",
                }}>
                  <span style={{ color: "#1db954", fontSize: 16, flexShrink: 0 }}>✓</span>
                  <span style={{ color: "var(--asta-text)", fontSize: 15, fontWeight: 500 }}>{s}</span>
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
              color: "var(--asta-accent)",
            }}>
              {t("product.from2Months")}
            </div>
            <img
              src="/images/astaxanthine/Rajeu-Photo-1.png"
              alt="Transformation NUTRELIS"
              style={{
                maxWidth: isMobile ? 300 : 600,
                width: "100%",
                display: "block",
                margin: "0 auto",
                objectFit: "contain",
              }}
            />
          </div>
        </div>
      </section>

      {/* STATS */}
      <section style={{ padding: isMobile ? `28px ${px}` : `${py} ${px}`, background: "#fff" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: isMobile ? 20 : 52 }}>
            <p style={{ color: "var(--asta-gold)", fontSize: isMobile ? 10 : 12, fontWeight: 700, letterSpacing: 2, marginBottom: isMobile ? 8 : 12 }}>
              {t("product.statsTag")}
            </p>
            <h2 style={{ fontSize: isMobile ? "1.1rem" : isSmall ? "1.7rem" : "clamp(1.8rem, 3vw, 2.4rem)", fontWeight: 800, fontFamily: "var(--font-sora), sans-serif", marginBottom: isMobile ? 8 : 16 }}>
              {t("product.statsTitle")}
            </h2>
            <p style={{ color: "var(--asta-text2)", fontSize: isMobile ? 12 : 15 }}>
              {t("product.statsDesc")}
            </p>
          </div>
          <StatsSection />
        </div>
      </section>

     {/* NUTRELIS VS AUTRES */}
      <section style={{
        background: "linear-gradient(135deg, #7D0806 0%, #a01010 40%, #d4817e 80%, #f5e8e5 100%)",
        padding: isMobile ? `28px ${px}` : `${py} ${px}`,
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: isSmall ? "1fr" : "1fr 1fr", gap: isSmall ? (isMobile ? 20 : 40) : 80, alignItems: "center" }}>

          {/* Gauche — comparaison */}
          <div>

            {/* Image produit centrée */}
            <div style={{ textAlign: "center", marginBottom: isMobile ? 8 : 16 }}>
              <img
                src="/images/astaxanthine/img_transparent.png"
                alt="NUTRELIS"
                style={{
                  width: isMobile ? 30 : 45,
                  height: "auto",
                  objectFit: "contain",
                  filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.2))",
                }}
              />
            </div>

            {/* Tableau comparatif */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: isMobile ? 8 : 16 }}>
              {/* NUTRELIS */}
              <div style={{
                background: "rgba(80,0,0,0.6)",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: isMobile ? 10 : 14,
                padding: isMobile ? "14px 12px" : "32px 20px",
              }}>
                <p style={{ color: "#fff", fontWeight: 800, fontSize: isMobile ? 12 : 15, textAlign: "center", marginBottom: isMobile ? 10 : 20, letterSpacing: 1 }}>
                  NUTRELIS
                </p>
                {[t("product.nutrelisPremium"), t("product.nutrelisVegan")].map((item, i) => (
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
                <p style={{ color: "var(--asta-text)", fontWeight: 800, fontSize: isMobile ? 12 : 15, textAlign: "center", marginBottom: isMobile ? 10 : 20, letterSpacing: 1 }}>
                  {t("product.otherBrands")}
                </p>
                {[t("product.otherAbsorption"), t("product.otherAdditives")].map((item, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: isMobile ? 6 : 10, padding: isMobile ? "5px 0" : "8px 0", borderBottom: i < 1 ? "1px solid var(--asta-border)" : "none" }}>
                    <span style={{ color: "#e53e3e", fontSize: isMobile ? 13 : 16, flexShrink: 0 }}>✗</span>
                    <span style={{ color: "var(--asta-text2)", fontSize: isMobile ? 10 : 13 }}>{item}</span>
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
              <span style={{ color: "#fff" }}> {t("product.nutrelisVsOthers")}</span>
            </h2>

            <div style={{ marginBottom: isMobile ? 20 : 40 }}>
              {[
                t("product.vsClean"),
                t("product.vsResults"),
                t("product.vsDurable"),
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
              {t("product.tryRiskFree")}
            </a>
            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: isMobile ? 11 : 13 }}>
              <span>{t("product.guarantee90Full")}</span>
            </p>
          </div>
        </div>
      </section>

      {/* COMMANDER */}
      <section id="commander" style={{ padding: isMobile ? `28px ${px}` : `${py} ${px}`, background: "var(--asta-bg)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: isMobile ? 20 : 52 }}>
            <p style={{ color: "var(--asta-gold)", fontSize: isMobile ? 10 : 12, fontWeight: 700, letterSpacing: 2, marginBottom: isMobile ? 8 : 12 }}>
              {t("product.orderNow")}
            </p>
            <h2 style={{ fontSize: isMobile ? "1.1rem" : isSmall ? "1.7rem" : "clamp(1.8rem, 3vw, 2.6rem)", fontWeight: 800, fontFamily: "var(--font-sora), sans-serif", marginBottom: isMobile ? 8 : 12 }}>
              {t("product.chooseFormula")}
            </h2>
            <p style={{ color: "var(--asta-text2)", fontSize: isMobile ? 12 : 15 }}>
              {t("product.chooseFormulaDesc")}
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
                <span style={{ color: "#f5a623", fontSize: 16 }}>★★★★★</span>
                <span style={{ color: "var(--asta-text2)", fontSize: 13 }}>4.9/5 · 6 000+ {t("product.satisfiedClients")}</span>
              </div>

              {/* Titre produit */}
              <h3 style={{ fontFamily: "var(--font-sora), sans-serif", fontWeight: 800, fontSize: 20, marginBottom: 8, lineHeight: 1.3 }}>
                NUTRELIS ASTAXANTHINE 12mg — {t("product.antiAgeComplex")}
              </h3>

              {/* Prix */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                <span style={{ color: "var(--asta-text2)", fontSize: 15, textDecoration: "line-through" }}>
                  {prixOriginal.toLocaleString("fr-FR")} FCFA
                </span>
                <span style={{ color: "var(--asta-accent)", fontSize: 26, fontWeight: 900, fontFamily: "var(--font-sora), sans-serif" }}>
                  {prixAffiche.toLocaleString("fr-FR")} FCFA
                </span>
              </div>

              {/* Description courte */}
              <p style={{ color: "var(--asta-text2)", fontSize: 14, lineHeight: 1.7, marginBottom: 20, borderLeft: "3px solid var(--asta-accent)", paddingLeft: 12 }}>
                {t("product.productLongDesc")}
              </p>

              {/* Bénéfices */}
              <div style={{ marginBottom: 24 }}>
                <p style={{ fontWeight: 700, fontSize: 13, letterSpacing: 1, marginBottom: 12, color: "var(--asta-text)" }}>
                  {t("product.chooseYourPack")}
                </p>
              </div>

              {/* Pack Selector */}
             <PackSelector medusaProduct={medusaProduct} onPackChange={(prix, original) => {
                setPrixAffiche(prix);
                setPrixOriginal(original);
              }} />

              {/* Bénéfices liste */}
              <div style={{ marginTop: 24, padding: "16px 20px", background: "var(--asta-bg2)", borderRadius: 12, border: "1px solid var(--asta-border)" }}>
                <p style={{ fontSize: 13, color: "var(--asta-text2)", marginBottom: 12, fontWeight: 600 }}>
                  {t("product.benefitIntro")}
                </p>
                {[
                  t("product.benefit1"),
                  t("product.benefit2"),
                  t("product.benefit3"),
                  t("product.benefit4"),
                  t("product.benefit5"),
                ].map((b, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 8 }}>
                    <span style={{ color: "#1db954", fontSize: 14, flexShrink: 0, marginTop: 2 }}>✓</span>
                    <span style={{ color: "var(--asta-text2)", fontSize: 13 }}>{b}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION MÉDECIN — TIMELINE */}
      <section style={{
        background: "linear-gradient(135deg, #fff8f6 0%, #fdecea 50%, #fff8f6 100%)",
        padding: isMobile ? `28px ${px}` : `${py} ${px}`,
        overflow: "hidden",
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: isSmall ? "1fr" : "1fr 1fr", gap: isSmall ? 20 : 80, alignItems: "center" }}>

          {/* Image médecin */}
          <div style={{ position: "relative" }}>
            <div style={{
              position: "absolute", inset: 0,
              background: "radial-gradient(ellipse at 60% 50%, #fde8e4 0%, transparent 70%)",
              borderRadius: 24,
            }} />
            <img
              src="/images/astaxanthine/Medecin.png"
              alt={t("product.altDoctor")}
              style={{
                width: isMobile ? "70%" : "100%", height: "auto",
                objectFit: "contain",
                position: "relative", zIndex: 1,
                filter: "drop-shadow(0 20px 40px rgba(125,8,6,0.15))",
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
                background: "var(--asta-accent)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: isMobile ? 16 : 22, flexShrink: 0,
                boxShadow: "0 4px 16px rgba(125,8,6,0.3)",
              }}>
                🌿
              </div>
              <h2 style={{
                fontFamily: "var(--font-sora), sans-serif",
                fontSize: isMobile ? "1.1rem" : isSmall ? "1.4rem" : "clamp(1.4rem, 2vw, 1.8rem)",
                fontWeight: 800, color: "var(--asta-accent)",
                lineHeight: 1.3,
              }}>
                {t("product.timelineTitle")}
              </h2>
            </div>

            {/* Items timeline */}
            <div style={{ display: "flex", flexDirection: "column", gap: isMobile ? 8 : 12 }}>
              {[
                {
                  icon: "✨",
                  bg: "#7D0806",
                  titre: t("product.timeline1Title"),
                  desc: t("product.timeline1Desc"),
                },
                {
                  icon: "🔥",
                  bg: "#c0392b",
                  titre: t("product.timeline2Title"),
                  desc: t("product.timeline2Desc"),
                },
                {
                  icon: "💎",
                  bg: "#922b21",
                  titre: t("product.timeline3Title"),
                  desc: t("product.timeline3Desc"),
                },
                {
                  icon: "🛡️",
                  bg: "#7D0806",
                  titre: t("product.timeline4Title"),
                  desc: t("product.timeline4Desc"),
                },
                {
                  icon: "⚡",
                  bg: "#c0392b",
                  titre: t("product.timeline5Title"),
                  desc: t("product.timeline5Desc"),
                },
                {
                  icon: "👁️",
                  bg: "#922b21",
                  titre: t("product.timeline6Title"),
                  desc: t("product.timeline6Desc"),
                },
              ].map((item, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: isMobile ? 10 : 16,
                  background: "#fff",
                  borderRadius: 14,
                  padding: isMobile ? "10px 12px" : "14px 20px",
                  border: "1px solid var(--asta-border)",
                  boxShadow: "0 2px 12px rgba(125,8,6,0.06)",
                  transition: "all 0.2s",
                }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = "translateX(6px)";
                    e.currentTarget.style.boxShadow = "0 4px 20px rgba(125,8,6,0.12)";
                    e.currentTarget.style.borderColor = "var(--asta-accent)";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = "translateX(0)";
                    e.currentTarget.style.boxShadow = "0 2px 12px rgba(125,8,6,0.06)";
                    e.currentTarget.style.borderColor = "var(--asta-border)";
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
                      color: "var(--asta-accent)",
                      letterSpacing: 0.5, marginBottom: 2,
                      fontFamily: "var(--font-sora), sans-serif",
                    }}>
                      {item.titre}
                    </p>
                    <p style={{ color: "var(--asta-text2)", fontSize: isMobile ? 10 : 12, lineHeight: 1.5 }}>
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
              src="/images/astaxanthine/261-Converti-1.png"
              alt={t("product.altGuarantee")}
              style={{ width: isMobile ? 100 : 200, height: "auto", marginBottom: isMobile ? 10 : 20, display: "block", margin: isMobile ? "0 auto 10px" : "0 auto 20px" }}
            />
            <p style={{ color: "var(--asta-accent)", fontSize: isMobile ? 10 : 12, fontWeight: 700, letterSpacing: 2, marginBottom: isMobile ? 8 : 12 }}>
              {t("product.feelDifference")}
            </p>
            <h2 style={{
              fontFamily: "var(--font-sora), sans-serif",
              fontSize: isMobile ? "1.1rem" : isSmall ? "1.7rem" : "2rem", fontWeight: 800, marginBottom: isMobile ? 10 : 20,
            }}>
              {t("product.guarantee")}
            </h2>
            <p style={{
              color: "var(--asta-text2)", fontSize: isMobile ? 12 : 15,
              lineHeight: 1.7, maxWidth: 400, margin: isMobile ? "0 auto 20px" : "0 auto 32px",
            }}>
              {t("product.guaranteeDesc")}
            </p>
            <a href="#commander" style={{
              display: isMobile ? "block" : "inline-block",
              background: "var(--asta-accent)", color: "#fff",
              padding: isMobile ? "14px 20px" : "18px 48px", borderRadius: 50,
              fontSize: isMobile ? 12 : 15, fontWeight: 900, textDecoration: "none",
              boxShadow: "0 6px 24px rgba(125,8,6,0.3)",
              fontFamily: "var(--font-sora), sans-serif",
              marginBottom: 24,
              whiteSpace: "nowrap",
              textAlign: "center",
            }}>
              {t("product.tryRiskFree")}
            </a>
            <p style={{ color: "var(--asta-text2)", fontSize: 13 }}>
              <span>{t("product.guarantee90Full")}</span>
            </p>
          </div>

          {/* Droite — image femme avec badge */}
          <div style={{ position: "relative" }}>
            <img
              src="/images/astaxanthine/BadgesA.png"
              alt={t("product.altResults")}
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
      <section style={{
        background: "var(--asta-accent)",
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
              {t("product.faqTitle")}
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: isSmall ? "1fr" : "1fr 1fr", gap: isMobile ? 8 : 16 }}>
            {[
              {
                icon: "🌿",
                q: t("product.faq1Q"),
                a: t("product.faq1A"),
              },
              {
                icon: "👁️",
                q: t("product.faq2Q"),
                a: t("product.faq2A"),
              },
              {
                icon: "✨",
                q: t("product.faq3Q"),
                a: t("product.faq3A"),
              },
              {
                icon: "🌸",
                q: t("product.faq4Q"),
                a: t("product.faq4A"),
              },
              {
                icon: "☀️",
                q: t("product.faq5Q"),
                a: t("product.faq5A"),
              },
              {
                icon: "💊",
                q: t("product.faq6Q"),
                a: t("product.faq6A"),
              },
              {
                icon: "🔬",
                q: t("product.faq7Q"),
                a: t("product.faq7A"),
              },
              {
                icon: "📦",
                q: t("product.faq8Q"),
                a: t("product.faq8A"),
              },
            ].map((faq, i) => (
              <FaqItemWhite key={i} icon={faq.icon} q={faq.q} a={faq.a} open={openFaqBottom === i} onToggle={() => setOpenFaqBottom(openFaqBottom === i ? null : i)} />
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: "#1a0505", padding: `64px ${px} 32px` }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : sc === "tablet" ? "1fr 1fr 1fr" : "2fr 1fr 1fr 1fr", gap: isMobile ? 24 : 48, marginBottom: 48 }}>
            <div>
              <div style={{ marginBottom: 20 }}>
                <a href="/">
                  <img src="/images/logo-homepage.png" alt="Nutrelis" style={{ height: isMobile ? 26 : 36, width: "auto" }} />
                </a>
              </div>
              <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.8, marginBottom: 24, maxWidth: 280 }}>
                {t("product.footerDesc")}
              </p>
            </div>
            {[
              { title: t("product.footerProducts"), links: [
                { label: "Astaxanthine 12mg", href: "/produits/astaxanthine-12mg" },
                { label: t("product.footerAllProducts"), href: "/produits/astaxanthine-12mg" },
                { label: t("product.footerSubscriptions"), href: "/produits/astaxanthine-12mg" },
                { label: t("product.footerSpecialOffers"), href: "/produits/astaxanthine-12mg" },
              ]},
              { title: t("product.footerInfo"), links: [
                { label: t("product.footerAbout"), href: "/a-propos" },
                { label: t("product.footerScience"), href: "/science" },
                { label: t("product.footerBlog"), href: "/blog" },
                { label: t("product.footerContact"), href: "/contact" },
              ]},
              { title: t("product.footerService"), links: [
                { label: t("product.footerFaq"), href: "/faq" },
                { label: t("product.footerShipping"), href: "/livraison" },
                { label: t("product.footerRefunds"), href: "/retours" },
                { label: t("product.footerTerms"), href: "/cgv" },
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
              {t("product.footerRights")}
            </p>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: isMobile ? 11 : 13 }}>
              {t("product.footerDelivery")}
            </p>
          </div>
        </div>
      </footer>

      <FloatingActions accent="#7D0806" />
    </HydrationGuard>
  );
}