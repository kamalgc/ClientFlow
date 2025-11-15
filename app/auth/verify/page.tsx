"use client";

import { Suspense } from "react";
import VerifyEmailPage from "./VerifyEmailContent";

export default function Page() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
      <VerifyEmailPage />
    </Suspense>
  );
}