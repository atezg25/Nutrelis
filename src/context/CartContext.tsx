"use client";
import { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react";

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
  medusaLineItemId?: string;
}

interface CartContextType {
  items: CartItem[];
  totalItems: number;
  totalPrix: number;
  medusaCartId: string | null;
  ajouterArticle: (item: Omit<CartItem, "quantite">) => Promise<boolean>;
  supprimerArticle: (id: string) => void;
  modifierQuantite: (id: string, quantite: number) => void;
  viderPanier: () => void;
}

// ============================================================
// MEDUSA CART HELPERS
// ============================================================
const BACKEND = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "";
const PUB_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "";
const REGION_ID = process.env.NEXT_PUBLIC_MEDUSA_REGION_ID || process.env.MEDUSA_REGION_ID || "reg_01KP6P8GQM37FW4H0PEVAV2V6S";

const medusaHeaders = {
  "Content-Type": "application/json",
  "x-publishable-api-key": PUB_KEY,
};

async function createMedusaCart(): Promise<string | null> {
  try {
    const res = await fetch(`${BACKEND}/store/carts`, {
      method: "POST",
      headers: medusaHeaders,
      body: JSON.stringify({ region_id: REGION_ID }),
    });
    const data = await res.json();
    return data.cart?.id || null;
  } catch {
    return null;
  }
}

async function addMedusaLineItem(cartId: string, variantId: string, quantity: number): Promise<string | null> {
  try {
    const res = await fetch(`${BACKEND}/store/carts/${cartId}/line-items`, {
      method: "POST",
      headers: medusaHeaders,
      body: JSON.stringify({ variant_id: variantId, quantity }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.warn("Medusa add line item error:", err.message || res.status);
      return null;
    }
    const data = await res.json();
    const item = data.cart?.items?.find((i: any) => i.variant_id === variantId);
    return item?.id || null;
  } catch {
    return null;
  }
}

/** Tester le stock en ajoutant au cart Medusa — retourne le lineItemId si OK, null si rupture */
async function tryAddToCart(cartId: string, variantId: string, quantity: number): Promise<string | null> {
  try {
    const res = await fetch(`${BACKEND}/store/carts/${cartId}/line-items`, {
      method: "POST",
      headers: medusaHeaders,
      body: JSON.stringify({ variant_id: variantId, quantity }),
    });
    if (!res.ok) return null; // Medusa refuse = pas de stock
    const data = await res.json();
    const item = data.cart?.items?.find((i: any) => i.variant_id === variantId);
    return item?.id || null;
  } catch {
    return null;
  }
}

async function updateMedusaLineItem(cartId: string, lineItemId: string, quantity: number): Promise<void> {
  try {
    await fetch(`${BACKEND}/store/carts/${cartId}/line-items/${lineItemId}`, {
      method: "POST",
      headers: medusaHeaders,
      body: JSON.stringify({ quantity }),
    });
  } catch {}
}

async function deleteMedusaLineItem(cartId: string, lineItemId: string): Promise<void> {
  try {
    await fetch(`${BACKEND}/store/carts/${cartId}/line-items/${lineItemId}`, {
      method: "DELETE",
      headers: medusaHeaders,
    });
  } catch {}
}

// ============================================================
// CONTEXTE
// ============================================================
const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [medusaCartId, setMedusaCartId] = useState<string | null>(null);
  const cartIdRef = useRef<string | null>(null);

  // Charger le panier et le cartId Medusa depuis localStorage au démarrage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("nutrelis-cart");
      if (saved) setItems(JSON.parse(saved));
      const savedCartId = localStorage.getItem("nutrelis-medusa-cart");
      if (savedCartId) {
        setMedusaCartId(savedCartId);
        cartIdRef.current = savedCartId;
      }
    } catch {}
  }, []);

  // Sauvegarder dans localStorage à chaque changement
  useEffect(() => {
    localStorage.setItem("nutrelis-cart", JSON.stringify(items));
  }, [items]);

  // Garder le ref à jour
  useEffect(() => {
    cartIdRef.current = medusaCartId;
    if (medusaCartId) {
      localStorage.setItem("nutrelis-medusa-cart", medusaCartId);
    }
  }, [medusaCartId]);

  // Garantir qu'un cart Medusa existe, en créer un si nécessaire
  const ensureMedusaCart = async (): Promise<string | null> => {
    if (cartIdRef.current) return cartIdRef.current;
    const newCartId = await createMedusaCart();
    if (newCartId) {
      setMedusaCartId(newCartId);
      cartIdRef.current = newCartId;
    }
    return newCartId;
  };

  const ajouterArticle = async (nouvelArticle: Omit<CartItem, "quantite">): Promise<boolean> => {
    // Si variant Medusa, vérifier le stock en tentant l'ajout au cart
    if (nouvelArticle.variantId) {
      const cartId = await ensureMedusaCart();
      if (!cartId) return false;

      // Vérifier si l'article est déjà dans le panier local
      const existant = items.find(i => i.id === nouvelArticle.id);
      if (existant && existant.medusaLineItemId) {
        // Tenter d'augmenter la quantité côté Medusa
        const res = await fetch(`${BACKEND}/store/carts/${cartId}/line-items/${existant.medusaLineItemId}`, {
          method: "POST",
          headers: medusaHeaders,
          body: JSON.stringify({ quantity: existant.quantite + 1 }),
        });
        if (!res.ok) return false; // Stock insuffisant
        setItems(prev => prev.map(i =>
          i.id === nouvelArticle.id ? { ...i, quantite: i.quantite + 1 } : i
        ));
        return true;
      }

      // Nouvel article — tenter l'ajout côté Medusa d'abord
      const lineItemId = await tryAddToCart(cartId, nouvelArticle.variantId, 1);
      if (!lineItemId) return false; // Stock = 0, Medusa refuse

      // Medusa a accepté → ajouter localement
      setItems(prev => [...prev, { ...nouvelArticle, quantite: 1, medusaLineItemId: lineItemId }]);
      return true;
    }

    // Pas de variant Medusa → ajout local direct
    setItems(prev => {
      const existant = prev.find(i => i.id === nouvelArticle.id);
      if (existant) {
        return prev.map(i =>
          i.id === nouvelArticle.id ? { ...i, quantite: i.quantite + 1 } : i
        );
      }
      return [...prev, { ...nouvelArticle, quantite: 1 }];
    });
    return true;
  };

  const supprimerArticle = (id: string) => {
    setItems(prev => {
      const item = prev.find(i => i.id === id);
      if (item?.medusaLineItemId && cartIdRef.current) {
        deleteMedusaLineItem(cartIdRef.current, item.medusaLineItemId);
      }
      return prev.filter(i => i.id !== id);
    });
  };

  const modifierQuantite = (id: string, quantite: number) => {
    if (quantite <= 0) {
      supprimerArticle(id);
      return;
    }
    setItems(prev => {
      const item = prev.find(i => i.id === id);
      if (item?.medusaLineItemId && cartIdRef.current) {
        updateMedusaLineItem(cartIdRef.current, item.medusaLineItemId, quantite);
      }
      return prev.map(i => i.id === id ? { ...i, quantite } : i);
    });
  };

  const viderPanier = () => {
    setItems([]);
    setMedusaCartId(null);
    cartIdRef.current = null;
    localStorage.removeItem("nutrelis-medusa-cart");
  };

  const totalItems = items.reduce((acc, i) => acc + i.quantite, 0);
  const totalPrix = items.reduce((acc, i) => acc + i.prix * i.quantite, 0);

  return (
    <CartContext.Provider value={{
      items,
      totalItems,
      totalPrix,
      medusaCartId,
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
