import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL!;
const PUB_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY!;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const reference = searchParams.get("reference");

    if (!reference) {
      return NextResponse.json({ error: "Référence manquante" }, { status: 400 });
    }

    // 1. Vérifier le paiement NotchPay
    const response = await fetch(`https://api.notchpay.co/payments/${reference}`, {
      headers: {
        "Authorization": process.env.NOTCHPAY_PUBLIC_KEY!,
        "Accept": "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: data.message }, { status: 400 });
    }

    // 2. Si paiement complet, créer la commande dans Medusa
    if (data.transaction?.status === "complete") {
      try {
        const metadata = data.transaction?.metadata || {};
        const items = JSON.parse(metadata.items || "[]");

        // Créer un cart Medusa
        const cartRes = await fetch(`${BACKEND}/store/carts`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-publishable-api-key": PUB_KEY,
          },
          body: JSON.stringify({
            currency_code: "xaf",
          }),
        });
        const cartData = await cartRes.json();
        const cartId = cartData.cart?.id;

        if (cartId && items.length > 0) {
          // Ajouter les items au cart
          for (const item of items) {
            await fetch(`${BACKEND}/store/carts/${cartId}/line-items`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "x-publishable-api-key": PUB_KEY,
              },
              body: JSON.stringify({
                variant_id: item.id,
                quantity: item.quantite || 1,
              }),
            });
          }

          // Compléter le cart → créer la commande
          await fetch(`${BACKEND}/store/carts/${cartId}/complete`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-publishable-api-key": PUB_KEY,
            },
          });
        }
      } catch (medusaError) {
        console.error("Erreur création commande Medusa:", medusaError);
        // Ne pas bloquer — le paiement est confirmé même si Medusa échoue
      }
    }

    return NextResponse.json(data);

  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
