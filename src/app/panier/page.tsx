"use client";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useScreenSize } from "@/hooks/useIsMobile";
import { useLocale } from "@/context/LocaleContext";

export default function Panier() {
  const { items, totalItems, totalPrix, supprimerArticle, modifierQuantite, viderPanier } = useCart();
  const sc = useScreenSize();
  const isMobile = sc === "mobile";
  const isSmall = sc === "mobile" || sc === "tablet";
  const { t } = useLocale();
  const px = isMobile ? "16px" : sc === "tablet" ? "28px" : "60px";

  return (
    <div style={{ background: "#fff", color: "#1a1a1a", minHeight: "100vh" }}>

      {/* NAVBAR */}
      <nav style={{ background: "#060f08", borderBottom: "1px solid #1a3522", padding: `0 ${px}`, height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", color: "#060f08", fontWeight: 900, fontSize: 15 }}>N</div>
          <span style={{ fontFamily: "var(--font-sora), sans-serif", fontWeight: 800, fontSize: isMobile ? 16 : 20, letterSpacing: 3, color: "#f0fff4" }}>NUTRELIS</span>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link href="/produits/astaxanthine-12mg" style={{ color: "rgba(255,255,255,0.65)", fontSize: isMobile ? 12 : 14, textDecoration: "none" }}>
            ← {isMobile ? t("nav.products") : t("cart.continueShopping")}
          </Link>
        </div>
      </nav>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: `40px ${px}` }}>
        <h1 style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: isMobile ? "1.5rem" : "2rem", fontWeight: 900, marginBottom: 8 }}>
          {t("cart.title")}
        </h1>
        <p style={{ color: "#888", fontSize: 15, marginBottom: 36 }}>
          {totalItems === 0 ? t("cart.empty") : `${totalItems} ${totalItems > 1 ? t("cart.itemsPlural") : t("cart.items")}`}
        </p>

        {items.length === 0 ? (

          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <div style={{ fontSize: 64, marginBottom: 24 }}>🛒</div>
            <h2 style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: "1.4rem", fontWeight: 800, marginBottom: 12 }}>
              {t("cart.empty")}
            </h2>
            <p style={{ color: "#888", fontSize: 15, marginBottom: 36 }}>
              {t("cart.emptyDesc")}
            </p>
            <Link href="/produits/astaxanthine-12mg" style={{ background: "#7D0806", color: "#fff", padding: "16px 40px", borderRadius: 10, fontSize: 15, fontWeight: 800, textDecoration: "none" }}>
              {t("cart.seeProducts")}
            </Link>
          </div>

        ) : (

          <div style={{ display: "grid", gridTemplateColumns: isSmall ? "1fr" : "1fr 380px", gap: isSmall ? 32 : 48, alignItems: "start" }}>

            {/* LISTE ARTICLES */}
            <div>
              {items.map((item, i) => (
                <div key={item.id} style={{
                  display: "grid",
                  gridTemplateColumns: isMobile ? "64px 1fr" : "80px 1fr auto",
                  gap: isMobile ? 16 : 24,
                  padding: "24px 0",
                  borderBottom: i < items.length - 1 ? "1px solid #eee" : "none",
                  alignItems: "start",
                }}>
                  <div style={{ width: isMobile ? 64 : 80, height: isMobile ? 64 : 80, borderRadius: 12, overflow: "hidden", background: "#fdf5f3", border: "1px solid #eee", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <img src={item.image} alt={item.nom} style={{ width: "100%", height: "100%", objectFit: "contain", padding: 6 }} />
                  </div>

                  <div style={{ gridColumn: isMobile ? "2" : "2" }}>
                    <div style={{ fontWeight: 800, fontSize: isMobile ? 14 : 15, marginBottom: 4 }}>{item.nom}</div>
                    <div style={{ color: "#888", fontSize: 13, marginBottom: 8 }}>{item.description}</div>
                    {item.mode === "abonnement" && (
                      <span style={{ background: "#e8f5eb", color: "var(--accent)", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20 }}>
                        ⭐ {t("cart.monthlySubscription")}
                      </span>
                    )}
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
                      <button onClick={() => modifierQuantite(item.id, item.quantite - 1)} style={{ width: 28, height: 28, borderRadius: "50%", border: "1.5px solid #ddd", background: "#fff", cursor: "pointer", fontSize: 16, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
                      <span style={{ fontWeight: 700, fontSize: 15, minWidth: 20, textAlign: "center" }}>{item.quantite}</span>
                      <button onClick={() => modifierQuantite(item.id, item.quantite + 1)} style={{ width: 28, height: 28, borderRadius: "50%", border: "1.5px solid #ddd", background: "#fff", cursor: "pointer", fontSize: 16, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
                      <button onClick={() => supprimerArticle(item.id)} style={{ color: "#e53e3e", fontSize: 12, fontWeight: 600, background: "none", border: "none", cursor: "pointer", marginLeft: 4 }}>
                        {t("cart.remove")}
                      </button>
                    </div>
                    {isMobile && (
                      <div style={{ marginTop: 12 }}>
                        <div style={{ fontWeight: 900, fontSize: 16, color: "#7D0806" }}>
                          {(item.prix * item.quantite).toLocaleString()} {t("common.currency")}
                        </div>
                        {item.prixOriginal > item.prix && (
                          <div style={{ color: "#aaa", fontSize: 12, textDecoration: "line-through" }}>
                            {(item.prixOriginal * item.quantite).toLocaleString()} {t("common.currency")}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {!isMobile && (
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontWeight: 900, fontSize: 18, color: "#7D0806" }}>
                        {(item.prix * item.quantite).toLocaleString()} {t("common.currency")}
                      </div>
                      {item.prixOriginal > item.prix && (
                        <div style={{ color: "#aaa", fontSize: 13, textDecoration: "line-through" }}>
                          {(item.prixOriginal * item.quantite).toLocaleString()} {t("common.currency")}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}

              <button onClick={viderPanier} style={{ marginTop: 16, color: "#aaa", fontSize: 13, background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>
                {t("cart.clearCart")}
              </button>
            </div>

            {/* RÉSUMÉ COMMANDE */}
            <div style={{ background: "#f8f9fa", borderRadius: 20, padding: "28px", border: "1px solid #eee", position: isSmall ? "relative" : "sticky", top: isSmall ? 0 : 80 }}>
              <h2 style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: "1.2rem", fontWeight: 800, marginBottom: 24 }}>
                {t("cart.orderSummary")}
              </h2>

              <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: "#555" }}>
                  <span>{t("cart.subtotal")}</span>
                  <span>{totalPrix.toLocaleString()} {t("common.currency")}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: "#555" }}>
                  <span>{t("cart.shipping")}</span>
                  <span style={{ color: "var(--accent)", fontWeight: 700 }}>{t("common.freeShipping")}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: "#555" }}>
                  <span>{t("common.guarantee90")}</span>
                  <span>90j ✅</span>
                </div>
              </div>

              <div style={{ borderTop: "1px solid #e0e0e0", paddingTop: 20, marginBottom: 28 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontWeight: 800, fontSize: 16 }}>{t("cart.total")}</span>
                  <span style={{ fontWeight: 900, fontSize: 22, color: "#7D0806" }}>
                    {totalPrix.toLocaleString()} {t("common.currency")}
                  </span>
                </div>
              </div>

              <Link href="/checkout" style={{
                display: "block", textAlign: "center",
                background: "#7D0806", color: "#fff",
                padding: "18px", borderRadius: 12,
                fontSize: 16, fontWeight: 900, textDecoration: "none",
                fontFamily: "var(--font-sora), sans-serif",
                boxShadow: "0 6px 24px rgba(125,8,6,0.3)",
                marginBottom: 14,
              }}>
                {t("cart.placeOrder")}
              </Link>

              <Link href="/produits/astaxanthine-12mg" style={{ display: "block", textAlign: "center", color: "#888", fontSize: 13, textDecoration: "none" }}>
                ← {t("cart.continueShopping")}
              </Link>

              <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 8 }}>
                {[`🔒 ${t("common.securePayment")}`, `📦 ${t("common.delivery")}`, `↩️ ${t("common.guarantee90")}`].map((b, i) => (
                  <div key={i} style={{ fontSize: 12, color: "#888" }}>{b}</div>
                ))}
              </div>
            </div>

          </div>
        )}
      </div>

      <footer style={{ background: "#060f08", padding: `32px ${px}`, marginTop: 80 }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", flexDirection: isMobile ? "column" : "row", justifyContent: "space-between", alignItems: isMobile ? "flex-start" : "center", gap: isMobile ? 16 : 0 }}>
          <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>{t("home.footerRights")}</span>
          <div style={{ display: "flex", gap: 24 }}>
            {[{ label: t("nav.faq"), href: "/faq" }, { label: t("common.delivery"), href: "/livraison" }, { label: "Contact", href: "/contact" }].map(l => (
              <Link key={l.label} href={l.href} style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, textDecoration: "none" }}>{l.label}</Link>
            ))}
          </div>
        </div>
      </footer>

    </div>
  );
}
