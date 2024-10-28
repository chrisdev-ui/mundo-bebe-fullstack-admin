import { initTRPC, TRPCError } from "@trpc/server";
import { Session } from "next-auth";
import { OpenApiMeta } from "trpc-to-openapi";

import { auth } from "@/auth";
import db from "@/db/drizzle";

interface CreateContextOptions {
  session: Session | null;
}

const createInnerTRPCContext = (opts: CreateContextOptions) => {
  return {
    session: opts.session,
    db,
  };
};

export const createTRPCContext = async (opts: {
  req?: Request;
  auth: Session | null;
}) => {
  const session = opts.auth ?? (await auth());
  return createInnerTRPCContext({ session });
};

const trpc = initTRPC
  .meta<OpenApiMeta>()
  .context<typeof createTRPCContext>()
  .create();

export const router = trpc.router;

const enforceIsUserAuthorized = trpc.middleware(({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "El usuario no está autorizado para ejecutar esta acción",
    });
  }
  return next({
    ctx: {
      session: { ...ctx.session, user: ctx.session.user },
    },
  });
});

export const publicProcedure = trpc.procedure;

export const protectedProcedure = trpc.procedure.use(enforceIsUserAuthorized);
