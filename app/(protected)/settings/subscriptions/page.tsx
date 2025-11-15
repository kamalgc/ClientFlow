"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import SettingsSidebar from "@/components/SettingsSidebar";
import SettingsHeader from "@/components/settings-header";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";

// ------- Skeletons -------
const SkeletonBanner = () => (
  <div className="bg-gray-200 animate-pulse p-6 rounded-lg mb-6">
    <div className="flex justify-between items-center">
      <div className="space-y-2">
        <div className="h-5 bg-gray-300 rounded w-48" />
        <div className="h-4 bg-gray-300 rounded w-96" />
      </div>
      <div className="h-10 bg-gray-300 rounded w-36" />
    </div>
  </div>
);

const SkeletonSection = () => (
  <div className="space-y-6 animate-pulse">
    <div className="space-y-2">
      <div className="h-6 bg-gray-200 rounded w-32" />
      <div className="h-4 bg-gray-200 rounded w-64" />
    </div>
    <div className="grid grid-cols-2 gap-6">
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-24" />
        <div className="h-10 bg-gray-200 rounded" />
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-16" />
        <div className="h-10 bg-gray-200 rounded" />
      </div>
    </div>
  </div>
);

// ------- Types -------
export type SubscriptionData = {
  product_name?: string;
  amount?: number;
  currency?: string;
  status?: string;
  trial_end?: string;
  current_period_end?: string;
};

export type PaymentMethod = {
  id: string;
  brand: "visa" | "mastercard" | "amex" | "discover" | string;
  last4: string;
  exp_month: number;
  exp_year: number;
  funding?: "credit" | "debit" | "prepaid" | string;
  default: boolean;
};

// ------- Helpers -------
const formatAmount = (amount?: number, currency?: string) => {
  if (!amount || !currency) return "$0.00";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount / 100);
};

const getTrialDaysLeft = (trialEnd?: string) => {
  if (!trialEnd) return 0;
  const now = new Date();
  const end = new Date(trialEnd);
  const diffTime = end.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
};

const BrandPill = ({ brand }: { brand: string }) => {
  const label = useMemo(() => {
    switch (brand?.toLowerCase()) {
      case "visa":
        return "V";
      case "mastercard":
        return "MC";
      case "amex":
        return "AX";
      case "discover":
        return "DS";
      default:
        return brand?.slice(0, 2)?.toUpperCase() || "PM";
    }
  }, [brand]);

  return (
    <span className="inline-flex h-6 w-6 items-center justify-center rounded bg-blue-600 text-white text-xs font-bold">
      {label}
    </span>
  );
};

// ------- Page -------
export default function SubscriptionSettings() {
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch subscription + payment methods
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [subRes, pmRes] = await Promise.all([
          fetch("/api/users/subscriptions", { credentials: "include" }),
          fetch("/api/users/payment-methods", { credentials: "include" }),
        ]);

        const sub = await subRes.json();
        const pm = await pmRes.json();

        if (!sub?.error) setSubscriptionData(sub);
        if (!pm?.error) setPaymentMethods(pm?.data || pm || []);
      } catch (e) {
        toast.error("Failed to load settings");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleUpdateRedirect = () => {
    window.location.href = "/auth/register/subscriptions";
  };

  const removePaymentMethod = async (id: string) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/users/payment-methods/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setPaymentMethods((p) => (p || []).filter((m) => m.id !== id));
        toast.success("Card removed");
      } else {
        const err = await res.json();
        toast.error(err?.error || "Failed to remove card");
      }
    } catch (e) {
      toast.error("Error removing card");
    } finally {
      setSaving(false);
    }
  };

  const makeDefault = async (id: string) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/users/payment-methods/${id}/default`, {
        method: "POST",
      });
      if (res.ok) {
        setPaymentMethods((list) =>
          (list || []).map((m) => ({ ...m, default: m.id === id }))
        );
        toast.success("Default payment method updated");
      } else {
        const err = await res.json();
        toast.error(err?.error || "Failed to update default");
      }
    } catch (e) {
      toast.error("Error updating default");
    } finally {
      setSaving(false);
    }
  };

  const canAddMore = (paymentMethods?.length || 0) < 3;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* <SettingsHeader /> */}
      <div className="flex">
        {/* <SettingsSidebar active="Subscription" /> */}

        <main className="flex-1 p-8">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-gray-900 mb-1">Subscription</h1>
            <p className="text-gray-600">Manage your subscription and billing information.</p>
          </div>

          {/* Banner */}
          {loading ? (
            <SkeletonBanner />
          ) : (
            <div className="bg-[#445CF4] text-white p-6 rounded-lg mb-6">
              <div className="flex justify-between items-center">
                <div>
                  {subscriptionData?.trial_end && getTrialDaysLeft(subscriptionData.trial_end) > 0 ? (
                    <>
                      <p className="font-medium text-lg mb-1">You're using the free trial</p>
                      <p className="text-blue-100">
                        Your free trial ends in {getTrialDaysLeft(subscriptionData.trial_end)} days. You'll be billed automatically unless you cancel or update your plan.
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="font-medium text-lg mb-1">Active Subscription</p>
                      <p className="text-blue-100">Your plan is active and will renew automatically.</p>
                    </>
                  )}
                </div>
                <Button className="bg-white text-[#445CF4] hover:bg-gray-100 font-medium px-6" onClick={handleUpdateRedirect}>
                  Cancel or update plan
                </Button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Subscription Details */}
            <div className="border border-gray-200 shadow-sm p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-gray-900 mb-1">Subscription details</h2>
              <p className="text-gray-600 text-sm mb-6">View and update your subscription details here.</p>
              {loading ? (
                <SkeletonSection />
              ) : (
                <div className="space-y-6">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Subscription plan</Label>
                    <Input value={subscriptionData?.product_name || "Free Plan"} readOnly className="bg-gray-50 border-gray-200" />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Price</Label>
                    <Input value={formatAmount(subscriptionData?.amount, subscriptionData?.currency)} readOnly className="bg-gray-50 border-gray-200" />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Renewal date</Label>
                    <Input value={subscriptionData?.current_period_end ? new Date(subscriptionData.current_period_end).toLocaleDateString() : "N/A"} readOnly className="bg-gray-50 border-gray-200" />
                  </div>
                  <div className="flex justify-end">
                    <Button onClick={handleUpdateRedirect} className="bg-[#445CF4] text-white hover:bg-[#364BBF] px-6 font-medium">
                      Update subscription
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Payment Method (screenshot-like) */}
            <div className="border border-gray-200 shadow-sm p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-gray-900 mb-1">Payment Method</h2>
              <p className="text-gray-600 text-sm mb-6">Payments for domains, add-ons, and other usage are made using the default card.</p>

              {loading ? (
                <SkeletonSection />
              ) : (
                <>
                  <div className="rounded-lg border border-gray-200">
                    {(paymentMethods || []).map((m) => (
                      <div key={m.id} className="flex items-center justify-between px-4 py-4">
                        <div className="flex items-center gap-3">
                          <BrandPill brand={m.brand} />
                          <div className="flex items-center gap-3">
                            <span className="text-gray-900 font-medium capitalize">
                              {m.brand} {m.funding || ""}
                            </span>
                            <span className="text-gray-500">•••• {m.last4}</span>
                            {m.default && <Badge className="bg-blue-600 hover:bg-blue-600">Default</Badge>}
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <span className="text-gray-500">Valid until {m.exp_month}/{m.exp_year}</span>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="hover:bg-gray-100">
                                <MoreHorizontal className="h-5 w-5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-44">
                              {!m.default && (
                                <DropdownMenuItem onClick={() => makeDefault(m.id)} disabled={saving}>
                                  Make default
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem className="text-red-600" onClick={() => removePaymentMethod(m.id)} disabled={saving}>
                                Remove
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    ))}

                    {/* Empty state */}
                    {(!paymentMethods || paymentMethods.length === 0) && (
                      <div className="px-4 py-6 text-sm text-gray-500">No cards yet.</div>
                    )}
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <p className="text-gray-600 text-sm">At most, three credit cards can be added.</p>
                    <Button
                      className="bg-gray-900 text-white hover:bg-gray-800"
                      disabled={!canAddMore}
                      onClick={() => (window.location.href = "/billing/add-card")}
                    >
                      Add Card
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div> 
        </main>
      </div>
    </div>
  );
}
