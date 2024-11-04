"use server";

import { AuthError } from "next-auth";

import { signIn, signOut } from "@/auth";
import { loginFormSchema } from "@/types/schemas";

export async function initActions(): Promise<void> {}

export async function authenticate({
  data,
  redirectTo = "/",
}: {
  data: FormData;
  redirectTo?: string;
}) {
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

export async function loginWithGoogle(): Promise<void> {
  await signIn("google", {
    redirectTo: "/",
  });
}

export async function loginWithInstagram(): Promise<void> {
  await signIn("instagram", {
    redirectTo: "/",
  });
}

export async function logout(): Promise<void> {
  await signOut({
    redirectTo: "/iniciar-sesion",
  });
}
