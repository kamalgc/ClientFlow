// app/api/user/getProfile/route.ts
import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"

type ProfileResponse = {
  id: string
  email: string
  full_name: string | null
  bio: string | null          // virtual, not stored in table
  company_name: string | null
  business_type:
    | "agency"
    | "consultancy"
    | "freelancer"
    | "legal-services"
    | "firm"
    | null
  how_found:
    | "social-media"
    | "ads"
    | "search-engine"
    | "llm"
    | "word-of-mouth"
    | null
  logo_url: string | null
  profile_picture_url: string | null
  custom_link: string | null
  onboarding_completed: boolean
  plan: string | null         // virtual, not stored in table
}

// ---------- GET /api/user/getProfile ----------
// app/api/user/getProfile/route.ts

export async function GET(_req: NextRequest) {
  try {
    const cookieStore = await cookies()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: (cookiesToSet) => {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )

    // ... rest of your code
  } catch (err) {
    console.error("GET /api/user/getProfile error:", err)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}


// ---------- PUT /api/user/getProfile ----------
export async function PUT(req: NextRequest) {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const body = await req.json()

  const fullName: string | undefined = body.fullName
  const email: string | undefined = body.email
  const profilePictureUrl: string | null | undefined = body.profilePictureUrl

  if (!fullName || !email) {
    return NextResponse.json(
      { error: "fullName and email are required" },
      { status: 400 }
    )
  }

  // 1) Update auth email if changed
  if (email !== user.email) {
    const { error: updateAuthError } = await supabase.auth.updateUser({ email })

    if (updateAuthError) {
      console.error("Error updating auth email:", updateAuthError)
      return NextResponse.json(
        { error: "Failed to update email" },
        { status: 400 }
      )
    }
  }

  // 2) Update public.users (only existing columns!)
  const { data, error } = await supabase
    .from("users")
    .update({
      full_name: fullName,
      email,
      logo_url: profilePictureUrl ?? null,
    })
    .eq("id", user.id)
    .select(
      `
        id,
        email,
        full_name,
        company_name,
        business_type,
        how_found,
        logo_url,
        custom_link,
        onboarding_completed
      `
    )
    .maybeSingle()

  if (error || !data) {
    console.error("Error updating profile:", error)
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    )
  }

  const response: ProfileResponse = {
    id: data.id,
    email: data.email,
    full_name: data.full_name,
    bio: null, // still virtual
    company_name: data.company_name,
    business_type: (data.business_type as any) ?? null,
    how_found: (data.how_found as any) ?? null,
    logo_url: data.logo_url,
    profile_picture_url: data.logo_url,
    custom_link: data.custom_link,
    onboarding_completed: data.onboarding_completed ?? false,
    plan: "Free Plan",
  }

  return NextResponse.json(response)
}