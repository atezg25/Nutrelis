import { hacher, journaliser, motDePasseTemporaire } from "@/lib/admin-auth";
import { query } from "@/lib/db";
import { corps, erreur, refuserSiNonProprietaire, reponse, reponseErreur, texte } from "@/lib/http";

export const dynamic = "force-dynamic";

/** Liste des comptes (propriétaire seulement). Jamais d'empreinte de mot de passe dans la réponse. */
export async function GET() {
  const refus = await refuserSiNonProprietaire();
  if (refus) return refus;
  try {
    const users = await query("SELECT id, email, name, role, active, must_change, last_login_at, created_at FROM admin_user ORDER BY created_at");
    return reponse({ users });
  } catch (err) {
    return reponseErreur(err);
  }
}

/** Créer un compte : un mot de passe temporaire est généré et rendu UNE SEULE FOIS ; la personne devra le changer à la première connexion. */
export async function POST(req: Request) {
  const refus = await refuserSiNonProprietaire();
  if (refus) return refus;
  try {
    const b = await corps(req);
    const email = texte(b.email, 200)?.toLowerCase() ?? null;
    const name = texte(b.name, 100);
    const role = b.role === "proprietaire" ? "proprietaire" : "gestionnaire";
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !name) return erreur("Nom et adresse e-mail valides requis.", 400);
    const temporaire = motDePasseTemporaire();
    try {
      await query("INSERT INTO admin_user (email, name, role, password_hash, must_change) VALUES ($1,$2,$3,$4,TRUE)", [email, name, role, await hacher(temporaire)]);
    } catch (err) {
      if (err instanceof Error && /duplicate key/.test(err.message)) return erreur("Un compte existe déjà avec cette adresse.", 409);
      throw err;
    }
    await journaliser("compte_cree", `${email} (${role})`);
    return reponse({ email, motDePasseTemporaire: temporaire }, 201);
  } catch (err) {
    return reponseErreur(err);
  }
}
