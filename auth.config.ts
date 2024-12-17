import type { NextAuthConfig } from "next-auth";
import { getToken } from "next-auth/jwt";

import { AuthPaths, PublicPaths } from "./constants";
import {
  isAdminPath,
  isAuthFlowPath,
  isNextPath,
  isProtectedPath,
  isPublicPath,
} from "./lib/utils";
import { UserRole } from "./types";

export const authConfig = {
  pages: {
    signIn: AuthPaths.LOGIN,
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async authorized({ request }) {
      const { nextUrl } = request;
      const session = await getToken({
        req: request,
        secret: process.env.AUTH_SECRET,
      });

      const isLoggedIn = !!session?.user;
      const isAdminRoute = isAdminPath(nextUrl.pathname);
      const isAuthRoute = isAuthFlowPath(nextUrl.pathname);
      const isPublicRoute = isPublicPath(nextUrl.pathname);
      const isProtectedRoute = isProtectedPath(nextUrl.pathname);
      const isNextRoute = isNextPath(nextUrl.pathname);
      const needsAuthentication = isAuthRoute || isProtectedRoute;

      if (isNextRoute || isPublicRoute) {
        return true;
      }

      if (needsAuthentication && !isLoggedIn) {
        return false;
      }

      if (isAuthRoute && isLoggedIn) {
        return Response.redirect(new URL(PublicPaths.HOME, nextUrl));
      }

      if (isAdminRoute && isLoggedIn) {
        if (
          session.user?.role === UserRole.SUPER_ADMIN ||
          session.user?.role === UserRole.ADMIN
        ) {
          return true;
        }
        return Response.redirect(new URL(PublicPaths.HOME, nextUrl));
      }

      return isLoggedIn;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
