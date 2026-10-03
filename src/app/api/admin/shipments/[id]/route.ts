import { adminCourant, journaliser } from "@/lib/admin-auth";
import { query } from "@/lib/db";
import { changerStatutExpedition, modifierExpedition, STATUTS_EXPEDITION, type StatutExpedition } from "@/lib/expeditions";
import { lireReglages } from "@/lib/reglages";
import { corps, erreur, refuserSiNonAdmin, reponse, reponseErreur, texte, UUID } from "@/lib/http";

export const dynamic = "force-dynamic";

/** Détail d'un colis : tout ce qu'il faut pour le suivre et pour imprimer son bordereau (expéditeur, destinataire, contenu, somme à encaisser). */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const refus = await refuserSiNonAdmin();
  if (refus) return refus;
  try {
    const { id } = await params;
    if (!UUID.test(id)) return erreur("Identifiant invalide.", 400);
    const [colis] = await query(
      `SELECT s.id, s.status, s.tracking, s.cod_fcfa, s.cod_collected, s.notes, s.shipped_at, s.delivered_at, s.carrier_id,
              ca.name AS carrier_name, ca.phone AS carrier_phone,
              o.id AS order_id, o.number, o.customer_name, o.phone, o.email, o.city, o.address, o.notes AS order_notes,
              o.subtotal_fcfa, o.delivery_fcfa, o.total_fcfa, o.payment_status, o.payment_method
         FROM shipment s JOIN customer_order o ON o.id=s.order_id LEFT JOIN carrier ca ON ca.id=s.carrier_id WHERE s.id=$1`,
      [id],
    );
    if (!colis) return erreur("Colis introuvable.", 404);
    const items = await query("SELECT name, qty, unit_fcfa FROM order_item WHERE order_id=$1 ORDER BY id", [colis.order_id]);
    const evenements = await query("SELECT at, status, note, admin_name FROM shipment_event WHERE shipment_id=$1 ORDER BY at, id", [id]);
    const r = await lireReglages();
    return reponse({ colis, items, evenements, expediteur: { nom: r.boutique_nom, telephone: r.boutique_telephone, adresse: r.boutique_adresse } });
  } catch (err) {
    return reponseErreur(err);
  }
}

/** Faire avancer le colis (statut + note), ou corriger transporteur / suivi / note. */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const refus = await refuserSiNonAdmin();
  if (refus) return refus;
  try {
    const { id } = await params;
    if (!UUID.test(id)) return erreur("Identifiant invalide.", 400);
    const b = await corps(req);
    const moi = await adminCourant();
    const auteur = moi ? { id: moi.id, name: moi.name } : null;
    if ("transporteurId" in b || "suivi" in b || "notes" in b) {
      const tid = b.transporteurId === null || b.transporteurId === "" ? null : typeof b.transporteurId === "string" && UUID.test(b.transporteurId) ? b.transporteurId : undefined;
      await modifierExpedition(id, {
        ...("transporteurId" in b ? { carrierId: tid } : {}),
        ...("suivi" in b ? { tracking: texte(b.suivi, 80) } : {}),
        ...("notes" in b ? { notes: texte(b.notes, 300) } : {}),
      });
      await journaliser("colis_modifie", `${id} : ${Object.keys(b).join(", ")}`);
    }
    if (typeof b.statut === "string") {
      if (!(STATUTS_EXPEDITION as readonly string[]).includes(b.statut)) return erreur("Statut invalide.", 400);
      await changerStatutExpedition(id, b.statut as StatutExpedition, texte(b.note, 300), auteur);
      await journaliser("colis_statut", `${id} → ${b.statut}`);
    }
    return reponse({ ok: true });
  } catch (err) {
    return reponseErreur(err);
  }
}
