import { query } from "@/lib/db";
import { corps, erreur, refuserSiNonAdmin, reponse, reponseErreur, UUID } from "@/lib/http";

export const dynamic = "force-dynamic";

/** Marque un panier « relancé » ou « récupéré » (le client a fini par commander autrement). */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const refus = await refuserSiNonAdmin();
  if (refus) return refus;
  try {
    const { id } = await params;
    if (!UUID.test(id)) return erreur("Panier introuvable.", 404);
    const b = await corps(req);
    if (b.status !== "relance" && b.status !== "recupere") return erreur("Statut invalide.", 400);
    const r = await query<{ id: string }>("UPDATE abandoned_cart SET status=$2, updated_at=now() WHERE id=$1 RETURNING id", [id, b.status]);
    if (!r[0]) return erreur("Panier introuvable.", 404);
    return reponse({ ok: true });
  } catch (err) {
    return reponseErreur(err);
  }
}
