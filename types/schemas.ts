import { z } from "zod";

import {
  ACCEPTED_IMAGE_TYPES,
  MAX_FILE_SIZE,
  PASSWORD_VALIDATION_REGEX,
} from "@/constants";

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

export const editProfileSchema = z.object({
  avatar: z.union([
    z
      .custom<File | undefined>()
      .refine((file) => !file || file.size <= MAX_FILE_SIZE, {
        message: "El archivo debe tener un tamaño máximo de 4.5MB",
      })
      .refine((file) => !file || ACCEPTED_IMAGE_TYPES.includes(file.type), {
        message:
          ".jpg, .jpeg, .png, .webp o .gif son los únicos formatos aceptados",
      }),
    z.string(),
    z.null(),
  ]),
  name: z.string().min(1, { message: "El nombre es requerido" }),
  lastName: z.string().min(1, { message: "El apellido es requerido" }),
  username: z.string().min(1, { message: "El nombre de usuario es requerido" }),
  email: z
    .string()
    .trim()
    .min(1, {
      message: "El correo electrónico es requerido",
    })
    .email({ message: "Correo electrónico inválido" }),
  phoneNumber: z.string().optional(),
});
