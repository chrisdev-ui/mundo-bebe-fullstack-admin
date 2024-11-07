import { z } from "zod";

import { PASSWORD_VALIDATION_REGEX } from "@/constants";

export const getUserSchema = z.object({
  name: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email().optional(),
  id: z.string().optional(),
  username: z.string().optional(),
});

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, {
      message: "Correo electrónico es obligatorio",
    })
    .email({
      message: "Correo electrónico inválido",
    }),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, { message: "El token es obligatorio" }),
  newPassword: z
    .string()
    .min(1, {
      message: "La contraseña es requerida",
    })
    .regex(PASSWORD_VALIDATION_REGEX, {
      message: "La contraseña no cumple con los requisitos",
    }),
  confirmNewPassword: z
    .string()
    .min(1, {
      message: "La confirmación de la contraseña es requerida",
    })
    .regex(PASSWORD_VALIDATION_REGEX, {
      message: "Las confirmación de la contraseña no cumple con los requisitos",
    }),
});
