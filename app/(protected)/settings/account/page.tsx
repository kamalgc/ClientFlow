// app/settings/account/page.tsx
"use client";

import { useEffect, useState } from "react";
import DeleteAccountSection from "@/components/DeleteAccountSection";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import SettingsHeader from "@/components/settings-header";
import { toast } from "sonner";
import { Loader2, AlertTriangle, Building, Globe, DollarSign } from "lucide-react";

import SettingsSidebar from "@/components/SettingsSidebar";
import { createClient } from "@/lib/supabase/client";
const supabase = createClient()
const SkeletonInput = ({ width = "max-w-xl" }) => (
  <div className={`h-10 bg-gray-200 rounded-md animate-pulse ${width}`}></div>
);
const SkeletonSelect = ({ width = "max-w-sm" }) => (
  <div className={`h-10 bg-gray-200 rounded-md animate-pulse ${width}`}></div>
);
const SkeletonBusinessLogo = () => (
  <div className="w-24 h-24 bg-gray-200 rounded-lg animate-pulse"></div>
);
const SkeletonText = ({ width = "w-32" }) => (
  <div className={`h-4 bg-gray-200 rounded animate-pulse ${width}`}></div>
);
const SkeletonButton = ({ width = "w-32" }) => (
  <div className={`h-10 bg-gray-200 rounded-md animate-pulse ${width}`}></div>
);

function getCookie(name: string) {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return m ? decodeURIComponent(m[2]) : null;
}

export default function AccountSettings() {
  // Original data from API (company-scoped)
  const [originalData, setOriginalData] = useState({
    businessName: "",
    businessType: "",
    currency: "USD",
    website: "",
    profilePictureUrl: "",
  });

  // IDs
  const [userId, setUserId] = useState<string>("");
  const [companyId, setCompanyId] = useState<string>("");

  // Form fields (company)
  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [website, setWebsite] = useState("");
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(null);

  // Local file
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  // UI State
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [websiteError, setWebsiteError] = useState("");
  const [businessNameError, setBusinessNameError] = useState("");

  const businessTypes = [
    { value: "Freelancer", label: "Freelancer" },
    { value: "Agency", label: "Agency" },
    { value: "Consultant", label: "Consultant" },
    { value: "Coach", label: "Coach" },
    { value: "Creator", label: "Creator" },
    { value: "Entrepreneur", label: "Entrepreneur" },
    { value: "Service Provider", label: "Service Provider" },
    { value: "Studio", label: "Small Team/Studio" },
    { value: "Marketing", label: "Marketing Professional" },
    { value: "Developer", label: "Developer" },
    { value: "Other", label: "Other" },
  ];

  const currencies = [
    { value: "USD", label: "US Dollar ($)", symbol: "$" },
    { value: "EUR", label: "Euro (€)", symbol: "€" },
    { value: "GBP", label: "British Pound (£)", symbol: "£" },
    { value: "CAD", label: "Canadian Dollar (C$)", symbol: "C$" },
    { value: "AUD", label: "Australian Dollar (A$)", symbol: "A$" },
    { value: "INR", label: "Indian Rupee (₹)", symbol: "₹" },
    { value: "NZD", label: "New Zealand Dollar (NZ$)", symbol: "NZ$" },
    { value: "SEK", label: "Swedish Krona (kr)", symbol: "kr" },
    { value: "NOK", label: "Norwegian Krone (kr)", symbol: "kr" },
    { value: "DKK", label: "Danish Krone (kr)", symbol: "kr" },
    { value: "AED", label: "UAE Dirham (د.إ)", symbol: "د.إ" },
  ];

  const hasChanges = () =>
    businessName !== originalData.businessName ||
    businessType !== originalData.businessType ||
    currency !== originalData.currency ||
    website !== originalData.website ||
    profilePictureUrl !== originalData.profilePictureUrl;

  const validateWebsite = (url: any) => {
    if (!url) return true;
    try {
      const urlPattern =
        /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w .-]*)*\/?$/;
      return urlPattern.test(url);
    } catch {
      return false;
    }
  };

  const validateForm = () => {
    let isValid = true;
    setWebsiteError("");
    setBusinessNameError("");

    if (businessName.trim() && businessName.trim().length < 2) {
      setBusinessNameError("Business name must be at least 2 characters");
      isValid = false;
    }
    if (website.trim() && !validateWebsite(website.trim())) {
      setWebsiteError("Please enter a valid website URL");
      isValid = false;
    }
    return isValid;
  };

  // Load company-scoped details based on company_id cookie (authoritative),
  // falling back to API's active_company_id if cookie is missing.
  useEffect(() => {
    let cancelled = false;

    const fetchCompanyAccount = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/users/companies", {
          credentials: "include",
          cache: "no-store",
        });
        const data = await res.json();

        if (!res.ok) {
          if (!cancelled) {
            toast.error(data?.error || "Failed to load account data");
            setLoading(false);
          }
          return;
        }

        // Expecting shape like:
        // {
        //   companies: [{ id, name, business_type, currency, website, logo_url }...],
        //   plan: string | null,
        //   active_company_id: string | null,
        //   user_id: string
        // }
        const cookieCid = getCookie("company_id");
        const activeCid = cookieCid || data?.active_company_id || null;

        const companies = Array.isArray(data?.companies) ? data.companies : [];
        const targetCompany =
          (activeCid && companies.find((c: any) => c.id === activeCid)) ||
          companies[0] ||
          null;

        if (!targetCompany) {
          if (!cancelled) {
            // No company yet — keep defaults and stop.
            setUserId(data?.user_id || "");
            setCompanyId("");
            setLoading(false);
          }
          return;
        }

        if (!cancelled) {
          setUserId(data?.user_id || "");
          setCompanyId(targetCompany.id);

          const accountData = {
            businessName: targetCompany.name || "",
            businessType: targetCompany.business_type || "",
            currency: targetCompany.currency || "USD",
            website: targetCompany.website || "",
            profilePictureUrl: targetCompany.logo_url || "",
          };

          setOriginalData(accountData);
          setBusinessName(accountData.businessName);
          setBusinessType(accountData.businessType);
          setCurrency(accountData.currency);
          setWebsite(accountData.website);
          setProfilePictureUrl(accountData.profilePictureUrl || null);
          setPreview(accountData.profilePictureUrl || null);
          setLoading(false);
        }
      } catch (error) {
        console.error("Fetch error:", error);
        if (!cancelled) {
          toast.error("Failed to load account data");
          setLoading(false);
        }
      }
    };

    // Initial load
    fetchCompanyAccount();

    // If another tab changes the cookie, refresh this view.
    const onStorage = (e: StorageEvent) => {
      if (e.key === "company_id") fetchCompanyAccount();
    };
    window.addEventListener("storage", onStorage);

    // Also refresh when the page re-gains focus (user may have switched teams)
    const onFocus = () => fetchCompanyAccount();
    window.addEventListener("focus", onFocus);

    return () => {
      cancelled = true;
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }
    const allowed = ["image/jpeg", "image/png", "image/jpg"];
    if (!allowed.includes(f.type)) {
      toast.error("Only JPG and PNG files are supported");
      return;
    }
    setFile(f);
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target?.result as string);
    reader.readAsDataURL(f);
  };

  const uploadLogoToStorage = async (fileToUpload: File) => {
    const ext = fileToUpload.name.split(".").pop();
    const fileName = `business-logo-${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("profile-pictures")
      .upload(fileName, fileToUpload, { upsert: true });
    if (uploadError) throw uploadError;
    const { data: publicUrlData } = supabase.storage
      .from("profile-pictures")
      .getPublicUrl(fileName);
    return publicUrlData.publicUrl;
  };

  const handleUpdateAccount = async () => {
    if (!validateForm()) {
      toast.error("Please fix the errors before saving");
      return;
    }
    if (!companyId) {
      toast.error("No company selected/found");
      return;
    }

    setSaving(true);
    try {
      let logoUrl = profilePictureUrl || null;
      if (file) {
        logoUrl = await uploadLogoToStorage(file);
        setProfilePictureUrl(logoUrl);
      }

      const res = await fetch("/api/users/companies", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          company_id: companyId,
          business_name: businessName.trim() || null,
          business_type: businessType || null,
          currency,
          website: website.trim() || null,
          profile_picture_url: logoUrl, // maps to companies.logo_url in the route
        }),
      });

      const updated = await res.json();
      if (!res.ok) {
        toast.error(updated?.error || "Failed to update account settings");
        setSaving(false);
        return;
      }

      const newOriginalData = {
        businessName: updated.business_name ?? businessName.trim(),
        businessType: updated.business_type ?? businessType,
        currency: updated.currency ?? currency,
        website: updated.website ?? website.trim(),
        profilePictureUrl: updated.profile_picture_url ?? logoUrl,
      };

      setOriginalData(newOriginalData);
      setBusinessName(newOriginalData.businessName);
      setBusinessType(newOriginalData.businessType);
      setCurrency(newOriginalData.currency);
      setWebsite(newOriginalData.website);
      setProfilePictureUrl(newOriginalData.profilePictureUrl || null);
      setPreview(newOriginalData.profilePictureUrl || preview);

      toast.success("Account settings updated successfully!");
    } catch (error: any) {
      console.error("Update error:", error);
      toast.error(error.message || "Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveLogo = () => {
    setFile(null);
    setPreview(null);
    setProfilePictureUrl(null);
  };

  return (
    <div className="min-h-screen bg-white text-black">
      {/* <SettingsHeader /> */}
      <div className="flex">
        {/* <SettingsSidebar active="Account" /> */}
        <main className="flex-1 p-8">
          <div className="max-w-3xl space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Account</h1>
                <p className="text-gray-600 mt-1">
                  Update your account settings. Manage your business information.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Business Name */}
              <div className="space-y-2">
                <Label htmlFor="businessName" className="text-sm font-medium text-gray-900 flex items-center space-x-2">
                  <Building size={16} className="text-gray-500" />
                  <span>Business Name</span>
                </Label>
                {loading ? (
                  <SkeletonInput />
                ) : (
                  <Input
                    id="businessName"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className={`max-w-xl ${businessNameError ? "border-red-500" : ""}`}
                    placeholder="Kamal's Studio"
                  />
                )}
                {businessNameError && (
                  <p className="text-sm text-red-500 flex items-center space-x-1">
                    <AlertTriangle size={12} />
                    <span>{businessNameError}</span>
                  </p>
                )}
                {loading ? <SkeletonText width="w-96" /> : (
                  <p className="text-sm text-gray-500">
                    This is your public display name. You can change it anytime.
                  </p>
                )}
              </div>

              {/* Business Logo */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-900 flex items-center space-x-2">
                  <span>Business logo</span>
                </Label>
                <div className="flex items-center space-x-4">
                  {loading ? (
                    <SkeletonBusinessLogo />
                  ) : (
                    <div className="relative">
                      <label
                        htmlFor="businessLogo"
                        className="w-24 h-24 border border-gray-200 rounded-lg flex items-center justify-center cursor-pointer hover:border-gray-300 bg-white"
                      >
                        {preview ? (
                          <img src={preview} alt="logo" className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          <div className="text-center text-sm text-gray-400">
                            <div className="mb-1">Upload</div>
                            <div className="text-xs">picture</div>
                          </div>
                        )}
                      </label>
                      <input id="businessLogo" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                    </div>
                  )}
                  <div className="flex-1">
                    {loading ? (
                      <div className="space-y-2">
                        <SkeletonText width="w-80" />
                        <div className="flex space-x-2">
                          <SkeletonButton width="w-20" />
                          <SkeletonButton width="w-20" />
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm text-gray-500">
                          Upload your company logo or a professional photo (JPG/PNG, max 5MB)
                        </p>
                        <div className="mt-2 flex space-x-2">
                          <Button variant="outline" onClick={() => document.getElementById("businessLogo")?.click()}>
                            Upload
                          </Button>
                          <Button variant="ghost" onClick={handleRemoveLogo}>Remove</Button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Currency */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-900 flex items-center space-x-2">
                  <DollarSign size={16} className="text-gray-500" />
                  <span>Currency</span>
                </Label>
                <div className="max-w-sm">
                  {loading ? (
                    <SkeletonSelect />
                  ) : (
                    <Select value={currency} onValueChange={(v) => setCurrency(v)}>
                      <SelectTrigger className="max-w-sm">
                        <SelectValue>
                          {currencies.find((c) => c.value === currency)?.label || currency}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {currencies.map((curr) => (
                          <SelectItem key={curr.value} value={curr.value}>
                            {curr.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
                {loading ? <SkeletonText width="w-64" /> : (
                  <p className="text-sm text-gray-500">Choose your preferred currency for tracking revenue.</p>
                )}
              </div>

              {/* Website */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-900 flex items-center space-x-2">
                  <Globe size={16} className="text-gray-500" />
                  <span>Website URL</span>
                </Label>
                {loading ? (
                  <SkeletonInput />
                ) : (
                  <Input
                    id="website"
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className={`max-w-xl ${websiteError ? "border-red-500" : ""}`}
                    placeholder="https://example.com"
                  />
                )}
                {websiteError && (
                  <p className="text-sm text-red-500 flex items-center space-x-1">
                    <AlertTriangle size={12} />
                    <span>{websiteError}</span>
                  </p>
                )}
                {loading ? <SkeletonText width="w-80" /> : (
                  <p className="text-sm text-gray-500">
                    Enter your main business website URL (homepage, booking page, or checkout).
                  </p>
                )}
              </div>

              {/* Update Button */}
              <div className="pt-4">
                {loading ? (
                  <SkeletonButton width="w-32" />
                ) : (
                  <Button
                    onClick={handleUpdateAccount}
                    disabled={saving || !hasChanges()}
                    className="bg-blue-600 text-white hover:bg-blue-700 px-6"
                  >
                    {saving ? (
                      <span className="flex items-center space-x-2">
                        <Loader2 size={16} className="animate-spin" />
                        <span>Updating...</span>
                      </span>
                    ) : (
                      "Update account"
                    )}
                  </Button>
                )}
              </div>
            </div>

            {!loading && (
              <div className="mt-8">
                <DeleteAccountSection userId={userId} />
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}