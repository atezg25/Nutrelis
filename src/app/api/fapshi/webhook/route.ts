import { appliquerPaiement } from "@/lib/orders";
import { fapshiConfigure, verifierPaiement } from "@/lib/fapshi";
import { corps, reponse } from "@/lib/http";

export const dynamic = "force-dynamic";

/**
 * Webhook Fapshi. ⚠️ On NE FAIT PAS CONFIANCE au contenu reçu : seul `transId` est lu, puis on redemande
 * l'état à Fapshi (GET /payment-status). Un faux webhook ne peut donc rien valider.
 * Toujours 200 : Fapshi n'a pas à réessayer en boucle ; la réconciliation rattrape tout ce qui manque.
 */
export async function POST(req: Request) {
  try {
    const b = await corps(req);
    const transId = typeof b.transId === "string" ? b.transId : null;
    if (transId && fapshiConfigure()) {
      const v = await verifierPaiement(transId);
      await appliquerPaiement(transId, v.statut, v.brut);
    }
  } catch (err) {
    console.error("[nutrelis] webhook fapshi", err instanceof Error ? err.message : err);
  }
  return reponse({ ok: true });
}
