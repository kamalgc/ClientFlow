"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import Loader from "@/components/loader";

export default function AuthCallbackPage() {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const run = async () => {
      // 1. Get session from Supabase
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error || !session?.user) {
        console.error("No session in callback:", error);
        toast.error("Session not found. Please log in again.");
        router.replace("/auth/login");
        return;
      }

      const userId = session.user.id;

      // 2. Check if user row exists in your `users` table
      const { data, error: dbError } = await supabase
        .from("users")
        .select("id, onboarding_completed")
        .eq("id", userId)
        .maybeSingle();

      if (dbError) {
        console.error("Error fetching user row:", dbError);
        // Fallback: send to onboarding so they can complete setup
        router.replace("/auth/onboarding");
        return;
      }

      // 3. Route based on existence / onboarding flag
      if (!data || data.onboarding_completed === false) {
        router.replace("/auth/onboarding");
      } else {
        router.replace("/dashboard");
      }
    };

    run();
  }, [router, supabase]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader text="Signing you in...."/>
    </div>
  );
}