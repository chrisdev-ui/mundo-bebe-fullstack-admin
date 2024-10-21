import { z } from "zod";

export const getUserSchema = z.object({
  name: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email().optional(),
  id: z.string().optional(),
  username: z.string().optional(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  token: z.string(),
  newPassword: z
    .string()
    .min(8, { message: "La contraseña debe tener al menos 8 caracteres" })
    .max(16, { message: "La contraseña no puede tener más de 16 caracteres" }),
});
