"use client";
import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useLocale } from "@/context/LocaleContext";
import { fetchProductByHandle, getVariantPrice, type MedusaProduct } from "@/lib/medusa-products";

/**
 * Page d'un produit ajouté depuis l'administration (tout produit autre que l'Astaxanthine, qui a sa page dédiée).
 * Les packs, les prix et la disponibilité viennent de la base : rien n'est écrit ici.
 */
export default function PageProduit({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { locale } = useLocale();
  const fr = locale === "fr";
  const { ajouterArticle } = useCart();
  const [produit, setProduit] = useState<MedusaProduct | null | undefined>(undefined);
  const [message, setMessage] = useState("");

  useEffect(() => {
    void fetchProductByHandle(slug).then(setProduit);
  }, [slug]);

  if (produit === undefined) return <p style={{ padding: 40, textAlign: "center" }}>{fr ? "Chargement…" : "Loading…"}</p>;
  if (produit === null) {
    return (
      <div style={{ padding: "80px 20px", textAlign: "center" }}>
        <h1 style={{ fontSize: 24, fontWeight: 800 }}>{fr ? "Produit introuvable" : "Product not found"}</h1>
        <Link href="/produits" style={{ color: "#7D0806", fontWeight: 700 }}>{fr ? "Voir tous nos produits" : "See all products"}</Link>
      </div>
    );
  }

  async function ajouter(v: MedusaProduct["variants"][number]) {
    if (!produit) return;
    const prix = getVariantPrice(v);
    const ok = await ajouterArticle({
      id: v.id,
      nom: `${produit.title} — ${v.title}`,
      description: v.title,
      prix,
      prixOriginal: Number((v.metadata as { originalPrice?: number } | null)?.originalPrice ?? prix),
      image: produit.thumbnail ?? "",
      mode: "unique",
      variantId: v.id,
    });
    setMessage(ok ? (fr ? "Ajouté au panier ✓" : "Added to cart ✓") : fr ? "Ce pack est en rupture de stock." : "This pack is out of stock.");
  }

  return (
    <main style={{ maxWidth: 960, margin: "0 auto", padding: "40px 20px 80px" }}>
      <Link href="/produits" style={{ color: "#555", fontSize: 14, textDecoration: "none" }}>← {fr ? "Tous les produits" : "All products"}</Link>
      <div style={{ display: "grid", gap: 32, gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", marginTop: 20 }}>
        <div style={{ background: "#f6f7f5", borderRadius: 20, padding: 20, display: "flex", alignItems: "center", justifyContent: "center", minHeight: 280 }}>
          {produit.thumbnail ? <img src={produit.thumbnail} alt={produit.title} style={{ maxWidth: "100%", maxHeight: 360, objectFit: "contain" }} /> : <span style={{ fontSize: 64 }}>🌿</span>}
        </div>
        <div>
          <h1 style={{ fontSize: "2rem", fontWeight: 900, margin: 0 }}>{produit.title}</h1>
          {produit.subtitle && <p style={{ color: "#7D0806", fontWeight: 700, margin: "6px 0 0" }}>{produit.subtitle}</p>}
          {produit.description && <p style={{ color: "#444", lineHeight: 1.7, marginTop: 14 }}>{produit.description}</p>}
          <div style={{ display: "grid", gap: 10, marginTop: 20 }}>
            {produit.variants.map((v) => (
              <div key={v.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, border: "1.5px solid #e4e7e2", borderRadius: 14, padding: "14px 16px", flexWrap: "wrap" }}>
                <div>
                  <div style={{ fontWeight: 800 }}>{v.title}</div>
                  <div style={{ color: "#7D0806", fontWeight: 900, fontSize: 18 }}>{getVariantPrice(v).toLocaleString("fr-FR")} FCFA</div>
                  {v.inStock && v.stockFaible && <div style={{ color: "#b45309", fontSize: 12, fontWeight: 700 }}>{fr ? "Plus que quelques exemplaires" : "Only a few left"}</div>}
                </div>
                <button
                  onClick={() => void ajouter(v)}
                  disabled={v.inStock === false}
                  style={{ background: v.inStock === false ? "#ccc" : "#7D0806", color: "#fff", border: 0, borderRadius: 10, padding: "12px 20px", fontWeight: 800, cursor: v.inStock === false ? "not-allowed" : "pointer" }}
                >
                  {v.inStock === false ? (fr ? "Rupture de stock" : "Out of stock") : fr ? "Ajouter au panier" : "Add to cart"}
                </button>
              </div>
            ))}
          </div>
          {message && <p style={{ marginTop: 14, fontWeight: 700 }}>{message} <Link href="/panier" style={{ color: "#7D0806" }}>{fr ? "Voir le panier" : "View cart"}</Link></p>}
        </div>
      </div>
    </main>
  );
}
