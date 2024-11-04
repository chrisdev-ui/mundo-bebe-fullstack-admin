export const PASSWORD_VALIDATION_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export const ADMIN_EMAILS = ["web.christian.dev@gmail.com"];

export const PASSWORD_CHANGE_COOLDOWN_MINUTES = 60;

export const MODULES = ["admin", "super-admin", "user", "guest"] as const;
