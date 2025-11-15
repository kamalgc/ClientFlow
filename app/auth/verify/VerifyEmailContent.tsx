"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, useCallback, useRef } from "react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "@/components/ui/input-otp";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const router = useRouter();
  const supabase = createClient();

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [resending, setResending] = useState(false);

  // Prevent double-submit (auto-verify + button click)
  const submittedRef = useRef(false);

  // Redirect if no email provided
  useEffect(() => {
    if (!email) {
      toast.error("No email provided");
      router.replace("/auth/register");
    }
  }, [email, router]);

  const handleVerify = useCallback(async () => {
    // hard guard
    if (submittedRef.current) return;

    if (code.length !== 6) {
      toast.error("Please enter a 6-digit code");
      setIsValid(false);
      return;
    }

    submittedRef.current = true;
    setLoading(true);
    setIsValid(null);

    try {
      const { data: verifyData, error: verifyError } =
  await supabase.auth.verifyOtp({
    email,
    token: code,
    type: "signup",
  });

if (verifyError) {
        // allow retry
        submittedRef.current = false;
        setLoading(false);
        setIsValid(false);
        setCode("");
        toast.error(`Invalid or expired code: ${verifyError.message}`);
        return;
      }

      // Success: a single success toast, then move on immediately
      toast.success("Email verified! Redirecting…");
setIsValid(true);
      router.replace("/auth/callback");
    } catch (err) {
      // allow retry
      submittedRef.current = false;
      setLoading(false);
      setIsValid(false);
      setCode("");
      console.error("Verification error:", err);
      toast.error("Something went wrong. Please try again.");
    }
  }, [code, email, router]);

  const handleResendCode = async () => {
    setResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
      });

      if (error) {
        toast.error(`Failed to resend code: ${error.message}`);
      } else {
        toast.success("New verification code sent!");
        setCode("");
        setIsValid(null);
        // allow verification again
        submittedRef.current = false;
      }
    } catch (err) {
      console.error("Resend error:", err);
      toast.error("Failed to resend code. Please try again.");
    } finally {
      setResending(false);
    }
  };

  // Auto-verify when code reaches 6 digits, but only if not already submitted
  useEffect(() => {
    if (code.length === 6 && !loading && !submittedRef.current) {
      void handleVerify();
    }
  }, [code, loading, handleVerify]);

  if (!email) return null;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 space-y-6 text-center">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">Verify your email</h1>
        <p className="text-muted-foreground max-w-md">
          We&apos;ve sent a 6-digit code to <strong>{email}</strong>.
          <br />
          Check your spam folder if you don&apos;t see it in your inbox.
        </p>
      </div>

      <div className="space-y-4">
        <InputOTP
          maxLength={6}
          value={code}
          onChange={(v) => {
            setIsValid(null);
            setCode(v);
          }}
          className={
            isValid === false
              ? "shake border-red-500"
              : isValid === true
              ? "success-glow border-green-500"
              : ""
          }
        >
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
          </InputOTPGroup>
          <InputOTPSeparator />
          <InputOTPGroup>
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>

        <Button
          onClick={handleVerify}
          disabled={loading || code.length !== 6 || submittedRef.current}
          className="w-full bg-[#445CF4] hover:bg-[#3344c9] max-w-xs"
        >
          {loading ? "Verifying..." : "Verify Email"}
        </Button>
      </div>

      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">Didn&apos;t receive the code?</p>
        <Button
          variant="ghost"
          onClick={handleResendCode}
          disabled={resending}
          className="text-[#445CF4] hover:text-[#3344c9] underline"
        >
          {resending ? "Sending..." : "Resend Code"}
        </Button>
      </div>

      <Button
        variant="ghost"
        onClick={() => router.replace("/auth/sign-up")}
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        ← Back to Registration
      </Button>
    </div>
  );
}