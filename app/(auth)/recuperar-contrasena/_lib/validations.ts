import { z } from "zod";

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, {
      message: "El correo electrónico es requerido",
    })
    .email({ message: "El correo electrónico es inválido" }),
});

export type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>;
