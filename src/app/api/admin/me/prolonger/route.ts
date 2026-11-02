import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminCourant, jetonSession, NOM_COOKIE_ADMIN } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

/** Activité de l'utilisateur : on rouvre une fenêtre de 10 min (le cookie actuel doit être encore valide). */
export async function POST() {
  const a = await adminCourant();
  if (!a) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const ver = (await cookies()).get(NOM_COOKIE_ADMIN)?.value.split(".")[2] ?? "0";
  const { valeur, expire } = jetonSession(a.id, Number(ver));
  const res = NextResponse.json({ ok: true });
  res.cookies.set(NOM_COOKIE_ADMIN, valeur, { httpOnly: true, secure: true, sameSite: "strict", path: "/", expires: expire });
  return res;
}
