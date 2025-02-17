import { z } from "zod";

import { PASSWORD_VALIDATION_REGEX } from "@/constants";
import { UserRole } from "@/types";

export const userCreateSchema = z
  .object({
    name: z.string().min(1, { message: "El nombre es requerido" }).max(255, {
      message: "El nombre no puede tener más de 255 caracteres",
    }),
    lastName: z
      .string()
      .min(1, { message: "El apellido es requerido" })
      .max(255, {
        message: "El apellido no puede tener más de 255 caracteres",
      }),
    username: z.string().optional(),
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
        message:
          "La confirmación de la contraseña no cumple con los requisitos",
      }),
    role: z.nativeEnum(UserRole).default(UserRole.USER),
    image: z
      .string()
      .url({ message: "La URL de la imagen no es válida" })
      .optional(),
    phoneNumber: z.string().optional(),
    dob: z
      .string()
      .refine((date) => !isNaN(Date.parse(date)), {
        message: "La fecha de nacimiento debe ser una fecha válida",
      })
      .optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });
