import { adminCourant } from "@/lib/admin-auth";
import { erreur, reponse } from "@/lib/http";

export const dynamic = "force-dynamic";

/** Qui est connecté ? (rôle, et s'il doit d'abord changer son mot de passe) */
export async function GET() {
  const a = await adminCourant();
  if (!a) return erreur("Non autorisé", 401, "NON_AUTORISE");
  return reponse({ email: a.email, name: a.name, role: a.role, mustChange: a.mustChange });
}
