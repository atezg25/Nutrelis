import { corps, entier, erreur, reponse, reponseErreur, texte, UUID } from "@/lib/http";
import { changerStatut, creerCommande, enregistrerPaiementCree, type LigneDemandee, type ModePaiement } from "@/lib/orders";
import { fapshiConfigure, initierPaiement } from "@/lib/fapshi";
import { notifierNouvelleCommande } from "@/lib/notifier";

export const dynamic = "force-dynamic";

/** Le client passe commande : on réserve le stock, puis (Fapshi) on renvoie le lien de paiement. */
export async function POST(req: Request) {
  try {
    const b = await corps(req);
    const brut = Array.isArray(b.items) ? b.items : [];
    const lignes: LigneDemandee[] = [];
    for (const it of brut) {
      const o = it as Record<string, unknown>;
      const variantId = typeof o.variantId === "string" && UUID.test(o.variantId) ? o.variantId : null;
      const qty = entier(o.qty ?? o.quantite, 1, 100);
      if (!variantId || !qty) return erreur("Panier invalide.", 400, "PANIER_INVALIDE");
      lignes.push({ variantId, qty });
    }
    const c = (b.client ?? {}) as Record<string, unknown>;
    const mode: ModePaiement = b.mode === "livraison" ? "livraison" : "fapshi";
    if (mode === "fapshi" && !fapshiConfigure()) {
      return erreur("Le paiement en ligne n'est pas encore disponible. Choisissez le paiement à la livraison.", 503, "PAIEMENT_INDISPONIBLE");
    }
    const cmd = await creerCommande({
      lignes,
      mode,
      client: {
        nom: [texte(c.prenom, 80), texte(c.nom, 80)].filter(Boolean).join(" ") || texte(c.fullName, 160) || "",
        telephone: texte(c.telephone, 30) ?? "",
        email: texte(c.email, 160),
        ville: texte(c.ville, 80),
        adresse: [texte(c.adresse, 200), texte(c.quartier, 80)].filter(Boolean).join(", ") || null,
        quartier: texte(c.quartier, 80),
        notes: texte(c.notes, 500),
      },
    });

    // Paiement à la livraison : la commande est ferme dès maintenant, la boutique est prévenue. Paiement en ligne :
    // elle l'est quand Fapshi confirme le paiement (voir appliquerPaiement).
    if (mode === "livraison") {
      void notifierNouvelleCommande(cmd.numero).catch(() => undefined);
      return reponse({ numero: cmd.numero, total: cmd.total, mode });
    }

    try {
      const base = process.env.NEXT_PUBLIC_URL || "https://nutrelis.bio";
      const p = await initierPaiement({
        montant: cmd.total,
        numeroCommande: cmd.numero,
        retour: `${base}/checkout/success?commande=${encodeURIComponent(cmd.numero)}`,
        email: texte(c.email, 160),
        message: `NUTRELIS — commande ${cmd.numero}`,
      });
      await enregistrerPaiementCree(cmd.id, cmd.total, p.transId);
      return reponse({ numero: cmd.numero, total: cmd.total, mode, checkoutUrl: p.lien });
    } catch (err) {
      // Fapshi n'a pas pu créer le paiement : la commande n'a pas lieu d'être, on libère le stock.
      console.error("[nutrelis] fapshi initiate-pay", err instanceof Error ? err.message : err);
      await changerStatut(cmd.id, "annulee");
      return erreur("Le paiement n'a pas pu être lancé. Réessayez dans un instant.", 502, "PAIEMENT_ECHEC");
    }
  } catch (err) {
    return reponseErreur(err);
  }
}
