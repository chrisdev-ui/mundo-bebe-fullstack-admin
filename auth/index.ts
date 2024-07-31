import { DrizzleAdapter } from '@auth/drizzle-adapter'
import NextAuth, { CredentialsSignin } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'

import db from '@/db/drizzle'
import { getUserByEmailOrUsername } from '@/server/lib/users'
import { loginSchema } from '@/server/schemas'
import { compare } from 'bcrypt-ts'

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db),
  providers: [
    Credentials({
      credentials: {
        username: { label: 'Username' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        const parsedCredentials = loginSchema.safeParse(credentials)

        if (!parsedCredentials.success) {
          throw new CredentialsSignin('Las credenciales son inválidas')
        }

        const { username, password } = parsedCredentials.data
        const user = await getUserByEmailOrUsername(username)

        if (!user) {
          throw new CredentialsSignin('Usuario no encontrado')
        }

        const isMatched = await compare(password, user.password)

        if (!isMatched) {
          throw new CredentialsSignin('Contraseña incorrecta')
        }

        const { password: _, ...userData } = user

        return userData
      }
    })
  ]
})
