import db from '@/db/drizzle'
import { DrizzleAdapter } from '@auth/drizzle-adapter'
import NextAuth from 'next-auth'

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db),
  providers: []
})
