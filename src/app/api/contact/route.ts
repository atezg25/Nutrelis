import { query } from "@/lib/db";
import { corps, erreur, reponse, reponseErreur, texte } from "@/lib/http";
import { createRateLimiter, getClientIp } from "@/lib/rate-limit";
import { notifierBoutique } from "@/lib/notifier";

export const dynamic = "force-dynamic";

// Anti-spam : 4 messages par 10 minutes et par adresse IP.
const limiteur = createRateLimiter({ maxRequests: 4, windowMs: 600_000 });

/** Formulaire de contact : le message est ENREGISTRÉ (onglet « Messages » de la console) puis la boutique est alertée. */
export async function POST(req: Request) {
  try {
    if (!limiteur.check(getClientIp(req.headers)).allowed) return erreur("Trop de messages envoyés. Réessayez dans quelques minutes.", 429, "TROP_ESSAIS");
    const b = await corps(req);
    // Champ piège invisible : un robot le remplit, une personne jamais. On répond « ok » sans rien enregistrer.
    if (typeof b.site === "string" && b.site.trim() !== "") return reponse({ ok: true });
    const nom = texte(b.nom, 80);
    const email = texte(b.email, 160);
    const sujet = texte(b.sujet, 120);
    const message = texte(b.message, 2000);
    if (!nom || !email || !message) return erreur("Nom, adresse e-mail et message sont obligatoires.", 400, "CHAMPS");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return erreur("Adresse e-mail invalide.", 400, "EMAIL");
    if (message.length < 5) return erreur("Votre message est trop court.", 400, "MESSAGE");
    await query("INSERT INTO contact_message (name, email, subject, message) VALUES ($1,$2,$3,$4)", [nom, email, sujet, message]);
    void notifierBoutique(
      `Nouveau message de ${nom}`,
      `✉️ Nouveau message sur le site\nDe : ${nom} <${email}>\nSujet : ${sujet ?? "—"}\n\n${message.slice(0, 600)}\n\nRépondre : https://nutrelis.bio/admin (onglet Messages)`,
    ).catch(() => undefined);
    return reponse({ ok: true });
  } catch (err) {
    return reponseErreur(err);
  }
}
