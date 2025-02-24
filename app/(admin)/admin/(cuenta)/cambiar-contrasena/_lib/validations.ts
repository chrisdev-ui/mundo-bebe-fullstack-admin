import { z } from "zod";

import { PASSWORD_VALIDATION_REGEX } from "@/constants";

export const formSchema = z
  .object({
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
    confirmNewPassword: z
      .string()
      .min(1, {
        message: "La confirmación de la nueva contraseña es requerida",
      })
      .regex(PASSWORD_VALIDATION_REGEX, {
        message:
          "La confirmación de la nueva contraseña no cumple con los requisitos",
      }),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Las nuevas contraseñas no coinciden",
    path: ["confirmNewPassword"],
  });

export type ChangePasswordSchema = z.infer<typeof formSchema>;
