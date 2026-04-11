"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { medusa } from "@/lib/medusa";

interface Customer {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
}

interface AuthContextType {
  customer: Customer | null;
  loading: boolean;
  connecter: (email: string, password: string) => Promise<void>;
  inscrire: (data: { email: string; password: string; first_name: string; last_name: string; phone?: string }) => Promise<void>;
  deconnecter: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("nutrelis-token");
    if (!token) { setLoading(false); return; }
    medusa.store.customer.retrieve()
      .then(({ customer }) => setCustomer(customer as Customer))
      .catch(() => { localStorage.removeItem("nutrelis-token"); setCustomer(null); })
      .finally(() => setLoading(false));
  }, []);

  const connecter = async (email: string, password: string) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/auth/customer/emailpass`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    localStorage.setItem("nutrelis-token", data.token);
    const { customer } = await medusa.store.customer.retrieve();
    setCustomer(customer as Customer);
  };

  const inscrire = async (data: { email: string; password: string; first_name: string; last_name: string; phone?: string }) => {
    // 1. Enregistrer les credentials
    const res = await fetch(`${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/auth/customer/emailpass/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: data.email, password: data.password }),
    });
    const authData = await res.json();
    if (!res.ok) throw new Error(authData.message);
    
    localStorage.setItem("nutrelis-token", authData.token);

    // 2. Créer le profil client
    await fetch(`${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/store/customers`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${authData.token}`,
        "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY!,
      },
      body: JSON.stringify({ first_name: data.first_name, last_name: data.last_name, phone: data.phone }),
    });

    // 3. Récupérer le profil
    const { customer } = await medusa.store.customer.retrieve();
    setCustomer(customer as Customer);
  };

  const deconnecter = async () => {
    localStorage.removeItem("nutrelis-token");
    setCustomer(null);
  };

  return (
    <AuthContext.Provider value={{ customer, loading, connecter, inscrire, deconnecter }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth doit être utilisé dans CartProvider");
  return ctx;
}
