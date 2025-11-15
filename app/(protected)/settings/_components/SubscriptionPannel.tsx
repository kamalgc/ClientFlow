"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SubscriptionSettings() {
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleUpdatePayment = async () => {
    setLoading(true);
    try {
      toast.success("Payment details updated!");
    } catch (error) {
      toast.error("Failed to update payment details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Free Trial Banner */}
      <div className="bg-blue-600 text-white rounded-xl px-6 py-5 flex items-center justify-between">
        <div>
          <p className="text-lg font-semibold">Your free trial is active</p>
          <p className="text-sm opacity-90">You have 7 days left to enjoy all premium features</p>
        </div>
        <Button variant="secondary" className="text-blue-600 bg-white hover:bg-gray-100">
          Upgrade Plan
        </Button>
      </div>

      {/* Two-column grid for card details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* First card */}
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold">Card details</CardTitle>
            <p className="text-sm text-gray-500">Update your payment information</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="cardNumber">Card number</Label>
              <Input
                id="cardNumber"
                type="text"
                placeholder="1234 5678 9012 3456"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="expiry">Expiry date</Label>
                <Input
                  id="expiry"
                  type="text"
                  placeholder="MM/YY"
                  value={expiry}
                  onChange={(e) => setExpiry(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="cvc">CVC</Label>
                <Input
                  id="cvc"
                  type="text"
                  placeholder="123"
                  value={cvc}
                  onChange={(e) => setCvc(e.target.value)}
                />
              </div>
            </div>
            <Button
              onClick={handleUpdatePayment}
              className="w-full"
              disabled={loading}
            >
              {loading ? "Updating..." : "Update Payment Method"}
            </Button>
          </CardContent>
        </Card>

        {/* Second card */}
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold">Card details</CardTitle>
            <p className="text-sm text-gray-500">Update your payment information</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="cardNumber2">Card number</Label>
              <Input id="cardNumber2" type="text" placeholder="1234 5678 9012 3456" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="expiry2">Expiry date</Label>
                <Input id="expiry2" type="text" placeholder="MM/YY" />
              </div>
              <div>
                <Label htmlFor="cvc2">CVC</Label>
                <Input id="cvc2" type="text" placeholder="123" />
              </div>
            </div>
            <Button className="w-full">Update Payment Method</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}