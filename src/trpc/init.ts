import { initTRPC } from "@trpc/server";
import { connectToDatabase } from "@/server/db";

// Runs once per request. Every procedure can rely on the database being connected.
// When you add auth, derive the user from the headers here and put it on the context.
export async function createTRPCContext(opts: { headers: Headers }) {
  await connectToDatabase();
  return { headers: opts.headers };
}

export type TRPCContext = Awaited<ReturnType<typeof createTRPCContext>>;

const t = initTRPC.context<TRPCContext>().create();

export const createTRPCRouter = t.router;

// For procedures that need a logged-in user, add a protectedProcedure here that
// checks the user on the context and throws new TRPCError({ code: "UNAUTHORIZED" }).
export const publicProcedure = t.procedure;
