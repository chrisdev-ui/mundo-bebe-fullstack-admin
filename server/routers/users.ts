import { TRPCError } from "@trpc/server";
import { genSaltSync, hashSync } from "bcrypt-ts";
import { and, eq, SQL } from "drizzle-orm";
import jwt from "jsonwebtoken";

import { users } from "@/db/schema";
import { sendEmail } from "@/lib/sendgrid";
import {
  forgotPasswordSchema,
  getUserSchema,
  resetPasswordSchema,
  userCreateSchema,
} from "@/server/schemas";
import { protectedProcedure, publicProcedure, router } from "@/server/trpc";

const JWT_SECRET = process.env.JWT_SECRET as string;
const RESET_TOKEN_EXPIRY = "1h";

const path = "/users";

export const usersRouter = router({
  get: publicProcedure
    .meta({ openapi: { method: "GET", path } })
    .input(getUserSchema)
    .mutation(async ({ input, ctx }) => {
      const parsedInput = getUserSchema.safeParse(input);
      if (!parsedInput.success) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Ha ocurrido un error con los datos del formulario",
          cause: parsedInput.error.issues.map((err) => err.message).join(", "),
        });
      }
      try {
        const query = ctx.db.select({}).from(users);
        const wheres: (SQL | undefined)[] = [];
        if (input.name) {
          wheres.push(eq(users.name, input.name));
        }
        if (input.lastName) {
          wheres.push(eq(users.lastName, input.lastName));
        }
        if (input.email) {
          wheres.push(eq(users.email, input.email));
        }
        if (input.id) {
          wheres.push(eq(users.id, input.id));
        }
        if (input.username) {
          wheres.push(eq(users.username, input.username));
        }
        if (wheres.length > 0) {
          query.where(and(...wheres));
        }
        const existUser = await query.execute();
        if (!existUser) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "No se encontró el usuario con los datos proporcionados",
          });
        }
        return existUser;
      } catch (error) {
        console.error(error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Ha ocurrido un error al buscar el usuario",
        });
      }
    }),
  create: publicProcedure
    .meta({ openapi: { method: "POST", path } })
    .input(userCreateSchema)
    .mutation(async ({ input, ctx }) => {
      const parsedInput = userCreateSchema.safeParse(input);
      if (!parsedInput.success) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Error parsing input",
          cause: parsedInput.error.issues.map((err) => err.message).join(", "),
        });
      }
      if (!input.name || !input.lastName || !input.email || !input.password) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Todos los campos son requeridos",
        });
      }

      if (input.password !== input.confirmPassword) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Las contraseñas no coinciden",
        });
      }

      if (input.password.length < 8 || input.password.length > 16) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "La contraseña debe tener entre 8 y 16 caracteres",
        });
      }

      if (
        input.role !== "USER" &&
        input.role !== "ADMIN" &&
        input.role !== "SUPER_ADMIN"
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "El rol debe ser USER, ADMIN o SUPER_ADMIN",
        });
      }

      try {
        const salt = genSaltSync(10);
        const hash = hashSync(input.password, salt);

        const existingUser = await ctx.db.query.users.findFirst({
          where: (users, { eq }) => eq(users.email, input.email),
        });

        if (existingUser) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Este usuario ya existe",
          });
        }

        await ctx.db.insert(users).values({
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
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Ha ocurrido un error al crear el usuario",
        });
      }
    }),
  update: protectedProcedure
    .meta({ openapi: { method: "PUT", path } })
    .input(userCreateSchema)
    .mutation(async ({ input, ctx }) => {}),
  delete: protectedProcedure
    .meta({ openapi: { method: "DELETE", path } })
    .input(userCreateSchema)
    .mutation(async ({ input, ctx }) => {}),
  forgotPassword: publicProcedure
    .meta({ openapi: { method: "POST", path: `${path}/forgot-password` } })
    .input(forgotPasswordSchema)
    .mutation(async ({ input, ctx }) => {
      const parsedInput = forgotPasswordSchema.safeParse(input);
      if (!parsedInput.success) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Ha ocurrido un error con los datos del formulario",
          cause: parsedInput.error.issues.map((err) => err.message).join(", "),
        });
      }
      try {
        const user = await ctx.db.query.users.findFirst({
          where: (users, { eq }) => eq(users.email, input.email),
        });

        if (!user) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "No se encontró el usuario con el correo proporcionado",
          });
        }

        const token = jwt.sign(
          { userId: user.id, email: user.email },
          JWT_SECRET,
          { expiresIn: RESET_TOKEN_EXPIRY },
        );

        await sendEmail({
          data: {
            templateName: "reset_password",
            to: input.email,
            name: user.name as string,
            email: input.email,
            token,
            webUrl: process.env.NEXT_PUBLIC_APP_URL as string,
          },
        });
      } catch (error) {
        console.error(error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Ha ocurrido un error al enviar el correo",
        });
      }
    }),
  resetPassword: publicProcedure
    .meta({ openapi: { method: "POST", path: `${path}/reset-password` } })
    .input(resetPasswordSchema)
    .mutation(async ({ input, ctx }) => {
      const parsedInput = resetPasswordSchema.safeParse(input);
      if (!parsedInput.success) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Ha ocurrido un error con los datos del formulario",
          cause: parsedInput.error.issues.map((err) => err.message).join(", "),
        });
      }

      try {
        const decoded = jwt.verify(input.token, JWT_SECRET) as {
          userId: string;
          email: string;
        };

        const user = await ctx.db.query.users.findFirst({
          where: (users, { eq }) => eq(users.id, decoded.userId),
        });

        if (!user) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "No se encontró el usuario con el token proporcionado",
          });
        }

        const salt = genSaltSync(10);
        const hash = hashSync(input.newPassword, salt);

        await ctx.db
          .update(users)
          .set({ password: hash })
          .where(eq(users.id, decoded.userId));
      } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "El token no es válido o ha caducado",
          });
        }
        console.error(error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Ha ocurrido un error al cambiar la contraseña",
        });
      }
    }),
});
