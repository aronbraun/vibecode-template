import { createEnv } from "@t3-oss/env-nextjs";
import * as z from "zod";

// Every environment variable the app reads, checked once when the app builds
// or starts. Always read `env.X` instead of `process.env.X`: a missing or
// misspelled variable then fails loudly instead of silently being undefined.
export const env = createEnv({
  server: {
    // Empty = automatic in-memory MongoDB (development only, see src/server/db.ts).
    MONGODB_URI: z.string().min(1).optional(),
  },
  // Variables the browser may read. They must start with NEXT_PUBLIC_.
  client: {},
  // Next.js inlines NEXT_PUBLIC_ variables at build time, so each client
  // variable must also be listed here as process.env.NEXT_PUBLIC_X.
  experimental__runtimeEnv: {},
  // An empty value in .env counts as "not set".
  emptyStringAsUndefined: true,
  // SKIP_ENV_VALIDATION=true skips the checks, e.g. for Docker builds.
  skipValidation: process.env.SKIP_ENV_VALIDATION === "true",
});
