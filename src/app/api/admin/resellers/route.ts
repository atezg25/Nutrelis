import { query } from "@/lib/db";
import { corps, entier, erreur, refuserSiNonAdmin, reponse, reponseErreur, texte } from "@/lib/http";

export const dynamic = "force-dynamic";

/** Revendeurs, avec ce qu'ils ont acheté et ce qu'il leur reste à payer. */
export async function GET() {
  const refus = await refuserSiNonAdmin();
  if (refus) return refus;
  try {
    const revendeurs = await query(
      `SELECT r.id, r.name, r.phone, r.email, r.city, r.discount_pct, r.active, r.notes,
              COUNT(o.id) FILTER (WHERE o.status <> 'annulee')::int AS commandes,
              COALESCE(SUM(o.total_fcfa) FILTER (WHERE o.status <> 'annulee'),0)::int AS achats_fcfa,
              COALESCE(SUM(o.total_fcfa) FILTER (WHERE o.status <> 'annulee' AND o.payment_status <> 'payee'),0)::int AS reste_a_payer_fcfa
         FROM reseller r LEFT JOIN customer_order o ON o.reseller_id=r.id GROUP BY r.id ORDER BY r.active DESC, r.name`,
    );
    return reponse({ revendeurs });
  } catch (err) {
    return reponseErreur(err);
  }
}

export async function POST(req: Request) {
  const refus = await refuserSiNonAdmin();
  if (refus) return refus;
  try {
    const b = await corps(req);
    const name = texte(b.name, 120);
    const remise = b.remisePct == null ? 0 : entier(b.remisePct, 0, 90);
    if (!name || remise === null) return erreur("Nom requis et remise entre 0 et 90 %.", 400);
    const [r] = await query<{ id: string }>(
      "INSERT INTO reseller (name, phone, email, city, discount_pct, notes) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id",
      [name, texte(b.phone, 30), texte(b.email, 160), texte(b.city, 80), remise, texte(b.notes, 500)],
    );
    return reponse({ id: r!.id }, 201);
  } catch (err) {
    return reponseErreur(err);
  }
}
