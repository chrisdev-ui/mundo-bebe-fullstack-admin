"use server";

import { del } from "@vercel/blob";
import { AuthError } from "next-auth";

import { signIn, signOut } from "@/auth";
import { AuthPaths, PublicPaths } from "@/constants";
import { env } from "@/env";
import { loginFormSchema } from "@/types/schemas";
import { composeMiddleware, withRateLimit } from "./middleware";

export async function initActions(): Promise<void> {}

interface AuthenticateInput {
  data: FormData;
  redirectTo?: string;
}

async function authenticateBase({
  data,
  redirectTo = PublicPaths.HOME,
}: AuthenticateInput) {
  const formData = Object.fromEntries(data);
  const parsedFormData = loginFormSchema.safeParse(formData);
  if (!parsedFormData.success) {
    throw new Error("Las credenciales son inválidas");
  }
  try {
    await signIn("credentials", {
      ...parsedFormData.data,
      redirectTo,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      if (error.type === "CredentialsSignin") {
        throw new Error(`${error.message.split(".")[0]}.`);
      }
    }
    throw error;
  }
}

export const authenticate = composeMiddleware<AuthenticateInput, void>(
  withRateLimit({
    requests: 5,
    duration: "1m",
    identifier: (input: AuthenticateInput) => {
      const email = input.data.get("email") as string;
      return `auth:${email}`;
    },
  }),
)(authenticateBase);

export async function loginWithGoogle(): Promise<void> {
  await signIn("google", {
    redirectTo: PublicPaths.HOME,
  });
}

export async function loginWithInstagram(): Promise<void> {
  await signIn("instagram", {
    redirectTo: PublicPaths.HOME,
  });
}

export async function logout(): Promise<void> {
  await signOut({
    redirectTo: AuthPaths.LOGIN,
  });
}

export async function deleteBlob(blobUrl: string): Promise<void> {
  try {
    await del(blobUrl, {
      token: env.BLOB_READ_WRITE_TOKEN,
    });
  } catch (error) {
    throw error;
  }
}
