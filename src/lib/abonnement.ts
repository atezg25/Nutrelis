/**
 * Abonnement NUTRELIS : le client commande en « abonnement » et obtient cette remise à CHAQUE livraison.
 * Pas de prélèvement automatique (Mobile Money n'en permet pas) : la boutique relance chaque mois pour confirmer
 * la prochaine livraison, et le client règle à chaque livraison. Annulable à tout moment.
 * Le prix est calculé ICI, côté serveur : ce que le panier affiche est ce qui est facturé.
 */
export const REMISE_ABONNEMENT_PCT = 15;
/** Délai (jours) après lequel un abonné est à relancer pour sa prochaine livraison. */
export const RELANCE_ABONNEMENT_JOURS = 28;

export function prixAbonne(prixFcfa: number): number {
  return Math.round((prixFcfa * (100 - REMISE_ABONNEMENT_PCT)) / 100);
}
