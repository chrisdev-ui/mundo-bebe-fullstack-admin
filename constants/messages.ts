export const ERRORS = {
  // Auth errors
  UNAUTHORIZED: "No estás autorizado para realizar esta acción",
  INVALID_CREDENTIALS: "Las credenciales proporcionadas son inválidas",
  TOO_MANY_REQUESTS:
    "Demasiados intentos de acceso. Por favor, inténtalo de nuevo más tarde",
  UNAUTHENTICATED:
    "No se ha encontrado un token de sesión válido para realizar esta acción",

  // JWT errors
  INVALID_JWT: "El token no es válido o ha caducado",
  JWT_USER_NOT_FOUND: "No se encontró el usuario con el token proporcionado",

  // User errors
  USER_NOT_FOUND: "Usuario no encontrado",
  FORBIDDEN: "No tienes permisos para realizar esta acción",
  EMAIL_ALREADY_EXISTS: "Ya existe un usuario con este correo electrónico",
  USER_EXISTS: "Este usuario ya existe",
  INVALID_PASSWORD: "La contraseña actual es incorrecta",
  SAME_PASSWORD: "La nueva contraseña debe ser diferente a la actual",
  PASSWORD_MISMATCH: "Las contraseñas no coinciden",
  INVALID_PASSWORD_LENGTH: "La contraseña debe tener entre 8 y 16 caracteres",
  INVALID_ROLE: "El rol especificado no es válido",
  USER_NOT_ALLOWED_TO_CHANGE_PASSWORD:
    "El usuario no puede cambiar su contraseña",
  INVITATION_ALREADY_ACTIVE: "Este usuario ya tiene una invitación activa",
  SUPER_ADMIN_SELF_DELETE: "Un Super Admin no puede eliminar su propia cuenta",
  ADMIN_DELETE_UNAUTHORIZED:
    "Los administradores solo pueden eliminar su propia cuenta o cuentas de usuarios y huéspedes",
  USER_DELETE_UNAUTHORIZED: "Solo puedes eliminar tu propia cuenta",
  EMAIL_MISMATCH: "El correo electrónico no coincide",
  INSUFICIENT_PERMISSIONS_FOR_ROLE_CHANGE:
    "No tienes permisos para cambiar el rol",
  IMAGE_UPLOAD_FAILED:
    "Error al subir la imagen. Por favor, inténtalo de nuevo",

  // Validation errors
  INVALID_INPUT: "Los datos proporcionados son inválidos",
  REQUIRED_FIELDS: "Todos los campos son requeridos",
  INVALID_CODE: "Código de invitación no válido o vencido",
  SLUG_ALREADY_EXISTS: "El identificador ya existe",
  SIZE_ALREADY_EXISTS: "Ya existe una talla con este código",
  SIZE_NOT_FOUND: "Talla no encontrada",
  COLOR_ALREADY_EXISTS: "Ya existe un color con este código",

  // Generic errors
  INTERNAL_SERVER_ERROR:
    "Ha ocurrido un error inesperado. Por favor, inténtalo de nuevo",
  OPERATION_FAILED: "La operación no pudo completarse",
} as const;

export const SUCCESS_MESSAGES = {
  PASSWORD_CHANGED: "¡Contraseña actualizada con éxito! 🔐",
  FORGOT_PASSWORD:
    "Se ha enviado un correo electrónico con el enlace de restablecimiento de contraseña 📧",
  USER_GET: "¡Usuario obtenido con éxito! 🚀",
  PROFILE_UPDATED: "¡Perfil actualizado con éxito! 🚀",
  USER_DELETED: "El usuario ha sido eliminado exitosamente ✅",
  USER_UPDATED: "¡Usuario actualizado con éxito! 🚀",
  USER_CREATED: "¡Usuario creado con éxito! 🚀",
  INVITATION_SENT: "¡Invitación enviada exitosamente! 🚀",
  LOGIN_SUCCESS: "Bienvenido/a a Mundo Bebé! 🎉",
  REGISTERED_USER: "¡Usuario registrado con éxito! 🚀",
  CATEGORY_CREATED: "¡Categoría creada con éxito! 🚀",
  CATEGORY_UPDATED: "¡Categoría actualizada con éxito! 🚀",
  CATEGORY_DELETED: "Categoría(s) eliminada(s) exitosamente ✅",
  SUBCATEGORY_CREATED: "¡Subcategoría creada con éxito! 🚀",
  SUBCATEGORY_UPDATED: "¡Subcategoría actualizada con éxito! 🚀",
  SUBCATEGORY_DELETED: "Subcategoría(s) eliminada(s) exitosamente ✅",
  SIZE_CREATED: "¡Talla creada con éxito! 🚀",
  SIZE_UPDATED: "¡Talla actualizada con éxito! 🚀",
  SIZE_DELETED: "Talla(s) eliminada(s) exitosamente ✅",
  COLOR_CREATED: "¡Color creado con éxito! 🚀",
  COLOR_UPDATED: "¡Color actualizado con éxito! 🚀",
  COLOR_DELETED: "Color(es) eliminado(s) exitosamente ✅",
} as const;
