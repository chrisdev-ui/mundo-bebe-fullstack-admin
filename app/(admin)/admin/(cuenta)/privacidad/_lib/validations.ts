import { z } from "zod";

export const formSchema = z.object({
  emailConfirmation: z
    .string()
    .min(1, { message: "El correo electrónico es requerido" })
    .email({ message: "Correo electrónico inválido" }),
});

export type DeleteAccountSchema = z.infer<typeof formSchema>;
