import { NextResponse } from "next/server";
import { jetonSession, motDePasseValide, NOM_COOKIE_ADMIN } from "@/lib/admin-auth";
import { corps, erreur } from "@/lib/http";

export const dynamic = "force-dynamic";

// Freinage des essais de mot de passe : au plus 8 tentatives par adresse et par 10 minutes (mémoire du processus).
const essais = new Map<string, { n: number; debut: number }>();

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "inconnue";
  const e = essais.get(ip);
  const maintenant = Date.now();
  if (e && maintenant - e.debut < 600_000 && e.n >= 8) return erreur("Trop d'essais. Réessayez dans quelques minutes.", 429, "TROP_ESSAIS");

  const b = await corps(req);
  const ok = typeof b.password === "string" && motDePasseValide(b.password);
  if (!ok) {
    essais.set(ip, e && maintenant - e.debut < 600_000 ? { n: e.n + 1, debut: e.debut } : { n: 1, debut: maintenant });
    return erreur("Mot de passe incorrect.", 401, "MDP_INCORRECT");
  }
  essais.delete(ip);
  const { valeur, expire } = jetonSession();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(NOM_COOKIE_ADMIN, valeur, { httpOnly: true, secure: true, sameSite: "strict", path: "/", expires: expire });
  return res;
}
