import { query } from "@/lib/db";
import { UUID } from "@/lib/http";

export const dynamic = "force-dynamic";

/** Sert une image de produit envoyée depuis l'administration. Publique, et mise en cache longtemps (une image ne change jamais : un nouvel envoi = un nouvel identifiant). */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!UUID.test(id)) return new Response("Introuvable", { status: 404 });
  const rows = await query<{ content_type: string; data: Buffer }>("SELECT content_type, data FROM media WHERE id=$1", [id]);
  const m = rows[0];
  if (!m) return new Response("Introuvable", { status: 404 });
  return new Response(new Uint8Array(m.data), {
    headers: { "Content-Type": m.content_type, "Cache-Control": "public, max-age=31536000, immutable", "X-Content-Type-Options": "nosniff" },
  });
}
