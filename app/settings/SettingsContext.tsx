"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

type SettingsData = {
  // User/Profile data
  fullName: string;
  email: string;
  profilePictureUrl: string | null;

  // Account/Company data
  companyName: string;
  businessType: string;
  currency: string;
  website: string;
  logoUrl: string | null;
  customLink: string;

  // Subscription data
  subscriptionStatus: string;
  planName: string;
  planAmount: number;
  planCurrency: string;
  trialEnd: string | null;
  currentPeriodEnd: string | null;

  // Payment methods
  paymentMethods: any[];

  // IDs
  userId: string;
  companyId: string;
};

type SettingsContextType = {
  data: SettingsData | null;
  loading: boolean;
  refreshData: () => Promise<void>;
  updateData: (updates: Partial<SettingsData>) => void;
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const [data, setData] = useState<SettingsData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAllData = async () => {
    try {
      setLoading(true);

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        toast.error("Please log in to continue");
        setLoading(false);
        return;
      }

      // Fetch user data from users table
      const { data: userData, error: userDataError } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();

      if (userDataError) {
        console.error("Error fetching user data:", userDataError);
        toast.error("Failed to load user data");
        setLoading(false);
        return;
      }

      // Combine all data
      const settingsData: SettingsData = {
        // User/Profile
        fullName: userData.full_name || "",
        email: userData.email || user.email || "",
        profilePictureUrl: userData.profile_pic_url || null,

        // Account/Company (from users table since we have single table)
        companyName: userData.company_name || "",
        businessType: userData.business_type || "",
        currency: "USD", // You can add this field to users table if needed
        website: "", // You can add this field to users table if needed
        logoUrl: userData.logo_url || null,
        customLink: userData.custom_link || "",

        // Subscription (you can add these fields or fetch from separate table)
        subscriptionStatus: "trial",
        planName: "Free Plan",
        planAmount: 0,
        planCurrency: "USD",
        trialEnd: null,
        currentPeriodEnd: null,

        // Payment methods (empty for now, add when you implement Stripe)
        paymentMethods: [],

        // IDs
        userId: user.id,
        companyId: userData.id || "",
      };

      setData(settingsData);
    } catch (error) {
      console.error("Error fetching settings data:", error);
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    await fetchAllData();
  };

  const updateData = (updates: Partial<SettingsData>) => {
    setData((prev) => (prev ? { ...prev, ...updates } : null));
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  return (
    <SettingsContext.Provider value={{ data, loading, refreshData, updateData }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}