import SettingsHeader from "@/components/settings-header";
import SettingsSidebar from "@/components/SettingsSidebar";
import { UserProfileProvider } from "./_components/user-profile-context";

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
          <UserProfileProvider>{children}</UserProfileProvider>
        </main>
      </div>
    </div>
  );
}