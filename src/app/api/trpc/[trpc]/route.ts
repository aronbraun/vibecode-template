import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { createTRPCContext } from "@/trpc/init";
import { appRouter } from "@/trpc/routers/_app";

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () => createTRPCContext({ headers: req.headers }),
    onError({ error, path }) {
      // Full cause in the server log; the client only gets the safe tRPC error shape.
      console.error(`tRPC ${path ?? "<router>"} failed:`, error);
    },
  });

export { handler as GET, handler as POST };
