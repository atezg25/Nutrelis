import { NextResponse } from "next/server";
import { adminCourant, hacher, jetonSession, journaliser, motDePasseAcceptable, NOM_COOKIE_ADMIN, verifierMotDePasse } from "@/lib/admin-auth";
import { query } from "@/lib/db";
import { corps, erreur } from "@/lib/http";

export const dynamic = "force-dynamic";

/**
 * Changer SON mot de passe : il faut redonner l'actuel. Toutes les autres sessions de ce compte sont fermées (session_version),
 * et la session en cours reçoit un nouveau cookie.
 */
export async function POST(req: Request) {
  const a = await adminCourant();
  if (!a) return erreur("Non autorisé", 401, "NON_AUTORISE");
  const b = await corps(req);
  const actuel = typeof b.actuel === "string" ? b.actuel : "";
  const nouveau = typeof b.nouveau === "string" ? b.nouveau : "";
  const [u] = await query<{ password_hash: string }>("SELECT password_hash FROM admin_user WHERE id=$1", [a.id]);
  if (!u || !(await verifierMotDePasse(actuel, u.password_hash))) {
    await journaliser("changement_mdp_refuse", "mot de passe actuel incorrect");
    return erreur("Le mot de passe actuel est incorrect.", 403, "MDP_ACTUEL");
  }
  const probleme = motDePasseAcceptable(nouveau);
  if (probleme) return erreur(probleme, 400, "MDP_FAIBLE");
  if (nouveau === actuel) return erreur("Le nouveau mot de passe doit être différent de l'actuel.", 400, "MDP_IDENTIQUE");
  const [m] = await query<{ session_version: number }>(
    "UPDATE admin_user SET password_hash=$2, session_version=session_version+1, must_change=FALSE, failed_attempts=0, locked_until=NULL WHERE id=$1 RETURNING session_version",
    [a.id, await hacher(nouveau)],
  );
  await journaliser("changement_mdp", "mot de passe changé, autres sessions fermées");
  const { valeur, expire } = jetonSession(a.id, m!.session_version);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(NOM_COOKIE_ADMIN, valeur, { httpOnly: true, secure: true, sameSite: "strict", path: "/", expires: expire });
  return res;
}
