import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export async function middleware(request: NextRequest) {
  const session = getSessionCookie(request);

  const { pathname } = request.nextUrl;

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
  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  // 🔐 Redirect signed-in users away from auth pages
  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // ✅ Role-specific protection starts here
  const forbiddenRoutesForObserver = ["/dashboard/user", "/dashboard/stations"];

  if (
    session?.user?.role === "observer" &&
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
