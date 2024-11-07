import { z } from "zod";

export const loginFormSchema = z.object({
  username: z.string().trim().min(1, {
    message: "El nombre de usuario o correo electrónico es requerido",
  }),
  password: z
    .string()
    .trim()
    .min(8, { message: "La contraseña debe tener al menos 8 caracteres" }),
});

export const inviteAdminSchema = z.object({
  name: z.string().min(1, { message: "El nombre es requerido" }),
  email: z.string().email({ message: "Correo electrónico inválido" }),
});
