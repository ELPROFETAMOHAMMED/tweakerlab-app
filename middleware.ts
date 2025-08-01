import { type NextRequest, NextResponse } from "next/server";
import { PROTECTED_ROUTES, ADMIN_ROUTES, AUTH_ROUTES } from "@/constants/navigation";
import { createClient } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const { pathname } = request.nextUrl;

  // Do not process authentication routes (pages and API)
  if (AUTH_ROUTES.includes(pathname) || pathname.startsWith("/api/auth/")) {
    return response;
  }

  const supabase = createClient(request, response);

  // API: protect everything except /api/auth/*
  if (pathname.startsWith("/api/") && !pathname.startsWith("/api/auth/")) {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return response;
  }

  // Verify session
  const { data: { user }, error: userError } = await supabase.auth.getUser();


  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );
  const isAdminRoute = ADMIN_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  // Redirige a login si intenta acceder a rutas protegidas sin login
  if (!user && isProtectedRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // If user is logged in, get profile
  if (user) {
    const { data: profile, error: profileError } = await supabase
      .from("profile")
      .select("has_scanned_pc, role")
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.error("Middleware - Profile error:", profileError);
      // Si no se puede obtener el perfil, no bloquear el acceso
      return response;
    }

    // Redirige a onboarding si no ha escaneado su PC
    if (profile && !profile.has_scanned_pc && pathname !== "/onboarding") {
      return NextResponse.redirect(new URL("/onboarding", request.url));
    }

    // Evita que se quede atrapado en onboarding
    if (profile?.has_scanned_pc && pathname === "/onboarding") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // Admin route: redirige si no es admin
    if (isAdminRoute && profile?.role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
