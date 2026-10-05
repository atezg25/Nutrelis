import { lireReglages } from "./reglages";

/** Réglages d'abonnement tels que saisis dans la console (lecture côté serveur uniquement). */
export async function lireAbonnement(): Promise<{ actif: boolean; pct: number; jours: number }> {
  const r = await lireReglages();
  const pct = Number(r.abonnement_remise_pct);
  const jours = Number(r.abonnement_jours_par_unite);
  return { actif: r.abonnement_actif !== "0", pct: pct >= 1 && pct <= 90 ? pct : 15, jours: jours >= 1 ? jours : 60 };
}
