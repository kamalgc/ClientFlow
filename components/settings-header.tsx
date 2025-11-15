import { X } from "lucide-react"

export default function SettingsHeader() {
  return (
    <div className="flex items-center justify-between border-b p-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your account settings and set any preferences.
        </p>
      </div>
      <a href="/dashboard/">
        <button className="rounded-md border border-gray-200 shadow-sm p-1.5 hover:bg-gray-100 transition cursor-pointer">
        <X className="w-4 h-4" />
        </button>
      </a>
    </div>
  )
}
