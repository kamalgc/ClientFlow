// app/api/stripe/webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  // you can omit apiVersion to use the account's default,
  // or pin to a specific version, e.g. "2024-06-20"
  apiVersion: "2025-11-17.clover",
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // 1) Checkout completed
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    const subscriptionId = session.subscription as string | null;
    if (!subscriptionId) {
      console.warn("checkout.session.completed without subscription id");
      return NextResponse.json({ received: true });
    }

    // NOTE: cast to Stripe.Subscription so TS knows all fields exist
    const subscription = (await stripe.subscriptions.retrieve(
      subscriptionId,
      { expand: ["default_payment_method"] }
    )) as any;

    const paymentMethod =
      subscription.default_payment_method as Stripe.PaymentMethod | null;
    const card = paymentMethod?.card;

    const planId = session.metadata?.plan_id ?? null;
    const userId = session.metadata?.user_id || session.client_reference_id;

    const firstItem = subscription.items.data[0];
    const price = firstItem?.price;

    const { error } = await supabase.from("subscriptions").upsert({
      user_id: userId,
      stripe_customer_id: subscription.customer as string,
      stripe_subscription_id: subscription.id,
      stripe_price_id: price?.id ?? null,
      plan_id: planId,
      billing_period: price?.recurring?.interval ?? null,
      status: subscription.status,
      current_period_start: new Date(
        subscription.current_period_start * 1000
      ).toISOString(),
      current_period_end: new Date(
        subscription.current_period_end * 1000
      ).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
      card_brand: card?.brand ?? null,
      card_last4: card?.last4 ?? null,
      card_exp_month: card?.exp_month ?? null,
      card_exp_year: card?.exp_year ?? null,
    });

    if (error) {
      console.error("Error storing subscription:", error);
    }
  }

  // 2) Subscription updated
  if (event.type === "customer.subscription.updated") {
    const subscription = event.data.object as any;

    const { error } = await supabase
      .from("subscriptions")
      .update({
        status: subscription.status,
        current_period_start: new Date(
          subscription.current_period_start * 1000
        ).toISOString(),
        current_period_end: new Date(
          subscription.current_period_end * 1000
        ).toISOString(),
        cancel_at_period_end: subscription.cancel_at_period_end,
      })
      .eq("stripe_subscription_id", subscription.id);

    if (error) {
      console.error("Error updating subscription:", error);
    }
  }

  // 3) Subscription deleted
  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as Stripe.Subscription;

    const { error } = await supabase
      .from("subscriptions")
      .update({ status: "canceled" })
      .eq("stripe_subscription_id", subscription.id);

    if (error) {
      console.error("Error marking subscription canceled:", error);
    }
  }

  return NextResponse.json({ received: true });
}