"use server";

import { AuthError } from "next-auth";

import { signIn, signOut } from "@/auth";
import { FormState } from "@/types";
import { loginFormSchema } from "@/types/schemas";

export async function initActions(): Promise<void> {}

export async function authenticate(
  prevState: FormState,
  data: FormData,
): Promise<FormState> {
  const formData = Object.fromEntries(data);
  const parsedFormData = loginFormSchema.safeParse(formData);
  if (!parsedFormData.success) {
    const fields: Record<string, string> = {};
    for (const key of Object.keys(formData)) {
      fields[key] = formData[key].toString();
    }
    return {
      message: "Las credenciales son inválidas",
      fields,
      issues: parsedFormData.error.issues.map((issue) => issue.message),
    };
  }
  try {
    await signIn("credentials", {
      redirectTo: "/",
      ...parsedFormData.data,
    });

    return {
      message: "",
    };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return {
            message: error.message,
            fields: parsedFormData.data,
          };
        default:
          return {
            message: "Algo salió mal. Por favor, intenta de nuevo",
            fields: parsedFormData.data,
          };
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
    redirectTo: "/",
  });
}
