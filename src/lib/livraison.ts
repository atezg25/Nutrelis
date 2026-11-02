import { query } from "./db";
import { lireReglage } from "./reglages";

/**
 * Frais de livraison d'une ville : le tarif de la ville s'il existe et est actif (table `shipping_rate`),
 * sinon le tarif par défaut des réglages. Module à part : `orders` et `expeditions` en ont besoin tous les deux.
 */
/** Compare sans tenir compte des accents ni de la casse : « Yaoundé », « yaounde » et « YAOUNDE » désignent la même ville. */
export const norm = (s: string | null | undefined) => (s ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

export async function fraisPourVille(ville: string | null | undefined, quartier?: string | null): Promise<{ fraisFcfa: number; delai: string | null; tarifVille: boolean }> {
  const v = (ville ?? "").trim();
  if (v) {
    // Le quartier prime sur la ville : on prend la ligne du quartier si elle existe, sinon celle de la ville entière.
    const toutes = await query<{ city: string; district: string; fee_fcfa: number; delay: string | null }>("SELECT city, district, fee_fcfa, delay FROM shipping_rate WHERE active");
    const deLaVille = toutes.filter((x) => norm(x.city) === norm(v));
    const r = deLaVille.find((x) => x.district && norm(x.district) === norm(quartier)) ?? deLaVille.find((x) => !x.district);
    if (r) return { fraisFcfa: r.fee_fcfa, delai: r.delay, tarifVille: true };
  }
  return { fraisFcfa: Number(await lireReglage("frais_livraison_fcfa")) || 0, delai: null, tarifVille: false };
}
