import { journaliser } from "@/lib/admin-auth";
import { query } from "@/lib/db";
import { corps, erreur, refuserSiNonAdmin, reponse, reponseErreur, texte, UUID } from "@/lib/http";

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
    if ("name" in b) { const v = texte(b.name, 100); if (!v) return erreur("Nom invalide.", 400); ajouter("name", v); }
    if ("phone" in b) ajouter("phone", texte(b.phone, 30));
    if ("notes" in b) ajouter("notes", texte(b.notes, 300));
    if (typeof b.active === "boolean") ajouter("active", b.active);
    if (sets.length === 0) return erreur("Rien à modifier.", 400);
    args.push(id);
    try {
      await query(`UPDATE carrier SET ${sets.join(", ")} WHERE id=$${args.length}`, args);
    } catch (err) {
      if (err instanceof Error && /duplicate key/.test(err.message)) return erreur("Ce nom est déjà pris.", 409);
      throw err;
    }
    await journaliser("transporteur_modifie", `${id} : ${Object.keys(b).join(", ")}`);
    return reponse({ ok: true });
  } catch (err) {
    return reponseErreur(err);
  }
}
