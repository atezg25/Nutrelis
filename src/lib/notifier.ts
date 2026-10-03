import { query } from "./db";

/**
 * Alerte « nouvelle commande » pour la boutique : WhatsApp (Cloud API) et/ou e-mail (Resend), selon ce qui est
 * configuré. Sans configuration, la commande n'est pas perdue : elle apparaît dans l'administration.
 * Variables : WHATSAPP_ENABLED, WHATSAPP_TOKEN, WHATSAPP_PHONE_ID, WHATSAPP_STORE_PHONE ; RESEND_API_KEY, STORE_EMAIL, MAIL_FROM.
 */
export async function notifierNouvelleCommande(numero: string): Promise<void> {
  const rows = await query<{ customer_name: string; phone: string; city: string | null; total_fcfa: number; payment_method: string }>(
    "SELECT customer_name, phone, city, total_fcfa, payment_method FROM customer_order WHERE number=$1",
    [numero],
  );
  const o = rows[0];
  if (!o) return;
  const items = await query<{ name: string; qty: number }>(
    "SELECT i.name, i.qty FROM order_item i JOIN customer_order c ON c.id=i.order_id WHERE c.number=$1",
    [numero],
  );
  const detail = items.map((i) => `${i.qty} × ${i.name}`).join(", ");
  const ligne = `🛒 Nouvelle commande ${numero} — ${o.customer_name} (${o.phone}${o.city ? `, ${o.city}` : ""}) — ${detail} — ${o.total_fcfa.toLocaleString("fr-FR")} FCFA — ${o.payment_method === "livraison" ? "paiement à la livraison" : "paiement en ligne"}`;

  const taches: Promise<unknown>[] = [];
  if (process.env.WHATSAPP_ENABLED === "true" && process.env.WHATSAPP_TOKEN && process.env.WHATSAPP_PHONE_ID && process.env.WHATSAPP_STORE_PHONE) {
    taches.push(
      fetch(`https://graph.facebook.com/v20.0/${process.env.WHATSAPP_PHONE_ID}/messages`, {
        method: "POST",
        headers: { Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`, "Content-Type": "application/json" },
        body: JSON.stringify({ messaging_product: "whatsapp", to: process.env.WHATSAPP_STORE_PHONE, type: "text", text: { body: ligne } }),
        signal: AbortSignal.timeout(10_000),
      }),
    );
  }
  if (process.env.RESEND_API_KEY && process.env.STORE_EMAIL) {
    taches.push(
      fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ from: process.env.MAIL_FROM || "NUTRELIS <commandes@nutrelis.bio>", to: [process.env.STORE_EMAIL], subject: `Nouvelle commande ${numero}`, text: ligne }),
        signal: AbortSignal.timeout(10_000),
      }),
    );
  }
  await Promise.allSettled(taches);
}
