import { TRPC_ERROR_CODE_KEY } from "@trpc/server/rpc";

type ErrorConfig = {
  code: TRPC_ERROR_CODE_KEY;
  message: string;
};

export const ERRORS = {
  // Auth errors
  UNAUTHORIZED: {
    code: "UNAUTHORIZED",
    message: "No estás autorizado para realizar esta acción",
  },
  INVALID_CREDENTIALS: {
    code: "UNAUTHORIZED",
    message: "Las credenciales proporcionadas son inválidas",
  },

  // JWT errors
  INVALID_JWT: {
    code: "UNAUTHORIZED",
    message: "El token no es válido o ha caducado",
  },
  JWT_USER_NOT_FOUND: {
    code: "NOT_FOUND",
    message: "No se encontró el usuario con el token proporcionado",
  },

  // User errors
  USER_NOT_FOUND: {
    code: "NOT_FOUND",
    message: "Usuario no encontrado",
  },
  USER_EXISTS: {
    code: "CONFLICT",
    message: "Este usuario ya existe",
  },
  INVALID_PASSWORD: {
    code: "BAD_REQUEST",
    message: "La contraseña actual es incorrecta",
  },
  SAME_PASSWORD: {
    code: "BAD_REQUEST",
    message: "La nueva contraseña debe ser diferente a la actual",
  },
  PASSWORD_MISMATCH: {
    code: "BAD_REQUEST",
    message: "Las contraseñas no coinciden",
  },
  INVALID_PASSWORD_LENGTH: {
    code: "BAD_REQUEST",
    message: "La contraseña debe tener entre 8 y 16 caracteres",
  },
  INVALID_ROLE: {
    code: "BAD_REQUEST",
    message: "El rol especificado no es válido",
  },
  USER_NOT_ALLOWED_TO_CHANGE_PASSWORD: {
    code: "CONFLICT",
    message: "El usuario no puede cambiar su contraseña",
  },
  INVITATION_ALREADY_ACTIVE: {
    code: "CONFLICT",
    message: "Este usuario ya tiene una invitación activa",
  },
  SUPER_ADMIN_SELF_DELETE: {
    code: "FORBIDDEN",
    message: "Un Super Admin no puede eliminar su propia cuenta",
  },
  ADMIN_DELETE_UNAUTHORIZED: {
    code: "FORBIDDEN",
    message:
      "Los administradores solo pueden eliminar su propia cuenta o cuentas de usuarios y huéspedes",
  },
  USER_DELETE_UNAUTHORIZED: {
    code: "FORBIDDEN",
    message: "Solo puedes eliminar tu propia cuenta",
  },

  // Validation errors
  INVALID_INPUT: {
    code: "BAD_REQUEST",
    message: "Los datos proporcionados son inválidos",
  },
  REQUIRED_FIELDS: {
    code: "BAD_REQUEST",
    message: "Todos los campos son requeridos",
  },

  // Rate limiting
  PASSWORD_CHANGE_COOLDOWN: (minutes: number): ErrorConfig => ({
    code: "TOO_MANY_REQUESTS",
    message: `La contraseña no puede ser cambiada. Por favor espera ${minutes} minutos antes de intentar nuevamente.`,
  }),

  // Generic errors
  INTERNAL_SERVER_ERROR: {
    code: "INTERNAL_SERVER_ERROR",
    message: "Ha ocurrido un error inesperado. Por favor, inténtalo de nuevo",
  },
  OPERATION_FAILED: {
    code: "INTERNAL_SERVER_ERROR",
    message: "La operación no pudo completarse",
  },
} as const;

export const SUCCESS_MESSAGES = {
  PASSWORD_CHANGED: "¡Contraseña actualizada con éxito! 🔐",
  FORGOT_PASSWORD:
    "¡Se ha enviado un correo electrónico con el enlace de restablecimiento de contraseña! 📧",
  USER_GET: "¡Usuario obtenido con éxito! 🚀",
  PROFILE_UPDATED: "¡Perfil actualizado con éxito! 🚀",
  USER_DELETED: "El usuario ha sido eliminado exitosamente ✅",
  USER_CREATED: "¡Usuario creado con éxito! 🚀",
  INVITATION_SENT: "¡Invitación enviada exitosamente! 🚀",
} as const;
