import {
  defaultShouldDehydrateQuery,
  QueryClient,
} from "@tanstack/react-query";
import { TRPCClientError } from "@trpc/client";

// An answer like "Please sign in first" (401) or "Not found" (404) will be the
// same next time, so asking again only keeps the person waiting.
function isAnswerThatWontChange(error: Error) {
  if (!(error instanceof TRPCClientError)) return false;
  const httpStatus = (error.data as { httpStatus?: number } | undefined)
    ?.httpStatus;
  return httpStatus !== undefined && httpStatus < 500;
}

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // With SSR, a staleTime above 0 avoids refetching immediately on the client.
        staleTime: 30 * 1000,
        // Try a failed request again (up to 3 times) only when it could work
        // next time. Retrying a 401 made signed-out pages wait 7 seconds.
        retry: (failureCount, error) =>
          !isAnswerThatWontChange(error) && failureCount < 3,
      },
      dehydrate: {
        // Also send still-pending server prefetches to the client so it can await them.
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) ||
          query.state.status === "pending",
      },
    },
  });
}
