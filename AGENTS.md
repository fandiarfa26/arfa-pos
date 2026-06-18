# AGENTS.md — ArfaPOS

## Prerequisites

- **nvm** — run `nvm use latest` first (pnpm is often unavailable without it)
- **pnpm** required (`engine-strict=true` in `.npmrc`)
- `.env` must contain `PUBLIC_SUPABASE_URL` and `PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- Run `pnpm install && pnpm prepare` before any check or dev command (`prepare` runs `svelte-kit sync`)

## Commands

| Command                | Purpose                                       |
| ---------------------- | --------------------------------------------- |
| `pnpm dev`             | Vite dev server                               |
| `pnpm build`           | Production build                              |
| `pnpm check`           | `svelte-kit sync && svelte-check` (typecheck) |
| `pnpm lint`            | Prettier check + ESLint                       |
| `pnpm format`          | Prettier write                                |
| `pnpm test:unit`       | Vitest (watch mode)                           |
| `pnpm test`            | `vitest --run` (CI-style)                     |
| `pnpm storybook`       | Storybook dev on port 6006                    |
| `pnpm build-storybook` | Static Storybook build                        |

Run `pnpm format` consistently — Prettier uses **tabs, single quotes, no trailing commas, 100 print width**. The formatter runs on Svelte files with `prettier-plugin-svelte` and sorts Tailwind classes via `prettier-plugin-tailwindcss`.

## Architecture

- **SvelteKit 2 + Svelte 5 runes** — forced via `svelte.config.js`. No `$:` assignments, no `export let`, no `on:click`. Use `$state()`, `$derived()`, `$props()`, `$bindable()`.
- **Feature-based structure** under `src/features/<name>/` with subdirs: `components/`, `schemas/`, `services/`, `types/`. Only `products/` is fully implemented; `pos/` is partial.
- **Shared components** in `src/shared/components/` (`app-header`, `bottom-nav`, `page-container`, `input-wrapper`, `page-header`).
- **shadcn-svelte UI** in `src/lib/components/ui/` (Vega style, configured via `components.json`).
- **Path aliases**: `$features` → `./src/features`, `$shared` → `./src/shared` (in `svelte.config.js`), `$lib` (SvelteKit default).
- **Global CSS** at `src/routes/layout.css` (not `src/app.css`) — Tailwind 4 `@import`, custom warm-brown theme, dark mode variables, custom `@utility` classes.
- **Mobile-first centered layout** — `PageContainer` uses `max-w-screen-sm`.

## Data & Backend Patterns

- **All mutations are SvelteKit form actions** (not REST). Only `/logout` is a standalone `+server.ts` endpoint.
- **Supabase queries are inlined** in `+page.server.ts` `load`/`action` functions. No ORM, no repository layer. Only `deleteProductService` is extracted to `src/features/products/services/`.
- **Server-only Zod validation** — Zod schemas live in `features/<name>/schemas/`. Auth forms (login/register) skip Zod and pass raw data to Supabase.
- **`use:enhance` + svelte-sonner toasts** for form feedback via `handleFormToast()` utility.
- **Supabase SSR** via `hooks.server.ts` — `event.locals.supabase`, `event.locals.session`, `event.locals.user` set on every request. Auth guard in `(app)/+layout.server.ts`.

## Testing

- **3 Vitest projects** in `vite.config.ts`: `client` (Playwright browser, `*.svelte.{test,spec}.{js,ts}`), `server` (Node, `*.{test,spec}.{js,ts}` excluding svelte), `storybook` (Storybook integration tests).
- **`expect.requireAssertions: true`** — every test must have at least one assertion.
- **No real tests exist** — only boilerplate examples (`greet.spec.ts`, `Welcome.svelte.spec.ts`, Storybook stories).

## Key Gotchas

- `$features` alias exists but **route files use deep relative imports** (`../../../../features/...`) — prefer `$features` for new code.
- **RLS-only security** — most queries omit `user_id` filters, relying on Supabase Row Level Security (not visible in code).
- **Auth validation gap** — auth forms don't use Zod and return raw Supabase errors (inconsistent UX).
- **No CI/CD** — no CI config files in repo. Run `pnpm check && pnpm lint && pnpm test` before committing.
- **Dark mode** — `mode-watcher` is a dependency and dark CSS variables exist, but no toggle UI is implemented.
- **Architecture reference** — `ARCHITECTURE.md` has detailed patterns and known issues.
- **Design docs** — consult `PRD.md` and `DESIGN.md` before implementing new features (per project convention).
