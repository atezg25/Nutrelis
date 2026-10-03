"use client";
import { useEffect, useState, Suspense, useLayoutEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useLocale } from "@/context/LocaleContext";
export const dynamic = "force-dynamic";

function SuccessContent() {
  const searchParams = useSearchParams();
  const reference = searchParams.get("commande");
  const [statut, setStatut] = useState<"chargement" | "succès" | "échec" | "attente">("chargement");
  const [emailEnvoye, setEmailEnvoye] = useState(false);
  const { viderPanier } = useCart();
  const { t } = useLocale();

  const confirmerCommande = async (ref: string) => {
    if (emailEnvoye) return;
    // Vider le panier
    viderPanier();
    // Envoyer l'email
    try {
      const customerRaw = localStorage.getItem("nutrelis-customer");
      if (!customerRaw) return;
      const customer = JSON.parse(customerRaw);
      await fetch("/api/send-confirmation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...customer, reference: ref }),
      });
      setEmailEnvoye(true);
      localStorage.removeItem("nutrelis-customer");
    } catch {
      // Silencieux — l'email est bonus, pas critique
    }
  };

  useEffect(() => {
    if (!reference) { setStatut("échec"); return; }
    let telephone = "";
    try { telephone = JSON.parse(localStorage.getItem("nutrelis-customer") || "{}").telephone || ""; } catch {}
    if (!telephone) { setStatut("attente"); return; }

    // Fapshi ramène le client ici avant que le webhook n'arrive : on interroge notre serveur (qui interroge Fapshi)
    // toutes les 4 s pendant ~1 min. Seule la réponse de Fapshi fait foi.
    let essais = 0;
    let arrete = false;
    const verifier = async () => {
      if (arrete) return;
      essais += 1;
      try {
        const r = await fetch(`/api/orders/${encodeURIComponent(reference)}?tel=${encodeURIComponent(telephone)}`, { cache: "no-store" });
        const d = await r.json();
        if (d.paiement === "payee") { setStatut("succès"); confirmerCommande(reference); return; }
        if (d.paiement === "echouee" || d.statut === "annulee") { setStatut("échec"); return; }
      } catch { /* on réessaie */ }
      if (essais >= 15) { setStatut("attente"); return; }
      setTimeout(verifier, 4000);
    };
    void verifier();
    return () => { arrete = true; };
  }, [reference]);

  if (statut === "chargement") {
    return (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
        <p style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: 18, fontWeight: 700 }}>
          {t("success.verifying")}
        </p>
      </div>
    );
  }

  if (statut === "attente") {
    return (
      <div style={{ textAlign: "center", maxWidth: 480, padding: "60px 40px" }}>
        <div style={{ fontSize: 64, marginBottom: 24 }}>🕐</div>
        <h1 style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: "1.6rem", fontWeight: 900, marginBottom: 16 }}>{t("success.pending")}</h1>
        <p style={{ color: "#555", fontSize: 15, marginBottom: 12, lineHeight: 1.8 }}>{t("success.pendingDesc")}</p>
        {reference && <p style={{ color: "#555", fontSize: 14, marginBottom: 28 }}>{t("success.reference")} : <strong>{reference}</strong></p>}
        <Link href="/contact" style={{ background: "#f0f0f0", color: "#333", padding: "14px 28px", borderRadius: 10, fontSize: 14, fontWeight: 700, textDecoration: "none" }}>{t("success.contact")}</Link>
      </div>
    );
  }

  if (statut === "échec") {
    return (
      <div style={{ textAlign: "center", maxWidth: 480, padding: "60px 40px" }}>
        <div style={{ fontSize: 64, marginBottom: 24 }}>❌</div>
        <h1 style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: "1.8rem", fontWeight: 900, marginBottom: 16 }}>
          {t("success.failed")}
        </h1>
        <p style={{ color: "#555", fontSize: 15, marginBottom: 36, lineHeight: 1.8 }}>
          {t("success.failedDesc")}
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/checkout" style={{ background: "#7D0806", color: "#fff", padding: "14px 28px", borderRadius: 10, fontSize: 14, fontWeight: 800, textDecoration: "none" }}>
            {t("success.retry")}
          </Link>
          <Link href="/contact" style={{ background: "#f0f0f0", color: "#333", padding: "14px 28px", borderRadius: 10, fontSize: 14, fontWeight: 700, textDecoration: "none" }}>
            {t("success.contact")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ textAlign: "center", maxWidth: 560, padding: "60px 24px" }}>
      <div style={{ fontSize: 72, marginBottom: 24 }}>🎉</div>
      <h1 style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: "2rem", fontWeight: 900, marginBottom: 16, color: "#1a1a1a" }}>
        {t("success.title")}
      </h1>
      <p style={{ color: "#555", fontSize: 16, lineHeight: 1.8, marginBottom: 12 }}>
        {t("success.desc")} <strong>ATEZ Express</strong> {t("success.in24h")}
      </p>
      <div style={{ background: "#f0faf2", border: "1px solid #c8e6d0", borderRadius: 16, padding: "20px", marginBottom: 16 }}>
        <p style={{ fontSize: 13, color: "#555", margin: 0 }}>{t("success.reference")} <strong>{reference}</strong></p>
      </div>
      <p style={{ color: "#888", fontSize: 13, marginBottom: 32 }}>
        📧 {t("success.emailSent")}
      </p>
      <Link href="/" style={{ background: "var(--accent)", color: "#060f08", padding: "16px 40px", borderRadius: 10, fontSize: 15, fontWeight: 800, textDecoration: "none", fontFamily: "var(--font-sora), sans-serif" }}>
        {t("success.backHome")}
      </Link>
    </div>
  );
}

export default function CheckoutSuccess() {
  const { t } = useLocale();

  useLayoutEffect(() => {
    document.documentElement.classList.add("hydrated");
  }, []);

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#fff", color: "#1a1a1a" }}>
      <Suspense fallback={
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
          <p style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: 18, fontWeight: 700 }}>{t("common.loading")}</p>
        </div>
      }>
        <SuccessContent />
      </Suspense>
    </div>
  );
}
