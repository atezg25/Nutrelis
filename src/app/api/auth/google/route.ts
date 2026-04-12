import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL!;
const PUB_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY!;

interface GoogleUserInfo {
  sub: string;
  email: string;
  email_verified: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
}

async function getGoogleUserInfo(accessToken: string): Promise<GoogleUserInfo> {
  const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error("Token Google invalide");
  return res.json();
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const accessToken = body.credential || body.access_token;
    if (!accessToken) {
      return NextResponse.json({ error: "Token manquant" }, { status: 400 });
    }

    // 1. Récupérer les infos Google
    const google = await getGoogleUserInfo(accessToken);
    if (!google.email) {
      return NextResponse.json({ error: "Email Google non disponible" }, { status: 400 });
    }

    const email = google.email;
    const password = `nutrelis_google_${google.sub}`;

    // 2. Essayer de connecter (client existant)
    let token: string | null = null;

    try {
      const loginRes = await fetch(`${BACKEND}/auth/customer/emailpass`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (loginRes.ok) {
        const loginData = await loginRes.json();
        token = loginData.token;
      }
    } catch {
      // Login échoué — on va créer le compte
    }

    // 3. Si pas de token, créer le compte
    if (!token) {
      const regRes = await fetch(`${BACKEND}/auth/customer/emailpass/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!regRes.ok) {
        const err = await regRes.json();
        return NextResponse.json({ error: err.message || "Erreur création compte" }, { status: 400 });
      }

      const regData = await regRes.json();
      token = regData.token;

      await fetch(`${BACKEND}/store/customers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          "x-publishable-api-key": PUB_KEY,
        },
        body: JSON.stringify({
          email,
          first_name: google.given_name || google.name || "",
          last_name: google.family_name || "",
        }),
      });
    }

    // 4. Récupérer le profil client
    const customerRes = await fetch(`${BACKEND}/store/customers/me`, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "x-publishable-api-key": PUB_KEY,
      },
    });
    const customerData = await customerRes.json();

    return NextResponse.json({
      token,
      customer: customerData.customer,
    });

  } catch (error: any) {
    console.error("Google auth erreur:", error);
    return NextResponse.json({ error: error.message || "Erreur serveur" }, { status: 500 });
  }
}
