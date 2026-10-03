import { NextResponse } from "next/server";
import { NOM_COOKIE_ADMIN } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(NOM_COOKIE_ADMIN, "", { httpOnly: true, secure: true, sameSite: "strict", path: "/", expires: new Date(0) });
  return res;
}
