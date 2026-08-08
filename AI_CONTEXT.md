# AI Context

## Project

Refer to:

- PRD.md
- DESIGN.md
- ARCHITECTURE.md

## Tech Stack

- SvelteKit
- TypeScript
- Supabase
- TailwindCSS

## Coding Rules

- Use strict TypeScript
- Avoid any
- Follow existing folder structure
- Reuse existing UI components
- Use SvelteKit form actions
- Use Zod for validation
- Run `pnpm check && pnpm lint && pnpm test` before finishing

## Before Making Changes

Always:

1. Read PRD.md
2. Read DESIGN.md
3. Read ARCHITECTURE.md
4. Analyze existing implementation
5. Create implementation plan
6. Wait for approval before coding

## Database

- Schema is defined in `supabase/migrations/` (001–003) and applied manually via the Supabase dashboard SQL editor — do not run a local migration tool.
- Queries are inlined in `+page.server.ts` via `locals.supabase`; security relies on RLS.
