"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function CheckoutSuccess() {
  const searchParams = useSearchParams();
  const reference = searchParams.get("reference") || searchParams.get("trxref");
  const [statut, setStatut] = useState<"chargement" | "succès" | "échec">("chargement");

  useEffect(() => {
    if (!reference) { setStatut("échec"); return; }

    fetch(`/api/notchpay/verify?reference=${reference}`)
      .then(r => r.json())
      .then(data => {
        if (data.transaction?.status === "complete") {
          setStatut("succès");
        } else {
          setStatut("échec");
        }
      })
      .catch(() => setStatut("échec"));
  }, [reference]);

  if (statut === "chargement") {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#fff" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
          <p style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: 18, fontWeight: 700 }}>Vérification du paiement...</p>
        </div>
      </div>
    );
  }

  if (statut === "échec") {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#fff" }}>
        <div style={{ textAlign: "center", maxWidth: 480, padding: "60px 40px" }}>
          <div style={{ fontSize: 64, marginBottom: 24 }}>❌</div>
          <h1 style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: "1.8rem", fontWeight: 900, marginBottom: 16 }}>
            Paiement non confirmé
          </h1>
          <p style={{ color: "#555", fontSize: 15, marginBottom: 36, lineHeight: 1.8 }}>
            Nous n'avons pas pu confirmer votre paiement. Réessayez ou contactez-nous.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <Link href="/checkout" style={{ background: "#7D0806", color: "#fff", padding: "14px 28px", borderRadius: 10, fontSize: 14, fontWeight: 800, textDecoration: "none" }}>
              Réessayer →
            </Link>
            <Link href="/contact" style={{ background: "#f0f0f0", color: "#333", padding: "14px 28px", borderRadius: 10, fontSize: 14, fontWeight: 700, textDecoration: "none" }}>
              Nous contacter
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#fff" }}>
      <div style={{ textAlign: "center", maxWidth: 560, padding: "60px 40px" }}>
        <div style={{ fontSize: 72, marginBottom: 24 }}>🎉</div>
        <h1 style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: "2rem", fontWeight: 900, marginBottom: 16, color: "#1a1a1a" }}>
          Paiement confirmé !
        </h1>
        <p style={{ color: "#555", fontSize: 16, lineHeight: 1.8, marginBottom: 12 }}>
          Votre commande a été reçue et sera expédiée via <strong>ATEZ Express</strong> dans les 24h.
        </p>
        <div style={{ background: "#f0faf2", border: "1px solid #c8e6d0", borderRadius: 16, padding: "20px", marginBottom: 36 }}>
          <p style={{ fontSize: 13, color: "#555" }}>Référence : <strong>{reference}</strong></p>
        </div>
        <Link href="/" style={{ background: "var(--accent)", color: "#060f08", padding: "16px 40px", borderRadius: 10, fontSize: 15, fontWeight: 800, textDecoration: "none", fontFamily: "var(--font-sora), sans-serif" }}>
          Retour à l'accueil →
        </Link>
      </div>
    </div>
  );
}