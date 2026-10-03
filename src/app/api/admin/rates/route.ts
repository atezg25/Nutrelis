import { journaliser } from "@/lib/admin-auth";
import { query } from "@/lib/db";
import { corps, entier, erreur, refuserSiNonAdmin, reponse, reponseErreur, texte } from "@/lib/http";

export const dynamic = "force-dynamic";

export async function GET() {
  const refus = await refuserSiNonAdmin();
  if (refus) return refus;
  try {
    const tarifs = await query("SELECT id, city, fee_fcfa, delay, active FROM shipping_rate ORDER BY active DESC, city");
    return reponse({ tarifs });
  } catch (err) {
    return reponseErreur(err);
  }
}

/** Ajoute le tarif d'une ville (ou met à jour celui qui existe déjà : une ville = une ligne). */
export async function POST(req: Request) {
  const refus = await refuserSiNonAdmin();
  if (refus) return refus;
  try {
    const b = await corps(req);
    const city = texte(b.ville, 80);
    const frais = entier(b.fraisFcfa, 0, 1_000_000);
    if (!city || frais === null) return erreur("Ville et frais de livraison (nombre entier) requis.", 400);
    const [t] = await query<{ id: string }>(
      `INSERT INTO shipping_rate (city, fee_fcfa, delay) VALUES ($1,$2,$3)
       ON CONFLICT (lower(city)) DO UPDATE SET fee_fcfa=EXCLUDED.fee_fcfa, delay=EXCLUDED.delay, active=TRUE RETURNING id`,
      [city, frais, texte(b.delai, 60)],
    );
    await journaliser("tarif_ville", `${city} : ${frais} FCFA`);
    return reponse({ id: t!.id }, 201);
  } catch (err) {
    return reponseErreur(err);
  }
}
