import SettingsHeader from "@/components/settings-header";
import SettingsSidebar from "@/components/SettingsSidebar";
import { SettingsProvider } from "./SettingsContext";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white">
      <SettingsHeader />
      <div className="flex">
        <SettingsSidebar/>
        <main className="flex-1 p-8">
          <SettingsProvider>{children}</SettingsProvider>
        </main>
      </div>
    </div>
  );
}