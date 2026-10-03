import { query } from "@/lib/db";
import { corps, entier, erreur, reponse, reponseErreur, texte, UUID } from "@/lib/http";

export const dynamic = "force-dynamic";

const chiffres = (s: string) => s.replace(/\D/g, "");

type LigneCommande = { id: string; number: string; status: string; phone: string; customer_name: string; city: string | null };

/** Retrouve la commande par numéro + téléphone (même réponse pour « inconnue » et « mauvais téléphone »). */
async function commande(numero: string, tel: string): Promise<LigneCommande | null> {
  const rows = await query<LigneCommande>("SELECT id, number, status, phone, customer_name, city FROM customer_order WHERE number=$1", [numero.trim().toUpperCase()]);
  const o = rows[0];
  if (!o || chiffres(tel).length < 8 || chiffres(o.phone).slice(-8) !== chiffres(tel).slice(-8)) return null;
  return o;
}

/**
 * Étape 1 : « quels produits puis-je noter ? » — numéro + téléphone de la commande. Seuls les produits d'une commande LIVRÉE
 * et pas encore notés sont proposés : un avis est toujours celui d'un acheteur réel.
 */
export async function GET(req: Request) {
  try {
    const u = new URL(req.url).searchParams;
    const o = await commande(u.get("numero") ?? "", u.get("tel") ?? "");
    if (!o) return erreur("Commande introuvable. Vérifiez le numéro et le téléphone utilisés pour la commande.", 404, "INTROUVABLE");
    if (o.status !== "livree") return erreur("Vous pourrez donner votre avis une fois votre colis livré.", 409, "PAS_LIVREE");
    const produits = await query<{ id: string; name: string; deja: boolean }>(
      `SELECT DISTINCT p.id, p.name, EXISTS (SELECT 1 FROM review r WHERE r.order_id=$1 AND r.product_id=p.id) AS deja
         FROM order_item i JOIN variant v ON v.id=i.variant_id JOIN product p ON p.id=v.product_id WHERE i.order_id=$1 ORDER BY p.name`,
      [o.id],
    );
    return reponse({ numero: o.number, nom: o.customer_name.split(" ")[0], ville: o.city, produits });
  } catch (err) {
    return reponseErreur(err);
  }
}

/** Étape 2 : dépôt de l'avis (en attente de validation par la boutique). */
export async function POST(req: Request) {
  try {
    const b = await corps(req);
    const numero = texte(b.numero, 20) ?? "";
    const tel = texte(b.tel, 30) ?? "";
    const o = await commande(numero, tel);
    if (!o) return erreur("Commande introuvable.", 404, "INTROUVABLE");
    if (o.status !== "livree") return erreur("Vous pourrez donner votre avis une fois votre colis livré.", 409, "PAS_LIVREE");
    const productId = typeof b.productId === "string" && UUID.test(b.productId) ? b.productId : null;
    const note = entier(b.note, 1, 5);
    const avis = texte(b.texte, 1200);
    const nom = texte(b.nom, 60) ?? o.customer_name.split(" ")[0] ?? "Client";
    if (!productId || !note || !avis || avis.length < 3) return erreur("Choisissez le produit, une note de 1 à 5 et écrivez votre avis.", 400);
    // Le produit doit faire partie de CETTE commande.
    const ok = await query(
      "SELECT 1 FROM order_item i JOIN variant v ON v.id=i.variant_id WHERE i.order_id=$1 AND v.product_id=$2 LIMIT 1", [o.id, productId]);
    if (ok.length === 0) return erreur("Ce produit ne fait pas partie de votre commande.", 400, "PRODUIT_INVALIDE");
    try {
      await query("INSERT INTO review (order_id, product_id, rating, body, display_name, city) VALUES ($1,$2,$3,$4,$5,$6)", [o.id, productId, note, avis, nom, o.city]);
    } catch (err) {
      if (err instanceof Error && /duplicate key/.test(err.message)) return erreur("Vous avez déjà donné votre avis sur ce produit. Merci !", 409, "DEJA_DONNE");
      throw err;
    }
    return reponse({ ok: true }, 201);
  } catch (err) {
    return reponseErreur(err);
  }
}
