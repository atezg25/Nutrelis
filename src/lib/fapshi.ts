/**
 * Fapshi — paiement Mobile Money (Cameroun). Même API que celle utilisée par NEXIO Learn :
 *   POST /initiate-pay   → { link, transId }   (page de paiement hébergée)
 *   GET  /payment-status/:transId → { status: CREATED | PENDING | SUCCESSFUL | FAILED | EXPIRED }
 * Auth : en-têtes `apiuser` et `apikey`.
 */
const BASE = process.env.FAPSHI_API_URL || "https://live.fapshi.com";

export function fapshiConfigure(): boolean {
  return !!process.env.FAPSHI_API_USER && !!process.env.FAPSHI_API_KEY;
}

function entetes(): Record<string, string> {
  return {
    apiuser: process.env.FAPSHI_API_USER ?? "",
    apikey: process.env.FAPSHI_API_KEY ?? "",
    "Content-Type": "application/json",
    accept: "application/json",
  };
}

async function appel(method: "GET" | "POST", chemin: string, corps?: unknown): Promise<Record<string, unknown>> {
  const res = await fetch(`${BASE}${chemin}`, {
    method,
    headers: entetes(),
    ...(corps ? { body: JSON.stringify(corps) } : {}),
    signal: AbortSignal.timeout(method === "GET" ? 6_000 : 15_000), // une vérification lente ne doit jamais bloquer la console
  });
  const texte = await res.text();
  if (!res.ok) throw new Error(`fapshi http ${res.status}: ${texte.slice(0, 200)}`);
  return texte ? (JSON.parse(texte) as Record<string, unknown>) : {};
}

export async function initierPaiement(p: {
  montant: number;
  numeroCommande: string;
  retour: string;
  email?: string | null;
  message: string;
}): Promise<{ lien: string; transId: string }> {
  const res = await appel("POST", "/initiate-pay", {
    amount: p.montant,
    externalId: p.numeroCommande,
    redirectUrl: p.retour,
    message: p.message,
    ...(p.email ? { email: p.email } : {}),
  });
  const lien = res["link"];
  const transId = res["transId"];
  if (typeof lien !== "string" || typeof transId !== "string") throw new Error("fapshi: réponse sans lien ou transId");
  return { lien, transId };
}

export type StatutFapshi = { statut: "payee" | "echouee" | "en_attente"; brut: string; montant: number | null };

/** Interroge Fapshi : c'est LUI qui fait foi, jamais le contenu d'un webhook. */
export async function verifierPaiement(transId: string): Promise<StatutFapshi> {
  const res = await appel("GET", `/payment-status/${encodeURIComponent(transId)}`);
  const brut = typeof res["status"] === "string" ? (res["status"] as string) : "";
  const montant = typeof res["amount"] === "number" ? (res["amount"] as number) : null;
  if (brut === "SUCCESSFUL") return { statut: "payee", brut, montant };
  if (brut === "FAILED" || brut === "EXPIRED") return { statut: "echouee", brut, montant };
  return { statut: "en_attente", brut, montant };
}
