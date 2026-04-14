import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, telephone, nom, prenom, montant, description, items, adresse, ville, quartier } = body;

    // Validation des entrées
    if (!telephone && !email) {
      return NextResponse.json({ error: "Téléphone ou email requis" }, { status: 400 });
    }
    if (!Number.isFinite(montant) || montant <= 0 || montant > 10_000_000) {
      return NextResponse.json({ error: "Montant invalide" }, { status: 400 });
    }
    if (!nom || typeof nom !== "string" || nom.length > 100) {
      return NextResponse.json({ error: "Nom invalide" }, { status: 400 });
    }
    if (!prenom || typeof prenom !== "string" || prenom.length > 100) {
      return NextResponse.json({ error: "Prénom invalide" }, { status: 400 });
    }
    if (!Array.isArray(items) || items.length === 0 || items.length > 50) {
      return NextResponse.json({ error: "Articles invalides" }, { status: 400 });
    }

    const response = await fetch("https://api.notchpay.co/payments/initialize", {
      method: "POST",
      headers: {
        "Authorization": process.env.NOTCHPAY_PUBLIC_KEY!,
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        email: email || `${telephone}@nutrelis.bio`,
        phone: telephone,
        name: `${prenom} ${nom}`,
        amount: montant,
        currency: "XAF",
        description: description,
        callback: `${process.env.NEXT_PUBLIC_URL || "https://nutrelis.bio"}/checkout/success`,
        metadata: {
          items: JSON.stringify(items || []),
          adresse, ville, quartier,
          nom, prenom, telephone, email,
          medusaCartId: body.medusaCartId || null,
        }
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Notchpay init erreur:", data.message);
      return NextResponse.json({ error: "Erreur lors de l'initialisation du paiement" }, { status: 400 });
    }

    return NextResponse.json(data);

  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
