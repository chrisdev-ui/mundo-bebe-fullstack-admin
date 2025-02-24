import { z } from "zod";

import { ACCEPTED_IMAGE_TYPES, MAX_FILE_SIZE } from "@/constants";
import { users } from "@/db/schema";

export const formSchema = z.object({
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
  dob: z.date({ message: "La fecha de nacimiento no es válida" }).optional(),
  role: z.enum(users.role.enumValues),
});

export type EditProfileSchema = z.infer<typeof formSchema>;
