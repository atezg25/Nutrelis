import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const reference = searchParams.get("reference");

    if (!reference || typeof reference !== "string" || reference.length > 100) {
      return NextResponse.json({ error: "Référence invalide" }, { status: 400 });
    }

    // Vérifier le statut du paiement via Notchpay
    const response = await fetch(`https://api.notchpay.co/payments/${encodeURIComponent(reference)}`, {
      headers: {
        "Authorization": process.env.NOTCHPAY_PUBLIC_KEY!,
        "Accept": "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Notchpay verify erreur pour ref:", reference);
      return NextResponse.json({ error: "Vérification du paiement échouée" }, { status: 400 });
    }

    // Retourner uniquement le statut (pas de création de commande — le webhook s'en charge)
    const status = data.transaction?.status;
    return NextResponse.json({
      status,
      reference: data.transaction?.reference,
      amount: data.transaction?.amount,
      currency: data.transaction?.currency,
    });

  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
