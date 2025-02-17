import { z } from "zod";

import { PASSWORD_VALIDATION_REGEX } from "@/constants";
import { UserRole } from "@/types";

export const userReadSchema = z.object({
  id: z.string().uuid(),
  name: z.string().nullable(),
  lastName: z.string().nullable(),
  username: z.string().nullable(),
  email: z.string().email(),
  emailVerified: z.date().nullable(),
  role: z.nativeEnum(UserRole),
  image: z.string().nullable(),
  phoneNumber: z.string().nullable(),
  dob: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
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

export const userUpdateSchema = z.object({
  name: z
    .string()
    .min(1, { message: "El nombre es requerido" })
    .max(255, {
      message: "El nombre no puede tener más de 255 caracteres",
    })
    .optional(),
  lastName: z
    .string()
    .min(1, { message: "El apellido es requerido" })
    .max(255, {
      message: "El apellido no puede tener más de 255 caracteres",
    })
    .optional(),
  username: z
    .string()
    .min(1, { message: "El nombre de usuario es requerido" })
    .max(255, {
      message: "El nombre de usuario no puede tener más de 255 caracteres",
    })
    .optional(),
  email: z
    .string()
    .email({
      message: "El correo electrónico no es válido",
    })
    .optional(),
  role: z.nativeEnum(UserRole).optional(),
  image: z
    .string()
    .url({ message: "La URL de la imagen no es válida" })
    .optional()
    .nullable(),
  phoneNumber: z.string().optional().nullable(),
  dob: z
    .union([z.date(), z.string().transform((str) => new Date(str)), z.null()])
    .optional(),
});

export const userDeleteSchema = z.object({
  id: z.string().uuid(),
});

export const userListSchema = z.array(userReadSchema);

export const userIdSchema = z.object({
  id: z.string().uuid(),
});

export const changePasswordSchema = z.object({
  currentPassword: z
    .string()
    .min(1, {
      message: "La contraseña actual es requerida",
    })
    .regex(PASSWORD_VALIDATION_REGEX, {
      message: "La contraseña actual no cumple con los requisitos",
    }),
  newPassword: z
    .string()
    .min(1, {
      message: "La nueva contraseña es requerida",
    })
    .regex(PASSWORD_VALIDATION_REGEX, {
      message: "La nueva contraseña no cumple con los requisitos",
    }),
});
