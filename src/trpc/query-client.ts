import { defaultShouldDehydrateQuery, QueryClient } from "@tanstack/react-query";

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // With SSR, a staleTime above 0 avoids refetching immediately on the client.
        staleTime: 30 * 1000,
      },
      dehydrate: {
        // Also send still-pending server prefetches to the client so it can await them.
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) || query.state.status === "pending",
      },
    },
  });
}
