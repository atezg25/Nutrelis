import { query } from "@/lib/db";
import { erreur, reponse, reponseErreur } from "@/lib/http";

export const dynamic = "force-dynamic";

/** Un article publié, avec son texte intégral. */
export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const en = new URL(req.url).searchParams.get("lang") === "en";
    const [a] = await query(
      `SELECT b.slug, CASE WHEN $2 THEN COALESCE(NULLIF(b.title_en,''), b.title) ELSE b.title END AS title, CASE WHEN $2 THEN COALESCE(NULLIF(b.excerpt_en,''), b.excerpt) ELSE b.excerpt END AS excerpt, CASE WHEN $2 THEN COALESCE(NULLIF(b.body_en,''), b.body) ELSE b.body END AS body, b.category, b.image_url, b.external_url, b.published_at,
              p.slug AS product_slug, CASE WHEN $2 THEN COALESCE(NULLIF(p.content->'en'->>'name',''), p.name) ELSE p.name END AS product_name, p.image_url AS product_image
         FROM blog_post b LEFT JOIN product p ON p.id = b.product_id
        WHERE b.published AND b.slug = $1`,
      [slug.toLowerCase(), en],
    );
    if (!a) return erreur("Article introuvable.", 404);
    return reponse({ article: a });
  } catch (err) {
    return reponseErreur(err);
  }
}
