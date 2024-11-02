import { TRPCError } from "@trpc/server";

import { invites } from "@/db/schema";
import { sendEmail } from "@/lib/sendgrid";
import { adminInvitationSchema, searchCodeSchema } from "@/server/schemas";
import { protectedProcedure, publicProcedure, router } from "@/server/trpc";

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
        console.error(error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Ha ocurrido un error al buscar la invitación",
        });
      }
    }),
  create: protectedProcedure
    .meta({ openapi: { method: "POST", path } })
    .input(adminInvitationSchema)
    .mutation(async ({ input, ctx }) => {
      const parsedInput = adminInvitationSchema.safeParse(input);
      if (!parsedInput.success) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Ha ocurrido un error con los datos del formulario",
          cause: parsedInput.error.issues.map((err) => err.message).join(", "),
        });
      }
      if (ctx.session.user.role !== "SUPER_ADMIN") {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "No tienes permisos para crear invitaciones",
        });
      }
      try {
        const existingUser = await ctx.db.query.users.findFirst({
          where: (users, { eq }) => eq(users.email, input.email),
        });

        if (existingUser) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Este correo electrónico ya está registrado como usuario",
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
          throw new TRPCError({
            code: "CONFLICT",
            message: "Este usuario ya tiene una invitación activa",
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
            role: "ADMIN",
            webUrl: url,
          },
        });
      } catch (e) {
        if (e instanceof TRPCError) {
          throw e;
        }
        console.error(e);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Ha ocurrido un error al enviar el correo",
        });
      }
    }),
});
