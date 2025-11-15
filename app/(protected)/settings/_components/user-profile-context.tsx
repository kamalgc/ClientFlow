"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { toast } from "sonner";

type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  company_name: string | null;
  business_type: string | null;
  how_found: string | null;
  logo_url: string | null;
  custom_link: string | null;
  onboarding_completed: boolean;
};

type UserProfileContextValue = {
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  setProfile: React.Dispatch<React.SetStateAction<Profile | null>>;
};

const UserProfileContext = createContext<UserProfileContextValue | null>(null);

export function UserProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/user/getProfile", {
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        const msg = data?.error || "Failed to load profile";
        setError(msg);
        toast.error(msg);
        return;
      }

      setProfile({
        id: data.id,
        email: data.email,
        full_name: data.full_name,
        company_name: data.company_name,
        business_type: data.business_type,
        how_found: data.how_found,
        logo_url: data.logo_url,
        custom_link: data.custom_link,
        onboarding_completed: data.onboarding_completed,
      });
    } catch (err) {
      console.error("Fetch profile error:", err);
      setError("Failed to load profile");
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return (
    <UserProfileContext.Provider
      value={{ profile, loading, error, refresh: fetchProfile, setProfile }}
    >
      {children}
    </UserProfileContext.Provider>
  );
}

export function useUserProfile() {
  const ctx = useContext(UserProfileContext);
  if (!ctx) {
    throw new Error("useUserProfile must be used inside <UserProfileProvider>");
  }
  return ctx;
}