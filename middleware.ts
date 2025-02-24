import { NextResponse } from "next/server";
import NextAuth from "next-auth";
import { getToken } from "next-auth/jwt";

import { authConfig } from "@/auth.config";
import { AdminPaths, AuthPaths, PublicPaths } from "@/constants";
import { env } from "@/env";
import { isAdminPath, isAuthFlowPath, isProtectedPath } from "@/lib/utils";
import { UserRole } from "./types/enum";

const redirect = (origin: string, destination: string) => {
  const targetUrl = new URL(`${origin}${destination}`);
  return NextResponse.redirect(targetUrl);
};

export default NextAuth(authConfig).auth(async (request) => {
  const { pathname, origin } = request.nextUrl;
  const { auth: nextauth } = request;

  const isLoggedIn = !!nextauth?.user;

  const session = await getToken({ req: request, secret: env.AUTH_SECRET });

  const requestHeaders = new Headers(request.headers);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  const isAdminRoute = isAdminPath(pathname);
  const isAuthRoute = isAuthFlowPath(pathname);
  const isProtectedRoute = isProtectedPath(pathname);
  const needsAuthentication = isAuthRoute || isProtectedRoute;

  if (isAuthRoute && !isLoggedIn) {
    return response;
  }

  if (needsAuthentication && !isLoggedIn) {
    return redirect(origin, AuthPaths.LOGIN);
  }

  if (isAuthRoute && isLoggedIn) {
    if (
      session?.user?.role === UserRole.SUPER_ADMIN ||
      session?.user?.role === UserRole.ADMIN
    ) {
      return redirect(origin, AdminPaths.ADMIN_PANEL);
    }
    return redirect(origin, PublicPaths.HOME);
  }

  if (isAdminRoute && isLoggedIn) {
    if (
      session?.user?.role === UserRole.SUPER_ADMIN ||
      session?.user?.role === UserRole.ADMIN
    ) {
      return response;
    }
    return redirect(origin, PublicPaths.HOME);
  }

  return response;
});

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|auth|favicon.ico|sitemap.xml|robots.txt|images|$).*)",
  ],
};
