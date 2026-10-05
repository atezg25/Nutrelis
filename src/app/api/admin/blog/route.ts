import { query } from "@/lib/db";
import { corps, erreur, refuserSiNonAdmin, reponse, reponseErreur, texte, UUID } from "@/lib/http";
import { journaliser } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

const IMAGE = /^(\/images\/[A-Za-z0-9._\-\/]+|\/api\/media\/[0-9a-f-]{36})$/i;
const CATEGORIES = ["Conseils", "Beauté", "Santé", "Utilisation", "Produit"];

function slugifier(titre: string): string {
  return titre.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80) || "article";
}

/** Tous les articles (publiés ou non) et la liste des produits auxquels on peut les rattacher. */
export async function GET() {
  const refus = await refuserSiNonAdmin();
  if (refus) return refus;
  try {
    const articles = await query(
      `SELECT b.id, b.slug, b.title, b.excerpt, b.body, b.title_en, b.excerpt_en, b.body_en, b.category, b.product_id, b.image_url, b.external_url, b.published, b.published_at, p.name AS product_name
         FROM blog_post b LEFT JOIN product p ON p.id = b.product_id ORDER BY b.published_at DESC, b.created_at DESC`,
    );
    const produits = await query("SELECT id, name FROM product ORDER BY sort, name");
    return reponse({ articles, produits, categories: CATEGORIES });
  } catch (err) {
    return reponseErreur(err);
  }
}

/** Crée un article. */
export async function POST(req: Request) {
  const refus = await refuserSiNonAdmin();
  if (refus) return refus;
  try {
    const b = await corps(req);
    const titre = texte(b.title, 160);
    if (!titre) return erreur("Le titre est obligatoire.", 400);
    const externe = texte(b.externalUrl, 500);
    if (externe && !/^https:\/\//.test(externe)) return erreur("Le lien externe doit commencer par https://", 400);
    const image = texte(b.imageUrl, 200);
    if (image && !IMAGE.test(image)) return erreur("Image invalide : envoyez-la depuis la console.", 400);
    const produit = typeof b.productId === "string" && UUID.test(b.productId) ? b.productId : null;
    const categorie = CATEGORIES.includes(String(b.category)) ? String(b.category) : "Conseils";
    let slug = slugifier(titre);
    const [existe] = await query("SELECT 1 FROM blog_post WHERE slug=$1", [slug]);
    if (existe) slug = `${slug}-${Date.now().toString(36).slice(-4)}`;
    const [a] = await query<{ id: string }>(
      `INSERT INTO blog_post (slug, title, excerpt, body, category, product_id, image_url, external_url, published, title_en, excerpt_en, body_en)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING id`,
      [slug, titre, texte(b.excerpt, 400) ?? "", typeof b.body === "string" ? b.body.slice(0, 20000) : "", categorie, produit, image, externe, b.published === true, texte(b.titleEn, 160), texte(b.excerptEn, 400), typeof b.bodyEn === "string" && b.bodyEn.trim() ? b.bodyEn.slice(0, 20000) : null],
    );
    await journaliser("blog_cree", titre);
    return reponse({ id: a!.id, slug }, 201);
  } catch (err) {
    return reponseErreur(err);
  }
}
