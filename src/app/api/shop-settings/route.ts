import { reponse, reponseErreur } from "@/lib/http";
import { lireAbonnement } from "@/lib/abonnement-serveur";
import { lireReglages } from "@/lib/reglages";

export const dynamic = "force-dynamic";

/** Réglages publics pilotés depuis la console : abonnement et textes de la page d'accueil. */
export async function GET() {
  try {
    const [ab, r] = await Promise.all([lireAbonnement(), lireReglages()]);
    return reponse({
      abonnement: ab,
      boutique: { titre: r.boutique_titre, description: r.boutique_description, carrousel: Math.max(0, Number(r.boutique_carrousel_secondes) || 0) },
    });
  } catch (err) {
    return reponseErreur(err);
  }
}
