import { query } from "@/lib/db";
import { reponse, reponseErreur } from "@/lib/http";

export const dynamic = "force-dynamic";

/** Articles publiés du blog, avec le produit auquel ils se rattachent (s'il y en a un). */
export async function GET() {
  try {
    const articles = await query(
      `SELECT b.slug, b.title, b.excerpt, b.category, b.image_url, b.external_url, (b.body <> '') AS has_body, b.published_at,
              p.slug AS product_slug, p.name AS product_name
         FROM blog_post b LEFT JOIN product p ON p.id = b.product_id
        WHERE b.published ORDER BY b.published_at DESC, b.created_at DESC`,
    );
    return reponse({ articles });
  } catch (err) {
    return reponseErreur(err);
  }
}
