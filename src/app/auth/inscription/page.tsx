"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useLocale } from "@/context/LocaleContext";

export default function Inscription() {
  const { t } = useLocale();
  const { inscrire } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ prenom: "", nom: "", email: "", telephone: "", password: "", confirm: "" });
  const [erreur, setErreur] = useState("");
  const [chargement, setChargement] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErreur("");
    if (form.password !== form.confirm) { setErreur(t("auth.passwordMismatch")); return; }
    if (form.password.length < 8) { setErreur(t("auth.passwordTooShort")); return; }
    setChargement(true);
    try {
      await inscrire({ email: form.email, password: form.password, first_name: form.prenom, last_name: form.nom, phone: form.telephone });
      router.push("/compte");
    } catch {
      setErreur(t("auth.registerError"));
    } finally {
      setChargement(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#1a0a0a", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, color: "#1a1a1a" }}>
      <div style={{ background: "#fff", borderRadius: 20, padding: "48px 40px", width: "100%", maxWidth: 480, boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}>

        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: "#7D0806", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900, fontSize: 20, margin: "0 auto 12px" }}>N</div>
          <h1 style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: "1.6rem", fontWeight: 800, marginBottom: 8 }}>{t("auth.registerTitle")}</h1>
          <p style={{ color: "#888", fontSize: 14 }}>{t("auth.registerDesc")}</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
            {[{ key: "prenom", label: t("auth.firstNameLabel"), placeholder: t("auth.firstNamePlaceholder") }, { key: "nom", label: t("auth.lastNameLabel"), placeholder: t("auth.lastNamePlaceholder") }].map(f => (
              <div key={f.key}>
                <label style={{ display: "block", fontWeight: 600, fontSize: 13, marginBottom: 8 }}>{f.label}</label>
                <input type="text" required placeholder={f.placeholder} value={(form as any)[f.key]}
                  onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                  style={{ width: "100%", padding: "13px 16px", borderRadius: 10, border: "1.5px solid #ddd", fontSize: 15, boxSizing: "border-box", outline: "none" }}
                  onFocus={e => e.currentTarget.style.borderColor = "#7D0806"}
                  onBlur={e => e.currentTarget.style.borderColor = "#ddd"}
                />
              </div>
            ))}
          </div>

          {[
            { key: "email", label: t("auth.emailLabel") + " *", type: "email", placeholder: t("auth.emailPlaceholder") },
            { key: "telephone", label: t("auth.phoneLabel"), type: "tel", placeholder: t("auth.phonePlaceholder") },
            { key: "password", label: t("auth.passwordMinLabel"), type: "password", placeholder: t("auth.passwordMinPlaceholder") },
            { key: "confirm", label: t("auth.confirmLabel"), type: "password", placeholder: t("auth.confirmPlaceholder") },
          ].map(f => (
            <div key={f.key} style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontWeight: 600, fontSize: 13, marginBottom: 8 }}>{f.label}</label>
              <input type={f.type} required={f.key !== "telephone"} placeholder={f.placeholder}
                value={(form as any)[f.key]}
                onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                style={{ width: "100%", padding: "13px 16px", borderRadius: 10, border: "1.5px solid #ddd", fontSize: 15, boxSizing: "border-box", outline: "none" }}
                onFocus={e => e.currentTarget.style.borderColor = "#7D0806"}
                onBlur={e => e.currentTarget.style.borderColor = "#ddd"}
              />
            </div>
          ))}

          {erreur && <p style={{ color: "#e53e3e", fontSize: 13, marginBottom: 16, textAlign: "center" }}>{erreur}</p>}

          <button type="submit" disabled={chargement}
            style={{ width: "100%", background: "#7D0806", color: "#fff", border: "none", padding: "16px", borderRadius: 12, fontSize: 16, fontWeight: 900, cursor: "pointer", fontFamily: "var(--font-sora), sans-serif", marginBottom: 16 }}
          >
            {chargement ? t("auth.registerLoading") : t("auth.registerBtn")}
          </button>
        </form>

        <p style={{ textAlign: "center", fontSize: 14, color: "#888" }}>
          {t("auth.hasAccount")}{" "}
          <Link href="/auth/connexion" style={{ color: "#7D0806", fontWeight: 700, textDecoration: "none" }}>{t("auth.loginLink")}</Link>
        </p>
      </div>
    </div>
  );
}
