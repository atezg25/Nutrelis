import { query } from "@/lib/db";
import { erreur, refuserSiNonAdmin, reponse, reponseErreur } from "@/lib/http";
import { journaliser } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

const TYPES = ["image/png", "image/jpeg", "image/webp", "video/mp4"] as const;
const MAX_IMAGE = 3 * 1024 * 1024;
const MAX_VIDEO = 25 * 1024 * 1024;

/** Envoi d'une image (PNG, JPEG ou WebP, 3 Mo) ou d'une vidéo (MP4, 25 Mo) de produit : corps brut de la requête, type dans `Content-Type`. */
export async function POST(req: Request) {
  const refus = await refuserSiNonAdmin();
  if (refus) return refus;
  try {
    const type = (req.headers.get("content-type") ?? "").split(";")[0]!.trim().toLowerCase();
    if (!(TYPES as readonly string[]).includes(type)) return erreur("Formats acceptés : PNG, JPEG, WebP ou MP4.", 415);
    const buf = Buffer.from(await req.arrayBuffer());
    const max = type === "video/mp4" ? MAX_VIDEO : MAX_IMAGE;
    if (buf.length === 0 || buf.length > max) return erreur(type === "video/mp4" ? "Vidéo vide ou trop lourde (25 Mo maximum)." : "Image vide ou trop lourde (3 Mo maximum).", 413);
    // On vérifie la « signature » du fichier : l'en-tête annoncé ne suffit pas.
    const png = buf.subarray(0, 4).toString("hex") === "89504e47";
    const jpg = buf.subarray(0, 3).toString("hex") === "ffd8ff";
    const webp = buf.subarray(0, 4).toString("ascii") === "RIFF" && buf.subarray(8, 12).toString("ascii") === "WEBP";
    const mp4 = buf.subarray(4, 8).toString("ascii") === "ftyp";
    const attendu = type === "image/png" ? png : type === "image/jpeg" ? jpg : type === "image/webp" ? webp : mp4;
    if (!attendu) return erreur("Ce fichier n'est pas valide ou ne correspond pas à son format.", 415);
    const [m] = await query<{ id: string }>("INSERT INTO media (content_type, data) VALUES ($1,$2) RETURNING id", [type, buf]);
    await journaliser(type === "video/mp4" ? "video_envoyee" : "image_envoyee", `${type}, ${Math.round(buf.length / 1024)} Ko`);
    return reponse({ url: `/api/media/${m!.id}` }, 201);
  } catch (err) {
    return reponseErreur(err);
  }
}
