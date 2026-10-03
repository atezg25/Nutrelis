import { query } from "@/lib/db";
import { refuserSiNonAdmin, reponse, reponseErreur } from "@/lib/http";

export const dynamic = "force-dynamic";

/** Clients : regroupés par téléphone à partir des commandes non annulées (nombre de commandes, total payé, dernière commande). */
export async function GET(req: Request) {
  const refus = await refuserSiNonAdmin();
  if (refus) return refus;
  try {
    const q = (new URL(req.url).searchParams.get("q") ?? "").trim();
    const args: unknown[] = [];
    let filtre = "";
    if (q) { args.push(`%${q}%`); filtre = `AND (customer_name ILIKE $1 OR phone ILIKE $1 OR email ILIKE $1 OR city ILIKE $1)`; }
    const clients = await query(
      `SELECT regexp_replace(phone, '[^0-9]', '', 'g') AS tel,
              (array_agg(customer_name ORDER BY created_at DESC))[1] AS nom,
              (array_agg(city ORDER BY created_at DESC) FILTER (WHERE city IS NOT NULL))[1] AS ville,
              (array_agg(email ORDER BY created_at DESC) FILTER (WHERE email IS NOT NULL))[1] AS email,
              COUNT(*)::int AS commandes,
              COALESCE(SUM(total_fcfa) FILTER (WHERE payment_status='payee'),0)::int AS paye_fcfa,
              COALESCE(SUM(total_fcfa) FILTER (WHERE payment_status<>'payee'),0)::int AS a_payer_fcfa,
              MAX(created_at) AS derniere
         FROM customer_order WHERE status <> 'annulee' AND channel <> 'revendeur' ${filtre}
        GROUP BY regexp_replace(phone, '[^0-9]', '', 'g') ORDER BY MAX(created_at) DESC LIMIT 300`,
      args,
    );
    return reponse({ clients });
  } catch (err) {
    return reponseErreur(err);
  }
}
