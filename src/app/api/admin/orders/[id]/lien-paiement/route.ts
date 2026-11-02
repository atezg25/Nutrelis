import { query } from "@/lib/db";
import { fapshiConfigure, initierPaiement } from "@/lib/fapshi";
import { enregistrerPaiementCree } from "@/lib/orders";
import { erreur, refuserSiNonAdmin, reponse, reponseErreur, UUID } from "@/lib/http";
import { journaliser } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

/**
 * Génère un lien de paiement Fapshi pour une commande non payée (client qui ne peut ou ne veut pas payer sur le site).
 * Le montant vient TOUJOURS de la base. Quand le client paie, le webhook / la réconciliation marque la commande payée comme d'habitude.
 */
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const refus = await refuserSiNonAdmin();
  if (refus) return refus;
  try {
    const { id } = await params;
    if (!UUID.test(id)) return erreur("Identifiant invalide.", 400);
    if (!fapshiConfigure()) return erreur("Le paiement en ligne n'est pas configuré.", 503, "PAIEMENT_INDISPONIBLE");
    const [o] = await query<{ number: string; total_fcfa: number; status: string; payment_status: string; email: string | null }>(
      "SELECT number, total_fcfa, status, payment_status, email FROM customer_order WHERE id=$1",
      [id],
    );
    if (!o) return erreur("Commande introuvable.", 404);
    if (o.payment_status === "payee") return erreur("Cette commande est déjà payée.", 409);
    if (o.status === "annulee") return erreur("Cette commande est annulée.", 409);
    const base = process.env.NEXT_PUBLIC_URL || "https://nutrelis.bio";
    const p = await initierPaiement({
      montant: Number(o.total_fcfa),
      numeroCommande: o.number,
      retour: `${base}/checkout/success?commande=${encodeURIComponent(o.number)}`,
      email: o.email,
      message: `NUTRELIS — commande ${o.number}`,
    });
    await enregistrerPaiementCree(id, Number(o.total_fcfa), p.transId);
    await journaliser("lien_paiement", `${o.number} (${o.total_fcfa} F)`);
    return reponse({ lien: p.lien, numero: o.number, total: Number(o.total_fcfa) });
  } catch (err) {
    console.error("[nutrelis] lien-paiement", err instanceof Error ? err.message : err);
    return reponseErreur(err);
  }
}
