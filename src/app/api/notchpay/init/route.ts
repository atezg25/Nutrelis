import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, telephone, nom, prenom, montant, description, items, adresse, ville, quartier } = body;

    const response = await fetch("https://api.notchpay.co/payments/initialize", {
      method: "POST",
      headers: {
        "Authorization": process.env.NOTCHPAY_PUBLIC_KEY!,
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        email: email || `${telephone}@nutrelis.com`,
        phone: telephone,
        name: `${prenom} ${nom}`,
        amount: montant,
        currency: "XAF",
        description: description,
        callback: `${process.env.NEXT_PUBLIC_URL}/checkout/success`,
        metadata: {
          items: JSON.stringify(items || []),
          adresse, ville, quartier,
          nom, prenom, telephone, email,
        }
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: data.message || "Erreur Notchpay" }, { status: 400 });
    }

    return NextResponse.json(data);

  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
