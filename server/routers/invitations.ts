import { SUCCESS_MESSAGES } from "@/constants/errors";
import { invites } from "@/db/schema";
import { sendEmail } from "@/lib/sendgrid";
import {
  createSuccessResponse,
  handleError,
  throwTRPCError,
} from "@/lib/utils.api";
import { adminInvitationSchema, searchCodeSchema } from "@/server/schemas";
import { protectedProcedure, publicProcedure, router } from "@/server/trpc";
import { UserRole } from "@/types";

const path = "/invitations";

export const invitationsRouter = router({
  checkValidCode: publicProcedure
    .meta({ openapi: { method: "GET", path } })
    .input(searchCodeSchema)
    .query(async ({ input, ctx }) => {
      if (!input.code || !input.email) return false;
      try {
        const isActiveInvitation = await ctx.db.query.invites.findFirst({
          where: (invites, { eq, and, gt }) =>
            and(
              eq(invites.token, input.code),
              eq(invites.email, input.email),
              gt(invites.expiresAt, new Date()),
            ),
        });
        return !!isActiveInvitation;
      } catch (error) {
        handleError(error, "OPERATION_FAILED", {
          cause: error,
          context: {
            userId: ctx?.session?.user?.id,
            operation: "getInvitation",
          },
        });
      }
    }),
  create: protectedProcedure
    .meta({ openapi: { method: "POST", path } })
    .input(adminInvitationSchema)
    .mutation(async ({ input, ctx }) => {
      const parsedInput = adminInvitationSchema.safeParse(input);
      if (!parsedInput.success) {
        throwTRPCError("INVALID_INPUT", undefined, {
          validationErrors: parsedInput.error.issues.map((err) => err.message),
          operation: "createInvitation",
          userId: ctx?.session?.user?.id,
        });
      }
      if (ctx.session.user.role !== UserRole.SUPER_ADMIN) {
        throwTRPCError("UNAUTHORIZED", undefined, {
          userId: ctx?.session?.user?.id,
          operation: "createInvitation",
        });
      }
      try {
        const existingUser = await ctx.db.query.users.findFirst({
          where: (users, { eq }) => eq(users.email, input.email),
        });

        if (existingUser) {
          throwTRPCError("USER_EXISTS", undefined, {
            userId: input.email,
            operation: "createInvitation",
          });
        }

        const userHasActiveInvitation = await ctx.db.query.invites.findFirst({
          where: (invites, { eq, and, lt }) =>
            and(
              eq(invites.email, input.email),
              lt(invites.expiresAt, new Date()),
            ),
        });

        if (userHasActiveInvitation) {
          throwTRPCError("INVITATION_ALREADY_ACTIVE", undefined, {
            userId: input.email,
            operation: "createInvitation",
          });
        }

        const token = crypto.randomUUID();

        await ctx.db.insert(invites).values({
          email: input.email,
          token,
          expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
        });

        const url = `${process.env.NEXT_PUBLIC_APP_URL}/registrarse?code=${token}&email=${input.email}`;

        await sendEmail({
          data: {
            templateName: "welcome",
            to: input.email,
            name: input.name,
            role: UserRole.ADMIN,
            webUrl: url,
          },
        });

        return createSuccessResponse(SUCCESS_MESSAGES.INVITATION_SENT);
      } catch (e) {
        handleError(e, "OPERATION_FAILED", {
          cause: e,
          context: {
            userId: input.email,
            operation: "createInvitation",
          },
        });
      }
    }),
});
