import { z } from "zod";

export const loginFormSchema = z.object({
  username: z
    .string()
    .trim()
    .min(1, { message: "El nombre de usuario es requerido" }),
  password: z
    .string()
    .trim()
    .min(8, { message: "La contraseña debe tener al menos 8 caracteres" })
    .max(16, { message: "La contraseña no puede tener más de 16 caracteres" }),
});
