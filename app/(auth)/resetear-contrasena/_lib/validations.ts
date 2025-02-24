import { z } from "zod";

import { PASSWORD_VALIDATION_REGEX } from "@/constants";

const resetPasswordSchema = z.object({
  newPassword: z
    .string()
    .min(1, {
      message: "La contraseña es requerida",
    })
    .regex(PASSWORD_VALIDATION_REGEX, {
      message: "La contraseña es inválida",
    }),
  confirmPassword: z
    .string()
    .min(1, {
      message: "La contraseña es requerida",
    })
    .regex(PASSWORD_VALIDATION_REGEX, {
      message: "La contraseña es inválida",
    }),
});

export const formSchema = resetPasswordSchema.refine(
  (data) => data.newPassword === data.confirmPassword,
  {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  },
);

export const actionSchema = resetPasswordSchema
  .extend({
    token: z.string().min(1, { message: "El token es obligatorio" }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export type ResetPasswordSchema = z.infer<typeof actionSchema>;
