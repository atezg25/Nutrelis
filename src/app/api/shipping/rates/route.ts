import { query } from "@/lib/db";
import { lireReglage } from "@/lib/reglages";
import { reponse, reponseErreur } from "@/lib/http";

export const dynamic = "force-dynamic";

/** Tarifs de livraison publics (pour afficher les frais pendant la commande) : villes actives + tarif par défaut. */
export async function GET() {
  try {
    const villes = await query<{ city: string; fee_fcfa: number; delay: string | null }>("SELECT city, fee_fcfa, delay FROM shipping_rate WHERE active ORDER BY city");
    const defaut = Number(await lireReglage("frais_livraison_fcfa")) || 0;
    return reponse({ villes: villes.map((v) => ({ ville: v.city, fraisFcfa: v.fee_fcfa, delai: v.delay })), defautFcfa: defaut });
  } catch (err) {
    return reponseErreur(err);
  }
}
