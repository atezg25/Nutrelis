import { query } from "@/lib/db";
import { corps, entier, erreur, refuserSiNonAdmin, reponse, reponseErreur, texte, UUID } from "@/lib/http";

export const dynamic = "force-dynamic";

/** Modifier un pack : libellé, prix public, prix barré, prix revendeur, seuil d'alerte, en vente ou non. */
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
    if ("label" in b) { const v = texte(b.label, 120); if (!v) return erreur("Libellé invalide.", 400); ajouter("label", v); }
    if ("prix" in b) { const v = entier(b.prix, 0); if (v === null) return erreur("Prix invalide.", 400); ajouter("price_fcfa", v); }
    if ("prixBarre" in b) { const v = b.prixBarre == null ? null : entier(b.prixBarre, 0); if (b.prixBarre != null && v === null) return erreur("Prix barré invalide.", 400); ajouter("original_price_fcfa", v); }
    if ("prixRevendeur" in b) { const v = b.prixRevendeur == null ? null : entier(b.prixRevendeur, 0); if (b.prixRevendeur != null && v === null) return erreur("Prix revendeur invalide.", 400); ajouter("reseller_price_fcfa", v); }
    if ("seuil" in b) { const v = entier(b.seuil, 0, 100000); if (v === null) return erreur("Seuil invalide.", 400); ajouter("low_stock_alert", v); }
    if ("description" in b) ajouter("description", texte(b.description, 300));
    if (typeof b.populaire === "boolean") ajouter("popular", b.populaire);
    if (typeof b.active === "boolean") ajouter("active", b.active);
    if (sets.length === 0) return erreur("Rien à modifier.", 400);
    args.push(id);
    await query(`UPDATE variant SET ${sets.join(", ")} WHERE id=$${args.length}`, args);
    return reponse({ ok: true });
  } catch (err) {
    return reponseErreur(err);
  }
}
