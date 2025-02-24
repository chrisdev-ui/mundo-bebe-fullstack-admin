import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Ratelimit, type Duration } from "@upstash/ratelimit";
import { Session } from "next-auth";
import { z } from "zod";

import { auth } from "@/auth";
import { ERRORS } from "@/constants/messages";
import { unstable_cache } from "@/lib/unstable-cache";
import redis from "@/lib/upstash";
import { AppError } from "@/lib/utils.api";
import type { UserRole } from "@/types";

export interface ActionContext {
  session?: Session;
}

type ServerAction<TInput, TOutput> = (
  input: TInput,
  context?: ActionContext,
) => Promise<TOutput>;
type MiddlewareFunction<TInput, TOutput> = (
  action: ServerAction<TInput, TOutput>,
) => ServerAction<TInput, TOutput>;

export function composeMiddleware<TInput, TOutput>(
  ...middlewares: MiddlewareFunction<TInput, TOutput>[]
) {
  return (
    action: ServerAction<TInput, TOutput>,
  ): ServerAction<TInput, TOutput> =>
    middlewares.reduceRight((acc, middleware) => middleware(acc), action);
}

export function withErrorHandling<TInput, TOutput>(): MiddlewareFunction<
  TInput,
  TOutput
> {
  return (action) =>
    async (input, ctx = {}) => {
      try {
        return await action(input, ctx);
      } catch (error) {
        console.error("Action error:", error);
        if (error instanceof AppError) {
          throw error;
        }
        throw new AppError(ERRORS.INTERNAL_SERVER_ERROR, { error });
      }
    };
}

interface AuthOptions {
  requiredRole?: UserRole[];
  redirectTo?: string;
}

export function withAuth<TInput, TOutput>(
  options: AuthOptions = {},
): MiddlewareFunction<TInput, TOutput> {
  return (action) =>
    async (input, ctx = {}) => {
      const session = await auth();

      if (!session?.user) {
        redirect(options.redirectTo ?? "/login");
      }

      if (
        options.requiredRole &&
        !options.requiredRole.includes(session.user.role)
      ) {
        throw new AppError(ERRORS.UNAUTHORIZED, {
          requiredRole: options.requiredRole,
        });
      }

      return action(input, { ...ctx, session });
    };
}

interface RateLimitOptions {
  requests: number;
  duration: Duration;
  identifier?: string | ((input: any) => string);
}

export function withRateLimit<TInput, TOutput>(
  options: RateLimitOptions,
): MiddlewareFunction<TInput, TOutput> {
  return (action) =>
    async (input, ctx = {}) => {
      const headersList = headers();
      const identifier =
        typeof options.identifier === "function"
          ? options.identifier(input)
          : options.identifier ||
            headersList.get("x-forwarded-for") ||
            headersList.get("cf-connecting-ip") ||
            "127.0.0.1";

      const ratelimit = new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(options.requests, options.duration),
      });

      const { success } = await ratelimit.limit(identifier);

      if (!success) {
        throw new AppError(ERRORS.TOO_MANY_REQUESTS);
      }

      return action(input, ctx);
    };
}

interface CacheOptions {
  keyParts: string[];
  revalidate?: number;
  tags?: string[];
}

export function withCache<TInput, TOutput>(
  options: CacheOptions,
): MiddlewareFunction<TInput, TOutput> {
  return (action) =>
    async (input, ctx = {}) => {
      return unstable_cache(() => action(input, ctx), options.keyParts, {
        revalidate: options.revalidate,
        tags: options.tags,
      })();
    };
}

interface ValidationOptions<T> {
  schema: z.Schema<T>;
  errorMessage?: string;
}

export function withValidation<TInput, TOutput>(
  options: ValidationOptions<TInput>,
): MiddlewareFunction<TInput, TOutput> {
  return (action) =>
    async (input, ctx = {}) => {
      const result = options.schema.safeParse(input);

      if (!result.success) {
        const errors = result.error.errors.map((err) => ({
          path: err.path.join("."),
          message: err.message,
        }));

        throw new AppError(
          options.errorMessage || "Ha ocurrido un error de validación",
          { errors },
        );
      }

      return action(result.data, ctx);
    };
}
