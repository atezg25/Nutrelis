import { NextRequest, NextResponse } from "next/server";
import { createRateLimiter, getClientIp } from "@/lib/rate-limit";

const paymentLimiter = createRateLimiter({ maxRequests: 5, windowMs: 60_000 });

export async function POST(req: NextRequest) {
  try {
    const { allowed } = paymentLimiter.check(getClientIp(req.headers));
    if (!allowed) return NextResponse.json({ error: "Trop de tentatives" }, { status: 429 });

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

    // Formater le téléphone avec le préfixe +237 si absent
    let phone = (telephone || "").replace(/\s+/g, "");
    if (phone && !phone.startsWith("+")) {
      phone = phone.startsWith("237") ? `+${phone}` : `+237${phone}`;
    }

    const response = await fetch("https://api.notchpay.co/payments/initialize", {
      method: "POST",
      headers: {
        "Authorization": process.env.NOTCHPAY_PUBLIC_KEY!,
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        email: email || `${phone.replace("+", "")}@nutrelis.bio`,
        phone: phone,
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

    console.log("Notchpay init response:", response.status, JSON.stringify(data).slice(0, 500));

    if (!response.ok) {
      return NextResponse.json({ error: data.message || "Erreur lors de l'initialisation du paiement" }, { status: 400 });
    }

    const authUrl = data.authorization_url || data.transaction?.authorization_url;

    return NextResponse.json({
      ...data,
      authorization_url: authUrl,
    });

  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
