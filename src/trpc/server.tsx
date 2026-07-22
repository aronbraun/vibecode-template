import "server-only";

import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import {
  createTRPCOptionsProxy,
  type TRPCQueryOptions,
} from "@trpc/tanstack-react-query";
import { headers } from "next/headers";
import { cache } from "react";
import { createTRPCContext } from "@/trpc/init";
import { makeQueryClient } from "@/trpc/query-client";
import { appRouter } from "@/trpc/routers/_app";

// One query client per server request (React cache keeps it stable).
export const getQueryClient = cache(makeQueryClient);

// Call procedures from server components, e.g. prefetch(trpc.notes.list.queryOptions()).
// Prefetching runs the query (and touches the database) during rendering — pages that
// do it must render dynamically, not be statically prerendered at build time.
export const trpc = createTRPCOptionsProxy({
  ctx: async () => createTRPCContext({ headers: await headers() }),
  router: appRouter,
  queryClient: getQueryClient,
});

export function HydrateClient(props: { children: React.ReactNode }) {
  const queryClient = getQueryClient();
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {props.children}
    </HydrationBoundary>
  );
}

export function prefetch<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- matches the official tRPC helper
  T extends ReturnType<TRPCQueryOptions<any>>,
>(queryOptions: T) {
  const queryClient = getQueryClient();
  if (queryOptions.queryKey[1]?.type === "infinite") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- matches the official tRPC helper
    void queryClient.prefetchInfiniteQuery(queryOptions as any);
  } else {
    void queryClient.prefetchQuery(queryOptions);
  }
}
