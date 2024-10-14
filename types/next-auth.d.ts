import { DefaultSession } from "next-auth";

import { AuthUser } from "@/types";

import "next-auth/jwt";

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: DefaultSession["user"] & AuthUser;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    user: AuthUser | null;
  }
}
