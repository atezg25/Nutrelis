import { query } from "./db";

/**
 * Réglages modifiables depuis la console (table `setting`). Chaque réglage a une valeur de repli (variable d'environnement
 * ou valeur par défaut) : la boutique fonctionne même si la table est vide.
 */
export type CleReglage = "frais_livraison_fcfa" | "alerte_email" | "alerte_whatsapp" | "abonnement_actif" | "abonnement_remise_pct" | "abonnement_jours_par_unite" | "boutique_titre" | "boutique_description" | "boutique_carrousel_secondes" | "boutique_nom" | "boutique_telephone" | "boutique_adresse";

export const REGLAGES: Record<CleReglage, { titre: string; aide: string; defaut: () => string; type: "entier" | "email" | "telephone" | "texte"; max?: number }> = {
  frais_livraison_fcfa: { titre: "Frais de livraison par défaut (FCFA)", aide: "Pour une ville qui n'a pas son propre tarif (onglet Expéditions > Tarifs par ville). 0 = livraison offerte.", defaut: () => String(Number(process.env.DELIVERY_FEE_FCFA ?? 0) || 0), type: "entier" },
  alerte_email: { titre: "E-mail qui reçoit les alertes de commande", aide: "Une alerte par commande à la livraison, et par paiement en ligne confirmé.", defaut: () => process.env.STORE_EMAIL ?? "", type: "email" },
  abonnement_actif: { titre: "Abonnement : activé (1) ou désactivé (0)", aide: "À 0, l'option « Abonnement » disparaît des pages produit et toute commande est facturée plein tarif.", defaut: () => "1", type: "entier" },
  abonnement_remise_pct: { titre: "Abonnement : remise à chaque livraison (%)", aide: "Entre 1 et 90. Appliquée par le serveur à chaque ligne en abonnement ; les textes du site se mettent à jour tout seuls.", defaut: () => "15", type: "entier" },
  abonnement_jours_par_unite: { titre: "Durée d'utilisation d'un produit, pour les abonnements (jours)", aide: "Un gel (ou un pot) dure ce nombre de jours : le pack de 2 dure le double, le pack de 3 le triple. La console propose de relancer l'abonné 7 jours avant la fin. Estimation : 60 jours (≈ 2 mois) à 2-3 utilisations par semaine.", defaut: () => "60", type: "entier" },
  boutique_titre: { titre: "Page d'accueil : titre principal", aide: "Laissez vide pour le titre par défaut (« Soins et bien-être naturels, livrés partout au Cameroun »).", defaut: () => "", type: "texte" },
  boutique_description: { titre: "Page d'accueil : texte sous le titre", aide: "Laissez vide pour le texte par défaut. 400 caractères au plus.", defaut: () => "", type: "texte", max: 400 },
  boutique_carrousel_secondes: { titre: "Page d'accueil : durée d'une image du carrousel (secondes)", aide: "Les images des produits défilent à l'accueil. 0 = défilement arrêté (le client utilise les flèches).", defaut: () => "5", type: "entier" },
  boutique_nom: { titre: "Nom de la boutique (bordereau de colis)", aide: "Expéditeur imprimé sur chaque bordereau.", defaut: () => "NUTRELIS", type: "texte" },
  boutique_telephone: { titre: "Téléphone de la boutique (bordereau de colis)", aide: "Numéro que le transporteur et le destinataire peuvent appeler.", defaut: () => process.env.WHATSAPP_STORE_PHONE ?? "", type: "telephone" },
  boutique_adresse: { titre: "Adresse de la boutique (bordereau de colis)", aide: "Adresse de départ des colis, par exemple ville et quartier.", defaut: () => "", type: "texte" },
  alerte_whatsapp: { titre: "Numéro WhatsApp de la boutique", aide: "Format international sans « + » (ex. 237677043275). L'envoi automatique exige l'API WhatsApp Cloud de Meta (non configurée).", defaut: () => process.env.WHATSAPP_STORE_PHONE ?? "", type: "telephone" },
};

export async function lireReglages(): Promise<Record<CleReglage, string>> {
  const rows = await query<{ key: string; value: string }>("SELECT key, value FROM setting");
  const m = new Map(rows.map((r) => [r.key, r.value]));
  const out = {} as Record<CleReglage, string>;
  for (const k of Object.keys(REGLAGES) as CleReglage[]) out[k] = m.get(k) ?? REGLAGES[k].defaut();
  return out;
}

export async function lireReglage(cle: CleReglage): Promise<string> {
  const rows = await query<{ value: string }>("SELECT value FROM setting WHERE key=$1", [cle]);
  return rows[0]?.value ?? REGLAGES[cle].defaut();
}

/** Valide puis enregistre. Renvoie un message d'erreur, ou null si tout est bon. */
export async function ecrireReglage(cle: CleReglage, brut: string): Promise<string | null> {
  const def = REGLAGES[cle];
  const v = brut.trim();
  if (def.type === "entier" && !/^\d{1,7}$/.test(v)) return `${def.titre} : nombre entier attendu.`;
  if (def.type === "email" && v !== "" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return `${def.titre} : adresse invalide.`;
  if (def.type === "texte" && v.length > (def.max ?? 200)) return `${def.titre} : ${def.max ?? 200} caractères au plus.`;
  if (cle === "abonnement_actif" && !/^[01]$/.test(v)) return `${def.titre} : 1 ou 0.`;
  if (cle === "abonnement_remise_pct" && (Number(v) < 1 || Number(v) > 90)) return `${def.titre} : entre 1 et 90.`;
  if (cle === "abonnement_jours_par_unite" && (Number(v) < 1 || Number(v) > 720)) return `${def.titre} : entre 1 et 720 jours.`;
  if (cle === "boutique_carrousel_secondes" && Number(v) > 60) return `${def.titre} : 60 secondes au plus.`;
  if (def.type === "telephone" && v !== "" && !/^\d{8,15}$/.test(v)) return `${def.titre} : chiffres uniquement, avec l'indicatif du pays.`;
  await query("INSERT INTO setting (key, value) VALUES ($1,$2) ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value, updated_at=now()", [cle, v]);
  return null;
}
