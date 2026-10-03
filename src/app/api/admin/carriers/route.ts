import { journaliser } from "@/lib/admin-auth";
import { query } from "@/lib/db";
import { corps, erreur, refuserSiNonAdmin, reponse, reponseErreur, texte } from "@/lib/http";

export const dynamic = "force-dynamic";

/** Transporteurs (ATEZ Express, agences de voyage, livreurs à moto…) avec le nombre de colis en cours. */
export async function GET() {
  const refus = await refuserSiNonAdmin();
  if (refus) return refus;
  try {
    const transporteurs = await query(
      `SELECT c.id, c.name, c.phone, c.notes, c.active,
              COUNT(s.id) FILTER (WHERE s.status IN ('expediee','en_livraison'))::int AS en_cours,
              COUNT(s.id)::int AS total
         FROM carrier c LEFT JOIN shipment s ON s.carrier_id = c.id GROUP BY c.id ORDER BY c.active DESC, c.name`,
    );
    return reponse({ transporteurs });
  } catch (err) {
    return reponseErreur(err);
  }
}

export async function POST(req: Request) {
  const refus = await refuserSiNonAdmin();
  if (refus) return refus;
  try {
    const b = await corps(req);
    const name = texte(b.name, 100);
    if (!name) return erreur("Nom du transporteur requis.", 400);
    try {
      const [c] = await query<{ id: string }>("INSERT INTO carrier (name, phone, notes) VALUES ($1,$2,$3) RETURNING id", [name, texte(b.phone, 30), texte(b.notes, 300)]);
      await journaliser("transporteur_cree", name);
      return reponse({ id: c!.id }, 201);
    } catch (err) {
      if (err instanceof Error && /duplicate key/.test(err.message)) return erreur("Ce transporteur existe déjà.", 409);
      throw err;
    }
  } catch (err) {
    return reponseErreur(err);
  }
}
