import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/iniciar-sesion",
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      if (isLoggedIn) {
        return true;
      } else {
        return false;
      }
    },
  },
  providers: [],
} satisfies NextAuthConfig;
