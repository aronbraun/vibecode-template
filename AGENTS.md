<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# AGENTS.md — vibecode template

A guide for AI coding agents working in this repository. Read this before making
changes and follow it in all work here. These rules override your defaults.

## What this project is

A full-stack TypeScript template for vibecoding — turning plain-language requests
into real features fast. The stack:

- **Next.js 16 (App Router)** + **React 19** + **TypeScript** — the app lives in `src/app`
- **Bun** — package manager AND runtime (scripts run `bun --bun next ...`)
- **tRPC v11 + Zod 4** — the ONLY way this app exposes an API
- **Mongoose 9 / MongoDB** — with an automatic in-memory database when `MONGODB_URI` is unset
- **Tailwind CSS v4 + shadcn/ui** — styling and UI components
- **Serverless-ready** — a standard Next.js repo with no platform config on
  purpose: Vercel and Railway auto-detect the framework and Bun (via `bun.lock`)

There is **no test suite in this template — that is deliberate.** Do not add
tests, test frameworks, or test scripts unless the user explicitly asks for them.
Verify work with the completion checklist at the bottom instead.

## Who you are talking to

The person chatting with you is **almost always NOT a developer**. They are
vibecoding: describing what they want in plain language. Because of that:

- **Explain things in plain language.** Avoid jargon. When you do something
  technical, say what it means for them.
- **Make reasonable decisions yourself** (naming, file locations, styling
  defaults, which existing pattern to copy). Only ask when you genuinely need
  product intent (e.g. "should this list show all items or only active ones?").
- **Never assume they'll review code.** Verify your own work (checklist below)
  before saying it's done.

## Documentation & library versions — MANDATORY, use Context7 first

- **Always read the latest docs via the Context7 MCP** (configured in
  `.mcp.json`) **before writing or changing code that uses a library, framework,
  SDK, API, or CLI tool** — even ones you think you know well (Next.js, tRPC,
  TanStack Query, Zod, Mongoose, Tailwind, shadcn, date libs, ...). Training
  data is stale or wrong about current APIs. Do this before writing code, not
  after something breaks. **If Context7 is not available, web-search the
  official docs instead — never code a library from memory.**
- **Always resolve the current version before installing any new library** —
  via Context7, a web search, or `bun info <package> version`. Never install a
  guessed version, and never hand-edit a version into `package.json`; install
  with `bun add <package>`.
- **Only use reliable libraries**: widely used, actively maintained, well
  documented. Prefer what is already installed over adding something new.

## Bun — runtime & package manager

- Use Bun for everything: `bun install` / `bun add` / `bun remove`, and
  `bun run dev|build|start|lint|typecheck`. `bun.lock` is committed — keep it.
- The scripts use `bun --bun next ...` so Next.js executes on the Bun runtime
  locally and on any host that runs the package.json scripts (Railway, Docker,
  a VPS). Vercel runs functions on Node.js by default — fine, the code must
  stay portable anyway; a project can opt into Vercel's Bun runtime (beta)
  later by adding a `vercel.json` with `{ "bunVersion": "1.x" }`. Don't add
  platform config files to this template.
- **Never use Bun-only APIs in app code** (`Bun.serve`, `Bun.file`, `bun:sqlite`,
  the `$` shell, `Bun.password`, ...). The app must stay portable to Node-based
  serverless platforms. Stick to Web-standard and Node APIs.
- CI and deploys install with `bun install --frozen-lockfile`.
- **Temporary pin:** `package.json` has `"overrides": { "bson": "7.2.0" }` because
  bson ≥ 7.3 crashes on Bun ≤ 1.3.14 at import time
  (`node:v8 isBuildingSnapshot is not yet implemented` — fixed upstream in
  oven-sh/bun#32501, not yet in a Bun release). Once a newer Bun ships, remove
  the override and this bullet, and confirm with
  `bun -e "await import('mongoose')"` that it still loads.

## Project structure — where things go

```
src/
  app/                    Pages & layouts (App Router). One folder per route.
    api/trpc/[trpc]/      The single tRPC HTTP handler — don't add routes here.
    globals.css           Tailwind v4 theme (CSS variables) — the only theme file.
  server/                 Server-only code. Never import from client components.
    db.ts                 Mongoose connection (+ automatic in-memory fallback).
    models/<name>.ts      One Mongoose model per file (copy note.ts).
  trpc/
    init.ts               tRPC setup, context, publicProcedure.
    routers/<domain>.ts   One router per domain (copy notes.ts) ...
    routers/_app.ts       ... merged here. Never define procedures inline here.
    client.tsx            "use client" provider + useTRPC hook.
    server.tsx            Server-component helpers (prefetch, HydrateClient).
    query-client.ts       TanStack Query defaults.
  components/             Shared React components (presentational, typed props).
    ui/                   shadcn components — managed by the CLI, see UI rules.
  lib/utils.ts            The shared util file (cn helper lives here).
```

## Database — Mongoose + MongoDB

- Every model lives in its own file in `src/server/models/<name>.ts`, shaped
  exactly like `note.ts`: `import "server-only"`, one interface, a
  `new Schema<X>(...)`, and the `models.X || model("X", schema)` guard (it
  prevents recompilation errors on hot reload).
- **Never import models — or anything from `src/server/` — into a client
  component.**
- **Never call `mongoose.connect` yourself.** `createTRPCContext` already awaits
  `connectToDatabase()` (`src/server/db.ts`) for every procedure; it connects
  once and is a no-op afterwards.
- **No `MONGODB_URI` → an in-memory MongoDB starts automatically.** That is a
  development convenience ONLY: all data is lost on restart, and on serverless
  every instance gets its own empty database. Real deployments must set
  `MONGODB_URI` (e.g. MongoDB Atlas — SSL on, never publicly accessible).
- **Avoid extra database round-trips — reuse what you have, and batch:**
  - Don't add a query to fetch something an earlier step in the same flow
    already loaded — carry it forward and reuse it.
  - When you need related data, get it in the same query (`populate` with a
    field selection, or aggregate) instead of a second lookup per record.
  - Work on many items with ONE bulk call (`insertMany`, `updateMany`,
    `deleteMany`, `$in`) — never one query per item in a loop.
  - Use `.lean()` for read-only data and select only the fields you need.
  - The only acceptable extra call is one that clearly improves correctness or
    readability at negligible cost.

## API — tRPC only

- **Every endpoint is a tRPC procedure** in a per-domain router
  `src/trpc/routers/<domain>.ts` merged into `_app.ts` (copy `notes.ts`). Do
  not create bare Next.js route handlers except when tRPC genuinely can't do
  the job (webhooks, file streaming, OAuth callbacks). Webhook handlers must
  verify the signature on the RAW request body and be idempotent.
- **Validate ALL input with Zod v4** (`import * as z from "zod"`) in
  `.input(...)`. Server-side validation is the real gate — client-side checks
  are cosmetic. Build schema variants from one base with
  `.pick()/.omit()/.partial()/.extend()` — never re-declare the same fields.
- **Return only the fields the UI needs** — never whole database documents, and
  never sensitive fields.
- Responses are plain JSON — return Dates as `.toISOString()` strings. If the
  project outgrows this, add superjson exactly as the tRPC data-transformers
  docs describe (all three touchpoints), not halfway.
- Client components: `const trpc = useTRPC()`, then
  `useQuery(trpc.x.y.queryOptions(...))` / `useMutation(trpc.x.y.mutationOptions(...))`,
  and invalidate with `queryClient.invalidateQueries(trpc.x.y.queryFilter())`.
  Always render loading, empty, and error states.
- Server components may prefetch via `src/trpc/server.tsx` (`prefetch` +
  `HydrateClient`) — but prefetching runs the query (and touches the database)
  during rendering, so only do it in dynamically rendered pages, never in
  statically prerendered ones (it would hit the database at build time).
- Errors: log the real cause with `console.error`, then throw a `TRPCError`
  whose message is clear, simple, and safe for the end user. Never leak stack
  traces, driver errors, or internals to the client.

## UI — Tailwind v4 + shadcn/ui

- **Tailwind v4 — there is NO `tailwind.config.*` file.** The theme (colors,
  radius, fonts) lives in `src/app/globals.css` as CSS variables. Change the
  theme there and only there.
- Style with utility classes; combine conditional classes with `cn()` from
  `@/lib/utils`. Use theme tokens (`bg-background`, `text-muted-foreground`,
  `border`, `text-destructive`, ...) instead of hardcoded colors so dark mode
  keeps working.
- **When NO design is provided:** build the UI on shadcn/ui components and
  customize on top of them — don't hand-roll buttons, inputs, dialogs, tables.
- **Add shadcn components only with the CLI:** `bunx shadcn@latest add <component>`.
  Never hand-write or paste files into `src/components/ui`, and don't edit them
  for one-off looks — customize at the usage site with props/classes, or extend
  deliberately when the change is app-wide.
- **When a design IS provided** (image, Figma, detailed spec): match it exactly —
  spacing, sizes, colors, typography — using shadcn primitives underneath where
  they help.
- **Check what already exists before creating a component.** Reuse or extend
  `src/components` first. Anything plausibly used more than once (a card, badge,
  dialog, empty state, banner) becomes a reusable component with clear typed
  props in `src/components`. Components stay presentational — data fetching
  stays in the pages/views via tRPC.

## Security — mandatory for ALL code

Apply these WHILE writing code, not after. Every new procedure, page, and fix
must comply from the first draft.

### Authentication & authorization (the moment the app has users)
- Every procedure that touches user data verifies the authenticated user —
  never rely on middleware alone.
- Every query that reads or modifies user data includes a userId/ownership
  filter.
- Admin checks happen inside the procedure, not only in middleware. Return
  `NOT_FOUND` (not `FORBIDDEN`) for resources the user doesn't own — don't
  reveal they exist.
- Rate limit login/signup/PIN endpoints; lock accounts after repeated failures.
- Hash passwords/PINs with bcrypt or Argon2 — never SHA-256 or plaintext.

### Input validation & injection
- Zod on every input (see API rules). Validate file uploads: size limit + MIME
  allowlist. Sanitize user-supplied filenames before storing or reflecting them.
- Only Mongoose typed methods / parameterized queries — never build a query by
  concatenating user input. Never `eval()`, never `dangerouslySetInnerHTML`
  with user content, never pass user input to shell commands.

### Secrets & environment
- Never hardcode API keys, connection strings, or signing secrets. Server
  secrets never get a `NEXT_PUBLIC_` prefix and are never passed as props to
  client components.
- `.env` is gitignored; only `.env.example` (placeholders + comments) is
  committed. Update `.env.example` with every new variable.
- `import "server-only"` on every module with sensitive logic (db and models
  already do this — keep it up).
- Separate keys for dev vs production. If a key may have leaked: revoke it,
  rotate, update envs, audit usage.

### API security & data exposure
- Rate limit public-facing and sensitive endpoints.
- Generic error messages to clients; detail only in server logs.
- Strip sensitive fields (password hashes, tokens, internal ids) from every
  response.
- SSRF: never fetch a user-controlled URL without validation and an allowlist;
  block private/internal IP ranges (127.x, 10.x, 169.254.x, 172.16.x, 192.168.x).

### Headers, database, dependencies
- Security headers are set centrally in `next.config.ts` (X-Frame-Options DENY,
  nosniff, HSTS, Referrer-Policy, Permissions-Policy). Keep them. Add a
  nonce-based Content-Security-Policy (see the Next.js CSP guide) when the app
  gets real traffic.
- Database connections over SSL; the database must not be publicly accessible.
- `bun.lock` committed; `bun install --frozen-lockfile` in CI/CD; run
  `bun audit` regularly and fix high/critical findings; remove unused
  dependencies.

## Code quality — mandatory

### Code must be extremely easy for humans to read
- Optimize first for human readability and simplicity, not cleverness.
- Prefer the shortest code possible — but when shorter means more complex,
  choose the longer version that is easier to read.

### Naming must be extremely simple and clear
- Name everything as simply as possible — even if longer — for clarity.
- Call a thing by what it actually does, not its "professional" name. Prefer
  plain English over technical names when the plain words are clearer.

### Never repeat yourself (DRY)
- The same fields, logic, or shape in more than one place → factor out a single
  source of truth (one Zod base schema, one shared function, one component).
- A rule that applies project-wide (e.g. an access check) lives in ONE reusable
  function that everything calls — never inline a second copy.

### Do not create extra files for small things
- A one-purpose helper used in one place belongs IN the file that uses it, not
  in its own file. No proxy/pass-through functions whose body just forwards the
  same arguments — inline the call.
- A helper needed by more than one file goes in the ONE shared util file
  (`src/lib/utils.ts`, or a single `<domain>.util.ts` next to that domain) —
  never a new file per helper, never a second util file next to an existing one.
- But don't overload one file either: when it starts holding several unrelated
  things, split it then. Aim for the simplest layout a human can follow.

### Always log — at a standard level, never overkill
- Server code logs with `console.info` / `console.warn` / `console.error`
  (serverless platforms capture these). Don't add a logging library and don't
  invent a logger; no leftover `console.log` debugging.
- Log what's worth knowing later: the start/outcome of each flow with a useful
  id or count, and every error with its cause before it is thrown or swallowed.
- No logs inside loops per item, no dumping variables, and never log secrets,
  tokens, passwords, connection strings, or whole documents.
- A log line is for us; the thrown error message is for the user — clear,
  simple, safe.

## Completion checklist — BLOCKING (before saying anything is done)

1. `bun run typecheck` — clean
2. `bun run lint` — clean
3. `bun run build` — succeeds
4. Security review of the new code against the rules above (input validation,
   ownership filters, minimal data exposure, no secrets in client code)
5. `.env.example` and README updated if env vars or behavior changed

This is not a finishing step — it is part of the implementation.

## Keeping docs updated

- `README.md` is the human guide. After any change to what the app does or how
  to run/deploy it, update it in the same change — short and plain.
- This AGENTS.md: when the user gives you a lasting rule, or the same mistake
  happens twice, write it down here so it doesn't happen a third time. When you
  find something here that is now wrong, fix it in the same change.
