import { journaliser } from "@/lib/admin-auth";
import { query } from "@/lib/db";
import { corps, erreur, refuserSiNonAdmin, reponse, reponseErreur, texte, UUID } from "@/lib/http";

export const dynamic = "force-dynamic";

/**
 * Valider (publier) ou refuser un avis, et y répondre au nom de la boutique. Le texte du client N'EST PAS modifiable : un avis
 * retouché cesse d'être un avis. La boutique répond dans `shop_reply`, affichée sous l'avis.
 */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const refus = await refuserSiNonAdmin();
  if (refus) return refus;
  try {
    const { id } = await params;
    if (!UUID.test(id)) return erreur("Identifiant invalide.", 400);
    const b = await corps(req);
    const sets: string[] = [];
    const args: unknown[] = [];
    const ajouter = (col: string, v: unknown) => { args.push(v); sets.push(`${col}=$${args.length}`); };
    if (b.statut === "publie" || b.statut === "refuse" || b.statut === "en_attente") { ajouter("status", b.statut); sets.push("decided_at=now()"); }
    if ("reponse" in b) ajouter("shop_reply", texte(b.reponse, 600));
    if (sets.length === 0) return erreur("Rien à modifier.", 400);
    args.push(id);
    await query(`UPDATE review SET ${sets.join(", ")} WHERE id=$${args.length}`, args);
    await journaliser("avis_modere", `${id} : ${Object.keys(b).map((k) => `${k}=${String(b[k]).slice(0, 40)}`).join(", ")}`);
    return reponse({ ok: true });
  } catch (err) {
    return reponseErreur(err);
  }
}
