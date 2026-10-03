import { query } from "@/lib/db";
import { reconcilierPaiements } from "@/lib/orders";
import { refuserSiNonAdmin, reponse, reponseErreur } from "@/lib/http";

export const dynamic = "force-dynamic";

/** Tableau de bord : l'essentiel d'un coup d'œil. */
export async function GET() {
  const refus = await refuserSiNonAdmin();
  if (refus) return refus;
  try {
    await reconcilierPaiements();
    const [chiffres] = await query<{ commandes_jour: number; ca_jour: number; ca_mois: number; a_traiter: number; impayees: number; commandes_mois: number }>(
      `SELECT
         COUNT(*) FILTER (WHERE created_at >= date_trunc('day', now()) AND status <> 'annulee')::int AS commandes_jour,
         COALESCE(SUM(total_fcfa) FILTER (WHERE created_at >= date_trunc('day', now()) AND payment_status='payee'),0)::int AS ca_jour,
         COALESCE(SUM(total_fcfa) FILTER (WHERE created_at >= date_trunc('month', now()) AND payment_status='payee'),0)::int AS ca_mois,
         COUNT(*) FILTER (WHERE status IN ('nouvelle','confirmee'))::int AS a_traiter,
         COUNT(*) FILTER (WHERE status NOT IN ('annulee') AND payment_status IN ('en_attente','a_la_livraison'))::int AS impayees,
         COUNT(*) FILTER (WHERE created_at >= date_trunc('month', now()) AND status <> 'annulee')::int AS commandes_mois
       FROM customer_order`,
    );
    const stockFaible = await query<{ sku: string; label: string; pname: string; stock: number; low_stock_alert: number }>(
      `SELECT v.sku, v.label, p.name AS pname, s.stock, v.low_stock_alert FROM variant v
         JOIN product p ON p.id=v.product_id JOIN variant_stock s ON s.variant_id=v.id
        WHERE v.active AND s.stock <= v.low_stock_alert ORDER BY s.stock, p.name`,
    );
    const derniers = await query(
      `SELECT id, number, customer_name, total_fcfa, status, payment_status, channel, created_at FROM customer_order ORDER BY created_at DESC LIMIT 8`,
    );
    return reponse({ chiffres, stockFaible, derniers });
  } catch (err) {
    return reponseErreur(err);
  }
}
