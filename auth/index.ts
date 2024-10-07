import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { compare } from "bcrypt-ts";
import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";

import { authConfig } from "@/auth.config";
import db from "@/db/drizzle";
import { getUserByEmailOrUsername, getUserById } from "@/server/lib/users";
import { loginSchema } from "@/server/schemas";

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
      session.user.id = token?.sub as string;
      session.user.role = token?.user?.role;

      return session;
    },
    async jwt({ token }) {
      const userInfo = await getUserById(token?.sub as string);
      return {
        ...token,
        user: {
          ...(token.user ?? {}),
          ...userInfo,
        },
      };
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

        const isMatched = await compare(password, user.password);

        if (!isMatched) {
          throw new CredentialsSignin("Contraseña incorrecta");
        }

        const { password: _, ...userData } = user;

        return userData;
      },
    }),
  ],
});
