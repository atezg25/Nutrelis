import { query } from "@/lib/db";
import { reponse, reponseErreur } from "@/lib/http";

export const dynamic = "force-dynamic";

type Ligne = {
  pid: string; slug: string; pname: string; subtitle: string | null; description: string | null; image_url: string | null; content: unknown;
  vid: string; sku: string; label: string; price_fcfa: number; original_price_fcfa: number | null; vdesc: string | null; popular: boolean; stock: number;
};

/** Catalogue public : produits actifs, leurs packs, leur prix et s'ils sont en stock. */
export async function GET() {
  try {
    const rows = await query<Ligne>(
      `SELECT p.id AS pid, p.slug, p.name AS pname, p.subtitle, p.description, p.image_url, p.content,
              v.id AS vid, v.sku, v.label, v.price_fcfa, v.original_price_fcfa, v.description AS vdesc, v.popular, s.stock
         FROM product p JOIN variant v ON v.product_id = p.id JOIN variant_stock s ON s.variant_id = v.id
        WHERE p.active AND v.active ORDER BY p.sort, p.name, v.sort, v.price_fcfa`,
    );
    const produits = new Map<string, Record<string, unknown> & { variants: unknown[] }>();
    for (const r of rows) {
      let p = produits.get(r.pid);
      if (!p) {
        p = { id: r.pid, slug: r.slug, name: r.pname, subtitle: r.subtitle, description: r.description, imageUrl: r.image_url, content: r.content ?? {}, variants: [] };
        produits.set(r.pid, p);
      }
      p.variants.push({
        id: r.vid, sku: r.sku, label: r.label, priceFcfa: r.price_fcfa, originalPriceFcfa: r.original_price_fcfa,
        description: r.vdesc, popular: r.popular,
        inStock: r.stock > 0,
        // Le stock exact n'est pas public ; on n'indique que « il en reste peu » pour créer l'urgence juste.
        stockFaible: r.stock > 0 && r.stock <= 5,
      });
    }
    // Avis clients vérifiés (achat livré) validés par la boutique.
    const avis = await query<{ product_id: string; rating: number; body: string; display_name: string; city: string | null; shop_reply: string | null; created_at: string }>(
      "SELECT product_id, rating, body, display_name, city, shop_reply, created_at FROM review WHERE status='publie' ORDER BY created_at DESC",
    );
    for (const a of avis) {
      const p = produits.get(a.product_id);
      if (p) ((p.avisVerifies as unknown[] | undefined) ?? (p.avisVerifies = [])).push({ rating: a.rating, body: a.body, display_name: a.display_name, city: a.city, shop_reply: a.shop_reply, created_at: a.created_at });
    }
    return reponse({ products: [...produits.values()] });
  } catch (err) {
    return reponseErreur(err);
  }
}
