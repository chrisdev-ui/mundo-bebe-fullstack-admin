import { TRPCError } from '@trpc/server'
import { genSaltSync, hashSync } from 'bcrypt-ts'
import { eq } from 'drizzle-orm'

import { ADMIN_EMAILS } from '@/constants'
import db from '@/db/drizzle'
import { users } from '@/db/schema'
import { userCreateSchema } from '@/server/schemas'
import { publicProcedure, router } from '@/server/trpc'

const path = '/users'

export const usersRouter = router({
  get: publicProcedure.query(() => {
    try {
      return ['christian is the best developer']
    } catch (e) {
      throw e
    }
  }),
  create: publicProcedure
    .meta({ openapi: { method: 'POST', path } })
    .input(userCreateSchema)
    .mutation(async ({ input }) => {
      const parsedInput = userCreateSchema.safeParse(input)
      if (!parsedInput.success) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error parsing input',
          cause: parsedInput.error.issues.map((err) => err.message).join(', ')
        })
      }
      if (
        !input.firstName ||
        !input.lastName ||
        !input.email ||
        !input.password
      ) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'firstName, lastName, email, and password are required'
        })
      }

      if (input.password !== input.confirmPassword) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Passwords do not match'
        })
      }

      if (input.password.length < 8 || input.password.length > 16) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Password must be at least 8 characters and no more than 16'
        })
      }

      try {
        const salt = genSaltSync(10)
        const hash = hashSync(input.password, salt)

        const existingUser = await db
          .select()
          .from(users)
          .where(eq(users.email, input.email))
          .execute()

        console.log(existingUser)

        if (existingUser.length > 0) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'User already exists'
          })
        }

        await db.insert(users).values({
          firstName: input.firstName,
          lastName: input.lastName,
          username: input.email,
          password: hash,
          email: input.email,
          emailVerified: new Date(),
          role: ADMIN_EMAILS.includes(input.email) ? 'ADMIN' : input.role
        })
      } catch (e) {
        console.error(e)
        throw e
      }
    })
})
