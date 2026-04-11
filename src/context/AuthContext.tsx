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
    medusa.store.customer.retrieve()
      .then(({ customer }) => setCustomer(customer as Customer))
      .catch(() => setCustomer(null))
      .finally(() => setLoading(false));
  }, []);

  const connecter = async (email: string, password: string) => {
    const { token } = await medusa.auth.login("customer", "emailpass", { email, password });
    localStorage.setItem("nutrelis-token", token);
    const { customer } = await medusa.store.customer.retrieve();
    setCustomer(customer as Customer);
  };

  const inscrire = async (data: { email: string; password: string; first_name: string; last_name: string; phone?: string }) => {
    await medusa.auth.register("customer", "emailpass", { email: data.email, password: data.password });
    await connecter(data.email, data.password);
    await medusa.store.customer.update({ first_name: data.first_name, last_name: data.last_name, phone: data.phone });
    const { customer } = await medusa.store.customer.retrieve();
    setCustomer(customer as Customer);
  };

  const deconnecter = async () => {
    await medusa.auth.logout();
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
