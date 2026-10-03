import { query } from "@/lib/db";
import { corps, entier, erreur, refuserSiNonAdmin, reponse, reponseErreur, texte, UUID } from "@/lib/http";

export const dynamic = "force-dynamic";

/** Modifier un produit (nom, texte, image, visible en boutique ou non). */
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
    if ("name" in b) { const v = texte(b.name, 120); if (!v) return erreur("Nom invalide.", 400); ajouter("name", v); }
    if ("subtitle" in b) ajouter("subtitle", texte(b.subtitle, 200));
    if ("description" in b) ajouter("description", texte(b.description, 2000));
    if ("imageUrl" in b) ajouter("image_url", texte(b.imageUrl, 400));
    if (typeof b.active === "boolean") ajouter("active", b.active);
    if ("sort" in b) { const v = entier(b.sort, 0, 10000); if (v === null) return erreur("Ordre invalide.", 400); ajouter("sort", v); }
    if (sets.length === 0) return erreur("Rien à modifier.", 400);
    args.push(id);
    await query(`UPDATE product SET ${sets.join(", ")} WHERE id=$${args.length}`, args);
    return reponse({ ok: true });
  } catch (err) {
    return reponseErreur(err);
  }
}
