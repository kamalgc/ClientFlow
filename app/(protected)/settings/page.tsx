"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useSettings } from "./SettingsContext";
import { createClient } from "@/lib/supabase/client";
import SettingsShell from "./SettingsShell";
import Loader from "@/components/loader";

export default function ProfileSettings() {
  const { data, loading, updateData } = useSettings();
  const supabase = createClient();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [nameError, setNameError] = useState("");

  // Initialize form with data from context
  useEffect(() => {
    if (data) {
      setFullName(data.fullName);
      setEmail(data.email);
      setProfilePicturePreview(data.profilePictureUrl);
    }
  }, [data]);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    let isValid = true;
    setEmailError("");
    setNameError("");

    if (!fullName.trim()) {
      setNameError("Full name is required");
      isValid = false;
    } else if (fullName.trim().length < 2) {
      setNameError("Full name must be at least 2 characters");
      isValid = false;
    }

    if (!email.trim()) {
      setEmailError("Email is required");
      isValid = false;
    } else if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address");
      isValid = false;
    }

    return isValid;
  };

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Only JPG and PNG files are supported");
      return;
    }

    setProfilePicture(file);

    const reader = new FileReader();
    reader.onload = (event) => {
      setProfilePicturePreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpdateProfile = async () => {
    if (!validateForm()) {
      toast.error("Please fix the errors before saving");
      return;
    }

    setSaving(true);

    try {
      let profilePictureUrl = data?.profilePictureUrl || null;

      if (profilePicture) {
        const fileExt = profilePicture.name.split(".").pop();
        const fileName = `${data?.userId}-${Date.now()}.${fileExt}`;
        const filePath = `avatars/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("assets")
          .upload(filePath, profilePicture);

        if (uploadError) {
          console.error("Upload error:", uploadError);
          toast.error("Failed to upload profile picture");
          setSaving(false);
          return;
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from("assets").getPublicUrl(filePath);

        profilePictureUrl = publicUrl;
      }

      const { error } = await supabase
        .from("users")
        .update({
          full_name: fullName.trim(),
          email: email.trim(),
          avatar_url: profilePictureUrl,
        })
        .eq("id", data?.userId);

      if (error) {
        console.error("Update error:", error);
        toast.error("Failed to update profile");
        setSaving(false);
        return;
      }

      updateData({
        fullName: fullName.trim(),
        email: email.trim(),
        profilePictureUrl,
      });

      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SettingsShell>
        <div className="px-8 py-8 flex items-center justify-center min-h-[400px]">
          <Loader text="loading details...."/>
        </div>
      </SettingsShell>
    );
  }

  return (
    <SettingsShell>
      <div className="px-8 py-8">
        <div className="max-w-3xl">
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-1">Profile</h2>
            <p className="text-sm text-gray-600">
              Update your profile settings. Manage your personal information.
            </p>
          </div>

          <div className="space-y-6">
            {/* Full name */}
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-sm font-medium text-gray-900">
                Full name
              </Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={`max-w-xl ${nameError ? "border-red-500" : ""}`}
                placeholder="Enter your full name"
              />
              {nameError && <p className="text-sm text-red-500">{nameError}</p>}
              <p className="text-sm text-gray-500">
                Enter your full name as you'd like it to appear across your account. You can
                only change this once every 30 days.
              </p>
            </div>

            {/* Profile picture */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-900">Profile picture</Label>
              <div className="flex items-start gap-4">
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
                    className="flex items-center justify-center w-16 h-16 border border-gray-200 rounded-lg cursor-pointer hover:border-gray-300 transition-colors bg-white"
                  >
                    {profilePicturePreview ? (
                      <img
                        src={profilePicturePreview}
                        alt="Profile preview"
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <div className="text-center text-xs text-gray-400">
                        <div>Upload</div>
                        <div>picture</div>
                      </div>
                    )}
                  </label>
                </div>
              </div>
              <p className="text-sm text-gray-500">
                Upload a professional photo to personalize your profile. Supported formats:
                JPG, PNG. Max size 5MB
              </p>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-900">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`max-w-xl ${emailError ? "border-red-500" : ""}`}
                placeholder="Enter your email address"
              />
              {emailError && <p className="text-sm text-red-500">{emailError}</p>}
              <p className="text-sm text-gray-500">
                Type a verified email to display on your profile. When changing emails,
                verification will be required.
              </p>
            </div>

            {/* Update button */}
            <div className="pt-4">
              <Button
                onClick={handleUpdateProfile}
                disabled={saving}
                className="bg-black hover:bg-gray-800 text-white px-6"
              >
                {saving ? (
                  <span className="flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin" />
                    Updating...
                  </span>
                ) : (
                  "Update profile"
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </SettingsShell>
  );
}