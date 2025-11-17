"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { X } from "lucide-react";

export default function SubscriptionSettings() {
  const [nameOnCard, setNameOnCard] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cardNumber1, setCardNumber1] = useState("");
  const [cvv1, setCvv1] = useState("");
  const [cardNumber2, setCardNumber2] = useState("");
  const [cvv2, setCvv2] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast.success("Card details saved successfully!");
    } catch (error) {
      toast.error("Failed to save card details");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateSubscription = async () => {
    toast.info("Redirecting to subscription management...");
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="flex">

        {/* Main Content */}
        <main className="flex-1">

          {/* Content */}
          <div className="">
            <div className="max-w-4xl">
              <div className="mb-8">
                <h1 className="text-2xl font-semibold text-gray-900">Subscription</h1>
                <p className="text-sm text-gray-600">
                  Update your plan, view billing details, and stay in control of your subscription anytime.
                </p>
              </div>

              {/* Free Plan Banner */}
              <div className="bg-black text-white rounded-lg p-6 mb-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-lg mb-1">You're using free plan</h3>
                    <p className="text-sm text-gray-300">
                      You can add components to your app by upgrading to the next plan.
                    </p>
                  </div>
                  <Button className="bg-white text-black hover:bg-gray-100">
                    View plans →
                  </Button>
                </div>
              </div>

              {/* Card Details */}
              <div className="border border-gray-200 rounded-lg p-6 mb-8">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Card details</h3>
                  <p className="text-sm text-gray-600">
                    View and update your card details here.
                  </p>
                </div>

                <div className="space-y-6">
                  {/* Name on Card and Expiry */}
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="nameOnCard" className="text-sm font-medium text-gray-900">
                        Name on card
                      </Label>
                      <Input
                        id="nameOnCard"
                        value={nameOnCard}
                        onChange={(e) => setNameOnCard(e.target.value)}
                        placeholder="Kathy Pacheco"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="expiry" className="text-sm font-medium text-gray-900">
                        Expiry
                      </Label>
                      <Input
                        id="expiry"
                        value={expiry}
                        onChange={(e) => setExpiry(e.target.value)}
                        placeholder="05/2025"
                      />
                    </div>
                  </div>

                  {/* Card Number 1 and CVV 1 */}
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="cardNumber1" className="text-sm font-medium text-gray-900">
                        Card number
                      </Label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2">
                          <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 2h12v8H4V6z" />
                          </svg>
                        </div>
                        <Input
                          id="cardNumber1"
                          value={cardNumber1}
                          onChange={(e) => setCardNumber1(e.target.value)}
                          placeholder="1414 1412 4141 1422"
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cvv1" className="text-sm font-medium text-gray-900">
                        CVV
                      </Label>
                      <Input
                        id="cvv1"
                        type="password"
                        value={cvv1}
                        onChange={(e) => setCvv1(e.target.value)}
                        placeholder="•••"
                        maxLength={3}
                      />
                    </div>
                  </div>

                  {/* Card Number 2 and CVV 2 */}
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="cardNumber2" className="text-sm font-medium text-gray-900">
                        Card number
                      </Label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2">
                          <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 2h12v8H4V6z" />
                          </svg>
                        </div>
                        <Input
                          id="cardNumber2"
                          value={cardNumber2}
                          onChange={(e) => setCardNumber2(e.target.value)}
                          placeholder="1414 1412 4141 1422"
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cvv2" className="text-sm font-medium text-gray-900">
                        CVV
                      </Label>
                      <Input
                        id="cvv2"
                        type="password"
                        value={cvv2}
                        onChange={(e) => setCvv2(e.target.value)}
                        placeholder="•••"
                        maxLength={3}
                      />
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="flex justify-end pt-2">
                    <Button
                      onClick={handleSave}
                      disabled={saving}
                      className="bg-black hover:bg-gray-800 text-white px-8"
                    >
                      {saving ? "Saving..." : "Save"}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Update Subscription Button */}
              <div>
                <Button
                  onClick={handleUpdateSubscription}
                  className="bg-black hover:bg-gray-800 text-white px-6"
                >
                  Update subscription
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}