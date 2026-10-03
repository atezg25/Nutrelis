import { query, tx } from "./db";
import { changerStatut } from "./orders";

/**
 * EXPÉDITIONS AU CAMEROUN.
 *  - Tarif de livraison par ville (table `shipping_rate`), sinon tarif par défaut des réglages.
 *  - Un colis par commande ; son statut fait avancer celui de la commande : expédié / en livraison → « expédiée », livré → « livrée ».
 *  - Paiement à la livraison : la somme à encaisser (`cod_fcfa`) est reprise du total de la commande ; à la remise du colis elle est
 *    marquée encaissée et la commande passe « payée ».
 *  - Colis retourné : la commande est annulée et le stock revient (une seule fois).
 */
export const STATUTS_EXPEDITION = ["expediee", "en_livraison", "livree", "echec", "retournee"] as const;
export type StatutExpedition = (typeof STATUTS_EXPEDITION)[number];

export type Auteur = { id: string | null; name: string } | null;

export class ErreurExpedition extends Error {
  constructor(public code: "COMMANDE_INTROUVABLE" | "COMMANDE_ANNULEE" | "DEJA_EXPEDIEE" | "TRANSPORTEUR_INVALIDE" | "COLIS_INTROUVABLE" | "STATUT_INVALIDE", message: string) {
    super(message);
  }
}

export async function creerExpedition(p: { orderId: string; carrierId?: string | null; tracking?: string | null; notes?: string | null }, auteur: Auteur): Promise<string> {
  return tx(async (c) => {
    const o = await c.query<{ number: string; status: string; payment_status: string; payment_method: string; total_fcfa: number }>(
      "SELECT number, status, payment_status, payment_method, total_fcfa FROM customer_order WHERE id=$1 FOR UPDATE", [p.orderId]);
    const cmd = o.rows[0];
    if (!cmd) throw new ErreurExpedition("COMMANDE_INTROUVABLE", "Commande introuvable.");
    if (cmd.status === "annulee") throw new ErreurExpedition("COMMANDE_ANNULEE", "Cette commande est annulée.");
    const deja = await c.query("SELECT 1 FROM shipment WHERE order_id=$1", [p.orderId]);
    if (deja.rows.length > 0) throw new ErreurExpedition("DEJA_EXPEDIEE", "Cette commande a déjà un colis.");
    if (p.carrierId) {
      const t = await c.query("SELECT 1 FROM carrier WHERE id=$1 AND active", [p.carrierId]);
      if (t.rows.length === 0) throw new ErreurExpedition("TRANSPORTEUR_INVALIDE", "Transporteur introuvable ou désactivé.");
    }
    // À encaisser à la remise : seulement si le client doit payer à la livraison et n'a pas déjà payé.
    const cod = cmd.payment_method === "livraison" && cmd.payment_status !== "payee" ? cmd.total_fcfa : 0;
    const s = await c.query<{ id: string }>(
      "INSERT INTO shipment (order_id, carrier_id, tracking, cod_fcfa, notes) VALUES ($1,$2,$3,$4,$5) RETURNING id",
      [p.orderId, p.carrierId ?? null, p.tracking ?? null, cod, p.notes ?? null]);
    await c.query("INSERT INTO shipment_event (shipment_id, status, note, admin_name) VALUES ($1,'expediee',$2,$3)", [s.rows[0]!.id, p.tracking ? `Suivi : ${p.tracking}` : null, auteur?.name ?? null]);
    await c.query("UPDATE customer_order SET status='expediee', updated_at=now() WHERE id=$1 AND status IN ('nouvelle','confirmee')", [p.orderId]);
    return s.rows[0]!.id;
  });
}

export async function changerStatutExpedition(id: string, statut: StatutExpedition, note: string | null, auteur: Auteur): Promise<void> {
  if (!(STATUTS_EXPEDITION as readonly string[]).includes(statut)) throw new ErreurExpedition("STATUT_INVALIDE", "Statut invalide.");
  let annulerCommande = null as string | null;
  await tx(async (c) => {
    const r = await c.query<{ order_id: string; status: string; cod_fcfa: number; cod_collected: boolean }>(
      "SELECT order_id, status, cod_fcfa, cod_collected FROM shipment WHERE id=$1 FOR UPDATE", [id]);
    const col = r.rows[0];
    if (!col) throw new ErreurExpedition("COLIS_INTROUVABLE", "Colis introuvable.");
    if (col.status === statut) return;
    await c.query("UPDATE shipment SET status=$2, updated_at=now(), delivered_at = CASE WHEN $2='livree' THEN now() ELSE delivered_at END WHERE id=$1", [id, statut]);
    await c.query("INSERT INTO shipment_event (shipment_id, status, note, admin_name) VALUES ($1,$2,$3,$4)", [id, statut, note, auteur?.name ?? null]);
    if (statut === "en_livraison") {
      await c.query("UPDATE customer_order SET status='expediee', updated_at=now() WHERE id=$1 AND status IN ('nouvelle','confirmee')", [col.order_id]);
    } else if (statut === "livree") {
      await c.query("UPDATE customer_order SET status='livree', updated_at=now() WHERE id=$1 AND status <> 'annulee'", [col.order_id]);
      if (col.cod_fcfa > 0 && !col.cod_collected) {
        // La somme a été remise au livreur : la commande est payée.
        await c.query("UPDATE shipment SET cod_collected=TRUE WHERE id=$1", [id]);
        await c.query("UPDATE customer_order SET payment_status='payee', updated_at=now() WHERE id=$1", [col.order_id]);
      }
    } else if (statut === "retournee") {
      annulerCommande = col.order_id;
    }
  });
  // Hors transaction : `changerStatut` ouvre la sienne (annulation + stock rendu une seule fois).
  if (annulerCommande) await changerStatut(annulerCommande, "annulee");
}

export async function modifierExpedition(id: string, p: { carrierId?: string | null; tracking?: string | null; notes?: string | null }): Promise<void> {
  const sets: string[] = [];
  const args: unknown[] = [];
  const ajouter = (col: string, v: unknown) => { args.push(v); sets.push(`${col}=$${args.length}`); };
  if (p.carrierId !== undefined) {
    if (p.carrierId) {
      const t = await query("SELECT 1 FROM carrier WHERE id=$1", [p.carrierId]);
      if (t.length === 0) throw new ErreurExpedition("TRANSPORTEUR_INVALIDE", "Transporteur introuvable.");
    }
    ajouter("carrier_id", p.carrierId);
  }
  if (p.tracking !== undefined) ajouter("tracking", p.tracking);
  if (p.notes !== undefined) ajouter("notes", p.notes);
  if (sets.length === 0) return;
  args.push(id);
  await query(`UPDATE shipment SET ${sets.join(", ")}, updated_at=now() WHERE id=$${args.length}`, args);
}
