"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

// ============================================================
// TYPES
// ============================================================
export interface CartItem {
  id: string;


  nom: string;
  description: string;
  prix: number;
  prixOriginal: number;
  quantite: number;
  image: string;
  mode: "unique" | "abonnement";
  variantId?: string;
}

interface CartContextType {
  items: CartItem[];
  totalItems: number;
  totalPrix: number;
  ajouterArticle: (item: Omit<CartItem, "quantite">) => Promise<boolean>;
  supprimerArticle: (id: string) => void;
  modifierQuantite: (id: string, quantite: number) => void;
  viderPanier: () => void;
}

// ============================================================
// CONTEXTE
// ============================================================
const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  // Le panier vit dans le navigateur (localStorage). Le serveur ne le connaît qu'au moment de la commande.
  useEffect(() => {
    try {
      const saved = localStorage.getItem("nutrelis-cart");
      if (saved) setItems(JSON.parse(saved));
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem("nutrelis-cart", JSON.stringify(items));
  }, [items]);

  /** Vérifie auprès du catalogue que ce pack est en stock. En cas de panne du catalogue, on laisse passer :
   *  le serveur re-vérifie le stock de toute façon au moment de la commande. */
  const enStock = async (variantId: string): Promise<boolean> => {
    try {
      const res = await fetch("/api/catalog", { cache: "no-store" });
      if (!res.ok) return true;
      const data = await res.json();
      for (const p of data.products ?? []) {
        for (const v of p.variants ?? []) if (v.id === variantId) return v.inStock === true;
      }
      return true;
    } catch {
      return true;
    }
  };

  const ajouterArticle = async (nouvelArticle: Omit<CartItem, "quantite">): Promise<boolean> => {
    if (nouvelArticle.variantId && !(await enStock(nouvelArticle.variantId))) return false;
    setItems(prev => {
      const existant = prev.find(i => i.id === nouvelArticle.id);
      if (existant) {
        return prev.map(i => (i.id === nouvelArticle.id ? { ...i, quantite: i.quantite + 1 } : i));
      }
      return [...prev, { ...nouvelArticle, quantite: 1 }];
    });
    return true;
  };

  const supprimerArticle = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const modifierQuantite = (id: string, quantite: number) => {
    if (quantite <= 0) {
      supprimerArticle(id);
      return;
    }
    setItems(prev => prev.map(i => (i.id === id ? { ...i, quantite } : i)));
  };

  const viderPanier = () => {
    setItems([]);
  };

  const totalItems = items.reduce((acc, i) => acc + i.quantite, 0);
  const totalPrix = items.reduce((acc, i) => acc + i.prix * i.quantite, 0);

  return (
    <CartContext.Provider value={{
      items,
      totalItems,
      totalPrix,
      ajouterArticle,
      supprimerArticle,
      modifierQuantite,
      viderPanier,
    }}>
      {children}
    </CartContext.Provider>
  );
}

// Hook personnalisé
export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart doit être utilisé dans CartProvider");
  return ctx;
}
