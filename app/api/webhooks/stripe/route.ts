// app/api/webhooks/stripe/route.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// IMPORTANT: use SERVICE ROLE key here (NOT anon)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// OPTIONAL: if you don't want to set metadata on Payment Links,
// map price IDs to your logical plans here.
const PRICE_TO_PLAN: Record<
  string,
  { plan_id: "starter" | "premium"; billing_period: "monthly" | "yearly" }
> = {
  // fill these using Stripe Dashboard -> Products -> Prices
  // "price_123": { plan_id: "starter", billing_period: "monthly" },
  // "price_456": { plan_id: "starter", billing_period: "yearly" },
  // "price_789": { plan_id: "premium", billing_period: "monthly" },
  // "price_abc": { plan_id: "premium", billing_period: "yearly" },
};

export async function POST(req: NextRequest) {
  console.log("🔔 Stripe webhook hit");

  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    console.error("❌ No stripe-signature header");
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    console.log("✅ Webhook verified:", event.type);
  } catch (err: any) {
    console.error("❌ Invalid webhook signature:", err.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    // 1) New / successful subscription from Payment Link
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      console.log("ℹ️ checkout.session.completed payload:", {
        id: session.id,
        mode: session.mode,
        client_reference_id: session.client_reference_id,
        metadata: session.metadata,
        subscription: session.subscription,
      });

      if (session.mode !== "subscription") {
        console.log("⚠️ Not a subscription checkout, ignoring");
        return NextResponse.json({ received: true });
      }

      const subscriptionId = session.subscription as string | null;
      if (!subscriptionId) {
        console.error("❌ No subscription ID on session");
        return NextResponse.json({ received: true });
      }

      // Fetch full subscription to get price, period dates, etc.
      const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
        expand: ["default_payment_method"],
      });

      const paymentMethod = subscription.default_payment_method as
        | Stripe.PaymentMethod
        | null;
      const card = paymentMethod?.card ?? null;

      const firstItem = subscription.items.data[0];
      const price = firstItem?.price ?? null;
      const priceId = price?.id ?? null;

      // userId comes from your query param -> client_reference_id
      const userId =
        session.client_reference_id || session.metadata?.user_id || null;

      if (!userId) {
        console.error("❌ No userId (client_reference_id) on session");
        return NextResponse.json({ received: true });
      }

      // plan/billingPeriod from either:
      //  - Payment Link metadata (if you set it there)
      //  - OR our local PRICE_TO_PLAN mapping
      let planId = session.metadata?.plan_id as "starter" | "premium" | null;
      let billingPeriod = session.metadata
        ?.billing_period as "monthly" | "yearly" | null;

      if (!planId || !billingPeriod) {
        if (priceId && PRICE_TO_PLAN[priceId]) {
          planId = PRICE_TO_PLAN[priceId].plan_id;
          billingPeriod = PRICE_TO_PLAN[priceId].billing_period;
        }
      }

      console.log("👤 User & plan:", {
        userId,
        planId,
        billingPeriod,
        priceId,
      });

      const subscriptionData = {
        user_id: userId,
        stripe_customer_id: String(subscription.customer),
        stripe_subscription_id: subscription.id,
        stripe_price_id: priceId,
        plan_id: planId,
        billing_period: billingPeriod,
        status: subscription.status,
        current_period_start: new Date(
          subscription.items.data[0].current_period_start*1000
        ).toISOString(),
        current_period_end: new Date(
          subscription.items.data[0].current_period_end*1000
        ).toISOString(),
        cancel_at_period_end: subscription.cancel_at_period_end ?? false,
        card_brand: card?.brand ?? null,
        card_last4: card?.last4 ?? null,
        card_exp_month: card?.exp_month ?? null,
        card_exp_year: card?.exp_year ?? null,
      };

      console.log("💾 Upserting subscription:", subscriptionData);

      const { data, error } = await supabase
        .from("subscriptions")
        .upsert(subscriptionData, { onConflict: "user_id" })
        .select();

      if (error) {
        console.error("❌ Supabase upsert error:", error);
        return NextResponse.json(
          { error: "Supabase insert failed", details: error.message },
          { status: 500 }
        );
      }

      console.log("✅ Subscription stored:", data);
    }

    // 2) Subscription updated (renewal, cancel_at_period_end, etc.)
    if (event.type === "customer.subscription.updated") {
      const subscription = event.data.object as any;

console.log("🔄 customer.subscription.updated:", {
  id: subscription.id,
  status: subscription.status,
});

const { data, error } = await supabase
  .from("subscriptions")
  .update({
    status: subscription.status,
    current_period_start: new Date(
      subscription.items.data[0].current_period_start*1000
    ).toISOString(),
    current_period_end: 
      subscription.items.data[0].current_period_end*1000
    ,
    cancel_at_period_end: subscription.cancel_at_period_end ?? false,
  })
  .eq("stripe_subscription_id", subscription.id)
  .select();

      if (error) {
        console.error("❌ Supabase update error:", error);
      } else {
        console.log("✅ Subscription updated in DB:", data);
      }
    }

    // 3) Subscription canceled
    if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object as Stripe.Subscription;

      console.log("🗑️ customer.subscription.deleted:", subscription.id);

      const { data, error } = await supabase
        .from("subscriptions")
        .update({ status: "canceled" })
        .eq("stripe_subscription_id", subscription.id)
        .select();

      if (error) {
        console.error("❌ Supabase cancel update error:", error);
      } else {
        console.log("✅ Subscription marked canceled:", data);
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("❌ Webhook handler crashed:", err);
    return NextResponse.json(
      { error: "Webhook handler error", message: err.message },
      { status: 500 }
    );
  }
}