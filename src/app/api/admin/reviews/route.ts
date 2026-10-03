import { query } from "@/lib/db";
import { refuserSiNonAdmin, reponse, reponseErreur } from "@/lib/http";

export const dynamic = "force-dynamic";

/** Avis clients à valider / publiés / refusés, avec la commande d'origine (preuve d'achat). `?statut=` filtre. */
export async function GET(req: Request) {
  const refus = await refuserSiNonAdmin();
  if (refus) return refus;
  try {
    const statut = new URL(req.url).searchParams.get("statut");
    const args: unknown[] = [];
    let filtre = "";
    if (statut === "en_attente" || statut === "publie" || statut === "refuse") { args.push(statut); filtre = "WHERE r.status=$1"; }
    const avis = await query(
      `SELECT r.id, r.rating, r.body, r.display_name, r.city, r.status, r.shop_reply, r.created_at, r.decided_at, p.name AS product_name, o.number
         FROM review r JOIN product p ON p.id=r.product_id JOIN customer_order o ON o.id=r.order_id ${filtre} ORDER BY (r.status='en_attente') DESC, r.created_at DESC LIMIT 200`,
      args,
    );
    const [c] = await query<{ en_attente: number; publies: number }>("SELECT COUNT(*) FILTER (WHERE status='en_attente')::int AS en_attente, COUNT(*) FILTER (WHERE status='publie')::int AS publies FROM review");
    return reponse({ avis, compteurs: c });
  } catch (err) {
    return reponseErreur(err);
  }
}
