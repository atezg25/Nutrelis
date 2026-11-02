import type { PoolClient } from "pg";
import { query, tx } from "./db";
import { fapshiConfigure, verifierPaiement } from "./fapshi";
import { alerterStock, notifierCommandeAnnulee, notifierNouvelleCommande } from "./notifier";
import { fraisPourVille } from "./livraison";
import { prixAbonne } from "./abonnement";
import { lireAbonnement } from "./abonnement-serveur";

export type LigneDemandee = { variantId: string; qty: number; abonnement?: boolean };
export type ClientCommande = {
  nom: string;
  telephone: string;
  email?: string | null;
  ville?: string | null;
  adresse?: string | null;
  quartier?: string | null;
  notes?: string | null;
};
export type ModePaiement = "fapshi" | "livraison" | "especes" | "virement";

export class ErreurCommande extends Error {
  constructor(
    public code: "PANIER_VIDE" | "PRODUIT_INDISPONIBLE" | "STOCK_INSUFFISANT" | "CLIENT_INVALIDE" | "REVENDEUR_INTROUVABLE",
    message: string,
  ) {
    super(message);
  }
}


/** Stock courant d'une variante = somme du journal. À lire DANS la transaction, variantes verrouillées. */
async function stockDe(c: PoolClient, variantId: string): Promise<number> {
  const r = await c.query<{ s: number }>("SELECT COALESCE(SUM(delta),0)::int AS s FROM stock_movement WHERE variant_id=$1", [variantId]);
  return r.rows[0]?.s ?? 0;
}

type VarianteLue = {
  id: string;
  sku: string;
  label: string;
  price_fcfa: number;
  reseller_price_fcfa: number | null;
  active: boolean;
  pname: string;
  pactive: boolean;
};

/**
 * Évalue un code promo pour un sous-total. `c` = client de transaction (le code est alors VERROUILLÉ, pour que deux commandes
 * simultanées ne dépassent pas le nombre d'utilisations) ; `null` = simple vérification (affichage au paiement).
 */
export async function evaluerCodePromo(c: PoolClient | null, brut: string, sousTotal: number): Promise<{ id: string; code: string; discount: number; libelle: string }> {
  const code = brut.trim().toUpperCase();
  const sql = "SELECT id, code, kind, value, min_order_fcfa, max_uses, used_count, starts_at, ends_at, active FROM promo_code WHERE upper(code)=$1" + (c ? " FOR UPDATE" : "");
  type Promo = { id: string; code: string; kind: "percent" | "fixed"; value: number; min_order_fcfa: number; max_uses: number | null; used_count: number; starts_at: Date | null; ends_at: Date | null; active: boolean };
  const rows = c ? (await c.query<Promo>(sql, [code])).rows : await query<Promo>(sql, [code]);
  const p = rows[0];
  const maintenant = new Date();
  if (!p || !p.active) throw new ErreurCommande("CODE_INVALIDE", "Ce code promo n'est pas valide.");
  if (p.starts_at && p.starts_at > maintenant) throw new ErreurCommande("CODE_INVALIDE", "Ce code promo n'est pas encore actif.");
  if (p.ends_at && p.ends_at < maintenant) throw new ErreurCommande("CODE_INVALIDE", "Ce code promo a expiré.");
  if (p.max_uses !== null && p.used_count >= p.max_uses) throw new ErreurCommande("CODE_INVALIDE", "Ce code promo a atteint son nombre d'utilisations.");
  if (sousTotal < p.min_order_fcfa) throw new ErreurCommande("CODE_INVALIDE", `Ce code demande une commande d'au moins ${p.min_order_fcfa.toLocaleString("fr-FR")} FCFA.`);
  const brutRemise = p.kind === "percent" ? Math.round((sousTotal * p.value) / 100) : p.value;
  const discount = Math.max(0, Math.min(brutRemise, sousTotal));
  return { id: p.id, code: p.code, discount, libelle: p.kind === "percent" ? `−${p.value} %` : `−${p.value.toLocaleString("fr-FR")} FCFA` };
}

export async function creerCommande(p: {
  lignes: LigneDemandee[];
  client: ClientCommande;
  mode: ModePaiement;
  canal?: "web" | "revendeur" | "manuel";
  revendeurId?: string | null;
  paiementRecu?: boolean;
  /** Code promo saisi par le client (ignoré pour les ventes revendeur). */
  code?: string | null;
}): Promise<{ id: string; numero: string; total: number }> {
  const nom = p.client.nom?.trim();
  const tel = p.client.telephone?.replace(/[^\d+]/g, "");
  if (!nom || !tel || tel.length < 8) throw new ErreurCommande("CLIENT_INVALIDE", "Nom et téléphone valides requis.");
  const lignes = p.lignes.filter((l) => Number.isInteger(l.qty) && l.qty > 0 && l.qty <= 100);
  if (lignes.length === 0) throw new ErreurCommande("PANIER_VIDE", "Le panier est vide.");
  // Une même variante dans un même mode (unique / abonnement) ne doit apparaître qu'une fois (on additionne sinon).
  // Le stock, lui, se contrôle sur le total de la variante, tous modes confondus.
  const reglageAbo = await lireAbonnement();
  const demandes = new Map<string, { variantId: string; abo: boolean; qty: number }>();
  const fusion = new Map<string, number>();
  for (const l of lignes) {
    const abo = l.abonnement === true && reglageAbo.actif && !p.revendeurId; // ni sur une vente revendeur, ni si l'abonnement est désactivé dans la console
    const cle = `${l.variantId}|${abo ? 1 : 0}`;
    const d = demandes.get(cle) ?? { variantId: l.variantId, abo, qty: 0 };
    d.qty += l.qty;
    demandes.set(cle, d);
    fusion.set(l.variantId, (fusion.get(l.variantId) ?? 0) + l.qty);
  }
  const estAbonnement = [...demandes.values()].some((d) => d.abo);

  const cree = await tx(async (c) => {
    const ids = [...fusion.keys()];
    const vs = await c.query<VarianteLue>(
      `SELECT v.id, v.sku, v.label, v.price_fcfa, v.reseller_price_fcfa, v.active, p.name AS pname, p.active AS pactive
         FROM variant v JOIN product p ON p.id = v.product_id WHERE v.id = ANY($1::uuid[]) ORDER BY v.id FOR UPDATE OF v`,
      [ids],
    );
    if (vs.rows.length !== ids.length) throw new ErreurCommande("PRODUIT_INDISPONIBLE", "Un produit du panier n'existe plus.");

    let remise = 0;
    if (p.revendeurId) {
      const r = await c.query<{ discount_pct: number; active: boolean }>("SELECT discount_pct, active FROM reseller WHERE id=$1", [p.revendeurId]);
      if (!r.rows[0] || !r.rows[0].active) throw new ErreurCommande("REVENDEUR_INTROUVABLE", "Revendeur introuvable ou inactif.");
      remise = r.rows[0].discount_pct;
    }

    let sousTotal = 0;
    const items: { v: VarianteLue; qty: number; unit: number; abo: boolean }[] = [];
    for (const v of vs.rows) {
      if (!v.active || !v.pactive) throw new ErreurCommande("PRODUIT_INDISPONIBLE", `${v.pname} (${v.label}) n'est plus en vente.`);
      const qtyTotale = fusion.get(v.id)!;
      const dispo = await stockDe(c, v.id);
      if (dispo < qtyTotale) {
        throw new ErreurCommande("STOCK_INSUFFISANT", `Stock insuffisant pour ${v.pname} (${v.label}) : ${Math.max(dispo, 0)} disponible(s).`);
      }
      for (const d of demandes.values()) {
        if (d.variantId !== v.id) continue;
        const unit = p.revendeurId ? (v.reseller_price_fcfa ?? Math.round((v.price_fcfa * (100 - remise)) / 100)) : d.abo ? prixAbonne(v.price_fcfa, reglageAbo.pct) : v.price_fcfa;
        sousTotal += unit * d.qty;
        items.push({ v, qty: d.qty, unit, abo: d.abo });
      }
    }
    const livraison = p.revendeurId ? 0 : (await fraisPourVille(p.client.ville, p.client.quartier)).fraisFcfa;
    // Code promo : calculé et verrouillé ICI (jamais fait confiance au navigateur). La livraison n'est pas remisée.
    let rabais = 0;
    let promo: { id: string; code: string } | null = null;
    if (p.code && !p.revendeurId) {
      const r = await evaluerCodePromo(c, p.code, sousTotal);
      rabais = r.discount;
      promo = { id: r.id, code: r.code };
    }
    const total = sousTotal - rabais + livraison;

    const num = await c.query<{ n: string }>("SELECT nextval('order_number_seq')::text AS n");
    const numero = `NUT-${num.rows[0]!.n.padStart(6, "0")}`;
    const canal = p.canal ?? (p.revendeurId ? "revendeur" : "web");
    const payee = p.paiementRecu === true;
    const ord = await c.query<{ id: string }>(
      `INSERT INTO customer_order (number, channel, reseller_id, customer_name, phone, email, city, address, notes,
                                   payment_status, payment_method, subtotal_fcfa, delivery_fcfa, total_fcfa, subscription, promo_code, discount_fcfa)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17) RETURNING id`,
      [
        numero, canal, p.revendeurId ?? null, nom, tel, p.client.email?.trim() || null, p.client.ville?.trim() || null,
        p.client.adresse?.trim() || null, p.client.notes?.trim() || null,
        payee ? "payee" : p.mode === "livraison" ? "a_la_livraison" : "en_attente", p.mode, sousTotal, livraison, total, estAbonnement, promo?.code ?? null, rabais,
      ],
    );
    const id = ord.rows[0]!.id;
    if (promo) await c.query("UPDATE promo_code SET used_count = used_count + 1 WHERE id=$1", [promo.id]);
    for (const it of items) {
      await c.query("INSERT INTO order_item (order_id, variant_id, name, unit_fcfa, qty, subscription) VALUES ($1,$2,$3,$4,$5,$6)", [id, it.v.id, `${it.v.pname} — ${it.v.label}${it.abo ? " (abonnement)" : ""}`, it.unit, it.qty, it.abo]);
      await c.query("INSERT INTO stock_movement (variant_id, delta, reason, ref) VALUES ($1,$2,'vente',$3)", [it.v.id, -it.qty, numero]);
    }
    return { id, numero, total };
  });
  // Rupture / stock faible franchi par cette vente : alerte à la boutique (sans jamais bloquer la commande).
  // Le panier enregistré à l'étape « coordonnées » n'est plus « abandonné » : la commande est passée.
  void query("UPDATE abandoned_cart SET status='recupere', updated_at=now() WHERE phone=$1", [tel]).catch(() => undefined);
  void alerterStock([...fusion].map(([variantId, qty]) => ({ variantId, qty }))).catch(() => undefined);
  return cree;
}

/** Rend le stock d'une commande (annulation, paiement échoué) — une seule fois. */
async function restituerStock(c: PoolClient, orderId: string, numero: string): Promise<void> {
  const deja = await c.query("SELECT 1 FROM stock_movement WHERE ref=$1 AND reason='annulation' LIMIT 1", [numero]);
  if (deja.rows.length > 0) return;
  const items = await c.query<{ variant_id: string; qty: number }>("SELECT variant_id, qty FROM order_item WHERE order_id=$1", [orderId]);
  for (const it of items.rows) {
    await c.query("INSERT INTO stock_movement (variant_id, delta, reason, ref) VALUES ($1,$2,'annulation',$3)", [it.variant_id, it.qty, numero]);
  }
}

/** Reprend le stock d'une commande rouverte ; remet le marqueur d'annulation à zéro pour une annulation future. */
async function reprendreStock(c: PoolClient, orderId: string, numero: string, note: string): Promise<void> {
  const items = await c.query<{ variant_id: string; qty: number }>("SELECT variant_id, qty FROM order_item WHERE order_id=$1", [orderId]);
  for (const it of items.rows) {
    await c.query("INSERT INTO stock_movement (variant_id, delta, reason, ref, note) VALUES ($1,$2,'vente',$3,$4)", [it.variant_id, -it.qty, numero, note]);
  }
  // Une nouvelle annulation devra pouvoir rendre le stock à nouveau : on marque l'ancienne comme soldée.
  await c.query("UPDATE stock_movement SET ref = ref || '#' || id WHERE ref=$1 AND reason='annulation'", [numero]);
}

export async function enregistrerPaiementCree(orderId: string, montant: number, transId: string): Promise<void> {
  await query("INSERT INTO payment (order_id, provider, provider_ref, amount_fcfa) VALUES ($1,'fapshi',$2,$3)", [orderId, transId, montant]);
}

/** Applique le verdict de Fapshi (webhook OU vérification) — idempotent. */
export async function appliquerPaiement(transId: string, statut: "payee" | "echouee" | "en_attente", brut: string): Promise<void> {
  if (statut === "en_attente") {
    await query("UPDATE payment SET provider_status=$2, updated_at=now() WHERE provider='fapshi' AND provider_ref=$1", [transId, brut]);
    return;
  }
  let echec: string | null = null;
  const vientDePayer = await tx(async (c): Promise<string | null> => {
    const p = await c.query<{ id: number; order_id: string; status: string }>(
      "SELECT id, order_id, status FROM payment WHERE provider='fapshi' AND provider_ref=$1 FOR UPDATE",
      [transId],
    );
    const pay = p.rows[0];
    if (!pay || pay.status === statut) return null;
    await c.query("UPDATE payment SET status=$2, provider_status=$3, updated_at=now() WHERE id=$1", [pay.id, statut, brut]);
    const o = await c.query<{ number: string; status: string; payment_status: string }>(
      "SELECT number, status, payment_status FROM customer_order WHERE id=$1 FOR UPDATE",
      [pay.order_id],
    );
    const ord = o.rows[0];
    if (!ord) return null;
    if (statut === "payee") {
      // Un paiement arrivé APRÈS annulation : on rouvre la commande et on reprend le stock.
      if (ord.status === "annulee") {
        await c.query("UPDATE customer_order SET status='nouvelle' WHERE id=$1", [pay.order_id]);
        await reprendreStock(c, pay.order_id, ord.number, "paiement reçu après annulation");
      }
      await c.query("UPDATE customer_order SET payment_status='payee', updated_at=now() WHERE id=$1", [pay.order_id]);
      return ord.number;
    } else if (ord.payment_status !== "payee") {
      // Paiement refusé ou expiré : on libère le stock, le client pourra recommander.
      await c.query("UPDATE customer_order SET payment_status='echouee', status='annulee', updated_at=now() WHERE id=$1", [pay.order_id]);
      await restituerStock(c, pay.order_id, ord.number);
      echec = ord.number;
    }
    return null;
  });
  // Le client a payé : la boutique est prévenue (une seule fois, car la transition « payée » n'arrive qu'une fois).
  if (vientDePayer) void notifierNouvelleCommande(vientDePayer, "PAYÉE en ligne ✅").catch(() => undefined);
  if (echec) void notifierCommandeAnnulee(echec, "paiement en ligne refusé ou expiré").catch(() => undefined);
}

/** Vérifie auprès de Fapshi les paiements en attente (> 2 min) et applique le verdict. Sans danger à rappeler. */
export async function reconcilierPaiements(): Promise<number> {
  if (!fapshiConfigure()) return 0;
  const rows = await query<{ provider_ref: string }>(
    "SELECT provider_ref FROM payment WHERE provider='fapshi' AND status='en_attente' AND provider_ref IS NOT NULL AND created_at < now() - interval '2 minutes' ORDER BY created_at LIMIT 20",
  );
  let n = 0;
  for (const r of rows) {
    try {
      const v = await verifierPaiement(r.provider_ref);
      await appliquerPaiement(r.provider_ref, v.statut, v.brut);
      if (v.statut !== "en_attente") n++;
    } catch {
      /* Fapshi indisponible : on repassera. */
    }
  }
  // Une commande Fapshi sans paiement abouti depuis plus d'1 h est abandonnée : on libère son stock.
  const abandon = await query<{ id: string; number: string }>(
    `SELECT o.id, o.number FROM customer_order o
      WHERE o.payment_method='fapshi' AND o.payment_status='en_attente' AND o.status='nouvelle' AND o.created_at < now() - interval '1 hour'
        AND NOT EXISTS (SELECT 1 FROM payment p WHERE p.order_id=o.id AND p.status='en_attente' AND p.created_at > now() - interval '1 hour')`,
  );
  for (const a of abandon) {
    await tx(async (c) => {
      const u = await c.query("UPDATE customer_order SET status='annulee', payment_status='echouee', updated_at=now() WHERE id=$1 AND status='nouvelle' AND payment_status='en_attente'", [a.id]);
      if (u.rowCount) await restituerStock(c, a.id, a.number);
    });
    n++;
  }
  return n;
}

export const STATUTS = ["nouvelle", "confirmee", "expediee", "livree", "annulee"] as const;
export type StatutCommande = (typeof STATUTS)[number];

export async function changerStatut(orderId: string, statut: StatutCommande): Promise<void> {
  let annulee: string | null = null;
  await tx(async (c) => {
    const o = await c.query<{ number: string; status: string }>("SELECT number, status FROM customer_order WHERE id=$1 FOR UPDATE", [orderId]);
    const ord = o.rows[0];
    if (!ord || ord.status === statut) return;
    if (statut === "annulee") annulee = ord.number;
    if (statut === "annulee") {
      await restituerStock(c, orderId, ord.number);
    } else if (ord.status === "annulee") {
      // Réouverture d'une commande annulée : le stock est repris (il peut devenir négatif, l'admin le verra).
      await reprendreStock(c, orderId, ord.number, "commande rouverte");
    }
    await c.query("UPDATE customer_order SET status=$2, updated_at=now() WHERE id=$1", [orderId, statut]);
  });
  if (annulee) void notifierCommandeAnnulee(annulee, "annulée dans l'administration").catch(() => undefined);
}

/** Encaissement manuel (espèces, virement, paiement à la livraison reçu). */
export async function marquerPayee(orderId: string, mode: ModePaiement): Promise<void> {
  await query(
    "UPDATE customer_order SET payment_status='payee', payment_method=CASE WHEN payment_method='fapshi' THEN payment_method ELSE $2 END, updated_at=now() WHERE id=$1",
    [orderId, mode],
  );
}
