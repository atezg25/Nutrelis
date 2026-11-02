import { query } from "@/lib/db";
import { refuserSiNonAdmin, reponse, reponseErreur } from "@/lib/http";

export const dynamic = "force-dynamic";

/**
 * Paniers abandonnés : le client a laissé son téléphone et son panier, puis n'a rien commandé depuis 30 minutes.
 * Les paniers déjà récupérés (commande passée) n'apparaissent pas.
 */
export async function GET() {
  const refus = await refuserSiNonAdmin();
  if (refus) return refus;
  try {
    const paniers = await query(
      `SELECT c.id, c.phone, c.name, c.email, c.city, c.total_fcfa, c.status, c.updated_at,
              COALESCE((SELECT string_agg(i.qty || ' × ' || p.name || ' — ' || v.label, ', ')
                          FROM jsonb_to_recordset(c.items) AS i("variantId" uuid, qty int)
                          JOIN variant v ON v.id = i."variantId" JOIN product p ON p.id = v.product_id), '') AS resume
         FROM abandoned_cart c
        WHERE c.status <> 'recupere' AND c.updated_at < now() - interval '30 minutes'
        ORDER BY c.updated_at DESC LIMIT 200`,
    );
    return reponse({ paniers });
  } catch (err) {
    return reponseErreur(err);
  }
}
