import { timingSafeEqual } from "node:crypto";
import { appliquerPaiement } from "@/lib/orders";
import { fapshiConfigure, verifierPaiement } from "@/lib/fapshi";
import { query } from "@/lib/db";
import { corps, reponse } from "@/lib/http";

export const dynamic = "force-dynamic";

/**
 * Webhook Fapshi. ⚠️ On NE FAIT PAS CONFIANCE au contenu reçu : seul `transId` est lu, puis on redemande
 * l'état à Fapshi (GET /payment-status). Un faux webhook ne peut donc rien valider.
 * Toujours 200 : Fapshi n'a pas à réessayer en boucle ; la réconciliation rattrape tout ce qui manque.
 */
export async function POST(req: Request) {
  // Secret partagé avec Fapshi (en-tête `x-wh-secret`). Fapshi ne l'envoie pas toujours : sans lui on ne rejette plus le message
  // (le paiement restait « en attente » jusqu'à la prochaine ouverture de la console), mais on ne traite alors QUE un transId que
  // NOUS avons créé (paiement « en attente » en base) ; l'état est de toute façon redemandé à Fapshi, qui seul fait foi.
  const attendu = process.env.FAPSHI_WEBHOOK_SECRET;
  let secretOk = !attendu;
  if (attendu) {
    const a = Buffer.from(req.headers.get("x-wh-secret") ?? "");
    const b = Buffer.from(attendu);
    secretOk = a.length === b.length && timingSafeEqual(a, b);
  }
  try {
    const b = await corps(req);
    const transId = typeof b.transId === "string" && /^[A-Za-z0-9_-]{4,40}$/.test(b.transId) ? b.transId : null;
    if (transId && fapshiConfigure()) {
      if (!secretOk) {
        const connu = await query("SELECT 1 FROM payment WHERE provider='fapshi' AND provider_ref=$1 AND status='en_attente' LIMIT 1", [transId]);
        if (connu.length === 0) return reponse({ ok: false }, 401);
      }
      const v = await verifierPaiement(transId);
      await appliquerPaiement(transId, v.statut, v.brut);
    }
  } catch (err) {
    console.error("[nutrelis] webhook fapshi", err instanceof Error ? err.message : err);
  }
  return reponse({ ok: true });
}
