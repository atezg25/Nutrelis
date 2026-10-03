import { query } from "./db";

/**
 * Réglages modifiables depuis la console (table `setting`). Chaque réglage a une valeur de repli (variable d'environnement
 * ou valeur par défaut) : la boutique fonctionne même si la table est vide.
 */
export type CleReglage = "frais_livraison_fcfa" | "alerte_email" | "alerte_whatsapp";

export const REGLAGES: Record<CleReglage, { titre: string; aide: string; defaut: () => string; type: "entier" | "email" | "telephone" }> = {
  frais_livraison_fcfa: { titre: "Frais de livraison (FCFA)", aide: "Ajoutés au total de chaque commande du site. 0 = livraison offerte.", defaut: () => String(Number(process.env.DELIVERY_FEE_FCFA ?? 0) || 0), type: "entier" },
  alerte_email: { titre: "E-mail qui reçoit les alertes de commande", aide: "Une alerte par commande à la livraison, et par paiement en ligne confirmé.", defaut: () => process.env.STORE_EMAIL ?? "", type: "email" },
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
  if (def.type === "telephone" && v !== "" && !/^\d{8,15}$/.test(v)) return `${def.titre} : chiffres uniquement, avec l'indicatif du pays.`;
  await query("INSERT INTO setting (key, value) VALUES ($1,$2) ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value, updated_at=now()", [cle, v]);
  return null;
}
