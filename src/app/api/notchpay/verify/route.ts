import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const reference = searchParams.get("reference");

    if (!reference) {
      return NextResponse.json({ error: "Référence manquante" }, { status: 400 });
    }

    const response = await fetch(`https://api.notchpay.co/payments/${reference}`, {
      headers: {
        "Authorization": process.env.NOTCHPAY_SECRET_KEY!,
        "Accept": "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: data.message }, { status: 400 });
    }

    return NextResponse.json(data);

  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}