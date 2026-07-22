"use client";

import type { QueryClient } from "@tanstack/react-query";
import { QueryClientProvider } from "@tanstack/react-query";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { createTRPCContext } from "@trpc/tanstack-react-query";
import { useState } from "react";
import { makeQueryClient } from "@/trpc/query-client";
import type { AppRouter } from "@/trpc/routers/_app";

export const { TRPCProvider, useTRPC, useTRPCClient } =
  createTRPCContext<AppRouter>();

let browserQueryClient: QueryClient | undefined;

function getQueryClient() {
  if (typeof window === "undefined") {
    // Server: always a fresh query client, never shared between requests.
    return makeQueryClient();
  }
  // Browser: reuse one client so React re-renders don't wipe the cache.
  browserQueryClient ??= makeQueryClient();
  return browserQueryClient;
}

function getUrl() {
  if (typeof window !== "undefined") return "/api/trpc";
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}/api/trpc`;
  return `http://localhost:${process.env.PORT ?? 3000}/api/trpc`;
}

export function TRPCReactProvider(props: { children: React.ReactNode }) {
  const queryClient = getQueryClient();
  const [trpcClient] = useState(() =>
    createTRPCClient<AppRouter>({
      links: [httpBatchLink({ url: getUrl() })],
    }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
        {props.children}
      </TRPCProvider>
    </QueryClientProvider>
  );
}
