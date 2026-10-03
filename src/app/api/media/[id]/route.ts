import { query } from "@/lib/db";
import { UUID } from "@/lib/http";

export const dynamic = "force-dynamic";

/**
 * Sert une image ou une vidéo de produit envoyée depuis l'administration. Publique, mise en cache longtemps (un nouvel envoi = un nouvel
 * identifiant). Les requêtes « Range » sont gérées : sans elles, Safari (iPhone) refuse de lire une vidéo.
 */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!UUID.test(id)) return new Response("Introuvable", { status: 404 });
  const rows = await query<{ content_type: string; data: Buffer }>("SELECT content_type, data FROM media WHERE id=$1", [id]);
  const m = rows[0];
  if (!m) return new Response("Introuvable", { status: 404 });
  const total = m.data.length;
  const entetes: Record<string, string> = {
    "Content-Type": m.content_type,
    "Cache-Control": "public, max-age=31536000, immutable",
    "X-Content-Type-Options": "nosniff",
    "Accept-Ranges": "bytes",
  };
  const range = /^bytes=(\d*)-(\d*)$/.exec(req.headers.get("range") ?? "");
  if (range) {
    let debut = range[1] === "" ? NaN : Number(range[1]);
    let fin = range[2] === "" ? NaN : Number(range[2]);
    if (Number.isNaN(debut)) { debut = Math.max(0, total - fin); fin = total - 1; } // « bytes=-500 » : les 500 derniers octets
    if (Number.isNaN(fin) || fin >= total) fin = total - 1;
    if (debut > fin || debut >= total) return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${total}` } });
    return new Response(new Uint8Array(m.data.subarray(debut, fin + 1)), {
      status: 206,
      headers: { ...entetes, "Content-Range": `bytes ${debut}-${fin}/${total}`, "Content-Length": String(fin - debut + 1) },
    });
  }
  return new Response(new Uint8Array(m.data), { headers: { ...entetes, "Content-Length": String(total) } });
}
