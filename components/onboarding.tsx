"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import { Toaster, toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

// (For when you show the avatar somewhere in the UI)
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Onboarding({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const supabase = createClient();

  const [step, setStep] = React.useState<1 | 2>(1);
  const [loading, setLoading] = React.useState(false);
  const [logoFile, setLogoFile] = React.useState<File | null>(null);
  const [logoPreview, setLogoPreview] = React.useState<string | null>(null);

  const [formData, setFormData] = React.useState({
    fullName: "",
    companyName: "",
    businessType: "",
    customLink: "",
  });

  // survey dialog state
  const [surveyOpen, setSurveyOpen] = React.useState(false);
  const [surveyHowFound, setSurveyHowFound] = React.useState("");
  const [surveySubmitting, setSurveySubmitting] = React.useState(false);
  const [completedUserId, setCompletedUserId] = React.useState<string | null>(
    null
  );

  // --- helpers for avatar initials & image generation ---

  const getInitials = (fullName: string) => {
    if (!fullName) return "";
    const parts = fullName
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    const firstTwo = parts.slice(0, 2);
    return firstTwo.map((p) => p[0].toUpperCase()).join("");
  };

  const generateAvatarImageFile = (
    fullName: string
  ): Promise<File | null> => {
    const initials = getInitials(fullName) || "?";

    const canvas = document.createElement("canvas");
    const size = 256;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");

    if (!ctx) return Promise.resolve(null);

    // Background
    ctx.fillStyle = "#111827"; // slate-900-ish
    ctx.fillRect(0, 0, size, size);

    // Text
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 96px system-ui, -apple-system, BlinkMacSystemFont";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(initials, size / 2, size / 2);

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob) return resolve(null);
        const file = new File([blob], `avatar-${Date.now()}.png`, {
          type: "image/png",
        });
        resolve(file);
      }, "image/png");
    });
  };

  const uploadLogo = async (userId: string): Promise<string | null> => {
    if (!logoFile) return null;

    try {
      const fileExt = logoFile.name.split(".").pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `logos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("assets")
        .upload(filePath, logoFile, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        console.error("Logo upload error:", uploadError);
        throw uploadError;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("assets").getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error("Error uploading logo:", error);
      return null;
    }
  };

  const uploadProfileAvatar = async (
    userId: string,
    fullName: string
  ): Promise<string | null> => {
    try {
      const avatarFile = await generateAvatarImageFile(fullName);
      if (!avatarFile) {
        console.error("Failed to generate avatar file");
        return null;
      }

      const fileName = `${userId}-${Date.now()}.png`;
      const filePath = `profile_pictures/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("assets")
        .upload(filePath, avatarFile, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        console.error("Profile picture upload error:", uploadError);
        throw uploadError;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("assets").getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      return null;
    }
  };

  async function goNext() {
    if (step === 1) {
      // basic validation before going to step 2
      if (!formData.fullName || !formData.companyName || !formData.businessType) {
        toast.error("Please fill in all fields");
        return;
      }
      setStep(2);
    } else {
      if (!formData.customLink) {
        toast.error("Please enter a custom link");
        return;
      }
      await handleSubmit();
    }
  }

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }

      if (!["image/jpeg", "image/png", "image/jpg"].includes(file.type)) {
        toast.error("Only JPG and PNG files are allowed");
        return;
      }

      setLogoFile(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        toast.error("Please log in to continue");
        router.push("/auth/login");
        return;
      }

      // 🚫 HARD STOP if user already completed onboarding
      const { data: profile, error: profileError } = await supabase
        .from("users")
        .select("onboarding_completed")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError && profileError.code !== "PGRST116") {
        console.error("Error fetching profile:", profileError);
        toast.error("Something went wrong. Please try again.");
        return;
      }

      if (profile?.onboarding_completed) {
        toast.info("You’ve already set up your workspace.");
        router.replace("/dashboard");
        return;
      }

      // 1) check custom_link availability
      const normalizedCustomLink = formData.customLink
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, "");

      const { data: existingUser, error: checkError } = await supabase
        .from("users")
        .select("id")
        .eq("custom_link", normalizedCustomLink)
        .neq("id", user.id)
        .maybeSingle();

      if (checkError && checkError.code !== "PGRST116") {
        console.error("Error checking custom link:", checkError);
        toast.error("Could not verify username availability. Please try again.");
        return;
      }

      if (existingUser) {
        toast.error("Username already taken");
        return;
      }

      // 2) upload logo
      let logoUrl: string | null = null;
      if (logoFile) {
        const loadingToast = toast.loading("Uploading logo...");
        logoUrl = await uploadLogo(user.id);
        toast.dismiss(loadingToast);

        if (!logoUrl) {
          toast.error("Failed to upload logo. Please try again.");
          return;
        }
      }

      // 3) generate & upload profile avatar based on initials
      const profilePictureUrl = await uploadProfileAvatar(
        user.id,
        formData.fullName
      );
      console.log("Profile picture URL:", profilePictureUrl);

      // 4) upsert user & set onboarding_completed
      const { error: upsertError } = await supabase.from("users").upsert(
        {
          id: user.id,
          email: user.email,
          full_name: formData.fullName,
          company_name: formData.companyName,
          business_type: formData.businessType,
          custom_link: normalizedCustomLink,
          logo_url: logoUrl,
          onboarding_completed: true,
          // if you later add a `profile_picture_url` column, you can also save:
          // profile_picture_url: profilePictureUrl,
        },
        { onConflict: "id" }
      );

      if (upsertError) {
        console.error("Save error:", upsertError);

        if (upsertError.code === "23505") {
          toast.error("Username already taken");
        } else {
          toast.error("Failed to save data: " + upsertError.message);
        }
        return;
      }

      toast.success("Workspace created successfully!");
      setCompletedUserId(user.id);
      setSurveyOpen(true);
    } catch (err) {
      console.error("Onboarding error:", err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSurveySubmit = async () => {
    if (!surveyHowFound) {
      toast.error("Please select an option or skip");
      return;
    }

    if (!completedUserId) {
      router.push("/auth/plans");
      return;
    }

    try {
      setSurveySubmitting(true);
      const { error } = await supabase
        .from("users")
        .update({ how_found: surveyHowFound })
        .eq("id", completedUserId);

      if (error) {
        console.error("Survey save error:", error);
      }
    } catch (err) {
      console.error("Survey submit error:", err);
    } finally {
      setSurveySubmitting(false);
      router.push("/auth/plans");
    }
  };

  const handleSurveySkipOrClose = () => {
    router.push("/auth/plans");
  };

  const initials = getInitials(formData.fullName);

  return (
    <>
      <Toaster richColors />
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            goNext();
          }}
        >
          <FieldGroup>
            <div className="flex flex-col items-center gap-2 text-center">
              <a
                href="#"
                className="flex flex-col items-center gap-2 font-medium"
              >
                <div className="flex items-center justify-center rounded-md">
                  <Image
                    src="/logo.png"
                    width={60}
                    height={60}
                    alt="ClientFlow"
                  />
                </div>
              </a>

              {step === 1 ? (
                <>
                  <h1 className="text-2xl font-semibold font-Inter">
                    About your business
                  </h1>
                  <FieldDescription className="text-[#999999] text-[15px] font-Inter">
                    Tell us about your business so we can personalize your
                    account.
                  </FieldDescription>
                  {/* Optional: show avatar preview based on full name */}
                  {formData.fullName && (
                    <Avatar className="mt-3 h-12 w-12">
                      {/* If later you have profilePictureUrl, put it here */}
                      <AvatarImage src={undefined} alt={formData.fullName} />
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                  )}
                </>
              ) : (
                <>
                  <h1 className="text-2xl font-semibold font-Inter">
                    Brand your workspace
                  </h1>
                  <FieldDescription className="text-[#999999] text-[15px] font-Inter">
                    Upload a logo and pick a portal username to reflect your
                    brand.
                  </FieldDescription>
                </>
              )}
            </div>

            {step === 1 && (
              <>
                <Field>
                  <FieldLabel
                    htmlFor="fullName"
                    className="text-sm font-medium text-black"
                  >
                    Full name
                  </FieldLabel>
                  <Input
                    id="fullName"
                    placeholder="John Doe"
                    className="rounded-[8px] mt-[-7] shadow-sm"
                    required
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                  />
                </Field>

                <Field>
                  <FieldLabel
                    htmlFor="companyName"
                    className="text-sm font-medium text-black"
                  >
                    Company name
                  </FieldLabel>
                  <Input
                    id="companyName"
                    placeholder="Acme Co."
                    className="rounded-[8px] mt-[-7] shadow-sm"
                    required
                    value={formData.companyName}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        companyName: e.target.value,
                      })
                    }
                  />
                </Field>

                <Field>
                  <FieldLabel
                    htmlFor="businessType"
                    className="text-sm font-medium text-black"
                  >
                    Type of business
                  </FieldLabel>
                  <Select
                    value={formData.businessType}
                    onValueChange={(value) =>
                      setFormData({ ...formData, businessType: value })
                    }
                  >
                    <SelectTrigger className="w-full rounded-[8px] mt-[-7] shadow-sm">
                      <SelectValue placeholder="Select an option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="agency">Agency</SelectItem>
                      <SelectItem value="consultancy">Consultancy</SelectItem>
                      <SelectItem value="freelancer">Freelancer</SelectItem>
                      <SelectItem value="legal-services">
                        Legal services
                      </SelectItem>
                      <SelectItem value="firm">Firm</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              </>
            )}

            {step === 2 && (
              <>
                <Field>
                  <FieldLabel
                    htmlFor="logo"
                    className="text-sm font-medium text-black"
                  >
                    Logo
                  </FieldLabel>
                  <div className="mt-[-7]">
                    <label
                      htmlFor="logo"
                      className="flex h-[72px] w-[72px] cursor-pointer flex-col items-center justify-center rounded-[8px] border border-[#E5E5E5] bg-[#FAFAFA] hover:bg-gray-50 transition-colors"
                    >
                      {logoPreview ? (
                        <img
                          src={logoPreview}
                          alt="Logo preview"
                          className="h-full w-full object-cover rounded-[8px]"
                        />
                      ) : (
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="text-[#D4D4D4]"
                        >
                          <path
                            d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15M17 8L12 3M12 3L7 8M12 3V15"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                      <input
                        id="logo"
                        type="file"
                        accept="image/png,image/jpeg,image/jpg"
                        className="hidden"
                        onChange={handleLogoChange}
                      />
                    </label>
                    <p className="mt-2 text-[13px] text-[#999999]">
                      Upload a JPG or PNG file, max 5MB.
                    </p>
                  </div>
                </Field>

                <Field>
                  <FieldLabel
                    htmlFor="customLink"
                    className="text-sm font-medium text-black"
                  >
                    Custom link
                  </FieldLabel>
                  <div className="flex items-center rounded-[8px] border border-[#E5E5E5] bg-white text-sm mt-[-7] overflow-hidden">
                    <Input
                      id="customLink"
                      placeholder="Username"
                      className="border-none shadow-sm rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 flex-1"
                      required
                      value={formData.customLink}
                      onChange={(e) => {
                        const value = e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9-]/g, "");
                        setFormData({ ...formData, customLink: value });
                      }}
                    />
                    <span className="px-3 py-2 text-[#666666] whitespace-nowrap border-l border-[#E5E5E5] bg-white text-sm">
                      .clientflowhq.com
                    </span>
                  </div>
                </Field>
              </>
            )}

            <Field className="mt-2">
              <Button
                type="submit"
                className="bg-button-dark shadow-btn text-white rounded-[8] border border-[#5E6371] w-full font-medium"
                disabled={loading}
              >
                {loading ? "Creating workspace..." : "Continue"}
              </Button>
            </Field>

            <div className="flex justify-center gap-2 mt-6">
              <button
                type="button"
                className={cn(
                  "h-2 w-10 rounded-full transition-colors",
                  step === 1 ? "bg-[#1A1A1A]" : "bg-[#E5E5E5]"
                )}
                onClick={() => setStep(1)}
                disabled={loading}
              />
              <button
                type="button"
                className={cn(
                  "h-2 w-10 rounded-full transition-colors",
                  step === 2 ? "bg-[#1A1A1A]" : "bg-[#E5E5E5]"
                )}
                disabled={loading}
              />
            </div>
          </FieldGroup>
        </form>
      </div>

      <Dialog
        open={surveyOpen}
        onOpenChange={(open) => {
          setSurveyOpen(open);
          if (!open) {
            handleSurveySkipOrClose();
          }
        }}
      >
        <DialogContent className="max-w-md rounded-2xl border border-[#E5E5E5] bg-white">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              How did you find us?
            </DialogTitle>
            <DialogDescription className="text-sm text-[#999999]">
              Help us understand where people discover ClientFlow. You can skip
              this if you’d like.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4">
            <Field>
              <FieldLabel className="text-sm font-medium text-black">
                Choose an option
              </FieldLabel>
              <Select
                value={surveyHowFound}
                onValueChange={(value) => setSurveyHowFound(value)}
              >
                <SelectTrigger className="w-full rounded-[8px] mt-[-7] shadow-sm">
                  <SelectValue placeholder="Select an option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="social-media">Social media</SelectItem>
                  <SelectItem value="ads">Ads</SelectItem>
                  <SelectItem value="search-engine">Search engine</SelectItem>
                  <SelectItem value="llm">LLM / AI assistant</SelectItem>
                  <SelectItem value="word-of-mouth">Word of mouth</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>

          <DialogFooter className="mt-4 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              className="rounded-[8px]"
              onClick={handleSurveySkipOrClose}
              disabled={surveySubmitting}
            >
              Skip
            </Button>
            <Button
              type="button"
              className="bg-button-dark shadow-btn text-white rounded-[8] border border-[#5E5E5E]"
              onClick={handleSurveySubmit}
              disabled={surveySubmitting}
            >
              {surveySubmitting ? "Saving..." : "Continue"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}