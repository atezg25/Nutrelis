import { query } from "@/lib/db";
import { creerCommande, dateLivraisonValide, reconcilierEnArrierePlan, type LigneDemandee, type ModePaiement } from "@/lib/orders";
import { corps, entier, erreur, refuserSiNonAdmin, reponse, reponseErreur, texte, UUID } from "@/lib/http";
import { journaliser } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

/** Liste des commandes (filtre par statut, canal ou recherche libre : numéro, nom, téléphone). */
export async function GET(req: Request) {
  const refus = await refuserSiNonAdmin();
  if (refus) return refus;
  try {
    reconcilierEnArrierePlan();
    const u = new URL(req.url).searchParams;
    const statut = u.get("statut");
    const canal = u.get("canal");
    const q = (u.get("q") ?? "").trim();
    const programmees = u.get("programmees"); // "toutes" = avec une date ; "a_livrer" = date atteinte ou dépassée
    const cond0 = programmees === "toutes" || programmees === "a_livrer";
    const cond: string[] = [];
    const args: unknown[] = [];
    if (statut) { args.push(statut); cond.push(`o.status = $${args.length}`); }
    if (canal) { args.push(canal); cond.push(`o.channel = $${args.length}`); }
    if (q) { args.push(`%${q}%`); cond.push(`(o.number ILIKE $${args.length} OR o.customer_name ILIKE $${args.length} OR o.phone ILIKE $${args.length})`); }
    if (cond0) cond.push("o.deliver_on IS NOT NULL AND o.status NOT IN ('livree','annulee')");
    if (programmees === "a_livrer") cond.push("o.deliver_on <= (now() AT TIME ZONE 'Africa/Douala')::date");
    const rows = await query(
      `SELECT o.id, o.number, o.channel, o.customer_name, o.phone, o.city, o.status, o.payment_status, o.payment_method,
              o.total_fcfa, o.created_at, o.subscription, to_char(o.deliver_on, 'YYYY-MM-DD') AS livraison_le, r.name AS reseller_name,
              (SELECT string_agg(i.qty || ' × ' || i.name, ', ') FROM order_item i WHERE i.order_id=o.id) AS resume
         FROM customer_order o LEFT JOIN reseller r ON r.id=o.reseller_id
        ${cond.length ? "WHERE " + cond.join(" AND ") : ""} ORDER BY ${cond0 ? "o.deliver_on ASC, " : ""}o.created_at DESC LIMIT 200`,
      args,
    );
    return reponse({ orders: rows });
  } catch (err) {
    return reponseErreur(err);
  }
}

/** Commande saisie par l'administrateur : vente directe, ou commande d'un revendeur (prix revendeur appliqués). */
export async function POST(req: Request) {
  const refus = await refuserSiNonAdmin();
  if (refus) return refus;
  try {
    const b = await corps(req);
    const lignes: LigneDemandee[] = [];
    for (const it of Array.isArray(b.lignes) ? b.lignes : []) {
      const o = it as Record<string, unknown>;
      const variantId = typeof o.variantId === "string" && UUID.test(o.variantId) ? o.variantId : null;
      const qty = entier(o.qty, 1, 1000);
      if (!variantId || !qty) return erreur("Lignes invalides.", 400);
      lignes.push({ variantId, qty });
    }
    const c = (b.client ?? {}) as Record<string, unknown>;
    const revendeurId = typeof b.revendeurId === "string" && UUID.test(b.revendeurId) ? b.revendeurId : null;
    const livraisonLe = b.livraisonLe ? dateLivraisonValide(b.livraisonLe) : null;
    if (b.livraisonLe && !livraisonLe) return erreur("Date de livraison invalide : choisissez aujourd'hui ou un jour à venir.", 400);
    const modes: ModePaiement[] = ["especes", "virement", "livraison", "fapshi"];
    const mode = modes.includes(b.mode as ModePaiement) ? (b.mode as ModePaiement) : "especes";
    const cmd = await creerCommande({
      lignes,
      mode,
      canal: revendeurId ? "revendeur" : "manuel",
      revendeurId,
      paiementRecu: b.paiementRecu === true,
      client: { nom: texte(c.nom, 160) ?? "", telephone: texte(c.telephone, 30) ?? "", email: texte(c.email, 160), ville: texte(c.ville, 80), quartier: texte(c.quartier, 80), adresse: texte(c.adresse, 200), notes: texte(c.notes, 500) },
      code: texte(b.code, 40),
      livraisonLe,
    });
    await journaliser("commande_saisie", `${cmd.numero}${revendeurId ? " (revendeur)" : ""} — ${cmd.total} FCFA${livraisonLe ? ` — livraison le ${livraisonLe}` : ""}`);
    return reponse(cmd, 201);
  } catch (err) {
    return reponseErreur(err);
  }
}
