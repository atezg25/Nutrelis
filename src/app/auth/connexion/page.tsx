"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useLocale } from "@/context/LocaleContext";
import BoutonGoogle from "@/components/BoutonGoogle";

export default function Connexion() {
  const { t } = useLocale();
  const { connecter } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [erreur, setErreur] = useState("");
  const [chargement, setChargement] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErreur("");
    setChargement(true);
    try {
      await connecter(form.email, form.password);
      router.push("/compte");
    } catch {
      setErreur(t("auth.loginError"));
    } finally {
      setChargement(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#1a0a0a", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, color: "#1a1a1a" }}>
      <div style={{ background: "#fff", borderRadius: 20, padding: "48px 40px", width: "100%", maxWidth: 440, boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: "#7D0806", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900, fontSize: 20, margin: "0 auto 12px" }}>N</div>
          <h1 style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: "1.6rem", fontWeight: 800, marginBottom: 8 }}>{t("auth.loginTitle")}</h1>
          <p style={{ color: "#888", fontSize: 14 }}>{t("auth.loginDesc")}</p>
        </div>

        {/* Connexion rapide avec Google */}
        <div style={{ marginBottom: 24 }}>
          <BoutonGoogle onSuccess={() => router.push("/compte")} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
          <div style={{ flex: 1, height: 1, background: "#e0e0e0" }} />
          <span style={{ color: "#aaa", fontSize: 13, fontWeight: 600 }}>{t("checkout.orManual")}</span>
          <div style={{ flex: 1, height: 1, background: "#e0e0e0" }} />
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontWeight: 600, fontSize: 13, marginBottom: 8 }}>{t("auth.emailLabel")}</label>
            <input
              type="email" required
              placeholder={t("auth.emailPlaceholder")}
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              style={{ width: "100%", padding: "13px 16px", borderRadius: 10, border: "1.5px solid #ddd", fontSize: 15, boxSizing: "border-box", outline: "none" }}
              onFocus={e => e.currentTarget.style.borderColor = "#7D0806"}
              onBlur={e => e.currentTarget.style.borderColor = "#ddd"}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: "block", fontWeight: 600, fontSize: 13, marginBottom: 8 }}>{t("auth.passwordLabel")}</label>
            <input
              type="password" required
              placeholder="••••••••"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              style={{ width: "100%", padding: "13px 16px", borderRadius: 10, border: "1.5px solid #ddd", fontSize: 15, boxSizing: "border-box", outline: "none" }}
              onFocus={e => e.currentTarget.style.borderColor = "#7D0806"}
              onBlur={e => e.currentTarget.style.borderColor = "#ddd"}
            />
          </div>

          {erreur && <p style={{ color: "#e53e3e", fontSize: 13, marginBottom: 16, textAlign: "center" }}>{erreur}</p>}

          <button
            type="submit"
            disabled={chargement}
            style={{ width: "100%", background: "#7D0806", color: "#fff", border: "none", padding: "16px", borderRadius: 12, fontSize: 16, fontWeight: 900, cursor: "pointer", fontFamily: "var(--font-sora), sans-serif", marginBottom: 16 }}
          >
            {chargement ? t("auth.loginLoading") : t("auth.loginBtn")}
          </button>
        </form>

        <p style={{ textAlign: "center", fontSize: 14, color: "#888" }}>
          {t("auth.noAccount")}{" "}
          <Link href="/auth/inscription" style={{ color: "#7D0806", fontWeight: 700, textDecoration: "none" }}>
            {t("auth.createAccount")}
          </Link>
        </p>
      </div>
    </div>
  );
}
