import { adminCourant, journaliser } from "@/lib/admin-auth";
import { query } from "@/lib/db";
import { creerExpedition } from "@/lib/expeditions";
import { corps, erreur, refuserSiNonAdmin, reponse, reponseErreur, texte, UUID } from "@/lib/http";

export const dynamic = "force-dynamic";

// Une commande est « à expédier » si elle n'a pas de colis, n'est ni annulée ni livrée, et si l'argent est là
// (payée) ou sera encaissé à la remise (paiement à la livraison / espèces). Une commande en ligne non payée attend son paiement.
const A_EXPEDIER = `o.status IN ('nouvelle','confirmee') AND NOT EXISTS (SELECT 1 FROM shipment s WHERE s.order_id=o.id)
                    AND (o.payment_status IN ('payee','a_la_livraison') OR o.payment_method IN ('livraison','especes'))`;

/** Vues : a_expedier | en_cours | livrees | incidents (échecs et retours). `q` filtre par numéro, client, téléphone, ville, suivi. */
export async function GET(req: Request) {
  const refus = await refuserSiNonAdmin();
  if (refus) return refus;
  try {
    const u = new URL(req.url).searchParams;
    const vue = u.get("vue") ?? "a_expedier";
    const q = (u.get("q") ?? "").trim();
    const args: unknown[] = [];
    let filtre = "";
    if (q) { args.push(`%${q}%`); filtre = `AND (o.number ILIKE $1 OR o.customer_name ILIKE $1 OR o.phone ILIKE $1 OR o.city ILIKE $1 OR o.address ILIKE $1 ${vue === "a_expedier" ? "" : "OR s.tracking ILIKE $1"})`; }

    const [c] = await query<{ a_expedier: number; en_cours: number; livrees: number; incidents: number }>(
      `SELECT (SELECT COUNT(*) FROM customer_order o WHERE ${A_EXPEDIER})::int AS a_expedier,
              COUNT(*) FILTER (WHERE s.status IN ('expediee','en_livraison'))::int AS en_cours,
              COUNT(*) FILTER (WHERE s.status = 'livree')::int AS livrees,
              COUNT(*) FILTER (WHERE s.status IN ('echec','retournee'))::int AS incidents
         FROM shipment s`,
    );

    if (vue === "a_expedier") {
      const commandes = await query(
        `SELECT o.id, o.number, o.customer_name, o.phone, o.city, o.address, o.total_fcfa, o.payment_status, o.payment_method, o.created_at,
                (SELECT string_agg(i.qty || ' × ' || i.name, ', ') FROM order_item i WHERE i.order_id=o.id) AS resume
           FROM customer_order o WHERE ${A_EXPEDIER} ${filtre} ORDER BY o.created_at LIMIT 200`,
        args,
      );
      return reponse({ compteurs: c, commandes });
    }
    const statuts = vue === "livrees" ? ["livree"] : vue === "incidents" ? ["echec", "retournee"] : ["expediee", "en_livraison"];
    args.push(statuts);
    const colis = await query(
      `SELECT s.id, s.status, s.tracking, s.cod_fcfa, s.cod_collected, s.shipped_at, s.delivered_at, s.notes,
              o.id AS order_id, o.number, o.customer_name, o.phone, o.city, o.address, o.total_fcfa, ca.name AS carrier_name,
              (SELECT string_agg(i.qty || ' × ' || i.name, ', ') FROM order_item i WHERE i.order_id=o.id) AS resume
         FROM shipment s JOIN customer_order o ON o.id=s.order_id LEFT JOIN carrier ca ON ca.id=s.carrier_id
        WHERE s.status = ANY($${args.length}::text[]) ${filtre} ORDER BY s.shipped_at DESC LIMIT 200`,
      args,
    );
    return reponse({ compteurs: c, colis });
  } catch (err) {
    return reponseErreur(err);
  }
}

/** Créer le colis d'une commande : transporteur, numéro de suivi, note. La commande passe « expédiée ». */
export async function POST(req: Request) {
  const refus = await refuserSiNonAdmin();
  if (refus) return refus;
  try {
    const b = await corps(req);
    const orderId = typeof b.orderId === "string" && UUID.test(b.orderId) ? b.orderId : null;
    const carrierId = typeof b.transporteurId === "string" && UUID.test(b.transporteurId) ? b.transporteurId : null;
    if (!orderId) return erreur("Commande invalide.", 400);
    const moi = await adminCourant();
    const id = await creerExpedition({ orderId, carrierId, tracking: texte(b.suivi, 80), notes: texte(b.notes, 300) }, moi ? { id: moi.id, name: moi.name } : null);
    await journaliser("colis_cree", `commande ${orderId} → colis ${id}`);
    return reponse({ id }, 201);
  } catch (err) {
    return reponseErreur(err);
  }
}
