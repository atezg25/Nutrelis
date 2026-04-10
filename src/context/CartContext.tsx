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
}

interface CartContextType {
  items: CartItem[];
  totalItems: number;
  totalPrix: number;
  ajouterArticle: (item: Omit<CartItem, "quantite">) => void;
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

  // Charger le panier depuis localStorage au démarrage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("nutrelis-cart");
      if (saved) setItems(JSON.parse(saved));
    } catch {}
  }, []);

  // Sauvegarder dans localStorage à chaque changement
  useEffect(() => {
    localStorage.setItem("nutrelis-cart", JSON.stringify(items));
  }, [items]);

  const ajouterArticle = (nouvelArticle: Omit<CartItem, "quantite">) => {
    setItems(prev => {
      const existant = prev.find(i => i.id === nouvelArticle.id);
      if (existant) {
        // Augmenter la quantité si déjà dans le panier
        return prev.map(i =>
          i.id === nouvelArticle.id
            ? { ...i, quantite: i.quantite + 1 }
            : i
        );
      }
      return [...prev, { ...nouvelArticle, quantite: 1 }];
    });
  };

  const supprimerArticle = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const modifierQuantite = (id: string, quantite: number) => {
    if (quantite <= 0) {
      supprimerArticle(id);
      return;
    }
    setItems(prev =>
      prev.map(i => i.id === id ? { ...i, quantite } : i)
    );
  };

  const viderPanier = () => setItems([]);

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