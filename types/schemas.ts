import { z } from "zod";

import { PASSWORD_VALIDATION_REGEX } from "@/constants";

export const loginFormSchema = z.object({
  username: z.string().trim().min(1, {
    message: "El nombre de usuario o correo electrónico es requerido",
  }),
  password: z
    .string()
    .trim()
    .min(1, { message: "La contraseña es requerida" })
    .regex(PASSWORD_VALIDATION_REGEX, {
      message: "La contraseña es inválida",
    }),
});

export const inviteAdminSchema = z.object({
  name: z.string().min(1, { message: "El nombre es requerido" }),
  email: z
    .string()
    .trim()
    .min(1, {
      message: "El correo electrónico es requerido",
    })
    .email({ message: "Correo electrónico inválido" }),
});
