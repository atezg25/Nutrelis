import { query } from "./db";
import { lireReglage } from "./reglages";

/**
 * Alertes de la boutique : e-mail (Resend) et WhatsApp (API Cloud de Meta), à TOUS les destinataires.
 *  - E-mails : le réglage « alerte_email » + les copies « alerte_email_copies » (liste séparée par des virgules).
 *  - WhatsApp : le réglage « alerte_whatsapp » + les copies « alerte_whatsapp_copies » (numéros internationaux sans « + »).
 * Sans configuration, rien n'est perdu : la commande apparaît dans l'administration.
 *  - Telegram : le réglage « alerte_telegram » (identifiants de discussion) + la variable TELEGRAM_BOT_TOKEN.
 * Variables : TELEGRAM_BOT_TOKEN, WHATSAPP_ENABLED, WHATSAPP_TOKEN, WHATSAPP_PHONE_ID ; RESEND_API_KEY, STORE_EMAIL, MAIL_FROM.
 */
const liste = (v: string) => v.split(/[,;\s]+/).map((x) => x.trim()).filter(Boolean);
const unique = <T,>(a: T[]) => [...new Set(a)];

export async function destinatairesAlertes(): Promise<{ emails: string[]; telephones: string[]; telegram: string[] }> {
  const [e1, e2, t1, t2, tg] = await Promise.all([
    lireReglage("alerte_email"), lireReglage("alerte_email_copies"), lireReglage("alerte_whatsapp"), lireReglage("alerte_whatsapp_copies"), lireReglage("alerte_telegram"),
  ]);
  return {
    telegram: unique(liste(tg).filter((x) => /^-?\d{5,20}$/.test(x))),
    emails: unique([...liste(e1), ...liste(e2)].map((x) => x.toLowerCase()).filter((x) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(x))),
    telephones: unique([...liste(t1), ...liste(t2)].map((x) => x.replace(/\D/g, "")).filter((x) => /^\d{8,15}$/.test(x))),
  };
}

/** Envoie une alerte à tous les destinataires. Ne lève jamais : une alerte qui échoue ne doit pas casser une commande. */
export async function notifierBoutique(sujet: string, texte: string): Promise<void> {
  const { emails, telephones, telegram } = await destinatairesAlertes();
  const taches: Promise<unknown>[] = [];
  // Telegram : un robot, un message par personne (chacune a d'abord appuyé sur Démarrer dans le robot).
  if (process.env.TELEGRAM_BOT_TOKEN) {
    for (const chat_id of telegram) {
      taches.push(
        fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chat_id, text: `${sujet}\n\n${texte}`.slice(0, 4000), disable_web_page_preview: true }),
          signal: AbortSignal.timeout(10_000),
        }).then(async (r) => { if (!r.ok) console.error("[nutrelis] alerte telegram refusée", chat_id.slice(-4), r.status, (await r.text()).slice(0, 160)); })
          .catch((e) => console.error("[nutrelis] alerte telegram", e instanceof Error ? e.message : e)),
      );
    }
  }
  if (process.env.WHATSAPP_ENABLED === "true" && process.env.WHATSAPP_TOKEN && process.env.WHATSAPP_PHONE_ID) {
    for (const to of telephones) {
      taches.push(
        fetch(`https://graph.facebook.com/v20.0/${process.env.WHATSAPP_PHONE_ID}/messages`, {
          method: "POST",
          headers: { Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`, "Content-Type": "application/json" },
          body: JSON.stringify({ messaging_product: "whatsapp", to, type: "text", text: { body: `${sujet}\n${texte}` } }),
          signal: AbortSignal.timeout(10_000),
        }).then((r) => { if (!r.ok) console.error("[nutrelis] alerte whatsapp refusée", to.slice(-4), r.status); }).catch((e) => console.error("[nutrelis] alerte whatsapp", to.slice(-4), e instanceof Error ? e.message : e)),
      );
    }
  }
  if (process.env.RESEND_API_KEY && emails.length > 0) {
    taches.push(
      fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ from: process.env.MAIL_FROM || "NUTRELIS <support@nutrelis.bio>", to: emails, subject: sujet, text: texte }),
        signal: AbortSignal.timeout(10_000),
      }).then(async (r) => { if (!r.ok) console.error("[nutrelis] alerte email refusée", r.status, (await r.text()).slice(0, 200)); }).catch((e) => console.error("[nutrelis] alerte email", e instanceof Error ? e.message : e)),
    );
  }
  await Promise.allSettled(taches);
}

type LigneCommande = { customer_name: string; phone: string; city: string | null; address: string | null; total_fcfa: number; payment_method: string };

async function resumeCommande(numero: string): Promise<{ o: LigneCommande; detail: string } | null> {
  const rows = await query<LigneCommande>(
    "SELECT customer_name, phone, city, address, total_fcfa, payment_method FROM customer_order WHERE number=$1",
    [numero],
  );
  const o = rows[0];
  if (!o) return null;
  const items = await query<{ name: string; qty: number }>(
    "SELECT i.name, i.qty FROM order_item i JOIN customer_order c ON c.id=i.order_id WHERE c.number=$1",
    [numero],
  );
  return { o, detail: items.map((i) => `${i.qty} × ${i.name}`).join(", ") };
}

/** Copie de la commande : nouvelle commande, ou paiement en ligne confirmé (`etat`). */
export async function notifierNouvelleCommande(numero: string, etat?: string): Promise<void> {
  const r = await resumeCommande(numero);
  if (!r) return;
  const { o, detail } = r;
  const texte = [
    `🛒 Nouvelle commande ${numero}${etat ? ` — ${etat}` : ""}`,
    `Client : ${o.customer_name} (${o.phone})`,
    `Livraison : ${[o.city, o.address].filter(Boolean).join(", ") || "non précisée"}`,
    `Articles : ${detail}`,
    `Total : ${o.total_fcfa.toLocaleString("fr-FR")} FCFA — ${etat ?? (o.payment_method === "livraison" ? "paiement à la livraison" : "paiement en ligne")}`,
    "Détail : https://nutrelis.bio/admin",
  ].join("\n");
  await notifierBoutique(`Nouvelle commande ${numero}${etat ? ` — ${etat}` : ""}`, texte);
}

/** Commande annulée, ou paiement en ligne refusé / expiré. */
export async function notifierCommandeAnnulee(numero: string, raison: string): Promise<void> {
  const r = await resumeCommande(numero);
  if (!r) return;
  const texte = `⚠️ Commande ${numero} — ${raison}\nClient : ${r.o.customer_name} (${r.o.phone})\nArticles : ${r.detail}\nTotal : ${r.o.total_fcfa.toLocaleString("fr-FR")} FCFA\nLe stock a été rendu.`;
  await notifierBoutique(`Commande ${numero} — ${raison}`, texte);
}

/**
 * Alerte de stock après une vente : RUPTURE (stock tombé à 0) ou STOCK FAIBLE (seuil franchi par cette vente).
 * Une alerte par franchissement, pas une par commande.
 */
export async function alerterStock(vendus: { variantId: string; qty: number }[]): Promise<void> {
  for (const v of vendus) {
    const r = await query<{ label: string; pname: string; seuil: number; stock: number }>(
      `SELECT v.label, p.name AS pname, v.low_stock_alert AS seuil,
              (SELECT COALESCE(SUM(delta),0)::int FROM stock_movement WHERE variant_id = v.id) AS stock
         FROM variant v JOIN product p ON p.id = v.product_id WHERE v.id = $1`,
      [v.variantId],
    );
    const x = r[0];
    if (!x) continue;
    const avant = x.stock + v.qty;
    if (x.stock <= 0 && avant > 0) {
      await notifierBoutique(`RUPTURE DE STOCK — ${x.pname} (${x.label})`, `🚨 RUPTURE DE STOCK : ${x.pname} — ${x.label}. Il n'en reste plus. Réapprovisionnez dans l'onglet Stock : https://nutrelis.bio/admin`);
    } else if (x.stock > 0 && x.stock <= x.seuil && avant > x.seuil) {
      await notifierBoutique(`Stock faible — ${x.pname} (${x.label})`, `⚠️ Stock faible : ${x.pname} — ${x.label}. Il reste ${x.stock} (seuil d'alerte : ${x.seuil}). https://nutrelis.bio/admin`);
    }
  }
}
