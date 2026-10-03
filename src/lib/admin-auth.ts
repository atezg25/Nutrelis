import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

/**
 * Accès à l'administration : un mot de passe (ADMIN_PASSWORD) et un cookie signé (HMAC) valable 12 h.
 * Simple volontairement : une seule personne administre la boutique.
 */
const COOKIE = "nutrelis_admin";
const DUREE_MS = 12 * 60 * 60 * 1000;

function secret(): string {
  const s = process.env.ADMIN_SESSION_SECRET;
  if (!s || s.length < 16) throw new Error("ADMIN_SESSION_SECRET manquant ou trop court");
  return s;
}

function signer(expire: number): string {
  return createHmac("sha256", secret()).update(String(expire)).digest("hex");
}

function egal(a: string, b: string): boolean {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

export function motDePasseValide(saisi: string): boolean {
  const attendu = process.env.ADMIN_PASSWORD;
  return !!attendu && attendu.length >= 8 && egal(saisi, attendu);
}

export function jetonSession(): { valeur: string; expire: Date } {
  const expire = Date.now() + DUREE_MS;
  return { valeur: `${expire}.${signer(expire)}`, expire: new Date(expire) };
}

export function jetonValide(valeur: string | undefined): boolean {
  if (!valeur) return false;
  const [exp, sig] = valeur.split(".");
  const expire = Number(exp);
  if (!sig || !Number.isFinite(expire) || expire < Date.now()) return false;
  return egal(sig, signer(expire));
}

/** À appeler en tête de chaque route d'administration. */
export async function adminConnecte(): Promise<boolean> {
  const jar = await cookies();
  return jetonValide(jar.get(COOKIE)?.value);
}

export const NOM_COOKIE_ADMIN = COOKIE;
