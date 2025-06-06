import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
        },
      },
    },
  )

  // Refresh session if expired
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Allow public access to landing page and auth routes
  if (
    request.nextUrl.pathname === "/" ||
    request.nextUrl.pathname.startsWith("/auth/") ||
    request.nextUrl.pathname.startsWith("/_next/") ||
    request.nextUrl.pathname.includes(".")
  ) {
    return supabaseResponse
  }

  // If no user and trying to access protected routes, redirect to sign in
  if (!user) {
    return NextResponse.redirect(new URL("/auth/signin", request.url))
  }

  // Get user profile to check role
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  // Protect admin routes
  if (request.nextUrl.pathname.startsWith("/admin")) {
    if (profile?.role !== "admin") {
      return NextResponse.redirect(new URL("/resident", request.url))
    }
  }

  // Protect resident routes
  if (request.nextUrl.pathname.startsWith("/resident")) {
    if (profile?.role !== "resident" && profile?.role !== "admin") {
      return NextResponse.redirect(new URL("/admin", request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
