import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * Vignette de partage (WhatsApp, Facebook, X…) d'un produit : 1200 × 630, l'IMAGE DU PRODUIT en question sur la palette de sa fiche.
 * Une seule route pour tous les produits, présents et futurs : l'image vient de `product.image_url`.
 */
type Ligne = { name: string; subtitle: string | null; image_url: string | null; content: { theme?: string } | null };

const PALETTES: Record<string, { fond1: string; fond2: string; accent: string; texte: string }> = {
  violet: { fond1: "#fffaf3", fond2: "#ead7f5", accent: "#6B1B8F", texte: "#24102e" },
  gel: { fond1: "#fff8f1", fond2: "#ffddc0", accent: "#D4560A", texte: "#2b1606" },
  defaut: { fond1: "#fff8f6", fond2: "#f2d9d4", accent: "#7D0806", texte: "#1a0505" },
};

/** Image du site (`/images/...`) lue sur le disque et passée en data-URI (PNG/JPEG seulement). Sinon null : la vignette s'affiche sans photo. */
async function imageEnLigne(url: string | null): Promise<string | null> {
  if (!url || !/^\/images\/[A-Za-z0-9._\-\/]+\.(png|jpe?g)$/i.test(url) || url.includes("..")) return null;
  try {
    const buf = await readFile(path.join(process.cwd(), "public", url));
    return `data:image/${/\.png$/i.test(url) ? "png" : "jpeg"};base64,${buf.toString("base64")}`;
  } catch {
    return null;
  }
}

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [p] = await query<Ligne>(
    "SELECT name, subtitle, image_url, content FROM product WHERE lower(slug) = lower($1) AND active LIMIT 1",
    [slug.slice(0, 120)],
  );
  const pal = p?.content?.theme === "violet" ? PALETTES.violet : slug.toLowerCase().startsWith("gel") ? PALETTES.gel : PALETTES.defaut;
  const photo = await imageEnLigne(p?.image_url ?? null);
  const nom = p?.name ?? "NUTRELIS";
  const sous = p?.subtitle ?? "Livraison partout au Cameroun";

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", background: `linear-gradient(135deg, ${pal.fond1} 0%, ${pal.fond2} 100%)`, fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", width: 700, padding: "0 20px 0 70px" }}>
          <div style={{ display: "flex", fontSize: 34, fontWeight: 800, letterSpacing: 6, color: pal.accent }}>NUTRELIS</div>
          <div style={{ display: "flex", fontSize: nom.length > 22 ? 64 : 80, fontWeight: 800, lineHeight: 1.05, color: pal.texte, marginTop: 28 }}>{nom}</div>
          <div style={{ display: "flex", fontSize: 32, color: pal.texte, opacity: 0.75, marginTop: 22, lineHeight: 1.3 }}>{sous}</div>
          <div style={{ display: "flex", marginTop: 40 }}>
            <div style={{ display: "flex", background: pal.accent, color: "#fff", fontSize: 26, fontWeight: 700, padding: "14px 30px", borderRadius: 50 }}>Livraison au Cameroun · Mobile Money</div>
          </div>
        </div>
        <div style={{ display: "flex", flex: 1, height: "100%", alignItems: "center", justifyContent: "center" }}>
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photo} alt={nom} width={380} height={600} style={{ width: 380, height: 600, objectFit: "contain" }} />
          ) : null}
        </div>
      </div>
    ),
    { width: 1200, height: 630, headers: { "Cache-Control": "public, max-age=3600, s-maxage=3600" } },
  );
}
