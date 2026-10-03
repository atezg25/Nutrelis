import { query } from "@/lib/db";
import { corps, entier, erreur, refuserSiNonAdmin, reponse, reponseErreur, texte, UUID } from "@/lib/http";

export const dynamic = "force-dynamic";

/** État du stock par pack + les 100 derniers mouvements du journal. */
export async function GET() {
  const refus = await refuserSiNonAdmin();
  if (refus) return refus;
  try {
    const variantes = await query(
      `SELECT v.id, v.sku, v.label, v.low_stock_alert, v.active, p.name AS product_name, s.stock
         FROM variant v JOIN product p ON p.id=v.product_id JOIN variant_stock s ON s.variant_id=v.id ORDER BY p.sort, p.name, v.sort`,
    );
    const mouvements = await query(
      `SELECT m.id, m.created_at, m.delta, m.reason, m.ref, m.note, v.sku, v.label, p.name AS product_name
         FROM stock_movement m JOIN variant v ON v.id=m.variant_id JOIN product p ON p.id=v.product_id ORDER BY m.id DESC LIMIT 100`,
    );
    return reponse({ variantes, mouvements });
  } catch (err) {
    return reponseErreur(err);
  }
}

const RAISONS_MANUELLES = ["initial", "reappro", "ajustement", "casse", "retour"] as const;

/** Entrée ou sortie manuelle : réapprovisionnement, ajustement d'inventaire, casse, retour client. */
export async function POST(req: Request) {
  const refus = await refuserSiNonAdmin();
  if (refus) return refus;
  try {
    const b = await corps(req);
    const variantId = typeof b.variantId === "string" && UUID.test(b.variantId) ? b.variantId : null;
    const delta = entier(b.delta, -100000, 100000);
    const raison = (RAISONS_MANUELLES as readonly string[]).includes(b.raison as string) ? (b.raison as string) : null;
    if (!variantId || !delta || delta === 0 || !raison) return erreur("Pack, quantité (non nulle) et motif requis.", 400);
    // Une sortie ne peut pas faire passer le stock sous zéro par une saisie manuelle.
    if (delta < 0) {
      const [s] = await query<{ stock: number }>("SELECT stock FROM variant_stock WHERE variant_id=$1", [variantId]);
      if (!s || s.stock + delta < 0) return erreur(`Stock insuffisant (${s?.stock ?? 0} en stock).`, 409);
    }
    await query("INSERT INTO stock_movement (variant_id, delta, reason, note, created_by) VALUES ($1,$2,$3,$4,'admin')", [variantId, delta, raison, texte(b.note, 300)]);
    return reponse({ ok: true }, 201);
  } catch (err) {
    return reponseErreur(err);
  }
}
