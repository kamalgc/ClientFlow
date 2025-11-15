'use client'

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import SettingsHeader from "@/components/settings-header"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import SettingsSidebar from "@/components/SettingsSidebar"

export default function ProfileSettings() {
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [profilePicture, setProfilePicture] = useState<File | null>(null)
  const [profilePicturePreview, setProfilePicturePreview] = useState<string | null>(null)

  const [saving, setSaving] = useState(false)
  const [emailError, setEmailError] = useState("")
  const [nameError, setNameError] = useState("")

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validateForm = () => {
    let isValid = true

    setEmailError("")
    setNameError("")

    if (!fullName.trim()) {
      setNameError("Full name is required")
      isValid = false
    } else if (fullName.trim().length < 2) {
      setNameError("Full name must be at least 2 characters")
      isValid = false
    }

    if (!email.trim()) {
      setEmailError("Email is required")
      isValid = false
    } else if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address")
      isValid = false
    }

    return isValid
  }

  const handleProfilePictureChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB")
      return
    }

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png"]
    if (!allowedTypes.includes(file.type)) {
      toast.error("Only JPG and PNG files are supported")
      return
    }

    setProfilePicture(file)

    const reader = new FileReader()
    reader.onload = (event) => {
      setProfilePicturePreview(event.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  // placeholder — swap with Supabase Storage later
  const uploadProfilePicture = async (file: File) => {
    return new Promise<string>((resolve) => {
      setTimeout(() => {
        resolve(`/uploads/profile-${Date.now()}.jpg`)
      }, 1000)
    })
  }

  const handleUpdateProfile = async () => {
    if (!validateForm()) {
      toast.error("Please fix the errors before saving")
      return
    }

    setSaving(true)

    try {
      let profilePictureUrl: string | null = null

      if (profilePicture) {
        profilePictureUrl = await uploadProfilePicture(profilePicture)
      }

      const res = await fetch("/api/user/getProfile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.trim(),
          profilePictureUrl,
        }),
      })

      const contentType = res.headers.get("content-type") || ""
      const data = contentType.includes("application/json")
        ? await res.json()
        : null

      if (!res.ok) {
        const msg = (data && data.error) || "Failed to update profile"
        toast.error(msg)
        return
      }

      toast.success("Profile updated successfully!")
    } catch (error) {
      console.error("Update error:", error)
      toast.error("Something went wrong. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* <SettingsHeader /> */}
      <div className="flex">
        {/* <SettingsSidebar active="Profile" /> */}

        <main className="flex-1 p-8">
          <div className="max-w-2xl space-y-8">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Profile</h1>
              <p className="text-gray-600 mt-1">
                Update your profile settings. Manage your personal information.
              </p>
            </div>

            <div className="space-y-6">
              {/* Full name */}
              <div className="space-y-2">
                <Label
                  htmlFor="fullName"
                  className="text-sm font-medium text-gray-900"
                >
                  Full name
                </Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className={`max-w-md ${nameError ? "border-red-500" : ""}`}
                  placeholder="Enter your full name"
                />
                {nameError && (
                  <p className="text-sm text-red-500">{nameError}</p>
                )}
                <p className="text-sm text-gray-500">
                  Enter your full name as you'd like it to appear across your
                  account. You can only change this once every 30 days.
                </p>
              </div>

              {/* Profile picture */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-900">
                  Profile picture
                </Label>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <input
                      type="file"
                      id="profilePicture"
                      accept="image/jpeg,image/jpg,image/png"
                      onChange={handleProfilePictureChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="profilePicture"
                      className="flex items-center justify-center w-16 h-16 border border-gray-200 rounded-lg cursor-pointer hover:border-gray-300 transition-colors bg-gray-50"
                    >
                      {profilePicturePreview ? (
                        <img
                          src={profilePicturePreview}
                          alt="Profile preview"
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-gray-400">
                          <div className="text-xs text-center">
                            <div>Upload</div>
                            <div>picture</div>
                          </div>
                        </div>
                      )}
                    </label>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">
                      Upload a professional photo to personalize your profile.
                      Supported formats: JPG, PNG. Max size 5MB
                    </p>
                  </div>
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-sm font-medium text-gray-900"
                >
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`max-w-md ${emailError ? "border-red-500" : ""}`}
                  placeholder="Enter your email address"
                />
                {emailError && (
                  <p className="text-sm text-red-500">{emailError}</p>
                )}
                <p className="text-sm text-gray-500">
                  Type a verified email to display on your profile. When
                  changing emails, verification will be required.
                </p>
              </div>

              {/* Update button */}
              <div className="pt-4">
                <Button
                  onClick={handleUpdateProfile}
                  disabled={saving}
                  className="bg-button-dark text-white hover:bg-blue-700 px-6"
                >
                  {saving ? (
                    <span className="flex items-center space-x-2">
                      <Loader2 size={16} className="animate-spin" />
                      <span>Updating...</span>
                    </span>
                  ) : (
                    "Update profile"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}