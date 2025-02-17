import { compareSync, genSaltSync, hashSync } from "bcrypt-ts";
import { differenceInMinutes, parseISO } from "date-fns";
import { and, eq, SQL } from "drizzle-orm";
import jwt from "jsonwebtoken";

import { PASSWORD_CHANGE_COOLDOWN_MINUTES } from "@/constants";
import { SUCCESS_MESSAGES } from "@/constants/errors";
import { users } from "@/db/schema";
import { sendEmail } from "@/lib/sendgrid";
import { isValidUserRole } from "@/lib/utils";
import {
  createSuccessResponse,
  handleError,
  throwTRPCError,
} from "@/lib/utils.api";
import {
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  userCreateSchema,
  userDeleteSchema,
  userReadSchema,
  userUpdateSchema,
} from "@/server/schemas";
import { protectedProcedure, publicProcedure, router } from "@/server/trpc";
import { UserRole } from "@/types";

const JWT_SECRET = process.env.JWT_SECRET as string;
const RESET_TOKEN_EXPIRY = "1h";

const path = "/users";

export const usersRouter = router({
  get: publicProcedure
    .meta({ openapi: { method: "GET", path } })
    .input(userReadSchema)
    .mutation(async ({ input, ctx }) => {
      const parsedInput = userReadSchema.safeParse(input);
      if (!parsedInput.success) {
        throwTRPCError("INVALID_INPUT", undefined, {
          validationErrors: parsedInput.error.issues.map((err) => err.message),
          operation: "getUser",
          userId: ctx?.session?.user?.id,
        });
      }
      try {
        const query = ctx.db.select().from(users);
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
        if (input.phoneNumber) {
          wheres.push(eq(users.phoneNumber, input.phoneNumber));
        }
        if (input.dob) {
          wheres.push(eq(users.dob, input.dob));
        }
        if (wheres.length > 0) {
          query.where(and(...wheres));
        }
        const existUser = await query.execute();
        if (!existUser) {
          throwTRPCError("USER_NOT_FOUND", undefined, { userId: input.id });
        }

        return createSuccessResponse(SUCCESS_MESSAGES.USER_GET, existUser);
      } catch (error: any) {
        handleError(error, "OPERATION_FAILED", {
          cause: error,
          context: {
            userId: input.id ?? ctx?.session?.user?.id,
            operation: "getUser",
          },
          shouldLog: false,
        });
      }
    }),
  create: publicProcedure
    .meta({ openapi: { method: "POST", path } })
    .input(userCreateSchema)
    .mutation(async ({ input, ctx }) => {
      const parsedInput = userCreateSchema.safeParse(input);
      if (!parsedInput.success) {
        throwTRPCError("INVALID_INPUT", undefined, {
          validationErrors: parsedInput.error.issues.map((err) => err.message),
          operation: "createUser",
          userId: ctx?.session?.user?.id,
        });
      }
      if (!input.name || !input.lastName || !input.email || !input.password)
        throwTRPCError("REQUIRED_FIELDS");

      if (input.password !== input.confirmPassword)
        throwTRPCError("PASSWORD_MISMATCH");

      if (input.password.length < 8 || input.password.length > 16)
        throwTRPCError("INVALID_PASSWORD_LENGTH");

      if (!isValidUserRole(input.role)) throwTRPCError("INVALID_ROLE");

      try {
        const salt = genSaltSync(10);
        const hash = hashSync(input.password, salt);

        const existingUser = await ctx.db.query.users.findFirst({
          where: (users, { eq }) => eq(users.email, input.email),
        });

        if (existingUser) {
          throwTRPCError("USER_EXISTS", undefined, {
            userId: existingUser.id,
            email: existingUser.email,
            operation: "createUser",
          });
        }

        await ctx.db.insert(users).values({
          name: input.name,
          lastName: input.lastName,
          username: input.username || input.email,
          password: hash,
          email: input.email,
          emailVerified: new Date(),
          role:
            process.env.SUPER_ADMIN_EMAIL === input.email
              ? UserRole.SUPER_ADMIN
              : input.role,
          image: input.image,
          phoneNumber: input.phoneNumber,
          dob: input.dob ? new Date(input.dob) : null,
        });

        return createSuccessResponse(SUCCESS_MESSAGES.USER_CREATED);
      } catch (e: any) {
        handleError(e, "OPERATION_FAILED", {
          context: {
            cause: e,
            userId: ctx?.session?.user?.id,
            operation: "createUser",
          },
        });
      }
    }),
  update: protectedProcedure
    .meta({ openapi: { method: "PUT", path } })
    .input(userUpdateSchema)
    .mutation(async ({ input, ctx }) => {
      const parsedInput = userUpdateSchema.safeParse(input);
      if (!parsedInput.success)
        throwTRPCError("INVALID_INPUT", undefined, {
          validationErrors: parsedInput.error.issues.map((err) => err.message),
          operation: "updateUser",
          userId: ctx?.session?.user?.id,
        });

      try {
        const existingUser = await ctx.db.query.users.findFirst({
          where: (users, { eq }) => eq(users.id, ctx.session.user.id),
        });

        if (!existingUser)
          throwTRPCError("USER_NOT_FOUND", undefined, {
            userId: ctx?.session?.user?.id,
            operation: "updateUser",
          });

        await ctx.db
          .update(users)
          .set({
            name: input.name,
            lastName: input.lastName,
            username: input.username,
            email: input.email,
            image: input.image,
            phoneNumber: input.phoneNumber,
            dob: input.dob,
            updatedAt: new Date(),
          })
          .where(eq(users.id, ctx.session.user.id));

        return createSuccessResponse(SUCCESS_MESSAGES.PROFILE_UPDATED);
      } catch (error: any) {
        handleError(error, "OPERATION_FAILED", {
          cause: error,
          context: {
            userId: ctx?.session?.user?.id,
            operation: "updateUser",
          },
        });
      }
    }),
  delete: protectedProcedure
    .meta({ openapi: { method: "DELETE", path } })
    .input(userDeleteSchema)
    .mutation(async ({ input, ctx }) => {
      const parsedInput = userDeleteSchema.safeParse(input);
      if (!parsedInput.success)
        throwTRPCError("INVALID_INPUT", undefined, {
          validationErrors: parsedInput.error.issues.map((err) => err.message),
          operation: "deleteUser",
          userId: ctx?.session?.user?.id,
        });

      try {
        const userToDelete = await ctx.db.query.users.findFirst({
          where: (users, { eq }) => eq(users.id, input.id),
        });

        if (!userToDelete)
          throwTRPCError("USER_NOT_FOUND", undefined, {
            userId: input.id,
            operation: "deleteUser",
          });

        const currentUser = ctx.session.user;

        switch (currentUser.role) {
          case UserRole.SUPER_ADMIN:
            if (currentUser.id === userToDelete.id) {
              throwTRPCError("SUPER_ADMIN_SELF_DELETE", undefined, {
                userId: currentUser.id,
                operation: "deleteUser",
              });
            }
            break;

          case UserRole.ADMIN:
            if (
              currentUser.id !== userToDelete.id &&
              userToDelete.role !== UserRole.USER &&
              userToDelete.role !== UserRole.GUEST
            ) {
              throwTRPCError("ADMIN_DELETE_UNAUTHORIZED", undefined, {
                userId: currentUser.id,
                targetUserId: userToDelete.id,
                operation: "deleteUser",
              });
            }
            break;

          case UserRole.USER:
          case UserRole.GUEST:
            if (currentUser.id !== userToDelete.id) {
              throwTRPCError("USER_DELETE_UNAUTHORIZED", undefined, {
                userId: currentUser.id,
                targetUserId: userToDelete.id,
                operation: "deleteUser",
              });
            }
            break;

          default:
            throwTRPCError("UNAUTHORIZED", undefined, {
              userId: currentUser.id,
              operation: "deleteUser",
            });
        }

        await ctx.db.delete(users).where(eq(users.id, input.id));

        return createSuccessResponse(SUCCESS_MESSAGES.USER_DELETED);
      } catch (e: any) {
        handleError(e, "OPERATION_FAILED", {
          cause: e,
          context: {
            userId: ctx?.session?.user?.id,
            operation: "deleteUser",
          },
        });
      }
    }),
  forgotPassword: publicProcedure
    .meta({ openapi: { method: "POST", path: `${path}/forgot-password` } })
    .input(forgotPasswordSchema)
    .mutation(async ({ input, ctx }) => {
      const parsedInput = forgotPasswordSchema.safeParse(input);
      if (!parsedInput.success)
        throwTRPCError("INVALID_INPUT", undefined, {
          validationErrors: parsedInput.error.issues.map((err) => err.message),
          operation: "forgotPassword",
          userId: ctx?.session?.user?.id,
        });

      try {
        const user = await ctx.db.query.users.findFirst({
          where: (users, { eq }) => eq(users.email, input.email),
        });

        if (!user)
          throwTRPCError("USER_NOT_FOUND", undefined, {
            userId: input.email,
            operation: "forgotPassword",
          });

        const minutesSinceLastUpdate = differenceInMinutes(
          new Date(),
          parseISO(user.updatedAt.toISOString()),
        );

        if (minutesSinceLastUpdate < PASSWORD_CHANGE_COOLDOWN_MINUTES) {
          throwTRPCError(
            "PASSWORD_CHANGE_COOLDOWN",
            PASSWORD_CHANGE_COOLDOWN_MINUTES - minutesSinceLastUpdate,
            {
              userId: user.id,
              operation: "forgotPassword",
            },
          );
        }

        const token = jwt.sign(
          { userId: user.id, email: user.email },
          JWT_SECRET,
          { expiresIn: RESET_TOKEN_EXPIRY },
        );

        const webUrl = `${process.env.NEXT_PUBLIC_APP_URL}/resetear-contrasena?token=${token}&email=${input.email}`;

        await sendEmail({
          data: {
            templateName: "reset_password",
            to: input.email,
            name: user.name as string,
            webUrl,
          },
        });

        return createSuccessResponse(SUCCESS_MESSAGES.FORGOT_PASSWORD);
      } catch (error: any) {
        handleError(error, "OPERATION_FAILED", {
          cause: error,
          context: {
            userId: input.email,
            operation: "forgotPassword",
          },
        });
      }
    }),
  resetPassword: publicProcedure
    .meta({ openapi: { method: "POST", path: `${path}/reset-password` } })
    .input(resetPasswordSchema)
    .mutation(async ({ input, ctx }) => {
      const parsedInput = resetPasswordSchema.safeParse(input);
      if (!parsedInput.success)
        throwTRPCError("INVALID_INPUT", undefined, {
          validationErrors: parsedInput.error.issues.map((err) => err.message),
          operation: "resetPassword",
          userId: ctx?.session?.user?.id,
        });

      if (input.newPassword !== input.confirmNewPassword)
        throwTRPCError("PASSWORD_MISMATCH");

      try {
        const decoded = jwt.verify(input.token, JWT_SECRET) as {
          userId: string;
          email: string;
        };

        const user = await ctx.db.query.users.findFirst({
          where: (users, { eq }) => eq(users.id, decoded.userId),
        });

        if (!user)
          throwTRPCError("JWT_USER_NOT_FOUND", undefined, {
            userId: input.token,
            operation: "resetPassword",
          });

        const minutesSinceLastUpdate = differenceInMinutes(
          new Date(),
          parseISO(user.updatedAt.toISOString()),
        );

        if (minutesSinceLastUpdate < PASSWORD_CHANGE_COOLDOWN_MINUTES) {
          throwTRPCError(
            "PASSWORD_CHANGE_COOLDOWN",
            PASSWORD_CHANGE_COOLDOWN_MINUTES - minutesSinceLastUpdate,
            {
              userId: user.id,
              operation: "resetPassword",
            },
          );
        }

        const salt = genSaltSync(10);
        const hash = hashSync(input.newPassword, salt);

        await ctx.db
          .update(users)
          .set({ password: hash, updatedAt: new Date() })
          .where(eq(users.id, decoded.userId));

        return createSuccessResponse(SUCCESS_MESSAGES.PASSWORD_CHANGED);
      } catch (error: any) {
        handleError(error, "OPERATION_FAILED", {
          cause: error,
          context: {
            userId: input.token,
            operation: "resetPassword",
          },
        });
      }
    }),
  changePassword: protectedProcedure
    .meta({ openapi: { method: "PATCH", path: `${path}/change-password` } })
    .input(changePasswordSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const user = await ctx.db.query.users.findFirst({
          where: (users, { eq }) => eq(users.id, ctx.session.user.id),
        });

        if (!user)
          throwTRPCError("USER_NOT_FOUND", undefined, {
            userId: ctx?.session?.user?.id,
            operation: "changePassword",
          });

        if (!user.password)
          throwTRPCError("USER_NOT_ALLOWED_TO_CHANGE_PASSWORD", undefined, {
            userId: ctx?.session?.user?.id,
            operation: "changePassword",
          });

        const isValidPassword = compareSync(
          input.currentPassword,
          user.password,
        );

        if (!isValidPassword)
          throwTRPCError("INVALID_PASSWORD", undefined, {
            userId: ctx?.session?.user?.id,
            operation: "changePassword",
          });

        const isSamePassword = compareSync(input.newPassword, user.password);
        if (isSamePassword)
          throwTRPCError("SAME_PASSWORD", undefined, {
            userId: ctx?.session?.user?.id,
            operation: "changePassword",
          });

        const salt = genSaltSync(10);
        const hash = hashSync(input.newPassword, salt);

        await ctx.db
          .update(users)
          .set({
            password: hash,
            updatedAt: new Date(),
          })
          .where(eq(users.id, ctx.session.user.id));

        return createSuccessResponse(SUCCESS_MESSAGES.PASSWORD_CHANGED);
      } catch (error: any) {
        handleError(error, "OPERATION_FAILED", {
          cause: error,
          context: {
            userId: ctx?.session?.user?.id,
            operation: "changePassword",
          },
        });
      }
    }),
});
