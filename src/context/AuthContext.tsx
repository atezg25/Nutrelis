"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

const BACKEND = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL!;
const PUB_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY!;

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
  deconnecter: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

async function fetchCustomer(token: string): Promise<Customer | null> {
  try {
    const res = await fetch(`${BACKEND}/store/customers/me`, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "x-publishable-api-key": PUB_KEY,
      },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.customer;
  } catch { return null; }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("nutrelis-token");
    if (!token) { setLoading(false); return; }
    fetchCustomer(token).then(c => {
      if (c) setCustomer(c);
      else localStorage.removeItem("nutrelis-token");
      setLoading(false);
    });
  }, []);

  const connecter = async (email: string, password: string) => {
    const res = await fetch(`${BACKEND}/auth/customer/emailpass`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Erreur connexion");
    
    localStorage.setItem("nutrelis-token", data.token);
    
    const c = await fetchCustomer(data.token);
    if (!c) throw new Error("Profil introuvable");
    setCustomer(c);
  };

  const inscrire = async (data: { email: string; password: string; first_name: string; last_name: string; phone?: string }) => {
    const regRes = await fetch(`${BACKEND}/auth/customer/emailpass/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: data.email, password: data.password }),
    });
    const regData = await regRes.json();
    if (!regRes.ok) throw new Error(regData.message || "Erreur inscription");

    const cusRes = await fetch(`${BACKEND}/store/customers`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${regData.token}`,
        "x-publishable-api-key": PUB_KEY,
      },
      body: JSON.stringify({ email: data.email, first_name: data.first_name, last_name: data.last_name, phone: data.phone }),
    });
    const cusData = await cusRes.json();
    if (!cusRes.ok) throw new Error(cusData.message || "Erreur création profil");

    localStorage.setItem("nutrelis-token", regData.token);
    setCustomer(cusData.customer);
  };

  const deconnecter = () => {
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
  if (!ctx) throw new Error("useAuth doit être utilisé dans AuthProvider");
  return ctx;
}
