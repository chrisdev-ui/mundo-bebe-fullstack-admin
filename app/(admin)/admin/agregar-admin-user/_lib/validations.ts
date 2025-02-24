import { z } from "zod";

const inviteAdminSchema = z.object({
  name: z.string().min(1, { message: "El nombre es requerido" }),
  email: z
    .string()
    .trim()
    .min(1, {
      message: "El correo electrónico es requerido",
    })
    .email({ message: "Correo electrónico inválido" }),
});

export const formSchema = inviteAdminSchema;

export type InviteAdminSchema = z.infer<typeof inviteAdminSchema>;
