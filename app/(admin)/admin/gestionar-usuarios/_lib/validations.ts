import {
  createSearchParamsCache,
  parseAsArrayOf,
  parseAsBoolean,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
} from "nuqs/server";
import { z } from "zod";

import {
  ACCEPTED_IMAGE_TYPES,
  MAX_FILE_SIZE,
  PASSWORD_VALIDATION_REGEX,
} from "@/constants";
import { User, users } from "@/db/schema";
import { getFiltersStateParser, getSortingStateParser } from "@/lib/parsers";

export const searchParamsCache = createSearchParamsCache({
  flags: parseAsArrayOf(z.enum(["advancedTable", "floatingBar"])).withDefault(
    [],
  ),
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(10),
  sort: getSortingStateParser<User>().withDefault([
    { id: "createdAt", desc: true },
  ]),
  name: parseAsString.withDefault(""),
  username: parseAsString.withDefault(""),
  email: parseAsString.withDefault(""),
  phone: parseAsString.withDefault(""),
  documentId: parseAsString.withDefault(""),
  role: parseAsArrayOf(z.enum(users.role.enumValues)).withDefault([]),
  active: parseAsBoolean.withDefault(true),
  from: parseAsString.withDefault(""),
  to: parseAsString.withDefault(""),
  // advanced filter
  filters: getFiltersStateParser().withDefault([]),
  joinOperator: parseAsStringEnum(["and", "or"]).withDefault("and"),
});

export const updateUserSchema = z.object({
  image: z
    .union([
      z
        .custom<File | undefined>()
        .refine((file) => !file || file.size <= MAX_FILE_SIZE, {
          message: "El archivo debe tener un tamaño máximo de 4.5MB",
        })
        .refine((file) => !file || ACCEPTED_IMAGE_TYPES.includes(file.type), {
          message:
            ".jpg, .jpeg, .png, .webp o .gif son los únicos formatos aceptados",
        }),
      z.string(),
      z.null(),
    ])
    .optional(),
  name: z.string().optional(),
  lastName: z.string().optional(),
  username: z.string().optional(),
  email: z.string().email().optional(),
  phoneNumber: z.string().optional(),
  documentId: z.string().optional(),
  role: z.enum(users.role.enumValues).optional(),
  dob: z.date().nullable().optional(),
});

export const createUserSchema = z.object({
  image: z
    .union([
      z
        .custom<File | undefined>()
        .refine((file) => !file || file.size <= MAX_FILE_SIZE, {
          message: "El archivo debe tener un tamaño máximo de 4.5MB",
        })
        .refine((file) => !file || ACCEPTED_IMAGE_TYPES.includes(file.type), {
          message:
            ".jpg, .jpeg, .png, .webp o .gif son los únicos formatos aceptados",
        }),
      z.string(),
      z.null(),
    ])
    .optional(),
  password: z
    .string()
    .min(1, { message: "La contraseña es requerida" })
    .regex(PASSWORD_VALIDATION_REGEX, {
      message: "La contraseña no cumple con los requisitos",
    }),
  name: z.string(),
  lastName: z.string(),
  username: z.string().optional(),
  email: z.string().email(),
  phoneNumber: z.string().optional(),
  documentId: z.string().optional(),
  role: z.enum(users.role.enumValues),
  dob: z.date().nullable().optional(),
});

export type GetUsersSchema = Awaited<
  ReturnType<typeof searchParamsCache.parse>
>;

export const updateUserActionSchema = z.object({
  id: z.string(),
  image: updateUserSchema.shape.image,
  name: updateUserSchema.shape.name,
  lastName: updateUserSchema.shape.lastName,
  username: updateUserSchema.shape.username,
  email: updateUserSchema.shape.email,
  phoneNumber: updateUserSchema.shape.phoneNumber,
  documentId: updateUserSchema.shape.documentId,
  role: updateUserSchema.shape.role,
  dob: updateUserSchema.shape.dob,
});

export type UpdateUserSchema = z.infer<typeof updateUserSchema>;
export type UpdateUserActionSchema = z.infer<typeof updateUserActionSchema>;
export type CreateUserSchema = z.infer<typeof createUserSchema>;
