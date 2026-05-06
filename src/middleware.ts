import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          response.cookies.set(name, value, options);
        },
        remove(name: string, options: any) {
          response.cookies.delete(name);
        },
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();

  // Protect /app routes
  if (request.nextUrl.pathname.startsWith("/app")) {
    if (!session) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    // Check onboarding for /app routes (except /app/onboarding)
    if (request.nextUrl.pathname !== "/onboarding") {
      const { data: profile } = await supabase
        .from("profiles")
        .select("onboarding_completed")
        .eq("id", session.user.id)
        .single();

      if (profile && !profile.onboarding_completed) {
        return NextResponse.redirect(new URL("/onboarding", request.url));
      }
    }
  }

  // Protect /admin routes
  if (request.nextUrl.pathname.startsWith("/admin")) {
    if (!session) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.redirect(new URL("/app/dashboard", request.url));
    }
  }

  // Protect /onboarding
  if (request.nextUrl.pathname === "/onboarding") {
    if (!session) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("onboarding_completed")
      .eq("id", session.user.id)
      .single();

    if (profile?.onboarding_completed) {
      return NextResponse.redirect(new URL("/app/dashboard", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ["/app/:path*", "/admin/:path*", "/onboarding"],
};