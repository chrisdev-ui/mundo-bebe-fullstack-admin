import { z } from 'zod'

export const userCreateSchema = z.object({
  name: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  password: z.string(),
  confirmPassword: z.string(),
  role: z.enum(['USER', 'ADMIN'])
})
