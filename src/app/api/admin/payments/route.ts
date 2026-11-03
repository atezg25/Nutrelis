import { query } from "@/lib/db";
import { reconcilierEnArrierePlan } from "@/lib/orders";
import { refuserSiNonAdmin, reponse, reponseErreur } from "@/lib/http";

export const dynamic = "force-dynamic";

/** Tous les paiements : en ligne (Fapshi) et encaissements manuels, avec le mot brut du fournisseur. */
export async function GET() {
  const refus = await refuserSiNonAdmin();
  if (refus) return refus;
  try {
    reconcilierEnArrierePlan();
    const enLigne = await query(
      `SELECT p.created_at, o.number, o.customer_name, p.provider, p.provider_ref, p.amount_fcfa, p.status, p.provider_status
         FROM payment p JOIN customer_order o ON o.id=p.order_id ORDER BY p.created_at DESC LIMIT 200`,
    );
    const manuels = await query(
      `SELECT o.updated_at AS created_at, o.number, o.customer_name, o.payment_method AS provider, NULL AS provider_ref, o.total_fcfa AS amount_fcfa,
              'payee' AS status, NULL AS provider_status
         FROM customer_order o WHERE o.payment_status='payee' AND o.payment_method <> 'fapshi' ORDER BY o.updated_at DESC LIMIT 200`,
    );
    const [resume] = await query<{ encaisse: number; en_attente: number; a_la_livraison: number }>(
      `SELECT COALESCE(SUM(total_fcfa) FILTER (WHERE payment_status='payee'),0)::int AS encaisse,
              COALESCE(SUM(total_fcfa) FILTER (WHERE payment_status='en_attente' AND status<>'annulee'),0)::int AS en_attente,
              COALESCE(SUM(total_fcfa) FILTER (WHERE payment_status='a_la_livraison' AND status<>'annulee'),0)::int AS a_la_livraison
         FROM customer_order`,
    );
    return reponse({ resume, paiements: [...enLigne, ...manuels].sort((a, b) => +new Date(b.created_at as string) - +new Date(a.created_at as string)) });
  } catch (err) {
    return reponseErreur(err);
  }
}
