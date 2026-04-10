"use client";
import Link from "next/link";

export default function Page() {
  return (
    <main style={{ background: "var(--bg-primary)", color: "#fff", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 24, padding: "60px" }}>
      <h1 style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: "2.5rem", fontWeight: 900, color: "var(--accent)" }}>Retours</h1>
      <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 16 }}>Cette page est en cours de construction.</p>
      <Link href="/" style={{ background: "var(--accent)", color: "#fff", padding: "12px 32px", borderRadius: 8, textDecoration: "none", fontWeight: 700 }}>← Retour à l accueil</Link>
    </main>
  );
}
