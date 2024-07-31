import { userSelect } from '@/server/schemas'
import { z } from 'zod'

export type User = z.infer<typeof userSelect>

export type FormState = {
  message: string
  fields?: Record<string, string>
  issues?: string[]
}
