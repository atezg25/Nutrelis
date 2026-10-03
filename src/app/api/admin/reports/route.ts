import { query } from "@/lib/db";
import { refuserSiNonAdmin, reponse, reponseErreur } from "@/lib/http";

export const dynamic = "force-dynamic";

/** Rapports sur 7, 30 ou 90 jours : ventes encaissées par jour, produits les plus vendus, répartition par canal et par moyen de paiement. */
export async function GET(req: Request) {
  const refus = await refuserSiNonAdmin();
  if (refus) return refus;
  try {
    const j = Number(new URL(req.url).searchParams.get("jours"));
    const jours = [7, 30, 90].includes(j) ? j : 30;
    const parJour = await query<{ jour: string; commandes: number; encaisse: number }>(
      `SELECT to_char(d::date, 'YYYY-MM-DD') AS jour,
              COUNT(o.id) FILTER (WHERE o.status <> 'annulee')::int AS commandes,
              COALESCE(SUM(o.total_fcfa) FILTER (WHERE o.payment_status='payee'),0)::int AS encaisse
         FROM generate_series(current_date - ($1::int - 1), current_date, interval '1 day') d
         LEFT JOIN customer_order o ON o.created_at::date = d::date
        GROUP BY d ORDER BY d`,
      [jours],
    );
    const produits = await query(
      `SELECT i.name, SUM(i.qty)::int AS quantite, SUM(i.qty * i.unit_fcfa)::int AS chiffre_fcfa
         FROM order_item i JOIN customer_order o ON o.id=i.order_id
        WHERE o.status <> 'annulee' AND o.created_at >= now() - ($1::int * interval '1 day')
        GROUP BY i.name ORDER BY chiffre_fcfa DESC LIMIT 10`,
      [jours],
    );
    const canaux = await query(
      `SELECT channel, COUNT(*)::int AS commandes, COALESCE(SUM(total_fcfa),0)::int AS total_fcfa
         FROM customer_order WHERE status <> 'annulee' AND created_at >= now() - ($1::int * interval '1 day') GROUP BY channel ORDER BY total_fcfa DESC`,
      [jours],
    );
    const moyens = await query(
      `SELECT payment_method, COUNT(*)::int AS commandes, COALESCE(SUM(total_fcfa) FILTER (WHERE payment_status='payee'),0)::int AS encaisse_fcfa
         FROM customer_order WHERE status <> 'annulee' AND created_at >= now() - ($1::int * interval '1 day') GROUP BY payment_method ORDER BY encaisse_fcfa DESC`,
      [jours],
    );
    const [t] = await query<{ commandes: number; encaisse: number; panier_moyen: number; annulees: number }>(
      `SELECT COUNT(*) FILTER (WHERE status <> 'annulee')::int AS commandes,
              COALESCE(SUM(total_fcfa) FILTER (WHERE payment_status='payee'),0)::int AS encaisse,
              COALESCE(AVG(total_fcfa) FILTER (WHERE status <> 'annulee'),0)::int AS panier_moyen,
              COUNT(*) FILTER (WHERE status = 'annulee')::int AS annulees
         FROM customer_order WHERE created_at >= now() - ($1::int * interval '1 day')`,
      [jours],
    );
    return reponse({ jours, totaux: t, parJour, produits, canaux, moyens });
  } catch (err) {
    return reponseErreur(err);
  }
}
