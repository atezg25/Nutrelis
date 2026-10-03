"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Reveler from "@/components/Reveler";
import { useLocale } from "@/context/LocaleContext";
import { fetchProducts, getVariantPrice, type MedusaProduct } from "@/lib/medusa-products";

/** Boutique : tous les produits en vente (ajoutés depuis l'administration). */
export default function Produits() {
  const { locale } = useLocale();
  const fr = locale === "fr";
  const [produits, setProduits] = useState<MedusaProduct[] | null>(null);
  useEffect(() => { void fetchProducts().then(setProduits); }, []);

  return (
    <main style={{ maxWidth: 1040, margin: "0 auto", padding: "50px 20px 80px" }}>
      <Reveler />
      <h1 style={{ fontSize: "2rem", fontWeight: 900, marginBottom: 24 }}>{fr ? "Nos produits" : "Our products"}</h1>
      {produits === null && <p>{fr ? "Chargement…" : "Loading…"}</p>}
      <div style={{ display: "grid", gap: 20, gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" }}>
        {(produits ?? []).map((p) => {
          const prix = Math.min(...p.variants.map(getVariantPrice));
          const dispo = p.variants.some((v) => v.inStock !== false);
          return (
            <Link key={p.id} href={`/produits/${p.handle}`} style={{ textDecoration: "none", color: "inherit", border: "1.5px solid #e4e7e2", borderRadius: 18, padding: 18, display: "block", background: "#fff" }}>
              <div style={{ height: 180, display: "flex", alignItems: "center", justifyContent: "center", background: "#f6f7f5", borderRadius: 12, marginBottom: 12 }}>
                {p.thumbnail ? <img src={p.thumbnail} alt={p.title} style={{ maxHeight: 160, maxWidth: "90%", objectFit: "contain" }} /> : <span style={{ fontSize: 48 }}>🌿</span>}
              </div>
              <div style={{ fontWeight: 800, fontSize: 17 }}>{p.title}</div>
              {p.subtitle && <div style={{ color: "#777", fontSize: 13 }}>{p.subtitle}</div>}
              <div style={{ marginTop: 8, color: "#7D0806", fontWeight: 900 }}>{fr ? "À partir de" : "From"} {prix.toLocaleString("fr-FR")} FCFA</div>
              {!dispo && <div style={{ color: "#b91c1c", fontSize: 12, fontWeight: 700, marginTop: 4 }}>{fr ? "Rupture de stock" : "Out of stock"}</div>}
            </Link>
          );
        })}
      </div>
    </main>
  );
}
