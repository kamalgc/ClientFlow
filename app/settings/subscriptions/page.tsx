"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { 
  Calendar, 
  CreditCard, 
  Info, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  ExternalLink 
} from "lucide-react";
import Loader from "@/components/loader";

type SubscriptionRow = {
  id: string;
  user_id: string;
  stripe_customer_id: string;
  stripe_subscription_id: string;
  stripe_price_id: string | null;
  plan_id: "starter" | "premium" | null;
  billing_period: "monthly" | "yearly" | null;
  status: string;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean | null;
  card_brand: string | null;
  card_last4: string | null;
  card_exp_month: number | null;
  card_exp_year: number | null;
  created_at: string | null;
};

export default function SubscriptionSettings() {
  const supabase = createClient();

  const [subscription, setSubscription] = useState<SubscriptionRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingPortal, setLoadingPortal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasSubscription = !!subscription && subscription.status !== "canceled";

  // Format dates nicely
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Days until renewal
  const getDaysUntilRenewal = () => {
    if (!subscription?.current_period_end) return null;
    const now = new Date();
    const end = new Date(subscription.current_period_end );
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  // Get plan price
  const getPlanPrice = () => {
    if (!subscription) return null;
    const prices: Record<string, Record<string, number>> = {
      starter: { monthly: 49, yearly: 39 },
      premium: { monthly: 99, yearly: 79 },
    };
    const planId = subscription.plan_id || "starter";
    const period = subscription.billing_period || "monthly";
    return prices[planId]?.[period] || 0;
  };

  // Status badge
  const getStatusBadge = () => {
    if (!subscription) return null;

    const status = subscription.status;
    const configs: Record<string, { bg: string; text: string; icon: any }> = {
      active: {
        bg: "bg-green-50",
        text: "text-green-700",
        icon: CheckCircle2,
      },
      trialing: {
        bg: "bg-blue-50",
        text: "text-blue-700",
        icon: Info,
      },
      past_due: {
        bg: "bg-orange-50",
        text: "text-orange-700",
        icon: AlertCircle,
      },
      canceled: {
        bg: "bg-red-50",
        text: "text-red-700",
        icon: XCircle,
      },
      incomplete: {
        bg: "bg-yellow-50",
        text: "text-yellow-700",
        icon: AlertCircle,
      },
    };

    const config = configs[status] || configs.active;
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}
      >
        <Icon className="h-4 w-4" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  useEffect(() => {
    const loadSubscription = async () => {
      setLoading(true);
      setError(null);

      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          console.error("Error fetching user:", userError);
          setError("Failed to load user");
          return;
        }

        if (!user) {
          setError("You must be logged in to view subscription settings.");
          return;
        }

        const { data, error: subError } = await supabase
          .from("subscriptions")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        if (subError) {
          console.error("Error fetching subscription:", subError);
          setError("Failed to load subscription.");
          return;
        }

        setSubscription(data as SubscriptionRow | null);
      } catch (err) {
        console.error("Unexpected error loading subscription:", err);
        setError("Something went wrong while loading subscription.");
      } finally {
        setLoading(false);
      }
    };

    loadSubscription();
  }, [supabase]);

  const handleManageSubscription = async () => {
    setLoadingPortal(true);
    try {
      // TODO: Wire to Stripe Customer Portal
      // const res = await fetch("/api/stripe/create-portal-session", { method: "POST" });
      // const { url } = await res.json();
      // window.location.href = url;

      toast.info("Stripe Customer Portal coming soon!");
    } catch (err) {
      console.error("Error opening portal:", err);
      toast.error("Failed to open billing portal.");
    } finally {
      setLoadingPortal(false);
    }
  };

  if (loading) {
    return (
      // <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      //   <div className="text-center">
      //     <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
      //     <p className="text-sm text-gray-600">Loading subscription...</p>
      //   </div>
      // </div>
      <Loader text="Loading subscription..."/>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  const daysUntilRenewal = getDaysUntilRenewal();
  const planPrice = getPlanPrice();

  return (
    // <div className="min-h-screen bg-gray-50">
            <div className="px-8 py-8">
        <div className="max-w-3xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Subscription</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage your plan, billing details, and payment methods
          </p>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Plan Overview */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current Plan Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-6 py-8 text-white">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-300 mb-2">
                      Current Plan
                    </p>
                    <h2 className="text-3xl font-bold">
                      {hasSubscription
                        ? `${subscription?.plan_id === "premium" ? "Premium" : "Starter"} Plan`
                        : "Free Plan"}
                    </h2>
                    {hasSubscription && (
                      <p className="mt-2 text-gray-300">
                        {subscription?.billing_period === "yearly"
                          ? "Billed annually"
                          : "Billed monthly"}{" "}
                        · ${planPrice}/{subscription?.billing_period === "yearly" ? "year" : "month"}
                      </p>
                    )}
                  </div>
                  {hasSubscription && getStatusBadge()}
                </div>
              </div>

              <div className="px-6 py-6">
                {hasSubscription ? (
                  <div className="space-y-6">
                    {/* Billing Cycle Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                          <Calendar className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">
                            Current period started
                          </p>
                          <p className="mt-1 text-base font-semibold text-gray-900">
                            {formatDate(subscription?.current_period_start)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                          <Calendar className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">
                            {subscription?.cancel_at_period_end
                              ? "Subscription ends on"
                              : "Next renewal date"}
                          </p>
                          <p className="mt-1 text-base font-semibold text-gray-900">
                            {formatDate(subscription?.current_period_end)}
                          </p>
                          {daysUntilRenewal !== null && daysUntilRenewal > 0 && (
                            <p className="mt-0.5 text-xs text-gray-500">
                              {daysUntilRenewal} days remaining
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Cancellation Notice */}
                    {subscription?.cancel_at_period_end && (
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-orange-900">
                            Subscription scheduled for cancellation
                          </p>
                          <p className="mt-1 text-sm text-orange-700">
                            Your subscription will end on{" "}
                            {formatDate(subscription?.current_period_end)}. You'll
                            continue to have access until then.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Member Since */}
                    <div className="border-t border-gray-200 pt-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Member since</span>
                        <span className="font-medium text-gray-900">
                          {formatDate(subscription?.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Info className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No active subscription
                    </h3>
                    <p className="text-sm text-gray-600 mb-6">
                      Upgrade to unlock premium features and grow your business
                    </p>
                    <Button
                      onClick={() => (window.location.href = "/auth/plans")}
                      className="bg-gray-900 hover:bg-gray-800 text-white"
                    >
                      View Plans
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Payment Method Card */}
            {hasSubscription && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <CreditCard className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Payment Method
                      </h3>
                      <p className="text-sm text-gray-500">
                        Your default payment method
                      </p>
                    </div>
                  </div>
                </div>

                {subscription?.card_last4 ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-8 bg-gradient-to-br from-gray-700 to-gray-900 rounded flex items-center justify-center text-white text-xs font-bold">
                          {subscription?.card_brand?.toUpperCase() || "CARD"}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            •••• •••• •••• {subscription?.card_last4}
                          </p>
                          <p className="text-xs text-gray-500">
                            Expires{" "}
                            {subscription?.card_exp_month
                              ?.toString()
                              .padStart(2, "0")}
                            /{subscription?.card_exp_year}
                          </p>
                        </div>
                      </div>
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    </div>

                    <p className="text-xs text-gray-500">
                      To update your payment method, use the billing portal below
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-600">No payment method on file</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column - Actions */}
          <div className="space-y-6">
            {/* Quick Actions Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Quick Actions
              </h3>
              <div className="space-y-3">
                {hasSubscription ? (
                  <>
                    <Button
                      onClick={handleManageSubscription}
                      disabled={loadingPortal}
                      className="w-full bg-gray-900 hover:bg-gray-800 text-white justify-between"
                    >
                      <span>Manage Billing</span>
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={() => (window.location.href = "/auth/plans")}
                      variant="outline"
                      className="w-full justify-between"
                    >
                      <span>Change Plan</span>
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={() => (window.location.href = "/auth/plans")}
                    className="w-full bg-gray-900 hover:bg-gray-800 text-white"
                  >
                    View Plans
                  </Button>
                )}
              </div>
            </div>

            {/* Subscription ID Card (for debugging/support) */}
            {hasSubscription && (
              <div className="bg-gray-50 rounded-xl border border-gray-200 p-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  Subscription Details
                </h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Plan ID</span>
                    <span className="text-gray-900 font-mono">
                      {subscription?.plan_id}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Status</span>
                    <span className="text-gray-900">
                      {subscription?.status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Subscription ID</span>
                    <span className="text-gray-900 font-mono truncate max-w-[150px]">
                      {subscription?.stripe_subscription_id.slice(0, 12)}...
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}