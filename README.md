# Vibecode Template

A full-stack TypeScript starter built for **vibecoding with AI agents**: describe
what you want in plain language, and the agent builds it following the rules in
[AGENTS.md](AGENTS.md). Works with zero configuration — no database, no accounts,
no env vars needed to start.

## Stack

| Piece | What it does |
| --- | --- |
| [Next.js 16](https://nextjs.org) (App Router) + React 19 | The app — pages, layouts, server components |
| [Bun](https://bun.com) | Package manager **and** runtime (`bun --bun next ...`) |
| [tRPC v11](https://trpc.io) + [Zod 4](https://zod.dev) | End-to-end typesafe API with validated inputs |
| [Mongoose 9](https://mongoosejs.com) / MongoDB | Database — with an automatic **in-memory fallback** |
| [Tailwind v4](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com) | Styling and UI components |
| [Context7 MCP](https://context7.com) | Preconfigured in `.mcp.json` so agents fetch current library docs |

## Quick start

Click **Use this template** on GitHub (or clone the repo), then:

```bash
bun install
bun run dev
```

Open [http://localhost:3000](http://localhost:3000). The **Notes demo** on the
homepage proves the whole chain works (UI → tRPC → Zod → Mongoose → MongoDB)
with zero setup: when `MONGODB_URI` is empty, an in-memory MongoDB starts
automatically. The very first start downloads a MongoDB binary — give it a
minute; after that it's instant.

When you start building the real app, delete the demo:
`src/components/notes-demo.tsx`, `src/trpc/routers/notes.ts`,
`src/server/models/note.ts` (and their usages in `page.tsx` / `_app.ts`).

## Environment

Copy the example and fill in what you need:

```bash
cp .env.example .env
```

- `MONGODB_URI` — a real MongoDB connection string (e.g.
  [MongoDB Atlas](https://www.mongodb.com/atlas)). **Leave empty for the
  in-memory database** — development only: data is lost on every restart, and on
  serverless every instance gets its own. **Always set it in deployed
  environments.**
- `CONTEXT7_API_KEY` — optional, raises the rate limits of the Context7 docs
  server ([get one free](https://context7.com/dashboard)). MCP clients read it
  from your shell environment, so also export it in your shell profile if you
  set one.

## Scripts

| Command | What it does |
| --- | --- |
| `bun run dev` | Dev server on the Bun runtime (Turbopack) |
| `bun run build` | Production build |
| `bun run start` | Serve the production build |
| `bun run lint` | ESLint |
| `bun run typecheck` | TypeScript check (`tsc --noEmit`) |

## Deploy

Set `MONGODB_URI` on every deployed environment — without it each serverless
instance spins up its own empty throwaway database.

There is deliberately **no platform config** in this repo — it's a standard
Next.js project, so platforms auto-detect everything, including Bun via
`bun.lock`.

### Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/aronbraun/vibecode-template&env=MONGODB_URI)

Or push your copy to GitHub and import it at [vercel.com/new](https://vercel.com/new).
Functions run on Node.js by default; to opt into Vercel's Bun runtime (public
beta), add a `vercel.json` with `{ "bunVersion": "1.x" }`.

### Railway

Create a project at [railway.com/new](https://railway.com/new) and deploy from
your repo — Railway detects Bun and runs the standard scripts. Add a MongoDB
service (or use Atlas) and set `MONGODB_URI`.

## Known temporary pin

`package.json` pins the transitive `bson` package to `7.2.0` (via `overrides`):
newer bson versions crash on Bun ≤ 1.3.14 when imported
([oven-sh/bun#32501](https://github.com/oven-sh/bun/issues/32501), already fixed
upstream but not yet released). Remove the override once you're on a newer Bun.

## Project structure

```
src/
  app/                    Pages & layouts (App Router)
    api/trpc/[trpc]/      The single tRPC HTTP handler
    globals.css           Tailwind v4 theme (CSS variables)
  server/
    db.ts                 Mongoose connection + in-memory fallback
    models/               One Mongoose model per file
  trpc/
    init.ts               tRPC setup, context, procedures
    routers/              One router per domain, merged in _app.ts
    client.tsx            Client provider + useTRPC hook
    server.tsx            Server-component helpers (prefetch, HydrateClient)
  components/             Shared components (components/ui is shadcn-managed)
  lib/utils.ts            Shared utils (cn helper)
```

## For AI agents

[AGENTS.md](AGENTS.md) is the rulebook (CLAUDE.md points to it): fetch current
library docs via Context7 before coding, Bun-only workflows, security and code
quality rules, and a completion checklist. This template deliberately ships
**without a test suite** — verification is typecheck + lint + build + security
review.
