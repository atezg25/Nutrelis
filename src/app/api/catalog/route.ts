import { query } from "@/lib/db";
import { reponse, reponseErreur } from "@/lib/http";

export const dynamic = "force-dynamic";

type Ligne = {
  pid: string; slug: string; pname: string; subtitle: string | null; description: string | null; image_url: string | null;
  vid: string; sku: string; label: string; price_fcfa: number; original_price_fcfa: number | null; stock: number;
};

/** Catalogue public : produits actifs, leurs packs, leur prix et s'ils sont en stock. */
export async function GET() {
  try {
    const rows = await query<Ligne>(
      `SELECT p.id AS pid, p.slug, p.name AS pname, p.subtitle, p.description, p.image_url,
              v.id AS vid, v.sku, v.label, v.price_fcfa, v.original_price_fcfa, s.stock
         FROM product p JOIN variant v ON v.product_id = p.id JOIN variant_stock s ON s.variant_id = v.id
        WHERE p.active AND v.active ORDER BY p.sort, p.name, v.sort, v.price_fcfa`,
    );
    const produits = new Map<string, Record<string, unknown> & { variants: unknown[] }>();
    for (const r of rows) {
      let p = produits.get(r.pid);
      if (!p) {
        p = { id: r.pid, slug: r.slug, name: r.pname, subtitle: r.subtitle, description: r.description, imageUrl: r.image_url, variants: [] };
        produits.set(r.pid, p);
      }
      p.variants.push({
        id: r.vid, sku: r.sku, label: r.label, priceFcfa: r.price_fcfa, originalPriceFcfa: r.original_price_fcfa,
        inStock: r.stock > 0,
        // Le stock exact n'est pas public ; on n'indique que « il en reste peu » pour créer l'urgence juste.
        stockFaible: r.stock > 0 && r.stock <= 5,
      });
    }
    return reponse({ products: [...produits.values()] });
  } catch (err) {
    return reponseErreur(err);
  }
}
