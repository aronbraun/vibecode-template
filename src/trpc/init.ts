import { initTRPC, TRPCError } from "@trpc/server";
import mongoose from "mongoose";
import * as z from "zod";

import { connectToDatabase } from "@/server/db";

// Runs once per request. Every procedure can rely on the database being connected.
// When you add auth, derive the user from the headers here and put it on the context.
export async function createTRPCContext(opts: { headers: Headers }) {
  await connectToDatabase();
  return { headers: opts.headers };
}

export type TRPCContext = Awaited<ReturnType<typeof createTRPCContext>>;

const t = initTRPC.context<TRPCContext>().create({
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        // When Zod rejects the input, give the form a message per field:
        // error.data.fieldErrors = { email: ["Invalid email"] }.
        fieldErrors:
          error.code === "BAD_REQUEST" && error.cause instanceof z.ZodError
            ? z.flattenError(error.cause).fieldErrors
            : null,
      },
    };
  },
});

export const createTRPCRouter = t.router;

// Turns raw database and unexpected errors into short, safe messages for the
// user. The real error (with the stack trace) is still logged by the tRPC
// route handler. Errors you throw yourself as TRPCError pass through unchanged.
const translateDatabaseErrors = t.middleware(async ({ next }) => {
  const result = await next();
  if (result.ok) return result;

  const { cause } = result.error;
  if (cause instanceof mongoose.Error.ValidationError) {
    const messages = Object.values(cause.errors).map(
      (fieldError) => fieldError.message,
    );
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: messages.join(" "),
      cause,
    });
  }
  if (cause instanceof mongoose.Error.CastError) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "That id is not valid.",
      cause,
    });
  }
  if (
    cause instanceof mongoose.mongo.MongoServerError &&
    cause.code === 11000
  ) {
    throw new TRPCError({
      code: "CONFLICT",
      message: "This already exists.",
      cause,
    });
  }
  // Any other unexpected error: keep the details in the server log only.
  if (result.error.code === "INTERNAL_SERVER_ERROR") {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Something went wrong. Please try again.",
      cause,
    });
  }
  return result;
});

// For procedures that need a logged-in user, add a protectedProcedure here that
// checks the user on the context and throws new TRPCError({ code: "UNAUTHORIZED" }).
export const publicProcedure = t.procedure.use(translateDatabaseErrors);
