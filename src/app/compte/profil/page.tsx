"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { medusa } from "@/lib/medusa";
import { useLocale } from "@/context/LocaleContext";

export default function Profil() {
  const { t } = useLocale();
  const { customer, loading } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ first_name: "", last_name: "", email: "", phone: "" });
  const [succes, setSucces] = useState(false);
  const [chargement, setChargement] = useState(false);

  useEffect(() => {
    if (!loading && !customer) router.push("/auth/connexion");
    if (customer) setForm({ first_name: customer.first_name, last_name: customer.last_name, email: customer.email, phone: customer.phone || "" });
  }, [customer, loading, router]);

  const handleSave = async () => {
    setChargement(true);
    try {
      await medusa.store.customer.update({ first_name: form.first_name, last_name: form.last_name, phone: form.phone });
      setSucces(true);
      setTimeout(() => setSucces(false), 3000);
    } catch {}
    finally { setChargement(false); }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fa" }}>
      <nav style={{ background: "#7D0806", padding: "0 60px", height: 68, display: "flex", alignItems: "center", gap: 16 }}>
        <Link href="/compte" style={{ color: "rgba(255,255,255,0.7)", textDecoration: "none", fontSize: 14 }}>{t("account.backToAccount")}</Link>
        <span style={{ color: "rgba(255,255,255,0.4)" }}>|</span>
        <span style={{ fontFamily: "var(--font-sora), sans-serif", fontWeight: 800, fontSize: 16, color: "#fff" }}>{t("account.profileTitle")}</span>
      </nav>

      <div style={{ maxWidth: 600, margin: "0 auto", padding: "48px 24px" }}>
        <h1 style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: "1.6rem", fontWeight: 800, marginBottom: 32 }}>{t("account.profileTitle")}</h1>

        <div style={{ background: "#fff", borderRadius: 20, padding: "40px", border: "1px solid #eee" }}>
          {[
            { key: "first_name", label: t("account.firstNameLabel"), type: "text" },
            { key: "last_name", label: t("account.lastNameLabel"), type: "text" },
            { key: "email", label: t("account.emailLabel"), type: "email", disabled: true },
            { key: "phone", label: t("account.phoneLabel"), type: "tel" },
          ].map(f => (
            <div key={f.key} style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontWeight: 600, fontSize: 13, marginBottom: 8, color: "#333" }}>{f.label}</label>
              <input type={f.type} value={(form as any)[f.key]} disabled={f.disabled}
                onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                style={{ width: "100%", padding: "13px 16px", borderRadius: 10, border: "1.5px solid #ddd", fontSize: 15, boxSizing: "border-box", outline: "none", background: f.disabled ? "#f8f8f8" : "#fff", color: f.disabled ? "#888" : "#1a1a1a" }}
                onFocus={e => !f.disabled && (e.currentTarget.style.borderColor = "#7D0806")}
                onBlur={e => e.currentTarget.style.borderColor = "#ddd"}
              />
            </div>
          ))}

          {succes && <p style={{ color: "#1db954", fontSize: 14, marginBottom: 16, textAlign: "center", fontWeight: 700 }}>{"✅ " + t("account.profileSaved")}</p>}

          <button onClick={handleSave} disabled={chargement}
            style={{ width: "100%", background: "#7D0806", color: "#fff", border: "none", padding: "16px", borderRadius: 12, fontSize: 16, fontWeight: 900, cursor: "pointer", fontFamily: "var(--font-sora), sans-serif" }}>
            {chargement ? t("account.saving") : t("account.saveBtn")}
          </button>
        </div>
      </div>
    </div>
  );
}
