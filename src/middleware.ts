import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Public routes
  if (req.nextUrl.pathname === "/" || req.nextUrl.pathname.startsWith("/api/")) {
    return res;
  }

  // Require auth for /app and /admin routes
  if (req.nextUrl.pathname.startsWith("/app") || req.nextUrl.pathname.startsWith("/admin")) {
    if (!session) {
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = "/";
      return NextResponse.redirect(redirectUrl);
    }

    // Check onboarding status for /app routes (but not /onboarding itself)
    if (req.nextUrl.pathname.startsWith("/app") && req.nextUrl.pathname !== "/onboarding") {
      const { data: profile } = await supabase
        .from("profiles")
        .select("onboarding_completed, role")
        .eq("id", session.user.id)
        .single();

      if (profile && !profile.onboarding_completed) {
        const redirectUrl = req.nextUrl.clone();
        redirectUrl.pathname = "/onboarding";
        return NextResponse.redirect(redirectUrl);
      }
    }

    // Admin route protection
    if (req.nextUrl.pathname.startsWith("/admin")) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();

      if (profile?.role !== "admin") {
        const redirectUrl = req.nextUrl.clone();
        redirectUrl.pathname = "/app/dashboard";
        return NextResponse.redirect(redirectUrl);
      }
    }
  }

  // Redirect authenticated users away from onboarding if already completed
  if (req.nextUrl.pathname === "/onboarding" && session) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("onboarding_completed")
      .eq("id", session.user.id)
      .single();

    if (profile?.onboarding_completed) {
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = "/app/dashboard";
      return NextResponse.redirect(redirectUrl);
    }
  }

  return res;
}

export const config = {
  matcher: ["/app/:path*", "/admin/:path*", "/onboarding"],
};