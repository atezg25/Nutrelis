"use client";
import Link from "next/link";
import { useCart } from "@/context/CartContext";

export default function Panier() {
  const { items, totalItems, totalPrix, supprimerArticle, modifierQuantite, viderPanier } = useCart();

  return (
    <div style={{ background: "#fff", color: "#1a1a1a", minHeight: "100vh" }}>

      {/* NAVBAR */}
      <nav style={{ background: "#060f08", borderBottom: "1px solid #1a3522", padding: "0 60px", height: 68, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", color: "#060f08", fontWeight: 900, fontSize: 16 }}>N</div>
          <span style={{ fontFamily: "var(--font-sora), sans-serif", fontWeight: 800, fontSize: 20, letterSpacing: 3, color: "#f0fff4" }}>NUTRELIS</span>
        </Link>
        <Link href="/produits/astaxanthine-12mg" style={{ color: "rgba(255,255,255,0.65)", fontSize: 14, textDecoration: "none" }}>
          ← Continuer mes achats
        </Link>
      </nav>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "60px" }}>
        <h1 style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: "2rem", fontWeight: 900, marginBottom: 8 }}>
          Mon panier
        </h1>
        <p style={{ color: "#888", fontSize: 15, marginBottom: 48 }}>
          {totalItems === 0 ? "Votre panier est vide" : `${totalItems} article${totalItems > 1 ? "s" : ""}`}
        </p>

        {items.length === 0 ? (

          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <div style={{ fontSize: 64, marginBottom: 24 }}>🛒</div>
            <h2 style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: "1.4rem", fontWeight: 800, marginBottom: 12 }}>
              Votre panier est vide
            </h2>
            <p style={{ color: "#888", fontSize: 15, marginBottom: 36 }}>
              Découvrez nos produits et commencez votre transformation
            </p>
            <Link href="/produits/astaxanthine-12mg" style={{ background: "#7D0806", color: "#fff", padding: "16px 40px", borderRadius: 10, fontSize: 15, fontWeight: 800, textDecoration: "none" }}>
              Voir nos produits →
            </Link>
          </div>

        ) : (

          <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 48, alignItems: "start" }}>

            {/* LISTE ARTICLES */}
            <div>
              {items.map((item, i) => (
                <div key={item.id} style={{
                  display: "grid",
                  gridTemplateColumns: "80px 1fr auto",
                  gap: 24,
                  padding: "28px 0",
                  borderBottom: i < items.length - 1 ? "1px solid #eee" : "none",
                  alignItems: "center",
                }}>
                  <div style={{ width: 80, height: 80, borderRadius: 12, overflow: "hidden", background: "#fdf5f3", border: "1px solid #eee", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <img src={item.image} alt={item.nom} style={{ width: "100%", height: "100%", objectFit: "contain", padding: 6 }} />
                  </div>

                  <div>
                    <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 4 }}>{item.nom}</div>
                    <div style={{ color: "#888", fontSize: 13, marginBottom: 8 }}>{item.description}</div>
                    {item.mode === "abonnement" && (
                      <span style={{ background: "#e8f5eb", color: "var(--accent)", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20 }}>
                        ⭐ Abonnement mensuel −15%
                      </span>
                    )}
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 12 }}>
                      <button onClick={() => modifierQuantite(item.id, item.quantite - 1)} style={{ width: 28, height: 28, borderRadius: "50%", border: "1.5px solid #ddd", background: "#fff", cursor: "pointer", fontSize: 16, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
                      <span style={{ fontWeight: 700, fontSize: 15, minWidth: 20, textAlign: "center" }}>{item.quantite}</span>
                      <button onClick={() => modifierQuantite(item.id, item.quantite + 1)} style={{ width: 28, height: 28, borderRadius: "50%", border: "1.5px solid #ddd", background: "#fff", cursor: "pointer", fontSize: 16, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
                      <button onClick={() => supprimerArticle(item.id)} style={{ color: "#e53e3e", fontSize: 12, fontWeight: 600, background: "none", border: "none", cursor: "pointer", marginLeft: 8 }}>
                        Supprimer
                      </button>
                    </div>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontWeight: 900, fontSize: 18, color: "#7D0806" }}>
                      {(item.prix * item.quantite).toLocaleString()} FCFA
                    </div>
                    {item.prixOriginal > item.prix && (
                      <div style={{ color: "#aaa", fontSize: 13, textDecoration: "line-through" }}>
                        {(item.prixOriginal * item.quantite).toLocaleString()} FCFA
                      </div>
                    )}
                  </div>
                </div>
              ))}

              <button onClick={viderPanier} style={{ marginTop: 16, color: "#aaa", fontSize: 13, background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>
                Vider le panier
              </button>
            </div>

            {/* RÉSUMÉ COMMANDE */}
            <div style={{ background: "#f8f9fa", borderRadius: 20, padding: "32px", border: "1px solid #eee", position: "sticky", top: 88 }}>
              <h2 style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: "1.2rem", fontWeight: 800, marginBottom: 24 }}>
                Résumé de la commande
              </h2>

              <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: "#555" }}>
                  <span>Sous-total</span>
                  <span>{totalPrix.toLocaleString()} FCFA</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: "#555" }}>
                  <span>Livraison</span>
                  <span style={{ color: "var(--accent)", fontWeight: 700 }}>GRATUITE</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: "#555" }}>
                  <span>Garantie</span>
                  <span>90 jours ✅</span>
                </div>
              </div>

              <div style={{ borderTop: "1px solid #e0e0e0", paddingTop: 20, marginBottom: 28 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontWeight: 800, fontSize: 16 }}>Total</span>
                  <span style={{ fontWeight: 900, fontSize: 22, color: "#7D0806" }}>
                    {totalPrix.toLocaleString()} FCFA
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
                Passer la commande →
              </Link>

              <Link href="/produits/astaxanthine-12mg" style={{ display: "block", textAlign: "center", color: "#888", fontSize: 13, textDecoration: "none" }}>
                ← Continuer mes achats
              </Link>

              <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 8 }}>
                {["🔒 Paiement 100% sécurisé", "📦 Livraison ATEZ Express", "↩️ Remboursé si insatisfait"].map((b, i) => (
                  <div key={i} style={{ fontSize: 12, color: "#888" }}>{b}</div>
                ))}
              </div>
            </div>

          </div>
        )}
      </div>

      <footer style={{ background: "#060f08", padding: "32px 60px", marginTop: 80 }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>© 2026 NUTRELIS</span>
          <div style={{ display: "flex", gap: 24 }}>
            {[{ label: "FAQ", href: "/faq" }, { label: "Livraison", href: "/livraison" }, { label: "Contact", href: "/contact" }].map(l => (
              <Link key={l.label} href={l.href} style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, textDecoration: "none" }}>{l.label}</Link>
            ))}
          </div>
        </div>
      </footer>

    </div>
  );
}