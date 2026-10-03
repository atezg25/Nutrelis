import { NextResponse } from "next/server";
import { adminCourant } from "./admin-auth";
import { ErreurCommande } from "./orders";
import { ErreurExpedition } from "./expeditions";

export const reponse = (data: unknown, status = 200) => NextResponse.json(data, { status });
export const erreur = (message: string, status = 400, code?: string) => NextResponse.json({ error: message, code }, { status });

/** À appeler en tête de chaque route d'administration : 401 si pas connecté, 403 tant que le mot de passe initial n'a pas été changé. */
export async function refuserSiNonAdmin(): Promise<NextResponse | null> {
  const a = await adminCourant();
  if (!a) return erreur("Non autorisé", 401, "NON_AUTORISE");
  if (a.mustChange) return erreur("Vous devez d'abord changer votre mot de passe.", 403, "CHANGER_MOT_DE_PASSE");
  return null;
}

/** Réservé au propriétaire : comptes, réglages, journal. */
export async function refuserSiNonProprietaire(): Promise<NextResponse | null> {
  const a = await adminCourant();
  if (!a) return erreur("Non autorisé", 401, "NON_AUTORISE");
  if (a.mustChange) return erreur("Vous devez d'abord changer votre mot de passe.", 403, "CHANGER_MOT_DE_PASSE");
  if (a.role !== "proprietaire") return erreur("Réservé au propriétaire.", 403, "INTERDIT");
  return null;
}

/** Traduit une erreur métier (stock, panier…) en réponse claire ; le reste devient un 500 sans détail technique. */
export function reponseErreur(err: unknown): NextResponse {
  if (err instanceof ErreurExpedition) return erreur(err.message, err.code === "COMMANDE_INTROUVABLE" || err.code === "COLIS_INTROUVABLE" ? 404 : 409, err.code);
  if (err instanceof ErreurCommande) return erreur(err.message, err.code === "STOCK_INSUFFISANT" ? 409 : 400, err.code);
  console.error("[nutrelis]", err instanceof Error ? err.message : err);
  return erreur("Erreur serveur. Réessayez dans un instant.", 500, "SERVEUR");
}

export function texte(v: unknown, max = 200): string | null {
  return typeof v === "string" && v.trim() ? v.trim().slice(0, max) : null;
}

export function entier(v: unknown, min = 0, max = 100_000_000): number | null {
  return typeof v === "number" && Number.isInteger(v) && v >= min && v <= max ? v : null;
}

export async function corps(req: Request): Promise<Record<string, unknown>> {
  try {
    const j = await req.json();
    return j && typeof j === "object" && !Array.isArray(j) ? (j as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

export const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
