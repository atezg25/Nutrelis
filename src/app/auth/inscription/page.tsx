"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function Inscription() {
  const { inscrire } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ prenom: "", nom: "", email: "", telephone: "", password: "", confirm: "" });
  const [erreur, setErreur] = useState("");
  const [chargement, setChargement] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErreur("");
    if (form.password !== form.confirm) { setErreur("Les mots de passe ne correspondent pas."); return; }
    if (form.password.length < 8) { setErreur("Le mot de passe doit contenir au moins 8 caractères."); return; }
    setChargement(true);
    try {
      await inscrire({ email: form.email, password: form.password, first_name: form.prenom, last_name: form.nom, phone: form.telephone });
      router.push("/compte");
    } catch {
      setErreur("Erreur lors de l'inscription. Cet email est peut-être déjà utilisé.");
    } finally {
      setChargement(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fa", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ background: "#fff", borderRadius: 20, padding: "48px 40px", width: "100%", maxWidth: 480, boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}>
        
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: "#7D0806", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900, fontSize: 20, margin: "0 auto 12px" }}>N</div>
          <h1 style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: "1.6rem", fontWeight: 800, marginBottom: 8 }}>Créer un compte</h1>
          <p style={{ color: "#888", fontSize: 14 }}>Rejoignez la famille NUTRELIS</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
            {[{ key: "prenom", label: "Prénom *", placeholder: "Jean" }, { key: "nom", label: "Nom *", placeholder: "Dupont" }].map(f => (
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
            { key: "email", label: "Email *", type: "email", placeholder: "votre@email.com" },
            { key: "telephone", label: "Téléphone", type: "tel", placeholder: "+237 6XX XXX XXX" },
            { key: "password", label: "Mot de passe *", type: "password", placeholder: "Minimum 8 caractères" },
            { key: "confirm", label: "Confirmer le mot de passe *", type: "password", placeholder: "••••••••" },
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
            {chargement ? "Création..." : "Créer mon compte →"}
          </button>
        </form>

        <p style={{ textAlign: "center", fontSize: 14, color: "#888" }}>
          Déjà un compte ?{" "}
          <Link href="/auth/connexion" style={{ color: "#7D0806", fontWeight: 700, textDecoration: "none" }}>Se connecter</Link>
        </p>
      </div>
    </div>
  );
}
