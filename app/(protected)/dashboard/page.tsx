// app/(protected)/dashboard/page.tsx
"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

function DashboardContent() {
  const searchParams = useSearchParams();       // ✅ now inside Suspense
  const sessionId = searchParams.get("session_id");
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (sessionId) {
      setShowSuccess(true);
      const id = setTimeout(() => setShowSuccess(false), 5000);
      return () => clearTimeout(id); // cleanup
    } else {
      setShowSuccess(false);
    }
  }, [sessionId]);

  return (
    <div className="min-h-screen p-8">
      {showSuccess && (
        <div className="mb-6 rounded-lg bg-green-50 border border-green-200 p-4">
          <div className="flex items-center gap-2">
            <svg
              className="h-5 w-5 text-green-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <p className="font-medium text-green-800">
              🎉 Payment successful! Your subscription is now active.
            </p>
          </div>
        </div>
      )}

      <h1 className="text-2xl font-bold">Dashboard</h1>
    </div>
  );
}

export default function Dashboard() {
  return (
    <Suspense fallback={<div className="min-h-screen p-8" />}>
      <DashboardContent />
    </Suspense>
  );
}