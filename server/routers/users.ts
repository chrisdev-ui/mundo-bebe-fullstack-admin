import { TRPCError } from "@trpc/server";
import { genSaltSync, hashSync } from "bcrypt-ts";
import { eq } from "drizzle-orm";

import db from "@/db/drizzle";
import { users } from "@/db/schema";
import { userCreateSchema } from "@/server/schemas";
import { publicProcedure, router } from "@/server/trpc";

const path = "/users";

export const usersRouter = router({
  get: publicProcedure.query(() => {
    try {
      return ["christian is the best developer"];
    } catch (e) {
      throw e;
    }
  }),
  create: publicProcedure
    .meta({ openapi: { method: "POST", path } })
    .input(userCreateSchema)
    .mutation(async ({ input }) => {
      const parsedInput = userCreateSchema.safeParse(input);
      if (!parsedInput.success) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error parsing input",
          cause: parsedInput.error.issues.map((err) => err.message).join(", "),
        });
      }
      if (!input.name || !input.lastName || !input.email || !input.password) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Todos los campos son requeridos",
        });
      }

      if (input.password !== input.confirmPassword) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Las contraseñas no coinciden",
        });
      }

      if (input.password.length < 8 || input.password.length > 16) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "La contraseña debe tener entre 8 y 16 caracteres",
        });
      }

      if (input.role !== "USER" && input.role !== "ADMIN") {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "El rol debe ser USER o ADMIN",
        });
      }

      try {
        const salt = genSaltSync(10);
        const hash = hashSync(input.password, salt);

        const existingUser = await db
          .select()
          .from(users)
          .where(eq(users.email, input.email))
          .execute();

        if (existingUser.length > 0) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Este usuario ya existe",
          });
        }

        await db.insert(users).values({
          name: input.name,
          lastName: input.lastName,
          username: input.email,
          password: hash,
          email: input.email,
          emailVerified: new Date(),
          role:
            process.env.SUPER_ADMIN_EMAIL === input.email
              ? "SUPER_ADMIN"
              : input.role,
        });
      } catch (e) {
        console.error(e);
        throw e;
      }
    }),
});
