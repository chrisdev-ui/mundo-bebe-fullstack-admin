import { publicProcedure, router } from '../trpc'

export const usersRouter = router({
  get: publicProcedure.query(() => {
    try {
      return ['christian is the best developer']
    } catch (e) {
      throw e
    }
  })
})
