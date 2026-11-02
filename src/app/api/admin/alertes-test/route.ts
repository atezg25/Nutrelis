import { journaliser } from "@/lib/admin-auth";
import { destinatairesAlertes, notifierBoutique } from "@/lib/notifier";
import { refuserSiNonProprietaire, reponse, reponseErreur } from "@/lib/http";

export const dynamic = "force-dynamic";

/** Envoie une alerte « TEST » par tous les canaux configurés et dit ce qui a été tenté (propriétaire seulement). */
export async function POST() {
  const refus = await refuserSiNonProprietaire();
  if (refus) return refus;
  try {
    const d = await destinatairesAlertes();
    const email = !!process.env.RESEND_API_KEY && d.emails.length > 0;
    const telegram = !!process.env.TELEGRAM_BOT_TOKEN && d.telegram.length > 0;
    const whatsapp = process.env.WHATSAPP_ENABLED === "true" && !!process.env.WHATSAPP_TOKEN && !!process.env.WHATSAPP_PHONE_ID && d.telephones.length > 0;
    await notifierBoutique("TEST — alertes NUTRELIS", "✅ Ceci est un test envoyé depuis l'administration. Si vous le lisez, ce canal reçoit bien les alertes (commandes, paiements, annulations, ruptures de stock).");
    await journaliser("alerte_test", `e-mail ${email ? d.emails.length : 0}, telegram ${telegram ? d.telegram.length : 0}, whatsapp ${whatsapp ? d.telephones.length : 0}`);
    return reponse({
      canaux: [
        { nom: "E-mail", actif: email, destinataires: email ? d.emails.length : 0, raison: email ? null : !process.env.RESEND_API_KEY ? "clé d'envoi absente" : "aucune adresse" },
        { nom: "Telegram", actif: telegram, destinataires: telegram ? d.telegram.length : 0, raison: telegram ? null : !process.env.TELEGRAM_BOT_TOKEN ? "robot non configuré" : "aucun identifiant de discussion" },
        { nom: "WhatsApp", actif: whatsapp, destinataires: whatsapp ? d.telephones.length : 0, raison: whatsapp ? null : "API WhatsApp de Meta non configurée" },
      ],
    });
  } catch (err) {
    return reponseErreur(err);
  }
}
