import { query } from "@/lib/db";
import { appliquerPaiement } from "@/lib/orders";
import { fapshiConfigure, verifierPaiement } from "@/lib/fapshi";
import { erreur, reponse, reponseErreur } from "@/lib/http";

export const dynamic = "force-dynamic";

const chiffres = (s: string) => s.replace(/\D/g, "");

/**
 * Suivi public d'une commande : il faut le NUMÉRO et le TÉLÉPHONE de la commande (les 8 derniers chiffres).
 * Au passage, si le paiement est encore en attente, on demande son état à Fapshi (c'est lui qui fait foi).
 */
export async function GET(req: Request, { params }: { params: Promise<{ numero: string }> }) {
  try {
    const { numero } = await params;
    const tel = chiffres(new URL(req.url).searchParams.get("tel") ?? "");
    if (tel.length < 8) return erreur("Téléphone requis.", 400, "TEL_REQUIS");
    const rows = await query<{ id: string; number: string; status: string; payment_status: string; total_fcfa: number; customer_name: string; phone: string }>(
      "SELECT id, number, status, payment_status, total_fcfa, customer_name, phone FROM customer_order WHERE number=$1",
      [numero.toUpperCase()],
    );
    const o = rows[0];
    // Même réponse pour « inconnue » et « mauvais téléphone » : on ne confirme pas l'existence d'une commande.
    if (!o || chiffres(o.phone).slice(-8) !== tel.slice(-8)) return erreur("Commande introuvable.", 404, "INTROUVABLE");

    if (o.payment_status === "en_attente" && fapshiConfigure()) {
      const pay = await query<{ provider_ref: string }>(
        "SELECT provider_ref FROM payment WHERE order_id=$1 AND status='en_attente' AND provider_ref IS NOT NULL ORDER BY created_at DESC LIMIT 1",
        [o.id],
      );
      if (pay[0]) {
        try {
          const v = await verifierPaiement(pay[0].provider_ref);
          await appliquerPaiement(pay[0].provider_ref, v.statut, v.brut);
          const maj = await query<{ status: string; payment_status: string }>("SELECT status, payment_status FROM customer_order WHERE id=$1", [o.id]);
          if (maj[0]) { o.status = maj[0].status; o.payment_status = maj[0].payment_status; }
        } catch { /* Fapshi indisponible : on renvoie l'état connu. */ }
      }
    }
    // État du colis (s'il est parti) : transporteur, suivi, et historique visible par le client.
    const colis = (await query<{ id: string; status: string; tracking: string | null; shipped_at: string; delivered_at: string | null; carrier_name: string | null }>(
      "SELECT s.id, s.status, s.tracking, s.shipped_at, s.delivered_at, ca.name AS carrier_name FROM shipment s LEFT JOIN carrier ca ON ca.id=s.carrier_id WHERE s.order_id=$1",
      [o.id],
    ))[0];
    const evenements = colis
      ? await query<{ at: string; status: string; note: string | null }>("SELECT at, status, note FROM shipment_event WHERE shipment_id=$1 ORDER BY at, id", [colis.id])
      : [];
    return reponse({
      numero: o.number, statut: o.status, paiement: o.payment_status, total: o.total_fcfa, client: o.customer_name,
      colis: colis ? { statut: colis.status, transporteur: colis.carrier_name, suivi: colis.tracking, expedieLe: colis.shipped_at, livreLe: colis.delivered_at, evenements } : null,
    });
  } catch (err) {
    return reponseErreur(err);
  }
}
