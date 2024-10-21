import { invitationsRouter } from "./routers/invitations";
import { usersRouter } from "./routers/users";
import { router } from "./trpc";

export const appRouter = router({
  users: usersRouter,
  invitations: invitationsRouter,
});

export type AppRouter = typeof appRouter;
