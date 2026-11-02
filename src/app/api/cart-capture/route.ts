import { query } from "@/lib/db";
import { corps, reponse, reponseErreur, texte, UUID } from "@/lib/http";
import { createRateLimiter, getClientIp } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const limiteur = createRateLimiter({ maxRequests: 12, windowMs: 60_000 });

/**
 * Panier en cours de commande : dès que le client a saisi son téléphone, on garde son panier. S'il passe commande,
 * `creerCommande` le marque « récupéré » ; sinon il apparaît dans l'onglet « Paniers abandonnés » pour être relancé.
 */
export async function POST(req: Request) {
  try {
    if (!limiteur.check(getClientIp(req.headers)).allowed) return reponse({ ok: true });
    const b = await corps(req);
    const tel = (texte(b.telephone, 30) ?? "").replace(/[^\d+]/g, "");
    if (tel.replace(/\D/g, "").length < 8) return reponse({ ok: true });
    const items: { variantId: string; qty: number; abo: boolean }[] = [];
    for (const it of (Array.isArray(b.items) ? b.items : []).slice(0, 20)) {
      const o = it as Record<string, unknown>;
      const qty = typeof o.qty === "number" && Number.isInteger(o.qty) && o.qty > 0 && o.qty <= 100 ? o.qty : null;
      if (typeof o.variantId === "string" && UUID.test(o.variantId) && qty) items.push({ variantId: o.variantId, qty, abo: o.mode === "abonnement" });
    }
    if (items.length === 0) return reponse({ ok: true });
    const total = typeof b.total === "number" && Number.isFinite(b.total) ? Math.min(Math.max(0, Math.round(b.total)), 100_000_000) : 0;
    const nom = [texte(b.prenom, 80), texte(b.nom, 80)].filter(Boolean).join(" ") || null;
    await query(
      `INSERT INTO abandoned_cart (phone, name, email, city, items, total_fcfa) VALUES ($1,$2,$3,$4,$5::jsonb,$6)
       ON CONFLICT (phone) DO UPDATE SET name=COALESCE(EXCLUDED.name, abandoned_cart.name), email=COALESCE(EXCLUDED.email, abandoned_cart.email),
         city=COALESCE(EXCLUDED.city, abandoned_cart.city), items=EXCLUDED.items, total_fcfa=EXCLUDED.total_fcfa, status='ouvert', updated_at=now()`,
      [tel, nom, texte(b.email, 160), texte(b.ville, 80), JSON.stringify(items), total],
    );
    return reponse({ ok: true });
  } catch (err) {
    return reponseErreur(err);
  }
}
