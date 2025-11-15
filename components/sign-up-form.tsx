// components/auth/SignUpForm.tsx
"use client"

import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"

export function SignUpForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  // ➜ EMAIL SIGNUP WITH 6-DIGIT OTP FLOW
  const handleEmailSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    try {
      // 1️⃣ Create auth user and trigger OTP email
      const { data: signupData, error: signupError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          // optional: add metadata here if needed later
          // data: { full_name: fullName }
          // for OTP we don't actually need emailRedirectTo
          emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
        },
      })

      if (signupError) {
        console.error("Signup error:", signupError)
        toast.error(`Failed to create account: ${signupError.message}`)
        return
      }

      // 2️⃣ Insert into your own users table (optional, like before)
      if (signupData.user) {
        try {
          await fetch("/api/users/insert", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: signupData.user.id,
              email: signupData.user.email,
              // full_name: fullName, // if you add this field to the form
            }),
          })
        } catch (err) {
          console.error("Failed to insert user into db:", err)
          // don't block flow
        }
      }

      // 3️⃣ Handle verification flow
      if (signupData.user && !signupData.user.email_confirmed_at) {
        // Supabase sends a 6-digit code to their email (type: "signup")
        toast.success("We've sent you a 6-digit code. Check your email.")
        router.push(`/auth/verify?email=${encodeURIComponent(email)}`)
      } else if (signupData.user && signupData.user.email_confirmed_at) {
        // Edge case: user already confirmed
        toast.success("Account created!")
        router.push("/auth/callback")
      } else {
        toast.success("Account created! Please verify your email.")
        router.push(`/auth/verify?email=${encodeURIComponent(email)}`)
      }
    } catch (err) {
      console.error("Signup error:", err)
      toast.error("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // ➜ GOOGLE SIGNUP (still goes to /auth/callback)
  const handleGoogleSignup = async () => {
    try {
      setGoogleLoading(true)

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
          redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
        },
      })

      if (error) {
        throw new Error(error.message)
      }

      // No need to do anything else: browser will redirect to Google,
      // then back to /auth/callback, which will decide where to send them.
    } catch (err) {
      if (err instanceof Error) {
        console.error("Google login error:", err.message)
        toast.error(err.message)
      } else {
        console.error("Google login error:", err)
        toast.error("Something went wrong with Google login.")
      }
    } finally {
      setGoogleLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form onSubmit={handleEmailSignup}>
        <FieldGroup>
          <div className="flex flex-col items-center gap-2 text-center">
            <a
              href="#"
              className="flex flex-col items-center gap-2 font-medium"
            >
              <div className="flex items-center justify-center rounded-md">
                <Image src="/logo.png" width={60} height={60} alt="ClientFlow" />
              </div>
            </a>
            <h1 className="text-2xl font-semibold font-Inter">
              Try ClientFlow for free
            </h1>
            <FieldDescription className="text-[#ACACAC] text-md font-Inter">
              Start your 7-day free trial
            </FieldDescription>
          </div>

          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="m@example.com"
              required
              className="rounded-[8]"
            />

            <FieldLabel htmlFor="password" className="mt-4">
              Password
            </FieldLabel>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="**************"
              required
              minLength={6}
              className="rounded-[8]"
            />
          </Field>

          <Field>
            <Button
              type="submit"
              className="bg-button-dark shadow-btn text-white rounded-[8] border border-[#5E6371] w-full font-medium"
              disabled={loading}
            >
              {loading ? "Creating account..." : "Create an account"}
            </Button>
          </Field>

          <FieldSeparator>OR</FieldSeparator>

          <Field className="grid gap-4 sm:grid-cols-1">
            <Button
              variant="outline"
              type="button"
              className="rounded-[8px] flex items-center gap-2 font-Inter font-light-300 justify-center"
              onClick={handleGoogleSignup}
              disabled={googleLoading}
            >
              {/* Google icon */}
              <svg
                viewBox="-0.5 0 48 48"
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5"
              >
                <g fill="none" fillRule="evenodd">
                  <g transform="translate(-401, -860)">
                    <g transform="translate(401, 860)">
                      <path
                        fill="#FBBC05"
                        d="M9.82727273,24 C9.82727273,22.4757333 10.0804318,21.0144 10.5322727,19.6437333 L2.62345455,13.6042667 C1.08206818,16.7338667 0.213636364,20.2602667 0.213636364,24 C0.213636364,27.7365333 1.081,31.2608 2.62025,34.3882667 L10.5247955,28.3370667 C10.0772273,26.9728 9.82727273,25.5168 9.82727273,24"
                      />
                      <path
                        fill="#EB4335"
                        d="M23.7136364,10.1333333 C27.025,10.1333333 30.0159091,11.3066667 32.3659091,13.2266667 L39.2022727,6.4 C35.0363636,2.77333333 29.6954545,0.533333333 23.7136364,0.533333333 C14.4268636,0.533333333 6.44540909,5.84426667 2.62345455,13.6042667 L10.5322727,19.6437333 C12.3545909,14.112 17.5491591,10.1333333 23.7136364,10.1333333"
                      />
                      <path
                        fill="#34A853"
                        d="M23.7136364,37.8666667 C17.5491591,37.8666667 12.3545909,33.888 10.5322727,28.3562667 L2.62345455,34.3946667 C6.44540909,42.1557333 14.4268636,47.4666667 23.7136364,47.4666667 C29.4455,47.4666667 34.9177955,45.4314667 39.0249545,41.6181333 L31.5177727,35.8144 C29.3995682,37.1488 26.7323182,37.8666667 23.7136364,37.8666667"
                      />
                      <path
                        fill="#4285F4"
                        d="M46.1454545,24 C46.1454545,22.6133333 45.9318182,21.12 45.6113636,19.7333333 L23.7136364,19.7333333 L23.7136364,28.8 L36.3181818,28.8 C35.6879545,31.8912 33.9724545,34.2677333 31.5177727,35.8144 L39.0249545,41.6181333 C43.3393409,37.6138667 46.1454545,31.6490667 46.1454545,24"
                      />
                    </g>
                  </g>
                </g>
              </svg>
              {googleLoading ? "Continuing..." : "Continue with Google"}
            </Button>
          </Field>
        </FieldGroup>
      </form>

      <FieldDescription className="px-6 text-center text-[#ACACAC]">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </FieldDescription>
    </div>
  )
}