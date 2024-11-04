import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/iniciar-sesion",
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;

      const isAdminRoute = nextUrl.pathname.startsWith("/admin");

      const isAuthFlow =
        nextUrl.pathname.startsWith("/registrarse") ||
        nextUrl.pathname.startsWith("/recuperar-contrasena") ||
        nextUrl.pathname.startsWith("/resetear-contrasena") ||
        nextUrl.pathname.startsWith("/iniciar-sesion");

      if (isAuthFlow && isLoggedIn) {
        return Response.redirect(new URL("/", nextUrl));
      }

      if (isAdminRoute && isLoggedIn) {
        return true;
      }

      if (isAdminRoute && !isLoggedIn) {
        return false;
      }

      return isLoggedIn;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
