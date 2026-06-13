# ArfaPOS

[![Node version](https://img.shields.io/badge/Node.js-%3E%3D20-3c873a?style=flat-square)](https://nodejs.org)
[![pnpm](https://img.shields.io/badge/package%20manager-pnpm-orange?style=flat-square)](https://pnpm.io)
[![Svelte](https://img.shields.io/badge/Svelte-5-ff3e00?style=flat-square&logo=svelte&logoColor=white)](https://svelte.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-blue?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Supabase](https://img.shields.io/badge/Supabase-3fcf8e?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38bdf8?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

> Web-based Point of Sale (POS) for Indonesian warungs and small shops — fast, simple, and mobile-first.

**[Features](#features) • [Tech stack](#tech-stack) • [Getting started](#getting-started) • [Project structure](#project-structure) • [Commands](#commands) • [Architecture](#architecture)**

---

## Features

- **Product management** — Create, read, update, and delete products with SKU, category, price, and stock tracking. Search via URL params.
- **POS cart & checkout** — Three-step flow (select items → review cart → payment). Manual item entry, quantity adjustment, numeric keypad for payment, and automatic change/shortfall calculation.
- **Transaction history** — View past transactions sorted newest-first, with per-transaction detail including line items.
- **Dashboard** — At-a-glance stats for today's revenue and transaction count.
- **Authentication** — Register, login, and logout via Supabase Auth. Session handled server-side with route guards.
- **Mobile-first UI** — Centered portrait layout optimized for touch input. Bottom navigation, sticky header, responsive cards.
- **Indonesian language UI** — Full Bahasa Indonesia interface.

## Tech stack

| Layer           | Technology                                                                                           |
| --------------- | ---------------------------------------------------------------------------------------------------- |
| Framework       | [SvelteKit 2](https://kit.svelte.dev) + [Svelte 5](https://svelte.dev) (runes mode)                  |
| Language        | [TypeScript](https://www.typescriptlang.org)                                                         |
| Styling         | [Tailwind CSS 4](https://tailwindcss.com) + [shadcn-svelte](https://shadcn-svelte.com) (Vega)        |
| Database & Auth | [Supabase](https://supabase.com) (PostgreSQL + RLS)                                                  |
| Validation      | [Zod](https://zod.dev)                                                                               |
| Icons           | [Lucide](https://lucide.dev)                                                                         |
| Testing         | [Vitest](https://vitest.dev) + [Playwright](https://playwright.dev)                                  |
| UI Tooling      | [Storybook](https://storybook.js.org), [Prettier](https://prettier.io), [ESLint](https://eslint.org) |

## Getting started

### Prerequisites

- [Node.js](https://nodejs.org) >= 20
- [pnpm](https://pnpm.io) (required — `engine-strict=true` in `.npmrc`)
- A [Supabase](https://supabase.com) project with the database schema applied

### Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd arfa-pos

# Install dependencies
pnpm install && pnpm prepare
```

> [!IMPORTANT]
> `pnpm prepare` runs `svelte-kit sync` which generates TypeScript definitions for your SvelteKit routes. This is required before running any type checking or dev commands.

### Environment variables

Create a `.env` file in the project root:

```env
PUBLIC_SUPABASE_URL=<your-supabase-project-url>
PUBLIC_SUPABASE_PUBLISHABLE_KEY=<your-supabase-anon-key>
```

### Start development

```bash
pnpm dev
```

The dev server starts at the default Vite port (usually `http://localhost:5173`).

## Project structure

```
src/
├── features/                # Feature-based modules
│   ├── products/            # Product CRUD (fully implemented)
│   ├── pos/                 # POS cart & checkout (partial)
│   ├── dashboard/           # Dashboard stats
│   └── transactions/        # Transaction history & detail
├── lib/
│   ├── components/ui/       # shadcn-svelte UI components
│   ├── supabase/            # Supabase client utilities
│   └── utils/               # Helpers (currency, date, SKU, toast)
├── routes/
│   ├── (auth)/              # Login & register pages
│   ├── (app)/               # Authenticated app routes
│   │   ├── (main)/          # Routes with bottom navigation
│   │   │   ├── dashboard/
│   │   │   ├── pos/
│   │   │   ├── products/
│   │   │   └── transactions/
│   │   ├── products/        # Product add/edit (no bottom nav)
│   │   └── transactions/    # Transaction detail (no bottom nav)
│   └── logout/              # POST /logout API endpoint
└── shared/components/       # App shell components
    ├── app-header.svelte
    ├── bottom-nav.svelte
    ├── input-wrapper.svelte
    ├── page-container.svelte
    └── page-header.svelte
```

## Commands

| Command                | Purpose                                        |
| ---------------------- | ---------------------------------------------- |
| `pnpm dev`             | Start Vite dev server                          |
| `pnpm build`           | Production build                               |
| `pnpm check`           | Typecheck (`svelte-kit sync` + `svelte-check`) |
| `pnpm lint`            | Prettier check + ESLint                        |
| `pnpm format`          | Prettier write (auto-format all files)         |
| `pnpm test:unit`       | Vitest (watch mode)                            |
| `pnpm test`            | Vitest run (CI-style)                          |
| `pnpm storybook`       | Storybook dev server (port 6006)               |
| `pnpm build-storybook` | Static Storybook build                         |

## Architecture

ArfaPOS follows **SvelteKit conventions** with some opinionated patterns:

- **All mutations are SvelteKit form actions** — no REST APIs, no client-side data fetching. Form feedback uses `use:enhance` with `svelte-sonner` toasts.
- **Supabase queries are inlined** in `+page.server.ts` `load` and `action` functions. No ORM or repository layer — RLS policies handle authorization server-side.
- **Server-only Zod validation** — schemas live in `features/<name>/schemas/`. Auth forms skip Zod and pass raw data to Supabase.
- **Mobile-first centered layout** — `PageContainer` constrains content to `max-w-screen-sm`.
- **No global state stores** — component state uses Svelte 5 runes (`$state`, `$derived`, `$props`, `$bindable`). URL search params serve as the source of truth for product search.
- **Path aliases** — `$features` → `src/features/`, `$lib` → `src/lib/`.

### Database

The Supabase schema includes:

- **`products`** — id, name, price, stock, category, sku, created_at
- **`transactions`** — id, total, user_id, amount_paid, created_at
- **`transaction_items`** — id, transaction_id, product_id (nullable), name, price, qty, subtotal

Row-level security ensures users only access their own data.

## Design

ArfaPOS uses a warm brown color palette, Inter variable font, and a deliberately restrained visual system focused on readability and fast transaction processing. See [`DESIGN.md`](DESIGN.md) for the full design system and [`PRD.md`](PRD.md) for product requirements.
