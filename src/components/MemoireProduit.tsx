"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

/** Mémorise la dernière page produit visitée : « Continuer mes achats » (panier) y ramène le client. */
export const CLE_RETOUR_BOUTIQUE = "nutrelis-boutique-retour";

export default function MemoireProduit() {
  const chemin = usePathname();
  useEffect(() => {
    try {
      if (chemin && /^\/produits\/[^/]+$/.test(chemin)) localStorage.setItem(CLE_RETOUR_BOUTIQUE, chemin);
    } catch { /* stockage indisponible : le retour se fera vers la boutique */ }
  }, [chemin]);
  return null;
}
