import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

// -------------------------
// LOG START
// -------------------------
console.log('🚀 Script starting...');

// -------------------------
// CONFIG
// -------------------------

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

const USER_ID = process.argv[2]; // from CLI arg

if (!USER_ID) {
  console.error('❌ Please provide a user_id:  node test-subscription.mjs <user_id>');
  process.exit(1);
}

// if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
//   console.error('❌ Missing Supabase env vars (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)');
//   process.exit(1);
// }

if (!STRIPE_SECRET_KEY) {
  console.error('❌ Missing STRIPE_SECRET_KEY env var');
  process.exit(1);
}

// -------------------------
// CLIENTS
// -------------------------
console.log('🛠 Initializing Supabase + Stripe clients...');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const stripe = new Stripe(STRIPE_SECRET_KEY);

/**
 * Main
 */
async function main() {
  console.log(`🔍 Fetching subscription for user_id: ${USER_ID}`);

  // 1) Fetch stripe_subscription_id from Supabase
  const { data, error } = await supabase
    .from('subscriptions')
    .select('stripe_subscription_id')
    .eq('user_id', USER_ID)
    .maybeSingle();

  console.log('🧪 Supabase response:', { data, error });

  if (error) {
    console.error('❌ Supabase error:', error);
    process.exit(1);
  }

  if (!data || !data.stripe_subscription_id) {
    console.error('❌ No Stripe subscription found for this user.');
    process.exit(1);
  }

  const subId = data.stripe_subscription_id;
  console.log(`📦 Found stripe_subscription_id: ${subId}`);

  // 2) Fetch subscription details from Stripe
  try {
    const subscription = await stripe.subscriptions.retrieve(subId);

    console.log('✅ Stripe Subscription Details:');
    console.log(JSON.stringify(subscription, null, 2));
  } catch (err) {
    console.error('❌ Stripe fetch error:', err);
    process.exit(1);
  }
}

main().then(() => {
  console.log('🏁 Done.');
});