import { IconBuildingStore } from "@tabler/icons-react";
import {
  addDays,
  addMonths,
  addWeeks,
  endOfDay,
  endOfMonth,
  endOfWeek,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from "date-fns";

import { CustomDate, NavItem, RouteMap, UserRole } from "@/types";

export const PASSWORD_VALIDATION_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export const PASSWORD_REQUIREMENTS = [
  { regex: /.{8,}/, text: "Al menos 8 caracteres" },
  { regex: /[0-9]/, text: "Al menos 1 número" },
  { regex: /[a-z]/, text: "Al menos 1 minúscula" },
  { regex: /[A-Z]/, text: "Al menos 1 mayúscula" },
  { regex: /[@$!%*?&]/, text: "Al menos un carácter especial (@$!%*?&)" },
];

export const ADMIN_EMAILS = ["web.christian.dev@gmail.com"];

export const PASSWORD_CHANGE_COOLDOWN_MINUTES = 60;

export const MAX_FILE_SIZE = 1024 * 1024 * 4.5;

export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
];

export const roleMappings: Record<UserRole, string> = {
  ADMIN: "Administrador",
  USER: "Usuario",
  GUEST: "Invitado",
  SUPER_ADMIN: "Super Administrador",
};

export const MODULES = ["admin", "super-admin", "user", "guest"] as const;

export const Company = {
  name: "Mundo Bebé",
  acronym: "J.A.",
  address: "Cra. 79 #6a-38, Kennedy, Bogotá - Colombia",
  logo: IconBuildingStore,
  email: "web.christian.dev@gmail.com",
  telephone: "+57 800 00 00 00",
};

export const routeMapping: RouteMap = {
  "/admin/panel": [{ title: "Panel de información", link: "/admin/panel" }],
  "/admin/agregar-admin-user": [
    { title: "Agregar administrador", link: "/admin/agregar-admin-user" },
  ],
  // Add more custom route mappings here
};

export const navItems: NavItem[] = [
  {
    title: "Panel de información",
    url: "/admin/panel",
    icon: "dashboard",
    isActive: false,
    accessLevel: [UserRole.ADMIN],
    items: [],
  },
  {
    title: "Agregar administrador",
    url: "/admin/agregar-admin-user",
    icon: "addAdmin",
    isActive: false,
    accessLevel: [UserRole.SUPER_ADMIN],
    items: [],
  },
  {
    title: "Gestionar usuarios",
    url: "/admin/gestionar-usuarios",
    icon: "usersGroup",
    isActive: false,
    accessLevel: [UserRole.ADMIN],
    items: [],
  },
  {
    title: "Cuenta",
    url: "#",
    icon: "user",
    isActive: false,
    accessLevel: [UserRole.ADMIN],
    items: [
      {
        title: "Editar perfil",
        url: "/admin/editar-perfil",
        icon: "userEdit",
        isActive: false,
        accessLevel: [UserRole.ADMIN],
      },
      {
        title: "Cambiar contraseña",
        url: "/admin/cambiar-contrasena",
        icon: "password",
        isActive: false,
        accessLevel: [UserRole.ADMIN],
      },
      {
        title: "Privacidad",
        url: "/admin/privacidad",
        icon: "privacy",
        isActive: false,
        accessLevel: [UserRole.ADMIN],
      },
      {
        title: "Cerrar sesión",
        action: "logout",
        icon: "logout",
        isActive: false,
        accessLevel: [UserRole.ADMIN],
      },
    ],
  },
];

export const NEXT_AUTH_PATHNAME = "/auth";
export const UNDERSCORE_NEXT_PATHNAME = "/_next";

export enum PublicPaths {
  HOME = "/",
}

export enum ProtectedPaths {}

export enum AdminPaths {
  ADMIN_PANEL = "/admin/panel",
  ADD_ADMIN_USER = "/admin/agregar-admin-user",
}

export enum AuthPaths {
  LOGIN = "/iniciar-sesion",
  SIGNUP = "/registrarse",
  FORGOT_PASSWORD = "/recuperar-contrasena",
  RESET_PASSWORD = "/resetear-contrasena",
}

export const datePresets: Array<CustomDate> = [
  { name: "Hoy", from: startOfDay(new Date()), to: endOfDay(new Date()) },
  {
    name: "Mañana",
    from: startOfDay(addDays(new Date(), 1)),
    to: endOfDay(addDays(new Date(), 1)),
  },
  {
    name: "Esta semana",
    from: startOfWeek(new Date()),
    to: endOfWeek(new Date()),
  },
  {
    name: "La próxima semana",
    from: startOfWeek(addWeeks(new Date(), 1)),
    to: endOfWeek(addWeeks(new Date(), 1)),
  },
  {
    name: "Este mes",
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  },
  {
    name: "El próximo mes",
    from: startOfMonth(addMonths(new Date(), 1)),
    to: endOfMonth(addMonths(new Date(), 1)),
  },
];
