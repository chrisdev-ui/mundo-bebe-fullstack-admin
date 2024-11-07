import { IconBuildingStore } from "@tabler/icons-react";

import { NavItem, RouteMap, UserRole } from "@/types";

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
  // Add more custom route mappings here
};

export const navItems: NavItem[] = [
  {
    title: "Panel de información",
    url: "/admin/panel",
    icon: "dashboard",
    isActive: false,
    accessLevel: [UserRole.ADMIN, UserRole.SUPER_ADMIN],
    items: [],
  },
  {
    title: "Cuenta",
    url: "#",
    icon: "user",
    isActive: false,
    accessLevel: [UserRole.ADMIN, UserRole.SUPER_ADMIN],
    items: [
      {
        title: "Perfil",
        url: "#",
        icon: "user",
        isActive: false,
        accessLevel: [UserRole.ADMIN, UserRole.SUPER_ADMIN],
      },
      {
        title: "Cambiar contraseña",
        url: "#",
        icon: "trash",
        isActive: false,
        accessLevel: [UserRole.ADMIN, UserRole.SUPER_ADMIN],
      },
      {
        title: "Cerrar sesión",
        url: "#",
        icon: "close",
        isActive: false,
        accessLevel: [UserRole.ADMIN, UserRole.SUPER_ADMIN],
      },
    ],
  },
];
