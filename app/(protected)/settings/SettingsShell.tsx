"use client";

import { usePathname, useRouter } from "next/navigation";
import { X } from "lucide-react";
import { useSettings } from "./SettingsContext";

export default function SettingsShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { loading } = useSettings();

  const isActive = (path: string) => pathname === path;

  return (
    <div className="min-h-screen bg-white">
      <div className="flex">
        <main className="flex-1">
          {/* Page Content */}
          {children}
        </main>
      </div>
    </div>
  );
}