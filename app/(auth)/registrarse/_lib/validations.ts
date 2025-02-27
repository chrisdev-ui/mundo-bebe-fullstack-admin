import { z } from "zod";

import { PASSWORD_VALIDATION_REGEX } from "@/constants";
import { UserRoleValues } from "@/db/schema";

const baseSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { message: "El nombre es requerido" })
    .max(50, {
      message: "El nombre no puede tener más de 50 caracteres",
    }),
  lastName: z
    .string()
    .trim()
    .min(1, { message: "El apellido es requerido" })
    .max(50, {
      message: "El apellido no puede tener más de 50 caracteres",
    }),
  email: z
    .string()
    .trim()
    .min(1, {
      message: "El correo electrónico es requerido",
    })
    .email({ message: "El correo electrónico es inválido" }),
  password: z
    .string()
    .min(1, { message: "La contraseña es requerida" })
    .regex(PASSWORD_VALIDATION_REGEX, {
      message: "La contraseña no cumple con los requisitos",
    }),
  confirmPassword: z
    .string()
    .min(1, {
      message: "La contraseña es requerida",
    })
    .regex(PASSWORD_VALIDATION_REGEX, {
      message: "La contraseña no cumple con los requisitos",
    }),
  role: z.literal(UserRoleValues.USER),
});

export const formSchema = baseSchema.refine(
  (data) => data.password === data.confirmPassword,
  {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  },
);

export const actionSchema = baseSchema
  .extend({
    username: z.string().optional(),
    image: z
      .string()
      .url({ message: "La URL de la imagen no es válida" })
      .optional(),
    phoneNumber: z.string().optional(),
    dob: z.date({ message: "La fecha de nacimiento no es válida" }).optional(),
    code: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export type RegisterSchema = z.infer<typeof actionSchema>;
