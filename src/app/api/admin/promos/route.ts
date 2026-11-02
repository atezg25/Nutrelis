import { query } from "@/lib/db";
import { journaliser } from "@/lib/admin-auth";
import { corps, entier, erreur, refuserSiNonAdmin, reponse, reponseErreur, texte } from "@/lib/http";

export const dynamic = "force-dynamic";

export async function GET() {
  const refus = await refuserSiNonAdmin();
  if (refus) return refus;
  try {
    const promos = await query("SELECT id, code, kind, value, min_order_fcfa, max_uses, used_count, starts_at, ends_at, active, note, created_at FROM promo_code ORDER BY created_at DESC");
    return reponse({ promos });
  } catch (err) {
    return reponseErreur(err);
  }
}

/** Crée un code : { code, kind: "percent"|"fixed", value, minOrder?, maxUses?, endsAt?, note? }. */
export async function POST(req: Request) {
  const refus = await refuserSiNonAdmin();
  if (refus) return refus;
  try {
    const b = await corps(req);
    const code = (texte(b.code, 40) ?? "").toUpperCase().replace(/\s+/g, "");
    if (!/^[A-Z0-9_-]{3,40}$/.test(code)) return erreur("Code : 3 à 40 caractères (lettres, chiffres, - ou _).", 400);
    const kind = b.kind === "fixed" ? "fixed" : "percent";
    const value = entier(b.value, 1, 10_000_000);
    if (value === null) return erreur("Valeur invalide.", 400);
    if (kind === "percent" && value > 100) return erreur("Un pourcentage ne dépasse pas 100.", 400);
    const minOrder = b.minOrder === undefined || b.minOrder === "" || b.minOrder === null ? 0 : entier(b.minOrder, 0, 100_000_000);
    if (minOrder === null) return erreur("Montant minimum invalide.", 400);
    const maxUses = b.maxUses === undefined || b.maxUses === "" || b.maxUses === null ? null : entier(b.maxUses, 1, 1_000_000);
    if (b.maxUses !== undefined && b.maxUses !== "" && b.maxUses !== null && maxUses === null) return erreur("Nombre d'utilisations invalide.", 400);
    const finRaw = texte(b.endsAt, 40);
    const fin = finRaw ? new Date(finRaw) : null;
    if (finRaw && (!fin || Number.isNaN(fin.getTime()))) return erreur("Date de fin invalide.", 400);
    const dejaLa = await query("SELECT 1 FROM promo_code WHERE upper(code)=$1", [code]);
    if (dejaLa.length > 0) return erreur("Ce code existe déjà.", 409);
    await query(
      "INSERT INTO promo_code (code, kind, value, min_order_fcfa, max_uses, ends_at, note) VALUES ($1,$2,$3,$4,$5,$6,$7)",
      [code, kind, value, minOrder, maxUses, fin ? new Date(fin.setHours(23, 59, 59, 999)) : null, texte(b.note, 200)],
    );
    await journaliser("promo_creee", `${code} (${kind === "percent" ? `${value} %` : `${value} FCFA`})`);
    return reponse({ ok: true });
  } catch (err) {
    return reponseErreur(err);
  }
}
