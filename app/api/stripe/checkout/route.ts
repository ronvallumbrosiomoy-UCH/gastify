import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import clientPromise from "@/lib/mongodb";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }
    const { plan } = await req.json();
    const isAnnual = plan === "annual";
    const priceId = isAnnual
      ? process.env.STRIPE_PRICE_ANNUAL!
      : process.env.STRIPE_PRICE_MONTHLY!;

    const client = await clientPromise;
    const db = client.db("gastify");
    const user = await db.collection("users").findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    const checkout = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: session.user.email,
      success_url: `${process.env.NEXTAUTH_URL}/dashboard?premium=success`,
      cancel_url: `${process.env.NEXTAUTH_URL}/pricing?premium=cancelled`,
      metadata: { userId: user._id.toString() },
    });

    return NextResponse.json({ url: checkout.url });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}