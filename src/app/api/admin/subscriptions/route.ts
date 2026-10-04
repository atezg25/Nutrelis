import { query } from "@/lib/db";
import { corps, erreur, refuserSiNonAdmin, reponse, reponseErreur, texte } from "@/lib/http";
import { journaliser } from "@/lib/admin-auth";
import { RELANCE_ABONNEMENT_JOURS, REMISE_ABONNEMENT_PCT } from "@/lib/abonnement";

export const dynamic = "force-dynamic";

/**
 * Abonnés = clients (par téléphone) ayant passé au moins une commande en abonnement non annulée.
 * « À relancer » = leur dernière commande (de n'importe quel type) date d'au moins RELANCE_ABONNEMENT_JOURS jours.
 */
export async function GET() {
  const refus = await refuserSiNonAdmin();
  if (refus) return refus;
  try {
    const abonnes = await query(
      `WITH abo AS (
         SELECT phone, max(customer_name) AS nom, max(city) AS ville, count(*)::int AS nb_abonnements,
                min(created_at) AS depuis
           FROM customer_order WHERE subscription AND status <> 'annulee' AND payment_status NOT IN ('echouee')
          GROUP BY phone
       )
       SELECT a.phone, a.nom, a.ville, a.nb_abonnements, a.depuis,
              (SELECT max(o.created_at) FROM customer_order o WHERE o.phone = a.phone AND o.status <> 'annulee') AS derniere,
              (SELECT o.number FROM customer_order o WHERE o.phone = a.phone AND o.status <> 'annulee' ORDER BY o.created_at DESC LIMIT 1) AS derniere_commande,
              (SELECT string_agg(DISTINCT i.name, ', ') FROM order_item i JOIN customer_order o ON o.id = i.order_id WHERE o.phone = a.phone AND i.subscription) AS produits,
              (s.phone IS NOT NULL) AS resilie
         FROM abo a LEFT JOIN subscription_stop s ON s.phone = a.phone
        ORDER BY resilie ASC, derniere ASC`,
    );
    return reponse({ abonnes, relanceJours: RELANCE_ABONNEMENT_JOURS, remisePct: REMISE_ABONNEMENT_PCT });
  } catch (err) {
    return reponseErreur(err);
  }
}

/** Résilier (ou rétablir) un abonné : on ne le relance plus. */
export async function POST(req: Request) {
  const refus = await refuserSiNonAdmin();
  if (refus) return refus;
  try {
    const b = await corps(req);
    const phone = texte(b.phone, 30);
    if (!phone) return erreur("Téléphone requis.", 400);
    if (b.resilier === false) {
      await query("DELETE FROM subscription_stop WHERE phone=$1", [phone]);
      await journaliser("abonnement_retabli", phone);
    } else {
      await query("INSERT INTO subscription_stop (phone) VALUES ($1) ON CONFLICT (phone) DO NOTHING", [phone]);
      await journaliser("abonnement_resilie", phone);
    }
    return reponse({ ok: true });
  } catch (err) {
    return reponseErreur(err);
  }
}
