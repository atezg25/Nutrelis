import { envoyerRappelsLivraison } from "@/lib/rappels";
import { refuserSiNonAdmin, reponse, reponseErreur } from "@/lib/http";
import { journaliser } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

/** Envoie tout de suite le rappel des livraisons programmées (en plus de celui de 7 h), par exemple pour l'essayer. */
export async function POST() {
  const refus = await refuserSiNonAdmin();
  if (refus) return refus;
  try {
    const r = await envoyerRappelsLivraison(true);
    await journaliser("rappel_livraison_manuel", `${r.commandes} commande(s)`);
    return reponse(r);
  } catch (err) {
    return reponseErreur(err);
  }
}
