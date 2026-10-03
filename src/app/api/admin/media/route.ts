import { query } from "@/lib/db";
import { erreur, refuserSiNonAdmin, reponse, reponseErreur } from "@/lib/http";

export const dynamic = "force-dynamic";

const TYPES = ["image/png", "image/jpeg", "image/webp"] as const;
const MAX = 3 * 1024 * 1024;

/** Envoi d'une image de produit (PNG, JPEG ou WebP, 3 Mo maximum) : corps brut de la requête, type dans `Content-Type`. */
export async function POST(req: Request) {
  const refus = await refuserSiNonAdmin();
  if (refus) return refus;
  try {
    const type = (req.headers.get("content-type") ?? "").split(";")[0]!.trim().toLowerCase();
    if (!(TYPES as readonly string[]).includes(type)) return erreur("Format accepté : PNG, JPEG ou WebP.", 415);
    const buf = Buffer.from(await req.arrayBuffer());
    if (buf.length === 0 || buf.length > MAX) return erreur("Image vide ou trop lourde (3 Mo maximum).", 413);
    // On vérifie la « signature » du fichier : l'en-tête annoncé ne suffit pas.
    const png = buf.subarray(0, 4).toString("hex") === "89504e47";
    const jpg = buf.subarray(0, 3).toString("hex") === "ffd8ff";
    const webp = buf.subarray(0, 4).toString("ascii") === "RIFF" && buf.subarray(8, 12).toString("ascii") === "WEBP";
    if (!(png || jpg || webp)) return erreur("Ce fichier n'est pas une image valide.", 415);
    const [m] = await query<{ id: string }>("INSERT INTO media (content_type, data) VALUES ($1,$2) RETURNING id", [type, buf]);
    return reponse({ url: `/api/media/${m!.id}` }, 201);
  } catch (err) {
    return reponseErreur(err);
  }
}
