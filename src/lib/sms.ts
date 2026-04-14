/**
 * Africa's Talking SMS API — notifications de commande
 * Documentation: https://africastalking.com/sms
 *
 * Variables d'environnement requises:
 *   AT_API_KEY       — Clé API Africa's Talking
 *   AT_USERNAME      — Username Africa's Talking (sandbox ou production)
 *   AT_SENDER_ID     — Sender ID (ex: "NUTRELIS") — optionnel
 *   SMS_ENABLED      — "true" pour activer (désactivé par défaut)
 */

const AT_API_URL = "https://api.africastalking.com/version1/messaging";
const AT_SANDBOX_URL = "https://api.sandbox.africastalking.com/version1/messaging";

interface SmsData {
  prenom: string;
  nom: string;
  telephone: string;
  reference: string;
  total: number;
}

/** Formater le numéro au format international (Cameroun) */
function formatPhone(phone: string): string {
  let cleaned = phone.replace(/[\s\-().]/g, "");
  if (cleaned.startsWith("+")) return cleaned;
  if (cleaned.startsWith("237")) return "+" + cleaned;
  if (cleaned.length >= 9) return "+237" + cleaned;
  return cleaned;
}

/** Envoyer un SMS de confirmation de commande au client */
export async function envoyerSms(data: SmsData): Promise<boolean> {
  const apiKey = process.env.AT_API_KEY;
  const username = process.env.AT_USERNAME;
  const enabled = process.env.SMS_ENABLED === "true";

  if (!enabled || !apiKey || !username) return false;
  if (!data.telephone) return false;

  const to = formatPhone(data.telephone);
  const senderId = process.env.AT_SENDER_ID || undefined;

  const message = [
    `NUTRELIS - Commande confirmee !`,
    `Bonjour ${data.prenom}, merci pour votre achat.`,
    `Ref: ${data.reference}`,
    `Total: ${data.total.toLocaleString("fr-FR")} FCFA`,
    `Expedition sous 24h via ATEZ Express.`,
    `Garantie 90 jours.`,
  ].join("\n");

  const isSandbox = username === "sandbox";
  const url = isSandbox ? AT_SANDBOX_URL : AT_API_URL;

  const params = new URLSearchParams({
    username,
    to,
    message,
  });
  if (senderId) params.append("from", senderId);

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        apiKey,
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: params.toString(),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("SMS Africa's Talking erreur:", res.status, err);
      return false;
    }

    const result = await res.json();
    const recipients = result?.SMSMessageData?.Recipients || [];
    const status = recipients[0]?.status;

    if (status === "Success") {
      console.log("SMS envoyé à:", to);
      return true;
    }

    console.warn("SMS statut:", status, "pour:", to);
    return false;
  } catch (err) {
    console.error("SMS erreur:", err);
    return false;
  }
}

/** Envoyer un SMS de notification à la boutique */
export async function notifierBoutiqueSms(data: SmsData): Promise<boolean> {
  const storePhone = process.env.SMS_STORE_PHONE;
  if (!storePhone) return false;

  return envoyerSms({
    ...data,
    telephone: storePhone,
    prenom: `Commande de ${data.prenom}`,
    nom: data.nom,
  });
}
