import { query } from "@/lib/db";
import { corps, erreur, refuserSiNonAdmin, reponse, reponseErreur, texte } from "@/lib/http";
import { journaliser } from "@/lib/admin-auth";
import { AVANCE_RELANCE_JOURS, REMISE_ABONNEMENT_PCT } from "@/lib/abonnement";
import { lireReglage } from "@/lib/reglages";

export const dynamic = "force-dynamic";

/**
 * Abonnés = clients (par téléphone) ayant passé au moins une commande en abonnement non annulée.
 * Le pack de leur dernière commande en abonnement dure (unités × jours par unité) ; on relance AVANCE_RELANCE_JOURS avant la fin.
 */
export async function GET() {
  const refus = await refuserSiNonAdmin();
  if (refus) return refus;
  try {
    const jours = Math.max(1, Number(await lireReglage("abonnement_jours_par_unite")) || 60);
    const abonnes = await query(
      `WITH abo AS (
         SELECT phone, max(customer_name) AS nom, max(city) AS ville, count(*)::int AS nb_abonnements,
                min(created_at) AS depuis
           FROM customer_order WHERE subscription AND status <> 'annulee' AND payment_status NOT IN ('echouee')
          GROUP BY phone
       )
       SELECT a.phone, a.nom, a.ville, a.nb_abonnements, a.depuis,
              l.created_at AS derniere, l.number AS derniere_commande, l.unites,
              (l.created_at + make_interval(days => l.unites * $1::int)) AS fin_pack,
              (SELECT string_agg(DISTINCT i.name, ', ') FROM order_item i JOIN customer_order o ON o.id = i.order_id WHERE o.phone = a.phone AND i.subscription) AS produits,
              (s.phone IS NOT NULL) AS resilie
         FROM abo a
         JOIN LATERAL (
           SELECT o.created_at, o.number,
                  COALESCE((SELECT SUM(i.qty * v.units) FROM order_item i JOIN variant v ON v.id = i.variant_id WHERE i.order_id = o.id AND i.subscription), 1)::int AS unites
             FROM customer_order o WHERE o.phone = a.phone AND o.subscription AND o.status <> 'annulee'
            ORDER BY o.created_at DESC LIMIT 1
         ) l ON TRUE
         LEFT JOIN subscription_stop s ON s.phone = a.phone
        ORDER BY resilie ASC, fin_pack ASC`,
      [jours],
    );
    return reponse({ abonnes, joursParUnite: jours, avanceJours: AVANCE_RELANCE_JOURS, remisePct: REMISE_ABONNEMENT_PCT });
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
