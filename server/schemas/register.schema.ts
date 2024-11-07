import { z } from "zod";

import { PASSWORD_VALIDATION_REGEX } from "@/constants";

export const userCreateSchema = z.object({
  name: z.string().min(1, { message: "El nombre es requerido" }).max(50, {
    message: "El nombre no puede tener más de 50 caracteres",
  }),
  lastName: z.string().min(1, { message: "El apellido es requerido" }).max(50, {
    message: "El apellido no puede tener más de 50 caracteres",
  }),
  email: z
    .string()
    .min(1, {
      message: "El correo electrónico es obligatorio",
    })
    .email({
      message: "El correo electrónico no es válido",
    }),
  password: z
    .string()
    .min(1, {
      message: "La contraseña es obligatoria",
    })
    .regex(PASSWORD_VALIDATION_REGEX, {
      message: "La contraseña no cumple con los requisitos",
    }),
  confirmPassword: z
    .string()
    .min(1, {
      message: "La confirmación de contraseña es obligatoria",
    })
    .regex(PASSWORD_VALIDATION_REGEX, {
      message: "La confirmación de la contraseña no cumple con los requisitos",
    }),
  role: z.enum(["USER", "ADMIN", "GUEST"]),
});
