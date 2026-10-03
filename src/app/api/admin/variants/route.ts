import { query } from "@/lib/db";
import { corps, entier, erreur, refuserSiNonAdmin, reponse, reponseErreur, texte, UUID } from "@/lib/http";
import { journaliser } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

/** Ajouter un pack à un produit existant. */
export async function POST(req: Request) {
  const refus = await refuserSiNonAdmin();
  if (refus) return refus;
  try {
    const b = await corps(req);
    const productId = typeof b.productId === "string" && UUID.test(b.productId) ? b.productId : null;
    const sku = texte(b.sku, 40)?.toUpperCase() ?? null;
    const label = texte(b.label, 120);
    const prix = entier(b.prix, 0);
    if (!productId || !sku || !label || prix === null) return erreur("Produit, code, libellé et prix requis.", 400);
    const revendeur = b.prixRevendeur == null ? null : entier(b.prixRevendeur, 0);
    const [v] = await query<{ id: string }>(
      "INSERT INTO variant (product_id, sku, label, price_fcfa, reseller_price_fcfa, description, popular, sort) VALUES ($1,$2,$3,$4,$5,$6,$7,(SELECT COALESCE(MAX(sort),0)+1 FROM variant WHERE product_id=$1)) RETURNING id",
      [productId, sku, label, prix, revendeur, texte(b.description, 300), b.populaire === true],
    );
    await journaliser("pack_cree", `${sku} — ${label} — ${prix} FCFA`);
    return reponse({ id: v!.id }, 201);
  } catch (err) {
    if (err instanceof Error && /duplicate key/.test(err.message)) return erreur("Ce code de pack existe déjà.", 409);
    return reponseErreur(err);
  }
}
