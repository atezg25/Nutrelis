import { query } from "@/lib/db";
import { corps, entier, erreur, refuserSiNonAdmin, reponse, reponseErreur, texte, UUID } from "@/lib/http";
import { journaliser } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const refus = await refuserSiNonAdmin();
  if (refus) return refus;
  try {
    const { id } = await params;
    if (!UUID.test(id)) return erreur("Identifiant invalide.", 400);
    const [revendeur] = await query("SELECT id, name, phone, email, city, discount_pct, active, notes FROM reseller WHERE id=$1", [id]);
    if (!revendeur) return erreur("Revendeur introuvable.", 404);
    const commandes = await query(
      `SELECT o.id, o.number, o.status, o.payment_status, o.total_fcfa, o.created_at,
              (SELECT string_agg(i.qty || ' × ' || i.name, ', ') FROM order_item i WHERE i.order_id=o.id) AS resume
         FROM customer_order o WHERE o.reseller_id=$1 ORDER BY o.created_at DESC LIMIT 100`,
      [id],
    );
    return reponse({ revendeur, commandes });
  } catch (err) {
    return reponseErreur(err);
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const refus = await refuserSiNonAdmin();
  if (refus) return refus;
  try {
    const { id } = await params;
    if (!UUID.test(id)) return erreur("Identifiant invalide.", 400);
    const b = await corps(req);
    const sets: string[] = [];
    const args: unknown[] = [];
    const ajouter = (col: string, v: unknown) => { args.push(v); sets.push(`${col}=$${args.length}`); };
    if ("name" in b) { const v = texte(b.name, 120); if (!v) return erreur("Nom invalide.", 400); ajouter("name", v); }
    if ("phone" in b) ajouter("phone", texte(b.phone, 30));
    if ("email" in b) ajouter("email", texte(b.email, 160));
    if ("city" in b) ajouter("city", texte(b.city, 80));
    if ("notes" in b) ajouter("notes", texte(b.notes, 500));
    if ("remisePct" in b) { const v = entier(b.remisePct, 0, 90); if (v === null) return erreur("Remise entre 0 et 90 %.", 400); ajouter("discount_pct", v); }
    if (typeof b.active === "boolean") ajouter("active", b.active);
    if (sets.length === 0) return erreur("Rien à modifier.", 400);
    args.push(id);
    await query(`UPDATE reseller SET ${sets.join(", ")} WHERE id=$${args.length}`, args);
    await journaliser("revendeur_modifie", `${id} : ${Object.keys(b).join(", ")}`);
    return reponse({ ok: true });
  } catch (err) {
    return reponseErreur(err);
  }
}
