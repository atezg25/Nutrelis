"use client";
import { use, useEffect, useState } from "react";
import Link from "next/link";
import Reveler from "@/components/Reveler";
import ProductTemplate, { type ProduitCatalogue } from "@/components/ProductTemplate";
import { useLocale } from "@/context/LocaleContext";

/**
 * Page d'un produit ajouté depuis l'administration (tout produit autre que l'Astaxanthine, qui a sa page dédiée).
 * Elle reprend la charte et toutes les sections de la page principale : voir `ProductTemplate`.
 */
export default function PageProduit({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { locale } = useLocale();
  const fr = locale === "fr";
  const [produits, setProduits] = useState<ProduitCatalogue[] | null>(null);

  useEffect(() => {
    void fetch("/api/catalog", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { products: [] }))
      .then((d: { products?: ProduitCatalogue[] }) => setProduits(d.products ?? []))
      .catch(() => setProduits([]));
  }, []);

  if (produits === null) return <><Reveler /><p style={{ padding: 40, textAlign: "center" }}>{fr ? "Chargement…" : "Loading…"}</p></>;

  // La casse de l'adresse ne compte pas : /produits/Essai-100F et /produits/essai-100f désignent le même produit.
  const voulu = decodeURIComponent(slug).toLowerCase();
  const produit = produits.find((p) => p.slug.toLowerCase() === voulu);
  if (!produit) {
    return (
      <div style={{ padding: "80px 20px", textAlign: "center" }}>
        <Reveler />
        <h1 style={{ fontSize: 24, fontWeight: 800 }}>{fr ? "Produit introuvable" : "Product not found"}</h1>
        <Link href="/produits" style={{ color: "#7D0806", fontWeight: 700 }}>{fr ? "Voir tous nos produits" : "See all products"}</Link>
      </div>
    );
  }
  return <ProductTemplate produit={produit} autres={produits} />;
}
