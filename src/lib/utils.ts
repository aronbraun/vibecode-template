// Merges Tailwind class names, dropping conflicting ones (e.g. cn("p-2", "p-4") -> "p-4").
// shadcn components import the same helper straight from the "cn" package.
export { cn } from "cn";
