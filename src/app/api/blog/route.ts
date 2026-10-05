import { query } from "@/lib/db";
import { reponse, reponseErreur } from "@/lib/http";

export const dynamic = "force-dynamic";

/** Articles publiés du blog, avec le produit auquel ils se rattachent (s'il y en a un). */
export async function GET(req: Request) {
  try {
    const en = new URL(req.url).searchParams.get("lang") === "en";
    const articles = await query(
      `SELECT b.slug, CASE WHEN $1 THEN COALESCE(NULLIF(b.title_en,''), b.title) ELSE b.title END AS title, CASE WHEN $1 THEN COALESCE(NULLIF(b.excerpt_en,''), b.excerpt) ELSE b.excerpt END AS excerpt, b.category, b.image_url, b.external_url, (b.body <> '') AS has_body, b.published_at,
              p.slug AS product_slug, CASE WHEN $1 THEN COALESCE(NULLIF(p.content->'en'->>'name',''), p.name) ELSE p.name END AS product_name
         FROM blog_post b LEFT JOIN product p ON p.id = b.product_id
        WHERE b.published ORDER BY b.published_at DESC, b.created_at DESC`,
      [en],
    );
    return reponse({ articles });
  } catch (err) {
    return reponseErreur(err);
  }
}
