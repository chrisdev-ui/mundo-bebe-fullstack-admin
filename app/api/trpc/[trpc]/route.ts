import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

import { auth } from "@/auth";
import { appRouter } from "@/server";
import { createTRPCContext } from "@/server/trpc";

const handler = async (req: Request) => {
  const session = await auth();
  const response = await fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () => createTRPCContext({ req, auth: session }),
    onError: ({ error, path }) => {
      console.error(`❌ tRPC failed on ${path}:`, error);
    },
  });

  return response;
};

export { handler as GET, handler as POST };
