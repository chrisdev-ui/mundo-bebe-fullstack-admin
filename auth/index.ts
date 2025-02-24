import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { compare } from "bcrypt-ts";
import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import Instagram from "next-auth/providers/instagram";
import { z } from "zod";

import { authConfig } from "@/auth.config";
import db from "@/db/drizzle";
import { getUserByEmailOrUsername, getUserById } from "@/lib/users";

const loginSchema = z.object({
  username: z.string(),
  password: z.string(),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: DrizzleAdapter(db),
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
  },
  callbacks: {
    async session({ session, token }) {
      if (token.user) {
        session.user = {
          ...session.user,
          ...token.user,
          email: token.user.email as string,
        };
      }

      return session;
    },
    async jwt({ token, user, session, trigger }) {
      if (trigger === "update") {
        return {
          ...token,
          user: {
            ...token.user,
            ...session.user,
          },
        };
      }
      if (user) {
        const userInfo = await getUserById(user.id as string);
        if (!userInfo) {
          throw new Error("No se pudo recuperar el usuario");
        }
        const { password: _, ...userInfoWithoutPassword } = userInfo;
        token = {
          ...token,
          user: {
            ...userInfoWithoutPassword,
          },
        };
      }

      if (token.sub) {
        const userInfo = await getUserById(token.sub);
        if (!userInfo) {
          throw new Error("No se pudo recuperar el usuario");
        }
        const { password: _, ...userInfoWithoutPassword } = userInfo;
        token = {
          ...token,
          user: {
            ...token.user,
            ...userInfoWithoutPassword,
          },
        };
      }

      return token;
    },
  },
  providers: [
    Credentials({
      credentials: {
        username: { label: "Username" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsedCredentials = loginSchema.safeParse(credentials);

        if (!parsedCredentials.success) {
          throw new CredentialsSignin("Las credenciales son inválidas");
        }

        const { username, password } = parsedCredentials.data;
        const user = await getUserByEmailOrUsername(username);

        if (!user) {
          throw new CredentialsSignin("Usuario no encontrado");
        }

        const isMatched = await compare(password, user.password as string);

        if (!isMatched) {
          throw new CredentialsSignin("Contraseña incorrecta");
        }

        const { password: _, ...userData } = user;

        return userData;
      },
    }),
    Google,
    Instagram,
  ],
});
