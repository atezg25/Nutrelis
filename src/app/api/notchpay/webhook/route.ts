import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { Resend } from "resend";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY!);
}

function escapeHtml(str: string): string {
  if (!str) return "";
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

const BACKEND = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL!;
const PUB_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY!;

// Déduplication en mémoire (protection intra-instance) + vérification Notchpay (inter-instances)
const referencesTraitees = new Set<string>();

// Vérifier le statut réel de la transaction via l'API Notchpay
async function verifierTransactionNotchpay(reference: string): Promise<boolean> {
  try {
    const res = await fetch(`https://api.notchpay.co/payments/${reference}`, {
      headers: { Authorization: process.env.NOTCHPAY_PUBLIC_KEY || "" },
    });
    if (!res.ok) return false;
    const data = await res.json();
    const s = data.transaction?.status;
    return s === "complete" || s === "completed" || s === "success";
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();

    // --- Vérification signature Notchpay (obligatoire) ---
    const signature = req.headers.get("x-notch-signature");
    const secretKey = process.env.NOTCHPAY_SECRET_KEY;
    if (!signature || !secretKey) {
      console.warn("Webhook Notchpay: signature ou clé secrète manquante");
      return NextResponse.json({ error: "Signature requise" }, { status: 401 });
    }
    const expected = crypto
      .createHmac("sha256", secretKey)
      .update(body)
      .digest("hex");
    if (signature !== expected) {
      console.warn("Webhook Notchpay: signature invalide");
      return NextResponse.json({ error: "Signature invalide" }, { status: 401 });
    }

    const payload = JSON.parse(body);
    console.log("Webhook Notchpay reçu:", JSON.stringify(payload, null, 2));

    // Notchpay envoie soit payload.transaction soit payload.data selon la version
    const transaction = payload.transaction || payload.data || payload;
    const status = transaction?.status;
    const reference = transaction?.reference;
    const event = payload.event || "";

    // On traite uniquement les paiements complétés
    const estComplete =
      status === "complete" ||
      status === "completed" ||
      status === "success" ||
      event === "payment.complete" ||
      event === "payment.success";

    if (!estComplete) {
      return NextResponse.json({ received: true, skipped: true });
    }

    // Dédoublonnage intra-instance (protection rapide)
    if (reference && referencesTraitees.has(reference)) {
      console.log("Webhook: référence déjà traitée (cache local):", reference);
      return NextResponse.json({ received: true, duplicate: true });
    }

    // Double vérification : confirmer le statut via l'API Notchpay
    if (reference) {
      const confirme = await verifierTransactionNotchpay(reference);
      if (!confirme) {
        console.warn("Webhook: transaction non confirmée par l'API Notchpay:", reference);
        return NextResponse.json({ error: "Transaction non confirmée" }, { status: 400 });
      }
      referencesTraitees.add(reference);
    }

    const metadata = transaction?.metadata || {};
    const items = (() => {
      try { return JSON.parse(metadata.items || "[]"); } catch { return []; }
    })();
    const { nom, prenom, email, telephone, adresse, ville, quartier } = metadata;
    const total = transaction?.amount || 0;

    // --- Email de confirmation (fire and forget) ---
    envoyerEmail({ nom, prenom, email, telephone, adresse, ville, quartier, items, total, reference })
      .catch(e => console.error("Webhook email erreur:", e));

    // --- Création commande Medusa (idempotent, avec référence en metadata) ---
    if (items.length > 0) {
      creerCommandeMedusa(items, reference).catch(e => console.error("Webhook Medusa erreur:", e));
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error("Webhook Notchpay erreur:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

async function envoyerEmail({
  nom, prenom, email, telephone, adresse, ville, quartier, items, total, reference,
}: {
  nom: string; prenom: string; email: string; telephone: string;
  adresse: string; ville: string; quartier: string;
  items: any[]; total: number; reference: string;
}) {
  const destinataire = process.env.STORE_EMAIL || "atezg25@gmail.com";

  const lignesItems = items.map((item: any) => `
    <tr>
      <td style="padding:12px 16px;border-bottom:1px solid #f0f0f0;">
        <div style="font-weight:700;color:#1a0505;font-size:14px;">${escapeHtml(item.nom)}</div>
        <div style="color:#888;font-size:12px;">${escapeHtml(item.description)}</div>
        ${item.mode === "abonnement" ? '<div style="color:#7D0806;font-size:11px;font-weight:700;">⭐ Abonnement −15%</div>' : ""}
      </td>
      <td style="padding:12px 16px;border-bottom:1px solid #f0f0f0;text-align:center;color:#555;font-size:14px;">${item.quantite}</td>
      <td style="padding:12px 16px;border-bottom:1px solid #f0f0f0;text-align:right;font-weight:800;color:#7D0806;font-size:14px;">${(item.prix * item.quantite).toLocaleString("fr-FR")} FCFA</td>
    </tr>
  `).join("");

  const html = `
<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 20px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
  <tr><td style="background:linear-gradient(135deg,#7D0806,#a01010);padding:36px 40px;text-align:center;">
    <div style="font-size:22px;font-weight:900;letter-spacing:3px;color:#fff;margin-bottom:16px;">NUTRELIS</div>
    <div style="font-size:40px;margin-bottom:12px;">🎉</div>
    <h1 style="color:#fff;font-size:24px;font-weight:900;margin:0 0 8px;">Nouvelle commande !</h1>
    <p style="color:rgba(255,255,255,0.8);font-size:15px;margin:0;">${escapeHtml(prenom)} ${escapeHtml(nom)} — réf. <strong style="color:#fff;">${escapeHtml(reference)}</strong></p>
  </td></tr>
  <tr><td style="padding:40px;">
    <h2 style="color:#1a0505;font-size:16px;font-weight:800;margin:0 0 16px;padding-bottom:12px;border-bottom:2px solid #f0f0f0;">📦 Commande</h2>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <thead><tr style="background:#f8f8f8;">
        <th style="padding:10px 16px;text-align:left;font-size:12px;color:#888;font-weight:700;">PRODUIT</th>
        <th style="padding:10px 16px;text-align:center;font-size:12px;color:#888;font-weight:700;">QTÉ</th>
        <th style="padding:10px 16px;text-align:right;font-size:12px;color:#888;font-weight:700;">PRIX</th>
      </tr></thead>
      <tbody>${lignesItems}</tbody>
      <tfoot>
        <tr style="background:#fdecea;">
          <td colspan="2" style="padding:14px 16px;font-size:16px;font-weight:900;color:#1a0505;">TOTAL</td>
          <td style="padding:14px 16px;text-align:right;font-size:20px;font-weight:900;color:#7D0806;">${total.toLocaleString("fr-FR")} FCFA</td>
        </tr>
      </tfoot>
    </table>
    <h2 style="color:#1a0505;font-size:16px;font-weight:800;margin:24px 0 16px;padding-bottom:12px;border-bottom:2px solid #f0f0f0;">🚚 Livraison</h2>
    <table width="100%" cellpadding="0" cellspacing="0">
      ${[["Client", `${escapeHtml(prenom)} ${escapeHtml(nom)}`], ["Téléphone", escapeHtml(telephone)||"—"], ["Email", escapeHtml(email)||"—"], ["Adresse", escapeHtml(adresse)||"—"], ["Quartier", escapeHtml(quartier)||"—"], ["Ville", escapeHtml(ville)||"—"]].map(([l,v],i)=>`
        <tr style="background:${i%2===0?"#f9f9f9":"#fff"};">
          <td style="padding:10px 16px;font-size:13px;color:#888;width:35%;">${l}</td>
          <td style="padding:10px 16px;font-size:13px;color:#1a0505;font-weight:600;">${v}</td>
        </tr>`).join("")}
    </table>
  </td></tr>
  <tr><td style="background:#1a0505;padding:24px 40px;text-align:center;">
    <div style="color:rgba(255,255,255,0.4);font-size:12px;">© 2026 NUTRELIS — Livraison via ATEZ Express 📦</div>
  </td></tr>
</table>
</td></tr></table>
</body></html>`;

  await getResend().emails.send({
    from: "NUTRELIS <onboarding@resend.dev>",
    to: [destinataire],
    subject: `✅ Nouvelle commande — ${prenom} ${nom} (${(total).toLocaleString("fr-FR")} FCFA)`,
    html,
  });
}

async function creerCommandeMedusa(items: any[], reference?: string) {
  const cartRes = await fetch(`${BACKEND}/store/carts`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-publishable-api-key": PUB_KEY },
    body: JSON.stringify({ currency_code: "xaf", metadata: { notchpay_reference: reference || "" } }),
  });
  const cartData = await cartRes.json();
  const cartId = cartData.cart?.id;
  if (!cartId) return;

  await Promise.all(items.map((item: any) =>
    fetch(`${BACKEND}/store/carts/${cartId}/line-items`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-publishable-api-key": PUB_KEY },
      body: JSON.stringify({ variant_id: item.variantId || item.id, quantity: item.quantite || 1 }),
    })
  ));

  await fetch(`${BACKEND}/store/carts/${cartId}/complete`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-publishable-api-key": PUB_KEY },
  });
}
