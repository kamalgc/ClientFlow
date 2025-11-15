"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SettingsSidebar() {
  const pathname = usePathname();

  const links = [
    { href: "/settings", label: "Profile" },
    { href: "/settings/account", label: "Account" },
    { href: "/settings/subscriptions", label: "Subscription" },
  ];

  return (
    <aside className="w-64 border-r border-gray-200 p-6">
      <div className="space-y-1">
        {links.map((link) => {
          const isActive = pathname === link.href;

          return (
            <Link key={link.href} href={link.href}>
              <div
                className={`font-medium py-2 px-3 rounded-md cursor-pointer transition-colors
                  ${
                    isActive
                      ? "bg-gray-100 text-black"
                      : "text-gray-600 hover:text-black hover:bg-gray-50"
                  }`}
              >
                {link.label}
              </div>
            </Link>
          );
        })}
      </div>
    </aside>
  );
}