/**
 * WhatsApp Business Cloud API — notifications de commande
 * Documentation: https://developers.facebook.com/docs/whatsapp/cloud-api
 *
 * Variables d'environnement requises:
 *   WHATSAPP_TOKEN        — Token d'accès permanent (System User)
 *   WHATSAPP_PHONE_ID     — ID du numéro de téléphone WhatsApp Business
 *   WHATSAPP_ENABLED      — "true" pour activer (désactivé par défaut)
 */

const WHATSAPP_API = "https://graph.facebook.com/v21.0";

interface OrderData {
  prenom: string;
  nom: string;
  telephone: string;
  reference: string;
  total: number;
  items: { nom: string; quantite: number }[];
}

/** Formater le numéro de téléphone au format international (Cameroun) */
function formatPhone(phone: string): string {
  let cleaned = phone.replace(/[\s\-().]/g, "");
  // +237... → ok
  if (cleaned.startsWith("+")) return cleaned;
  // 237... → ajouter +
  if (cleaned.startsWith("237")) return "+" + cleaned;
  // 6... ou 2... → ajouter +237
  if (cleaned.length >= 9) return "+237" + cleaned;
  return cleaned;
}

/** Envoyer une notification WhatsApp de confirmation de commande */
export async function envoyerWhatsApp(order: OrderData): Promise<boolean> {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_ID;
  const enabled = process.env.WHATSAPP_ENABLED === "true";

  if (!enabled || !token || !phoneId) return false;
  if (!order.telephone) return false;

  const to = formatPhone(order.telephone);

  const produitsListe = order.items
    .map(item => `• ${item.nom} (x${item.quantite})`)
    .join("\n");

  const message = [
    `🎉 *Commande confirmée !*`,
    ``,
    `Bonjour ${order.prenom},`,
    `Merci pour votre commande NUTRELIS !`,
    ``,
    `📦 *Vos produits :*`,
    produitsListe,
    ``,
    `💰 *Total :* ${order.total.toLocaleString("fr-FR")} FCFA`,
    `📋 *Référence :* ${order.reference}`,
    ``,
    `🚚 Expédition sous 24h via ATEZ Express.`,
    `Vous recevrez votre numéro de suivi par SMS.`,
    ``,
    `✅ Garantie satisfait ou remboursé 90 jours`,
    ``,
    `Une question ? Répondez directement à ce message.`,
    `— L'équipe NUTRELIS`,
  ].join("\n");

  try {
    const res = await fetch(`${WHATSAPP_API}/${phoneId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: { body: message },
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("WhatsApp API erreur:", res.status, err);
      return false;
    }

    console.log("WhatsApp envoyé à:", to);
    return true;
  } catch (err) {
    console.error("WhatsApp erreur:", err);
    return false;
  }
}

/** Envoyer une notification WhatsApp à la boutique (nouvelle commande) */
export async function notifierBoutiqueWhatsApp(order: OrderData): Promise<boolean> {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_ID;
  const storePhone = process.env.WHATSAPP_STORE_PHONE;
  const enabled = process.env.WHATSAPP_ENABLED === "true";

  if (!enabled || !token || !phoneId || !storePhone) return false;

  const produitsListe = order.items
    .map(item => `• ${item.nom} (x${item.quantite})`)
    .join("\n");

  const message = [
    `🔔 *Nouvelle commande !*`,
    ``,
    `👤 ${order.prenom} ${order.nom}`,
    `📞 ${order.telephone}`,
    `📋 Réf: ${order.reference}`,
    `💰 ${order.total.toLocaleString("fr-FR")} FCFA`,
    ``,
    produitsListe,
  ].join("\n");

  try {
    const res = await fetch(`${WHATSAPP_API}/${phoneId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: formatPhone(storePhone),
        type: "text",
        text: { body: message },
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("WhatsApp boutique erreur:", res.status, err);
      return false;
    }

    return true;
  } catch (err) {
    console.error("WhatsApp boutique erreur:", err);
    return false;
  }
}
