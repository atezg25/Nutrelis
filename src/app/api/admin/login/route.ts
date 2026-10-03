import { NextResponse } from "next/server";
import { connecter, jetonSession, journaliser, NOM_COOKIE_ADMIN, type ResultatConnexion } from "@/lib/admin-auth";
import { corps, erreur, texte } from "@/lib/http";

export const dynamic = "force-dynamic";

// Freinage par adresse IP : au plus 12 tentatives par 10 minutes (mémoire du processus). S'ajoute au verrouillage PAR COMPTE (8 échecs = 15 min).
const essais = new Map<string, { n: number; debut: number }>();

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "inconnue";
  const maintenant = Date.now();
  const e = essais.get(ip);
  if (e && maintenant - e.debut < 600_000 && e.n >= 12) return erreur("Trop d'essais. Réessayez dans quelques minutes.", 429, "TROP_ESSAIS");

  const b = await corps(req);
  const email = texte(b.email, 200);
  const mdp = typeof b.password === "string" ? b.password.slice(0, 200) : "";
  const r: ResultatConnexion = email && mdp ? await connecter(email, mdp) : { ok: false, raison: "IDENTIFIANTS" };
  // `"admin" in r` plutôt que `r.ok` : le projet n'est pas en mode strict, TypeScript ne distingue pas les deux cas par un booléen.
  if (!("admin" in r)) {
    essais.set(ip, e && maintenant - e.debut < 600_000 ? { n: e.n + 1, debut: e.debut } : { n: 1, debut: maintenant });
    await journaliser("connexion_refusee", `${email ?? "?"} (${ip})`, { id: null, name: email ?? "inconnu" });
    if (r.raison === "VERROUILLE") return erreur("Compte verrouillé 15 minutes après trop d'échecs.", 423, "VERROUILLE");
    return erreur("Adresse ou mot de passe incorrect.", 401, "IDENTIFIANTS");
  }
  essais.delete(ip);
  const { valeur, expire } = jetonSession(r.admin.id, r.admin.version);
  await journaliser("connexion", ip, { id: r.admin.id, name: email! });
  const res = NextResponse.json({ ok: true });
  res.cookies.set(NOM_COOKIE_ADMIN, valeur, { httpOnly: true, secure: true, sameSite: "strict", path: "/", expires: expire });
  return res;
}
