import { NotesDemo } from "@/components/notes-demo";

const stack = [
  "Next.js 16",
  "TypeScript",
  "Bun",
  "tRPC v11",
  "Zod 4",
  "Mongoose 9",
  "Tailwind v4",
  "shadcn/ui",
];

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-10 px-6 py-16">
      <div className="flex max-w-xl flex-col items-center gap-4 text-center">
        <h1 className="text-4xl font-semibold tracking-tight">
          Vibecode Template
        </h1>
        <p className="text-lg text-muted-foreground">
          A full-stack TypeScript starter. Edit{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">
            src/app/page.tsx
          </code>{" "}
          to begin — AGENTS.md tells your coding agent how to work here.
        </p>
        <ul className="flex flex-wrap justify-center gap-2">
          {stack.map((item) => (
            <li
              key={item}
              className="rounded-full border px-3 py-1 text-sm text-muted-foreground"
            >
              {item}
            </li>
          ))}
        </ul>
      </div>
      <NotesDemo />
    </main>
  );
}
