import { corps, erreur, reponse, reponseErreur, texte } from "@/lib/http";
import { evaluerCodePromo } from "@/lib/orders";
import { createRateLimiter, getClientIp } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

// Anti-devinette : 20 essais par minute et par adresse IP.
const limiteur = createRateLimiter({ maxRequests: 20, windowMs: 60_000 });

/**
 * Le client saisit un code au paiement : on lui montre la remise. Indicatif seulement — la VRAIE remise est recalculée et
 * appliquée par le serveur à la création de la commande (`creerCommande`).
 */
export async function POST(req: Request) {
  try {
    if (!limiteur.check(getClientIp(req.headers)).allowed) return erreur("Trop d'essais. Réessayez dans une minute.", 429, "TROP_ESSAIS");
    const b = await corps(req);
    const code = texte(b.code, 40);
    const sousTotal = typeof b.sousTotal === "number" && Number.isFinite(b.sousTotal) ? Math.max(0, Math.round(b.sousTotal)) : 0;
    if (!code) return erreur("Saisissez un code.", 400, "CODE_VIDE");
    const r = await evaluerCodePromo(null, code, sousTotal);
    return reponse({ code: r.code, remiseFcfa: r.discount, libelle: r.libelle });
  } catch (err) {
    return reponseErreur(err);
  }
}
