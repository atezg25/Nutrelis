import { journaliser } from "@/lib/admin-auth";
import { ecrireReglage, lireReglages, REGLAGES, type CleReglage } from "@/lib/reglages";
import { corps, erreur, refuserSiNonProprietaire, reponse, reponseErreur } from "@/lib/http";

export const dynamic = "force-dynamic";

export async function GET() {
  const refus = await refuserSiNonProprietaire();
  if (refus) return refus;
  try {
    const valeurs = await lireReglages();
    return reponse({ reglages: (Object.keys(REGLAGES) as CleReglage[]).map((k) => ({ cle: k, titre: REGLAGES[k].titre, aide: REGLAGES[k].aide, valeur: valeurs[k] })) });
  } catch (err) {
    return reponseErreur(err);
  }
}

/** Enregistre un ou plusieurs réglages : { frais_livraison_fcfa: "1500", ... }. Tout est validé avant d'écrire. */
export async function PUT(req: Request) {
  const refus = await refuserSiNonProprietaire();
  if (refus) return refus;
  try {
    const b = await corps(req);
    const cles = (Object.keys(b) as string[]).filter((k): k is CleReglage => k in REGLAGES);
    if (cles.length === 0) return erreur("Aucun réglage reçu.", 400);
    const avant = await lireReglages();
    for (const k of cles) {
      const v = typeof b[k] === "string" ? (b[k] as string) : String(b[k] ?? "");
      const msg = await ecrireReglage(k, v);
      if (msg) return erreur(msg, 400);
      if (avant[k] !== v.trim()) await journaliser("reglage", `${k} : « ${avant[k]} » → « ${v.trim()} »`);
    }
    return reponse({ ok: true });
  } catch (err) {
    return reponseErreur(err);
  }
}
