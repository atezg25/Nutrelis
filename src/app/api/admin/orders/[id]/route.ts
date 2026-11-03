import { query } from "@/lib/db";
import { changerStatut, marquerPayee, reconcilierEnArrierePlan, STATUTS, type ModePaiement, type StatutCommande } from "@/lib/orders";
import { corps, erreur, refuserSiNonAdmin, reponse, reponseErreur, UUID } from "@/lib/http";
import { journaliser } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const refus = await refuserSiNonAdmin();
  if (refus) return refus;
  try {
    const { id } = await params;
    if (!UUID.test(id)) return erreur("Identifiant invalide.", 400);
    reconcilierEnArrierePlan(); // un paiement Mobile Money arrivé entre-temps est appliqué avant l'affichage
    const [commande] = await query(
      `SELECT o.*, r.name AS reseller_name FROM customer_order o LEFT JOIN reseller r ON r.id=o.reseller_id WHERE o.id=$1`,
      [id],
    );
    if (!commande) return erreur("Commande introuvable.", 404);
    const items = await query("SELECT name, unit_fcfa, qty FROM order_item WHERE order_id=$1 ORDER BY id", [id]);
    const paiements = await query("SELECT provider, provider_ref, amount_fcfa, status, provider_status, created_at FROM payment WHERE order_id=$1 ORDER BY created_at", [id]);
    return reponse({ commande, items, paiements });
  } catch (err) {
    return reponseErreur(err);
  }
}

/** Changer le statut d'une commande, ou la marquer payée (espèces, virement, paiement à la livraison reçu). */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const refus = await refuserSiNonAdmin();
  if (refus) return refus;
  try {
    const { id } = await params;
    if (!UUID.test(id)) return erreur("Identifiant invalide.", 400);
    const b = await corps(req);
    if (typeof b.statut === "string") {
      if (!(STATUTS as readonly string[]).includes(b.statut)) return erreur("Statut invalide.", 400);
      await changerStatut(id, b.statut as StatutCommande);
      await journaliser("commande_statut", `${id} → ${b.statut}`);
    }
    if (typeof b.paiementRecu === "string") {
      const modes = ["especes", "virement", "livraison"] as const;
      if (!(modes as readonly string[]).includes(b.paiementRecu)) return erreur("Mode de paiement invalide.", 400);
      await marquerPayee(id, b.paiementRecu as ModePaiement);
      await journaliser("commande_payee_manuel", `${id} (${b.paiementRecu})`);
    }
    return reponse({ ok: true });
  } catch (err) {
    return reponseErreur(err);
  }
}
