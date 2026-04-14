import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY!);
}

function escapeHtml(str: string): string {
  if (!str) return "";
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

interface CartItem {
  nom: string;
  description: string;
  prix: number;
  quantite: number;
  mode: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { nom, prenom, email, telephone, adresse, ville, quartier, items, total, reference } = body;

    if (!email && !telephone) {
      return NextResponse.json({ error: "Email ou téléphone manquant" }, { status: 400 });
    }

    // Tant que le domaine nutrelis.bio n'est pas vérifié dans Resend,
    // on envoie uniquement à l'adresse du compte Resend (atezg25@gmail.com).
    // Une fois le domaine vérifié, remplacer par : email || `${telephone}@nutrelis.bio`
    const destinataire = process.env.STORE_EMAIL || "atezg25@gmail.com";

    const lignesItems = (items as CartItem[] || []).map((item) => `
      <tr>
        <td style="padding: 12px 16px; border-bottom: 1px solid #f0f0f0;">
          <div style="font-weight: 700; color: #1a0505; font-size: 14px;">${escapeHtml(item.nom)}</div>
          <div style="color: #888; font-size: 12px; margin-top: 2px;">${escapeHtml(item.description)}</div>
          ${item.mode === "abonnement" ? '<div style="color: #7D0806; font-size: 11px; font-weight: 700; margin-top: 4px;">⭐ Abonnement mensuel −15%</div>' : ""}
        </td>
        <td style="padding: 12px 16px; border-bottom: 1px solid #f0f0f0; text-align: center; color: #555; font-size: 14px;">
          ${item.quantite}
        </td>
        <td style="padding: 12px 16px; border-bottom: 1px solid #f0f0f0; text-align: right; font-weight: 800; color: #7D0806; font-size: 14px;">
          ${(item.prix * item.quantite).toLocaleString("fr-FR")} FCFA
        </td>
      </tr>
    `).join("");

    const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Confirmation de commande NUTRELIS</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: Arial, Helvetica, sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">

          <!-- HEADER -->
          <tr>
            <td style="background: linear-gradient(135deg, #7D0806 0%, #a01010 100%); padding: 36px 40px; text-align: center;">
              <div style="display: inline-block; background: rgba(255,255,255,0.15); border-radius: 12px; padding: 10px 20px; margin-bottom: 20px;">
                <span style="color: #fff; font-size: 22px; font-weight: 900; letter-spacing: 3px;">NUTRELIS</span>
              </div>
              <div style="font-size: 48px; margin-bottom: 12px;">🎉</div>
              <h1 style="color: #ffffff; font-size: 26px; font-weight: 900; margin: 0 0 8px 0; line-height: 1.2;">
                Commande confirmée !
              </h1>
              <p style="color: rgba(255,255,255,0.8); font-size: 15px; margin: 0;">
                Merci pour votre confiance, <strong style="color: #fff;">${escapeHtml(prenom)} ${escapeHtml(nom)}</strong>
              </p>
            </td>
          </tr>

          <!-- BODY -->
          <tr>
            <td style="padding: 40px;">

              <!-- Message de bienvenue -->
              <p style="color: #555; font-size: 15px; line-height: 1.7; margin: 0 0 32px 0;">
                Votre paiement a bien été reçu et votre commande est maintenant en cours de préparation.
                Elle sera expédiée via <strong style="color: #1a0505;">ATEZ Express</strong> dans les <strong style="color: #7D0806;">24 heures</strong>.
              </p>

              <!-- Référence -->
              ${reference ? `
              <div style="background: #fdecea; border: 1px solid #f5c6c5; border-radius: 10px; padding: 16px 20px; margin-bottom: 32px; text-align: center;">
                <div style="color: #888; font-size: 12px; margin-bottom: 4px;">RÉFÉRENCE DE COMMANDE</div>
                <div style="color: #7D0806; font-size: 16px; font-weight: 900; letter-spacing: 1px;">${reference}</div>
              </div>
              ` : ""}

              <!-- Récapitulatif commande -->
              <h2 style="color: #1a0505; font-size: 16px; font-weight: 800; margin: 0 0 16px 0; padding-bottom: 12px; border-bottom: 2px solid #f0f0f0;">
                📦 Votre commande
              </h2>

              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
                <thead>
                  <tr style="background: #f8f8f8;">
                    <th style="padding: 10px 16px; text-align: left; font-size: 12px; color: #888; font-weight: 700; letter-spacing: 1px;">PRODUIT</th>
                    <th style="padding: 10px 16px; text-align: center; font-size: 12px; color: #888; font-weight: 700; letter-spacing: 1px;">QTÉ</th>
                    <th style="padding: 10px 16px; text-align: right; font-size: 12px; color: #888; font-weight: 700; letter-spacing: 1px;">PRIX</th>
                  </tr>
                </thead>
                <tbody>
                  ${lignesItems}
                </tbody>
                <tfoot>
                  <tr>
                    <td colspan="2" style="padding: 16px 16px 8px; font-size: 13px; color: #888;">Livraison</td>
                    <td style="padding: 16px 16px 8px; text-align: right; font-size: 13px; color: #1db954; font-weight: 700;">GRATUITE</td>
                  </tr>
                  <tr style="background: #fdecea;">
                    <td colspan="2" style="padding: 14px 16px; font-size: 16px; font-weight: 900; color: #1a0505;">TOTAL</td>
                    <td style="padding: 14px 16px; text-align: right; font-size: 20px; font-weight: 900; color: #7D0806;">${(total || 0).toLocaleString("fr-FR")} FCFA</td>
                  </tr>
                </tfoot>
              </table>

              <!-- Livraison -->
              <h2 style="color: #1a0505; font-size: 16px; font-weight: 800; margin: 32px 0 16px 0; padding-bottom: 12px; border-bottom: 2px solid #f0f0f0;">
                🚚 Informations de livraison
              </h2>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 32px;">
                ${[
                  ["Nom", `${escapeHtml(prenom)} ${escapeHtml(nom)}`],
                  ["Téléphone", escapeHtml(telephone) || "—"],
                  ["Adresse", escapeHtml(adresse) || "—"],
                  ["Quartier", escapeHtml(quartier) || "—"],
                  ["Ville", escapeHtml(ville) || "—"],
                  ["Délai estimé", "4 à 7 jours ouvrés"],
                ].map(([label, val], i) => `
                  <tr style="background: ${i % 2 === 0 ? "#f9f9f9" : "#fff"};">
                    <td style="padding: 10px 16px; font-size: 13px; color: #888; width: 40%;">${label}</td>
                    <td style="padding: 10px 16px; font-size: 13px; color: #1a0505; font-weight: 600;">${val}</td>
                  </tr>
                `).join("")}
              </table>

              <!-- Garantie -->
              <div style="background: linear-gradient(135deg, #f0faf2, #e8f5eb); border: 1px solid #c8e6d0; border-radius: 12px; padding: 20px 24px; margin-bottom: 32px;">
                <div style="font-size: 20px; margin-bottom: 8px;">✅</div>
                <div style="font-weight: 800; color: #1a7a3c; font-size: 15px; margin-bottom: 4px;">Garantie satisfait ou remboursé 90 jours</div>
                <div style="color: #555; font-size: 13px; line-height: 1.6;">
                  Si vous n'êtes pas satisfait des résultats dans les 90 jours, retournez votre commande pour un remboursement intégral — sans question posée.
                </div>
              </div>

              <!-- CTA -->
              <div style="text-align: center; margin-bottom: 32px;">
                <a href="${process.env.NEXT_PUBLIC_URL || "https://nutrelis-v76z.vercel.app"}/produits/astaxanthine-12mg"
                   style="display: inline-block; background: #7D0806; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 10px; font-size: 15px; font-weight: 800; letter-spacing: 0.5px;">
                  Voir nos autres produits →
                </a>
              </div>

            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background: #1a0505; padding: 28px 40px; text-align: center;">
              <div style="color: rgba(255,255,255,0.9); font-size: 18px; font-weight: 900; letter-spacing: 3px; margin-bottom: 8px;">NUTRELIS</div>
              <div style="color: rgba(255,255,255,0.5); font-size: 12px; margin-bottom: 16px;">
                Des compléments d'excellence pour votre santé
              </div>
              <div style="color: rgba(255,255,255,0.4); font-size: 11px; line-height: 1.7;">
                Livraison assurée par ATEZ Express 📦<br />
                Pour toute question : contactez-nous via notre site
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>
    `;

    const { data, error } = await getResend().emails.send({
      from: "NUTRELIS <support@nutrelis.bio>",
      to: [destinataire],
      subject: `✅ Nouvelle commande — ${prenom} ${nom} (${email || telephone})`,
      html,
    });

    if (error) {
      console.error("Erreur Resend:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, id: data?.id });

  } catch (error) {
    console.error("Erreur send-confirmation:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
