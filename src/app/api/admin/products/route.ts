import { query, tx } from "@/lib/db";
import { corps, entier, erreur, refuserSiNonAdmin, reponse, reponseErreur, texte } from "@/lib/http";

export const dynamic = "force-dynamic";

export async function GET() {
  const refus = await refuserSiNonAdmin();
  if (refus) return refus;
  try {
    const produits = await query(
      `SELECT p.id, p.slug, p.name, p.subtitle, p.description, p.image_url, p.active, p.sort, p.content FROM product p ORDER BY p.sort, p.name`,
    );
    const variantes = await query(
      `SELECT v.id, v.product_id, v.sku, v.label, v.price_fcfa, v.original_price_fcfa, v.reseller_price_fcfa, v.low_stock_alert, v.active, v.sort, v.description, v.popular, s.stock
         FROM variant v JOIN variant_stock s ON s.variant_id=v.id ORDER BY v.sort, v.price_fcfa`,
    );
    return reponse({ produits, variantes });
  } catch (err) {
    return reponseErreur(err);
  }
}

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Nouveau produit, avec au moins un pack (« variante ») : { name, slug, packs: [{ sku, label, prix }] }. */
export async function POST(req: Request) {
  const refus = await refuserSiNonAdmin();
  if (refus) return refus;
  try {
    const b = await corps(req);
    const name = texte(b.name, 120);
    const slug = texte(b.slug, 80)?.toLowerCase() ?? null;
    if (!name || !slug || !SLUG.test(slug)) return erreur("Nom et identifiant (lettres, chiffres, tirets) requis.", 400);
    const packs = Array.isArray(b.packs) ? b.packs : [];
    if (packs.length === 0) return erreur("Ajoutez au moins un pack avec son prix.", 400);
    const lus = packs.map((x) => {
      const o = x as Record<string, unknown>;
      return { sku: texte(o.sku, 40)?.toUpperCase() ?? null, label: texte(o.label, 120), prix: entier(o.prix, 0), revendeur: o.prixRevendeur == null ? null : entier(o.prixRevendeur, 0) };
    });
    if (lus.some((p) => !p.sku || !p.label || p.prix === null)) return erreur("Chaque pack doit avoir un code, un libellé et un prix.", 400);
    const id = await tx(async (c) => {
      const r = await c.query<{ id: string }>(
        "INSERT INTO product (slug, name, subtitle, description, image_url, sort) VALUES ($1,$2,$3,$4,$5,(SELECT COALESCE(MAX(sort),0)+1 FROM product)) RETURNING id",
        [slug, name, texte(b.subtitle, 200), texte(b.description, 2000), texte(b.imageUrl, 400)],
      );
      let n = 0;
      for (const p of lus) {
        n += 1;
        await c.query("INSERT INTO variant (product_id, sku, label, price_fcfa, reseller_price_fcfa, sort) VALUES ($1,$2,$3,$4,$5,$6)", [r.rows[0]!.id, p.sku, p.label, p.prix, p.revendeur, n]);
      }
      return r.rows[0]!.id;
    });
    return reponse({ id }, 201);
  } catch (err) {
    if (err instanceof Error && /duplicate key/.test(err.message)) return erreur("Cet identifiant ou ce code de pack existe déjà.", 409);
    return reponseErreur(err);
  }
}
