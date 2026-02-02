import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export async function POST(req: Request) {
  try {
    const { returnUrl } = (await req.json()) as { returnUrl?: string };

    const priceId = process.env.STRIPE_PRICE_ID;
    if (!priceId) {
      return NextResponse.json(
        { error: "Missing STRIPE_PRICE_ID" },
        { status: 500 }
      );
    }

    const origin =
      process.env.NEXT_PUBLIC_SITE_URL ||
      (req.headers.get("origin") ?? "http://localhost:3000");

    const successUrl = `${origin}/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = returnUrl ? `${origin}${returnUrl}` : `${origin}/`;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: priceId, quantity: 1 }],
      allow_promotion_codes: true,
      success_url: successUrl,
      cancel_url: cancelUrl,
      currency: process.env.STRIPE_CURRENCY || "eur"
    });

    return NextResponse.json({ url: session.url });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
