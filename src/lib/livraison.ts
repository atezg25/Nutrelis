import { query } from "./db";
import { lireReglage } from "./reglages";

/**
 * Frais de livraison d'une ville : le tarif de la ville s'il existe et est actif (table `shipping_rate`),
 * sinon le tarif par défaut des réglages. Module à part : `orders` et `expeditions` en ont besoin tous les deux.
 */
export async function fraisPourVille(ville: string | null | undefined): Promise<{ fraisFcfa: number; delai: string | null; tarifVille: boolean }> {
  const v = (ville ?? "").trim();
  if (v) {
    const r = await query<{ fee_fcfa: number; delay: string | null }>("SELECT fee_fcfa, delay FROM shipping_rate WHERE lower(city)=lower($1) AND active", [v]);
    if (r[0]) return { fraisFcfa: r[0].fee_fcfa, delai: r[0].delay, tarifVille: true };
  }
  return { fraisFcfa: Number(await lireReglage("frais_livraison_fcfa")) || 0, delai: null, tarifVille: false };
}
