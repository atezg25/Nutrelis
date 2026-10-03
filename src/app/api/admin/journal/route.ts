import { query } from "@/lib/db";
import { refuserSiNonProprietaire, reponse, reponseErreur } from "@/lib/http";

export const dynamic = "force-dynamic";

/** Journal d'audit (propriétaire seulement) : qui a fait quoi, quand. Les 300 dernières lignes, filtrables par action. */
export async function GET(req: Request) {
  const refus = await refuserSiNonProprietaire();
  if (refus) return refus;
  try {
    const action = new URL(req.url).searchParams.get("action");
    const rows = action
      ? await query("SELECT id, at, admin_name, action, detail FROM audit_log WHERE action=$1 ORDER BY id DESC LIMIT 300", [action])
      : await query("SELECT id, at, admin_name, action, detail FROM audit_log ORDER BY id DESC LIMIT 300");
    return reponse({ journal: rows });
  } catch (err) {
    return reponseErreur(err);
  }
}
