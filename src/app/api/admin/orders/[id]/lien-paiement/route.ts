import { query } from "@/lib/db";
import { fapshiConfigure, initierPaiement, verifierPaiement } from "@/lib/fapshi";
import { appliquerPaiement, enregistrerPaiementCree } from "@/lib/orders";
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
    if (o.status === "annulee") return erreur("Cette commande est annulée.", 409);
    // UN SEUL lien actif par commande : on ne régénère jamais un lien pour le même paiement.
    const existants = await query<{ provider_ref: string; link: string | null; status: string }>(
      "SELECT provider_ref, link, status FROM payment WHERE order_id=$1 AND provider='fapshi' ORDER BY created_at DESC",
      [id],
    );
    for (const e of existants) {
      if (e.status === "payee") return erreur("Cette commande a déjà été payée par Mobile Money.", 409, "DEJA_PAYEE");
      if (e.status !== "en_attente") continue;
      const v = await verifierPaiement(e.provider_ref).catch(() => null);
      if (!v) return erreur("Impossible de vérifier le lien existant auprès de Fapshi. Réessayez dans un instant.", 503, "VERIFICATION_IMPOSSIBLE");
      if (v.statut === "payee") {
        await appliquerPaiement(e.provider_ref, "payee", v.brut);
        return erreur("Le paiement vient d'être reçu : la commande est à jour. Aucun nouveau lien n'est nécessaire.", 409, "DEJA_PAYEE");
      }
      if (v.statut === "echouee") {
        // Lien expiré ou refusé : il est clos, un nouveau lien peut être créé.
        await query("UPDATE payment SET status='echouee', provider_status=$2, updated_at=now() WHERE provider_ref=$1", [e.provider_ref, v.brut]);
        continue;
      }
      if (e.link) return reponse({ lien: e.link, numero: o.number, total: Number(o.total_fcfa), reutilise: true });
      return erreur("Un lien de paiement est déjà en cours pour cette commande (créé avant l'enregistrement des liens). Attendez son expiration ou son paiement.", 409, "LIEN_EXISTANT");
    }
    const base = process.env.NEXT_PUBLIC_URL || "https://nutrelis.bio";
    const p = await initierPaiement({
      montant: Number(o.total_fcfa),
      numeroCommande: o.number,
      retour: `${base}/checkout/success?commande=${encodeURIComponent(o.number)}`,
      email: o.email,
      message: `NUTRELIS — commande ${o.number}`,
    });
    await enregistrerPaiementCree(id, Number(o.total_fcfa), p.transId, p.lien);
    await journaliser("lien_paiement", `${o.number} (${o.total_fcfa} F)`);
    return reponse({ lien: p.lien, numero: o.number, total: Number(o.total_fcfa) });
  } catch (err) {
    console.error("[nutrelis] lien-paiement", err instanceof Error ? err.message : err);
    return reponseErreur(err);
  }
}
