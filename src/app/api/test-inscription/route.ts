import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  
  const regRes = await fetch(`${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/auth/customer/emailpass/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: body.email, password: body.password }),
  });
  const regData = await regRes.json();
  
  if (!regRes.ok) return NextResponse.json({ etape: "register", erreur: regData }, { status: 400 });

  const cusRes = await fetch(`${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/store/customers`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${regData.token}`,
      "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY!,
    },
    body: JSON.stringify({ email: body.email, first_name: body.first_name, last_name: body.last_name }),
  });
  const cusData = await cusRes.json();

  if (!cusRes.ok) return NextResponse.json({ etape: "create_customer", erreur: cusData }, { status: 400 });

  return NextResponse.json({ succes: true, customer: cusData.customer });
}
