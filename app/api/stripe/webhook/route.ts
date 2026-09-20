import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature")!;

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("gastify");

    switch (event.type) {
      case "checkout.session.completed": {
        const checkout = event.data.object as Stripe.Checkout.Session;
        const userId = checkout.metadata?.userId;
        if (userId) {
          await db.collection("users").updateOne(
            { _id: new (await import("mongodb")).ObjectId(userId) },
            {
              $set: {
                role: "premium",
                stripeCustomerId: checkout.customer as string,
                stripeSubscriptionId: checkout.subscription as string,
                premiumSince: new Date(),
              },
            }
          );
        }
        break;
      }
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await db.collection("users").updateOne(
          { stripeSubscriptionId: subscription.id },
          { $set: { role: "user", premiumSince: null } }
        );
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}