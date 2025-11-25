import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // JWT token read (edge-safe)
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });
  // token null => not logged in

  type RoutePrefix = `/${string}/`;
  const authRoutePrefix = ["/sign-in", "/sign-up"];
  const protectedRoutePrefix: RoutePrefix[] = ["/dashboard/"];

  const isAuthRoute = authRoutePrefix.some((prefix) =>
    pathname.startsWith(prefix)
  );

  const isProtectedRoute =
    pathname === "/dashboard" ||
    protectedRoutePrefix.some((prefix) => pathname.startsWith(prefix));

  // 🔐 Block access to protected routes if no session
  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  // 🔐 Redirect signed-in users away from auth pages
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // ✅ Role-specific protection
  const forbiddenRoutesForObserver = ["/dashboard/user", "/dashboard/stations"];

  const role = (token as any)?.role;

  if (
    role === "observer" &&
    forbiddenRoutesForObserver.some((route) => pathname.startsWith(route))
  ) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
