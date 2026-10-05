/**
 * Abonnement NUTRELIS : le client commande en « abonnement » et obtient cette remise à CHAQUE livraison.
 * Pas de prélèvement automatique (Mobile Money n'en permet pas) : la boutique relance chaque mois pour confirmer
 * la prochaine livraison, et le client règle à chaque livraison. Annulable à tout moment.
 * Le prix est calculé ICI, côté serveur : ce que le panier affiche est ce qui est facturé.
 */
export const REMISE_ABONNEMENT_PCT = 15; // valeur par défaut : la vraie valeur est le réglage « abonnement_remise_pct » (console)
/**
 * Cadence : un produit dure `abonnement_jours_par_unite` jours (réglage, 60 par défaut) ; un pack de N dure N fois plus
 * (colonne `variant.units`). La relance part AVANCE_RELANCE_JOURS avant la fin du pack, pour livrer sans rupture.
 */
export const AVANCE_RELANCE_JOURS = 7;

export function prixAbonne(prixFcfa: number, pct: number = REMISE_ABONNEMENT_PCT): number {
  return Math.round((prixFcfa * (100 - pct)) / 100);
}
