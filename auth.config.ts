import type { NextAuthConfig } from "next-auth";

import { AuthPaths } from "@/constants";
import { env } from "@/env";

export const authConfig = {
  pages: {
    signIn: AuthPaths.LOGIN,
  },
  secret: env.AUTH_SECRET,
  providers: [],
} satisfies NextAuthConfig;
