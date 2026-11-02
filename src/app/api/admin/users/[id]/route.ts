import { adminCourant, hacher, journaliser, motDePasseTemporaire } from "@/lib/admin-auth";
import { query } from "@/lib/db";
import { corps, erreur, refuserSiNonProprietaire, reponse, reponseErreur, UUID } from "@/lib/http";

export const dynamic = "force-dynamic";

/**
 * Désactiver / réactiver un compte, changer son rôle, ou réinitialiser son mot de passe (mot de passe temporaire rendu une seule fois).
 * Garde-fous : on ne peut ni se désactiver soi-même, ni se retirer le rôle de propriétaire, ni laisser la boutique sans propriétaire actif.
 */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const refus = await refuserSiNonProprietaire();
  if (refus) return refus;
  try {
    const { id } = await params;
    if (!UUID.test(id)) return erreur("Identifiant invalide.", 400);
    const moi = (await adminCourant())!;
    const [cible] = await query<{ email: string; role: string; active: boolean }>("SELECT email, role, active FROM admin_user WHERE id=$1", [id]);
    if (!cible) return erreur("Compte introuvable.", 404);
    const b = await corps(req);
    const memeCompte = id === moi.id;

    if (typeof b.active === "boolean" && b.active !== cible.active) {
      if (memeCompte) return erreur("Vous ne pouvez pas désactiver votre propre compte.", 400, "AUTO_DESACTIVATION");
      // Désactiver ferme aussi ses sessions ouvertes.
      await query("UPDATE admin_user SET active=$2, session_version=session_version+1 WHERE id=$1", [id, b.active]);
      await journaliser(b.active ? "compte_reactive" : "compte_desactive", cible.email);
    }
    if (b.role === "proprietaire") return erreur("Un utilisateur ne peut pas devenir propriétaire.", 403, "INTERDIT");
    // Un propriétaire cumule tous les rôles (il a aussi tous les droits du gestionnaire) : on ne le rétrograde pas.
    if (b.role === "gestionnaire" && cible.role === "proprietaire") return erreur("Un propriétaire garde tous les rôles : il ne peut pas être rétrogradé.", 403, "INTERDIT");
    if (b.role === "gestionnaire") {
      if (b.role !== cible.role) {
        if (memeCompte) return erreur("Vous ne pouvez pas modifier votre propre rôle.", 400, "AUTO_ROLE");
        await query("UPDATE admin_user SET role=$2, session_version=session_version+1 WHERE id=$1", [id, b.role]);
        await journaliser("compte_role", `${cible.email} → ${b.role}`);
      }
    }
    if (b.reinitialiser === true) {
      const temporaire = motDePasseTemporaire();
      await query("UPDATE admin_user SET password_hash=$2, must_change=TRUE, session_version=session_version+1, failed_attempts=0, locked_until=NULL WHERE id=$1", [id, await hacher(temporaire)]);
      await journaliser("compte_mdp_reinitialise", cible.email);
      return reponse({ ok: true, motDePasseTemporaire: temporaire });
    }
    return reponse({ ok: true });
  } catch (err) {
    return reponseErreur(err);
  }
}
