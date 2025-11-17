"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useSettings } from "../SettingsContext";
import { createClient } from "@/lib/supabase/client";
import SettingsShell from "../SettingsShell";
import Loader from "@/components/loader";

export default function AccountSettings() {
  const { data, loading, updateData } = useSettings();
  const supabase = createClient();

  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [customLink, setCustomLink] = useState("");
  const [logo, setLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Initialize form with data from context
  useEffect(() => {
    if (data) {
      setCompanyName(data.companyName);
      setEmail(data.email);
      setCurrency(data.currency);
      setCustomLink(data.customLink);
      setLogoPreview(data.logoUrl);
    }
  }, [data]);

  const currencies = [
    { value: "USD", label: "US Dollar (USD)" },
    { value: "EUR", label: "Euro (EUR)" },
    { value: "GBP", label: "British Pound (GBP)" },
    { value: "CAD", label: "Canadian Dollar (CAD)" },
    { value: "AUD", label: "Australian Dollar (AUD)" },
    { value: "INR", label: "Indian Rupee (INR)" },
  ];

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    if (!["image/jpeg", "image/png", "image/jpg"].includes(file.type)) {
      toast.error("Only JPG and PNG files are supported");
      return;
    }

    setLogo(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      setLogoPreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpdateAccount = async () => {
    if (!data?.userId) {
      toast.error("User information is missing.");
      return;
    }

    setSaving(true);

    try {
      // Normalize username once
      const normalizedCustomLink =
        customLink.trim() !== ""
          ? customLink.trim().toLowerCase()
          : null;

      // ---------------------------
      // 1. Check if username available (before uploading logo)
      // ---------------------------
      if (normalizedCustomLink) {
        const { data: existingUsers, error: checkError } = await supabase
          .from("users")
          .select("id")
          .eq("custom_link", normalizedCustomLink)
          .neq("id", data.userId)
          .limit(1);

        if (checkError) {
          console.error("Error checking custom link:", checkError);
          toast.error(
            "Could not verify username availability. Please try again."
          );
          return;
        }

        const usernameTaken =
          existingUsers && Array.isArray(existingUsers) && existingUsers.length > 0;

        if (usernameTaken) {
          toast.error("Username already taken");
          return;
        }
      }

      let logoUrl = data.logoUrl || null;

      // ---------------------------
      // 2. Upload logo if changed
      // ---------------------------
      if (logo) {
        const fileExt = logo.name.split(".").pop();
        const fileName = `${data.userId}-${Date.now()}.${fileExt}`;
        const filePath = `logos/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("assets")
          .upload(filePath, logo);

        if (uploadError) {
          console.error("Logo upload error:", uploadError);
          toast.error("Failed to upload logo, please try again.");
          return;
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from("assets").getPublicUrl(filePath);

        logoUrl = publicUrl;
      }

      // ---------------------------
      // 3. Update user in DB
      // ---------------------------
      const { error } = await supabase
        .from("users")
        .update({
          company_name: companyName,
          email: email,
          logo_url: logoUrl,
          custom_link: normalizedCustomLink, // can be null
        })
        .eq("id", data.userId);

      if (error) {
        console.error("Update error:", error);
        throw error;
      }

      // ---------------------------
      // 4. Update global context
      // ---------------------------
      updateData({
        companyName,
        email,
        currency,
        logoUrl,
        customLink: normalizedCustomLink ?? "",
      });

      toast.success("Account updated successfully!");
    } catch (error: any) {
      console.error("Update error:", error);
      toast.error(error?.message || "Failed to update account");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SettingsShell>
        <div className="px-8 py-8 flex items-center justify-center">
          <Loader text="loading details...." />
        </div>
      </SettingsShell>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="flex">
        {/* Main Content */}
        <main className="flex-1">
          {/* Content */}
          <div className="">
            <div className="max-w-3xl">
              <div className="mb-8">
                <h1 className="text-2xl font-semibold text-gray-900">Account</h1>
                <p className="text-sm text-gray-600">
                  Update your account settings. Manage your business information.
                </p>
              </div>

              <div className="space-y-6">
                {/* Company Name */}
                <div className="space-y-2">
                  <Label
                    htmlFor="companyName"
                    className="text-sm font-medium text-gray-900"
                  >
                    Company Name
                  </Label>
                  <Input
                    id="companyName"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Acme Co"
                    className="max-w-xl"
                  />
                  <p className="text-sm text-gray-500">
                    This is your public display name. It can be your real name or a
                    pseudonym. You can only change this once every 30 days.
                  </p>
                </div>

                {/* Logo */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-900">Logo</Label>
                  <div className="flex items-start gap-4">
                    <div className="relative">
                      <input
                        type="file"
                        id="logo"
                        accept="image/jpeg,image/jpg,image/png"
                        onChange={handleLogoChange}
                        className="hidden"
                      />
                      <label
                        htmlFor="logo"
                        className="flex items-center justify-center w-16 h-16 border border-gray-200 rounded-lg cursor-pointer hover:border-gray-300 transition-colors bg-white"
                      >
                        {logoPreview ? (
                          <img
                            src={logoPreview}
                            alt="Logo preview"
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
                    Upload your company logo or a professional photo to enhance your
                    business profile. JPG or PNG, max 5MB
                  </p>
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
                    placeholder="acmeco@gmail.com"
                    className="max-w-xl"
                  />
                  <p className="text-sm text-gray-500">
                    You can manage verified email addresses in your email settings.
                  </p>
                </div>

                {/* Currency */}
                <div className="space-y-2">
                  <Label
                    htmlFor="currency"
                    className="text-sm font-medium text-gray-900"
                  >
                    Currency
                  </Label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger className="max-w-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map((curr) => (
                        <SelectItem key={curr.value} value={curr.value}>
                          {curr.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-gray-500">
                    Choose your preferred currency for tracking revenue.
                  </p>
                </div>

                {/* Custom Link */}
                <div className="space-y-2">
                  <Label
                    htmlFor="customLink"
                    className="text-sm font-medium text-gray-900"
                  >
                    Custom link
                  </Label>
                  <p className="text-sm text-gray-600 mb-2">
                    Change your onboarding and client portal username URL.
                  </p>
                  <div className="flex items-center max-w-xl border border-gray-200 rounded-lg overflow-hidden">
                    <Input
                      id="customLink"
                      value={customLink}
                      onChange={(e) => setCustomLink(e.target.value)}
                      placeholder="acmeco"
                      className="border-none focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                    <span className="px-4 py-2 bg-white text-gray-500 border-l border-gray-200 whitespace-nowrap text-sm">
                      /clientflowhq.com
                    </span>
                  </div>
                </div>

                {/* Update Button */}
                <div className="pt-4">
                  <Button
                    onClick={handleUpdateAccount}
                    disabled={saving}
                    className="bg-black hover:bg-gray-800 text-white px-6"
                  >
                    {saving ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Updating...
                      </span>
                    ) : (
                      "Update account"
                    )}
                  </Button>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="mt-12 pt-8 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Danger zone
                </h3>
                <div className="bg-black text-white rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium mb-1">
                        You're using free plan
                      </h4>
                      <p className="text-sm text-gray-300">
                        You can add components to your app by upgrading to the
                        next plan.
                      </p>
                    </div>
                    <Button className="bg-white text-black hover:bg-gray-100">
                      View plans →
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}