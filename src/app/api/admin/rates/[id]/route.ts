import { journaliser } from "@/lib/admin-auth";
import { query } from "@/lib/db";
import { corps, entier, erreur, refuserSiNonAdmin, reponse, reponseErreur, texte, UUID } from "@/lib/http";

export const dynamic = "force-dynamic";

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
    if ("fraisFcfa" in b) { const v = entier(b.fraisFcfa, 0, 1_000_000); if (v === null) return erreur("Frais invalides.", 400); ajouter("fee_fcfa", v); }
    if ("delai" in b) ajouter("delay", texte(b.delai, 60));
    if (typeof b.active === "boolean") ajouter("active", b.active);
    if (sets.length === 0) return erreur("Rien à modifier.", 400);
    args.push(id);
    await query(`UPDATE shipping_rate SET ${sets.join(", ")} WHERE id=$${args.length}`, args);
    await journaliser("tarif_ville_modifie", `${id} : ${Object.entries(b).map(([k, v]) => `${k}=${String(v)}`).join(", ")}`);
    return reponse({ ok: true });
  } catch (err) {
    return reponseErreur(err);
  }
}

/** Supprimer le tarif d'une ville : elle retombe sur le tarif par défaut. */
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const refus = await refuserSiNonAdmin();
  if (refus) return refus;
  try {
    const { id } = await params;
    if (!UUID.test(id)) return erreur("Identifiant invalide.", 400);
    await query("DELETE FROM shipping_rate WHERE id=$1", [id]);
    await journaliser("tarif_ville_supprime", id);
    return reponse({ ok: true });
  } catch (err) {
    return reponseErreur(err);
  }
}
