import type { NextConfig } from "next";

// Checks the environment variables when the app builds, not when a user hits a page.
import "./src/lib/env";

const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];

const nextConfig: NextConfig = {
  // Cache Components: the static part of every page is sent instantly and the
  // dynamic parts stream in. Dynamic data must sit inside a <Suspense> boundary.
  cacheComponents: true,
  // Links prefetch the reusable static shell of their route, so navigation is instant.
  partialPrefetching: true,
  // React Compiler auto-optimizes re-renders. No hand-written useMemo/useCallback needed.
  reactCompiler: true,
  // Mongoose (and the dev-only in-memory MongoDB) must be loaded with native
  // require instead of being bundled into the server build.
  serverExternalPackages: ["mongoose", "mongodb-memory-server-core"],
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};

export default nextConfig;
