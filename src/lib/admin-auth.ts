import { createHmac, randomBytes, scrypt as scryptCb, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { cookies } from "next/headers";
import { query } from "./db";

/**
 * COMPTES ADMINISTRATEURS.
 *  - Mot de passe : jamais stocké, seulement son empreinte scrypt (sel aléatoire par compte).
 *  - Session : cookie signé (HMAC) valable 10 min, prolongée à chaque activité, lié à l'identifiant ET à la `session_version` du compte : changer le mot de passe
 *    (ou désactiver le compte) invalide aussitôt toutes les sessions ouvertes.
 *  - Rôles : `proprietaire` (tout, dont comptes, réglages, journal) et `gestionnaire` (commandes, paiements, stock, produits, revendeurs).
 */
const scrypt = promisify(scryptCb) as (mdp: string, sel: Buffer, longueur: number) => Promise<Buffer>;
export const NOM_COOKIE_ADMIN = "nutrelis_admin";
/** Inactivité maximale : la console se ferme après 10 min sans action (le navigateur prolonge le cookie tant que l'on travaille). */
const DUREE_MS = 10 * 60 * 1000;
const VERROU_MS = 15 * 60 * 1000;
const ESSAIS_MAX = 8;

export type Role = "proprietaire" | "gestionnaire";
export type AdminCourant = { id: string; email: string; name: string; role: Role; mustChange: boolean };

// ---------------------------------------------------------------- mots de passe
export async function hacher(mdp: string): Promise<string> {
  const sel = randomBytes(16);
  const h = await scrypt(mdp, sel, 64);
  return `scrypt$${sel.toString("hex")}$${h.toString("hex")}`;
}

export async function verifierMotDePasse(mdp: string, empreinte: string): Promise<boolean> {
  const [algo, selHex, hHex] = empreinte.split("$");
  if (algo !== "scrypt" || !selHex || !hHex) return false;
  const attendu = Buffer.from(hHex, "hex");
  const calcule = await scrypt(mdp, Buffer.from(selHex, "hex"), attendu.length);
  return attendu.length === calcule.length && timingSafeEqual(attendu, calcule);
}

/** Règle unique de robustesse : 10 caractères au moins, une lettre et un chiffre. */
export function motDePasseAcceptable(mdp: string): string | null {
  if (mdp.length < 10) return "Le mot de passe doit contenir au moins 10 caractères.";
  if (mdp.length > 200) return "Mot de passe trop long.";
  if (!/[A-Za-z]/.test(mdp) || !/\d/.test(mdp)) return "Le mot de passe doit contenir au moins une lettre et un chiffre.";
  return null;
}

export function motDePasseTemporaire(): string {
  // 12 caractères lisibles (sans 0/O/1/l) + un chiffre garanti.
  const alphabet = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const octets = randomBytes(12);
  let m = "";
  for (let i = 0; i < 12; i++) m += alphabet[octets[i]! % alphabet.length];
  return /\d/.test(m) ? m : `${m.slice(0, 11)}7`;
}

// ---------------------------------------------------------------- sessions
function secret(): string {
  const s = process.env.ADMIN_SESSION_SECRET;
  if (!s || s.length < 16) throw new Error("ADMIN_SESSION_SECRET manquant ou trop court");
  return s;
}
const signer = (charge: string) => createHmac("sha256", secret()).update(charge).digest("hex");
function egal(a: string, b: string): boolean {
  const x = Buffer.from(a), y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

export function jetonSession(uid: string, version: number): { valeur: string; expire: Date } {
  const expire = Date.now() + DUREE_MS;
  const charge = `${uid}.${expire}.${version}`;
  return { valeur: `${charge}.${signer(charge)}`, expire: new Date(expire) };
}

type LigneAdmin = { id: string; email: string; name: string; role: Role; active: boolean; must_change: boolean; session_version: number };

/** Le compte connecté, ou null (cookie absent, falsifié, expiré, compte désactivé, session invalidée). */
export async function adminCourant(): Promise<AdminCourant | null> {
  const jar = await cookies();
  const v = jar.get(NOM_COOKIE_ADMIN)?.value;
  if (!v) return null;
  const parts = v.split(".");
  if (parts.length !== 4) return null;
  const [uid, exp, ver, sig] = parts as [string, string, string, string];
  if (!egal(sig, signer(`${uid}.${exp}.${ver}`)) || Number(exp) < Date.now()) return null;
  if (!/^[0-9a-f-]{36}$/i.test(uid)) return null;
  const rows = await query<LigneAdmin>("SELECT id, email, name, role, active, must_change, session_version FROM admin_user WHERE id=$1", [uid]);
  const a = rows[0];
  if (!a || !a.active || String(a.session_version) !== ver) return null;
  return { id: a.id, email: a.email, name: a.name, role: a.role, mustChange: a.must_change };
}

// ---------------------------------------------------------------- connexion
let fauxHachis: Promise<string> | null = null;
export type ResultatConnexion =
  | { ok: true; admin: { id: string; version: number } }
  | { ok: false; raison: "IDENTIFIANTS" | "VERROUILLE" };

/**
 * Vérifie email + mot de passe. Premier démarrage : si AUCUN compte n'existe, l'adresse de la boutique (STORE_EMAIL) peut créer le
 * compte PROPRIÉTAIRE avec le mot de passe initial `ADMIN_PASSWORD` ; il devra le changer dès la première connexion.
 */
export async function connecter(emailBrut: string, mdp: string): Promise<ResultatConnexion> {
  const email = emailBrut.trim().toLowerCase();
  const [{ n }] = await query<{ n: number }>("SELECT count(*)::int AS n FROM admin_user");
  if (n === 0) {
    const initial = process.env.ADMIN_PASSWORD;
    const boutique = (process.env.STORE_EMAIL ?? "").trim().toLowerCase();
    if (initial && boutique && email === boutique && egal(mdp, initial)) {
      const empreinte = await hacher(mdp);
      await query(
        "INSERT INTO admin_user (email, name, role, password_hash, must_change) VALUES ($1,'Propriétaire','proprietaire',$2,TRUE) ON CONFLICT (email) DO NOTHING",
        [email, empreinte],
      );
    }
  }
  const rows = await query<{ id: string; password_hash: string; active: boolean; failed_attempts: number; locked_until: Date | null; session_version: number }>(
    "SELECT id, password_hash, active, failed_attempts, locked_until, session_version FROM admin_user WHERE email=$1",
    [email],
  );
  const u = rows[0];
  if (!u || !u.active) {
    // Même durée de calcul qu'un vrai compte : on ne révèle pas si l'adresse existe.
    fauxHachis ??= hacher("compte-inexistant-0");
    await verifierMotDePasse(mdp, await fauxHachis);
    return { ok: false, raison: "IDENTIFIANTS" };
  }
  if (u.locked_until && u.locked_until.getTime() > Date.now()) return { ok: false, raison: "VERROUILLE" };
  if (!(await verifierMotDePasse(mdp, u.password_hash))) {
    const echecs = u.failed_attempts + 1;
    await query("UPDATE admin_user SET failed_attempts=$2, locked_until=$3 WHERE id=$1", [u.id, echecs >= ESSAIS_MAX ? 0 : echecs, echecs >= ESSAIS_MAX ? new Date(Date.now() + VERROU_MS) : null]);
    return { ok: false, raison: echecs >= ESSAIS_MAX ? "VERROUILLE" : "IDENTIFIANTS" };
  }
  await query("UPDATE admin_user SET failed_attempts=0, locked_until=NULL, last_login_at=now() WHERE id=$1", [u.id]);
  return { ok: true, admin: { id: u.id, version: u.session_version } };
}

// ---------------------------------------------------------------- journal
export async function journaliser(action: string, detail?: string, admin?: { id: string | null; name: string } | null): Promise<void> {
  try {
    const a = admin === undefined ? await adminCourant() : admin;
    await query("INSERT INTO audit_log (admin_id, admin_name, action, detail) VALUES ($1,$2,$3,$4)", [a?.id ?? null, a?.name ?? null, action, detail?.slice(0, 500) ?? null]);
  } catch (err) {
    console.error("[nutrelis] journal", err instanceof Error ? err.message : err);
  }
}
