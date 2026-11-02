import { query } from "@/lib/db";
import { journaliser } from "@/lib/admin-auth";
import { corps, erreur, refuserSiNonAdmin, reponse, reponseErreur, UUID } from "@/lib/http";

export const dynamic = "force-dynamic";

/** Active / désactive un code. */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const refus = await refuserSiNonAdmin();
  if (refus) return refus;
  try {
    const { id } = await params;
    if (!UUID.test(id)) return erreur("Code introuvable.", 404);
    const b = await corps(req);
    if (typeof b.active !== "boolean") return erreur("Valeur invalide.", 400);
    const r = await query<{ code: string }>("UPDATE promo_code SET active=$2 WHERE id=$1 RETURNING code", [id, b.active]);
    if (!r[0]) return erreur("Code introuvable.", 404);
    await journaliser(b.active ? "promo_activee" : "promo_desactivee", r[0].code);
    return reponse({ ok: true });
  } catch (err) {
    return reponseErreur(err);
  }
}

/** Supprime un code JAMAIS utilisé ; un code déjà utilisé se désactive seulement (l'historique des commandes le référence). */
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const refus = await refuserSiNonAdmin();
  if (refus) return refus;
  try {
    const { id } = await params;
    if (!UUID.test(id)) return erreur("Code introuvable.", 404);
    const r = await query<{ code: string }>("DELETE FROM promo_code WHERE id=$1 AND used_count=0 RETURNING code", [id]);
    if (!r[0]) return erreur("Ce code a déjà servi : désactivez-le plutôt que de le supprimer.", 409);
    await journaliser("promo_supprimee", r[0].code);
    return reponse({ ok: true });
  } catch (err) {
    return reponseErreur(err);
  }
}
