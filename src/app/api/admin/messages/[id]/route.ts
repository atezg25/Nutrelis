import { query } from "@/lib/db";
import { journaliser } from "@/lib/admin-auth";
import { corps, erreur, refuserSiNonAdmin, reponse, reponseErreur, UUID } from "@/lib/http";

export const dynamic = "force-dynamic";

/** Marque un message comme traité (ou à nouveau « nouveau »). */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const refus = await refuserSiNonAdmin();
  if (refus) return refus;
  try {
    const { id } = await params;
    if (!UUID.test(id)) return erreur("Message introuvable.", 404);
    const b = await corps(req);
    if (b.status !== "nouveau" && b.status !== "traite") return erreur("Statut invalide.", 400);
    const r = await query<{ id: string }>("UPDATE contact_message SET status=$2 WHERE id=$1 RETURNING id", [id, b.status]);
    if (!r[0]) return erreur("Message introuvable.", 404);
    await journaliser("message_" + b.status, id);
    return reponse({ ok: true });
  } catch (err) {
    return reponseErreur(err);
  }
}
