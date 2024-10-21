import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/iniciar-sesion",
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isAdminRoute =
        nextUrl.pathname.startsWith("/admin") ||
        nextUrl.pathname.startsWith("/super-admin");

      if (isAdminRoute) {
        if (isLoggedIn) {
          return true;
        } else {
          return Response.redirect(new URL("/", nextUrl));
        }
      } else {
        return isLoggedIn;
      }
    },
  },
  providers: [],
} satisfies NextAuthConfig;
