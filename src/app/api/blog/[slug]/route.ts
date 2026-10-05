import { query } from "@/lib/db";
import { erreur, reponse, reponseErreur } from "@/lib/http";

export const dynamic = "force-dynamic";

/** Un article publié, avec son texte intégral. */
export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const [a] = await query(
      `SELECT b.slug, b.title, b.excerpt, b.body, b.category, b.image_url, b.external_url, b.published_at,
              p.slug AS product_slug, p.name AS product_name, p.image_url AS product_image
         FROM blog_post b LEFT JOIN product p ON p.id = b.product_id
        WHERE b.published AND b.slug = $1`,
      [slug.toLowerCase()],
    );
    if (!a) return erreur("Article introuvable.", 404);
    return reponse({ article: a });
  } catch (err) {
    return reponseErreur(err);
  }
}
