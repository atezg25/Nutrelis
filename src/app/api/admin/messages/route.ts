import { query } from "@/lib/db";
import { refuserSiNonAdmin, reponse, reponseErreur } from "@/lib/http";

export const dynamic = "force-dynamic";

/** Messages reçus par le formulaire de contact : les plus récents d'abord, avec le nombre de non traités. */
export async function GET(req: Request) {
  const refus = await refuserSiNonAdmin();
  if (refus) return refus;
  try {
    const vue = new URL(req.url).searchParams.get("vue");
    const messages = await query(
      `SELECT id, name, email, subject, message, status, created_at FROM contact_message
        WHERE ($1::text IS NULL OR status = $1) ORDER BY created_at DESC LIMIT 200`,
      [vue === "nouveau" || vue === "traite" ? vue : null],
    );
    const [c] = await query<{ nouveaux: number }>("SELECT COUNT(*) FILTER (WHERE status='nouveau')::int AS nouveaux FROM contact_message");
    return reponse({ messages, nouveaux: c?.nouveaux ?? 0 });
  } catch (err) {
    return reponseErreur(err);
  }
}
