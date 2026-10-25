"use client";

import { ProgressProvider } from "@bprogress/next/app";
import { ThemeProvider } from "next-themes";
import { NuqsAdapter } from "nuqs/adapters/next/app";

import { TRPCReactProvider } from "@/trpc/client";

// Every app-wide provider in one place, so layout.tsx stays a server component.
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    // Light / dark / system theme, applied as a class on <html>.
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {/* Thin loading bar at the top of the page while navigating. */}
      <ProgressProvider
        height="3px"
        color="var(--primary)"
        options={{ showSpinner: false }}
        shallowRouting
      >
        <TRPCReactProvider>
          {/* Lets components keep state in the URL (?q=...) with nuqs. */}
          <NuqsAdapter>{children}</NuqsAdapter>
        </TRPCReactProvider>
      </ProgressProvider>
    </ThemeProvider>
  );
}
