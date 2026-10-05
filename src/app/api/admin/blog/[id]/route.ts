import { query } from "@/lib/db";
import { corps, erreur, refuserSiNonAdmin, reponse, reponseErreur, texte, UUID } from "@/lib/http";
import { journaliser } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

const IMAGE = /^(\/images\/[A-Za-z0-9._\-\/]+|\/api\/media\/[0-9a-f-]{36})$/i;
const CATEGORIES = ["Conseils", "Beauté", "Santé", "Utilisation", "Produit"];

function slugifier(titre: string): string {
  return titre.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80) || "article";
}

/** Modifie un article (tous les champs sont facultatifs). */
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
    if ("title" in b) { const v = texte(b.title, 160); if (!v) return erreur("Le titre est obligatoire.", 400); ajouter("title", v); }
    if ("excerpt" in b) ajouter("excerpt", texte(b.excerpt, 400) ?? "");
    if ("body" in b) ajouter("body", typeof b.body === "string" ? b.body.slice(0, 20000) : "");
    if ("category" in b) ajouter("category", CATEGORIES.includes(String(b.category)) ? String(b.category) : "Conseils");
    if ("productId" in b) ajouter("product_id", typeof b.productId === "string" && UUID.test(b.productId) ? b.productId : null);
    if ("imageUrl" in b) { const v = texte(b.imageUrl, 200); if (v && !IMAGE.test(v)) return erreur("Image invalide : envoyez-la depuis la console.", 400); ajouter("image_url", v); }
    if ("externalUrl" in b) { const v = texte(b.externalUrl, 500); if (v && !/^https:\/\//.test(v)) return erreur("Le lien externe doit commencer par https://", 400); ajouter("external_url", v); }
    if (typeof b.published === "boolean") ajouter("published", b.published);
    if (sets.length === 0) return erreur("Rien à modifier.", 400);
    args.push(id);
    await query(`UPDATE blog_post SET ${sets.join(", ")} WHERE id=$${args.length}`, args);
    await journaliser("blog_modifie", `${id} : ${Object.keys(b).join(", ")}`);
    return reponse({ ok: true });
  } catch (err) {
    return reponseErreur(err);
  }
}

/** Supprime un article. */
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const refus = await refuserSiNonAdmin();
  if (refus) return refus;
  try {
    const { id } = await params;
    if (!UUID.test(id)) return erreur("Identifiant invalide.", 400);
    await query("DELETE FROM blog_post WHERE id=$1", [id]);
    await journaliser("blog_supprime", id);
    return reponse({ ok: true });
  } catch (err) {
    return reponseErreur(err);
  }
}
