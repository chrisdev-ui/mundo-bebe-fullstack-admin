import { createSelectSchema } from 'drizzle-zod'
import { z } from 'zod'

import { users } from '@/db/schema'

export const loginSchema = z.object({
  username: z.string(),
  password: z.string()
})

export const userSelect = createSelectSchema(users)
