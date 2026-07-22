import { createTRPCRouter } from "@/trpc/init";
import { notesRouter } from "@/trpc/routers/notes";

// One sub-router per domain, each in its own file under src/trpc/routers/.
export const appRouter = createTRPCRouter({
  notes: notesRouter,
});

export type AppRouter = typeof appRouter;
