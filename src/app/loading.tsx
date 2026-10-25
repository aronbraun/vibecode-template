import { Skeleton } from "@/components/ui/skeleton";

// Shown while a page's server data is still loading.
export default function Loading() {
  return (
    <main className="flex flex-1 flex-col items-center gap-6 px-6 py-16">
      <Skeleton className="h-10 w-72" />
      <Skeleton className="h-6 w-96 max-w-full" />
      <Skeleton className="h-80 w-full max-w-2xl" />
    </main>
  );
}
