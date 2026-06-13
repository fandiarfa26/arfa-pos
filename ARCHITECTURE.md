# ArfaPOS Architecture Document

> Based on the current implementation at commit time. This document describes what exists in the codebase, not aspirational architecture.

---

## 1. Project Overview

### Purpose

ArfaPOS is a **web-based Point of Sale (POS) application** for small Indonesian warungs and toko kecil (small shops). It is designed to be:

- **Fast** — checkout process optimized for speed
- **Mobile-first** — primary target is portrait-mode mobile devices
- **Simple** — minimal training required, non-technical users
- **Lightweight** — not an ERP; focused on daily transactions

### Main Business Domains

Based on the codebase, only **one domain is fully implemented**:

| Domain                  | Status                                               |
| ----------------------- | ---------------------------------------------------- |
| **Product Management**  | Fully implemented (CRUD + search)                    |
| **Authentication**      | Fully implemented (register, login, logout, session) |
| **POS / Cart**          | Placeholder (`<h1>pos</h1>`)                         |
| **Checkout**            | Not implemented                                      |
| **Transaction History** | Placeholder (`<h1>transactions</h1>`)                |
| **Dashboard**           | Placeholder (greeting text only)                     |

---

## 2. Tech Stack

### Core Framework

| Technology    | Version | Purpose                                             |
| ------------- | ------- | --------------------------------------------------- |
| SvelteKit     | ^2.57.0 | Full-stack framework (SSR, routing, server actions) |
| Svelte        | ^5.55.2 | UI framework with runes mode                        |
| TypeScript    | ^6.0.2  | Strict type safety                                  |
| Vite          | ^8.0.7  | Build tool                                          |
| Tailwind CSS  | ^4.2.2  | Utility-first CSS                                   |
| shadcn-svelte | ^1.3.0  | UI component library (Vega style)                   |

### Backend / Database

| Technology    | Version   | Purpose                               |
| ------------- | --------- | ------------------------------------- |
| Supabase js   | ^2.106.2  | Database client + Auth                |
| @supabase/ssr | ^0.10.3   | Server-side Supabase session handling |
| PostgreSQL    | (managed) | Database via Supabase                 |
| Zod           | ^4.4.3    | Schema validation                     |

### UI Libraries

| Library                    | Purpose                                        |
| -------------------------- | ---------------------------------------------- |
| @lucide/svelte             | Icons                                          |
| bits-ui                    | Headless UI primitives (dialog, dropdown-menu) |
| svelte-sonner              | Toast notifications                            |
| tailwind-merge             | Tailwind class merging                         |
| tailwind-variants          | Component variants (used by shadcn button)     |
| clsx                       | Conditional class names                        |
| mode-watcher               | Dark mode support                              |
| tw-animate-css             | Animation utilities                            |
| @fontsource-variable/inter | Inter font                                     |
| @tailwindcss/forms         | Form reset plugin                              |

### Testing & Quality

| Tool       | Purpose                                      |
| ---------- | -------------------------------------------- |
| Vitest     | Test runner (unit + browser component tests) |
| Playwright | Browser provider for Vitest                  |
| Storybook  | Component development environment            |
| Prettier   | Code formatting                              |
| ESLint     | Linting                                      |

### Deployment

- **Adapter:** `@sveltejs/adapter-auto` (auto-detects deployment platform)

---

## 3. Directory Structure

### Top-Level Layout

```
arfa-pos/
├── .env                     # Supabase URL + anonymous key
├── .storybook/              # Storybook configuration
├── DESIGN.md                # Design system & UI guidelines
├── PRD.md                   # Product requirements document
├── AI_CONTEXT.md             # Instructions for AI coding assistants
├── components.json          # shadcn-svelte configuration
├── pnpm-workspace.yaml      # pnpm workspace settings (allows oxide + esbuild)
├── svelte.config.js          # SvelteKit config (runes mode forced)
├── vite.config.ts           # Vite + Vitest configuration (3 test projects)
├── tsconfig.json            # Strict TypeScript, bundler module resolution
├── eslint.config.js         # ESLint flat config
├── static/                  # Static assets (robots.txt)
└── src/                     # Application source code
```

### `src/` Directory

```
src/
├── app.d.ts                 # App.Locals type definitions (supabase, session, user)
├── app.html                 # Base HTML template
├── hooks.server.ts          # Global handle hook: Supabase SSR client setup
├── layout.css               # Tailwind imports + custom warm-brown theme
├── features/                # Feature-based modules
│   └── products/            # (only implemented feature)
│       ├── components/      # UI components
│       ├── schemas/         # Zod validation schemas
│       ├── services/        # Database access functions
│       └── types/           # TypeScript interfaces
├── lib/
│   ├── components/ui/       # shadcn-svelte components (button, card, dialog, etc.)
│   ├── supabase/            # Supabase browser client factory
│   ├── utils/               # Utility functions (currency, SKU, toast)
│   └── vitest-examples/     # Boilerplate test examples
├── routes/                  # SvelteKit routes and layouts
│   ├── (auth)/              # Unauthenticated routes (login, register)
│   ├── (app)/               # Authenticated routes (auth guard)
│   │   └── (main)/          # Routes with bottom navigation
│   └── logout/              # Logout API endpoint
├── shared/
│   └── components/          # Shared UI components
└── stories/                 # Storybook boilerplate stories
```

### Feature Folder Structure

The only fully implemented feature (`products`) follows this pattern:

```
features/<feature-name>/
├── components/       # Svelte components specific to this feature
├── schemas/         # Zod validation schemas
├── services/        # Database access / business logic functions
└── types/           # TypeScript interfaces and type definitions
```

This pattern is defined by PRD.md but only `products` exists. Other domains (`transactions`, `pos`) do not have feature folders yet.

---

## 4. Architecture Patterns

### Feature-Based Structure (Partial)

The codebase adopts a feature-based folder structure under `src/features/`. Currently only `products/` exists with the sub-structure `components/`, `schemas/`, `services/`, `types/`. Other domains (dashboard, POS, transactions) live directly in `src/routes/` as placeholders without feature infrastructure.

### No Repository Pattern

Database queries are executed **inline** in SvelteKit server files (`+page.server.ts`) using `locals.supabase` directly. There is a single small service file:

- `delete-product-service.ts` — wraps a single Supabase delete call

Most queries (product list, product by SKU, product insert, product update) are written directly in the route's `load` function or action handler. There is **no abstracted repository or data access layer**.

### Service Layer (Minimal)

Only one service exists:

```
features/products/services/delete-product-service.ts
```

This function accepts `supabase` client as a parameter and performs a database operation. It is a thin wrapper around Supabase's query builder. Other operations (create, update, list) are inlined in route files.

### No Dependency Injection

There is **no DI container or manual DI pattern**. The Supabase client is accessed through `event.locals.supabase`, which is attached by SvelteKit's `handle` hook (`hooks.server.ts`). On the client side, `createSupabaseBrowserClient()` is a factory function — but it is currently not used anywhere in the application code (only defined).

### State Management

State management uses **only Svelte 5 runes** — no global stores, no Context API, no external state managers.

| Mechanism                      | Usage                                                           |
| ------------------------------ | --------------------------------------------------------------- |
| `$state()`                     | Local component state (form inputs, loading flags, dialog open) |
| `$derived()` / `$derived.by()` | Computed values (form state, display text)                      |
| `$props()`                     | Component props                                                 |
| `$bindable()`                  | Two-way binding (dialog open, button ref)                       |
| `SvelteURLSearchParams`        | Reactive URL search params (product search)                     |
| Form `ActionResult`            | Server validation results passed as `form` prop                 |

---

## 5. Frontend Conventions

### Component Organization

Components are split into three categories:

1. **`src/features/<feature>/components/`** — Feature-specific components (e.g., `product-card.svelte`, `product-form.svelte`)
2. **`src/shared/components/`** — Reusable application components (e.g., `app-header.svelte`, `bottom-nav.svelte`, `page-container.svelte`)
3. **`src/lib/components/ui/`** — shadcn-svelte primitives (e.g., `button.svelte`, `card/`, `dialog/`)

Components use Svelte 5 runes and the `$props()` API for prop declarations. Snippet types are used for children slots.

### Form Handling

Forms use **SvelteKit form actions** with `use:enhance` for progressive enhancement:

1. Server action in `+page.server.ts` processes form data, validates with Zod, and returns `ActionResult`
2. Client-side `use:enhance` captures the result, calls `handleFormToast()` for notification
3. On success, `goto()` redirects to the target page

The `handleFormToast()` utility maps `ActionResult` types to svelte-sonner toasts:

- `success` → green toast
- `failure` → amber toast
- `error` → red toast

### Validation Approach

All server-side validation uses **Zod schemas** (`features/products/schemas/product-schema.ts`):

```ts
export const productSchema = z.object({
	name: z.string().trim().min(1, 'Nama produk tidak boleh kosong'),
	category: z.string().trim().nullable(),
	price: z.coerce.number().min(500, 'Harga produk tidak boleh kurang dari Rp 500'),
	stock: z.coerce.number().nullable()
});
```

Validation errors are returned as `fieldErrors` using `z.treeifyError()`. These are mapped to specific form fields and displayed via `InputWrapper` component.

**Authentication forms (login/register) do NOT use Zod validation** — they pass raw form data to Supabase and display error messages directly.

### Table/List Implementation

Lists use **mobile-first card layouts**, not traditional HTML tables:

- `product-list.svelte` renders a `grid grid-cols-1` with `ProductCard` components
- Each card shows name, price (formatted IDR), category, stock, and action buttons
- Search functionality uses debounced input (500ms) with URL param sync via `SvelteURLSearchParams`

---

## 6. Backend Conventions

### Server Actions

Mutations use **SvelteKit form actions** (not REST API routes). Each action is a named export in `+page.server.ts`:

- `?/login` — `signInWithPassword`
- `?/register` — `signUp`
- `?/createProduct` — Zod validated product insert
- `?/updateProduct` — Zod validated product update
- `?/deleteProduct` — product delete

Actions return either:

- `fail(status, data)` — validation errors or server errors
- `{ message: string }` — success object (redirect via `goto()` on client)

### API Routes

Only **one** standalone API route exists:

- `POST /logout` — `src/routes/logout/+server.ts` — calls `supabase.auth.signOut()` then redirects to `/login`

No RESTful API endpoints exist. All other mutations are form actions.

### Database Access Pattern

1. **Server-side:** `locals.supabase` (created in `hooks.server.ts` via `createServerClient`) is used in `load` functions and action handlers
2. **Query style:** Direct Supabase query builder calls (`supabase.from('products').select(...)`), no abstraction layer
3. **User scoping:** Only `createProduct` sets `user_id: locals.user?.id`; other queries do not explicitly filter by user (relies on Supabase RLS policies)
4. **Client-side:** `createSupabaseBrowserClient()` function exists in `src/lib/supabase/client.ts` but is not currently used anywhere

---

## 7. Naming Conventions

### Components

- **shadcn-svelte UI components:** Lowercase, kebab-case files (`button.svelte`, `input-group/`)
- **Feature components:** PascalCase, hyphen-delimited for multi-word (`product-card.svelte`, `product-add-button.svelte`, `product-delete-dialog.svelte`)
- **Shared components:** PascalCase, hyphen-delimited (`app-header.svelte`, `page-container.svelte`, `input-wrapper.svelte`)
- **Layout/routing components:** SvelteKit conventions (`+layout.svelte`, `+page.svelte`, `+page.server.ts`, `+server.ts`, `+error.svelte`)

### Hooks

Only one server-side hook exists: `src/hooks.server.ts`. Client-side hooks directory (`src/lib/hooks/`) exists but is empty.

**Needs clarification:** No custom client-side hooks exist. The `$lib/hooks` alias is defined in `components.json` but unused.

### Utilities

Utility files are in `src/lib/utils/` and use kebab-case:

- `currency.ts` — exports `formatCurrency()`
- `generate-sku.ts` — exports `generateSku()`
- `handle-form-toast.ts` — exports `handleFormToast()`

General utilities (`cn`, type helpers) are in `src/lib/utils.ts` (root of `$lib`).

### Types

Feature types are in `features/<feature>/types/`:

- `product.ts` — exports `Product` interface
- `product-form-state.ts` — exports `ProductFormState` interface

---

## 8. Testing Strategy

### Current State

Testing infrastructure is **configured but only contains boilerplate examples**:

| Test Type               | Configured?                 | Real Tests?                                    |
| ----------------------- | --------------------------- | ---------------------------------------------- |
| Unit tests (server)     | ✅ Vitest, Node environment | ❌ Only boilerplate (`greet.spec.ts`)          |
| Browser component tests | ✅ Vitest + Playwright      | ❌ Only boilerplate (`Welcome.svelte.spec.ts`) |
| Storybook tests         | ✅ Storybook + a11y addon   | ❌ Only boilerplate stories                    |
| Visual regression       | ✅ Chromatic configured     | ❌ Not used                                    |

### Test Configuration (vite.config.ts)

Three Vitest projects are configured:

1. **client** — browser environment (Playwright + Chromium), runs `*.svelte.{test,spec}.{js,ts}` files
2. **server** — Node environment, runs `*.{test,spec}.{js,ts}` files (excluding svelte files)
3. **storybook** — uses `storybookTest()` plugin for Storybook integration tests

All tests require explicit assertions (`expect.requireAssertions: true`).

**Needs clarification:** No tests exist for the actual application features (products, auth, etc.). Testing patterns for SvelteKit server actions, load functions, and Supabase queries are not established.

---

## 9. Feature Development Guide

This section describes the pattern that the existing `products` feature establishes. It documents what currently exists, not a prescribed workflow.

### Steps Observed from `products` Feature

1. **Create types** in `features/<name>/types/` — define interfaces for data models
2. **Create schema** in `features/<name>/schemas/` — Zod validation schema
3. **Create services** in `features/<name>/services/` — database functions (currently only delete has its own service)
4. **Create components** in `features/<name>/components/` — UI components
5. **Wire up routes** in `src/routes/` — `+page.server.ts` (load + actions) and `+page.svelte` (render)

### Required Files per Feature (Inferred from `products`)

```
features/<name>/
├── components/
│   ├── <name>-list.svelte          # List/orchestrator component
│   ├── <name>-card.svelte          # Individual item card
│   ├── <name>-form.svelte          # Create/edit form
│   └── <name>-delete-dialog.svelte # Delete confirmation
├── schemas/
│   └── <name>-schema.ts            # Zod validation
├── services/
│   └── <feature>-service.ts        # Database operations
└── types/
    ├── <name>.ts                   # Main data interface
    └── <name>-form-state.ts        # Form state interface
```

**Note:** This structure is based on the single existing feature. Other patterns may emerge as more features are implemented.

---

## 10. Architecture Decisions

These are decisions inferred from the existing codebase. Items marked as "Inferred" are observed patterns. Items marked as "Missing" are notable by their absence in the code.

### Explicit Decisions

1. **Svelte 5 runes mode forced** — `svelte.config.js` enables runes for all non-node_modules files. This means no legacy `$:` syntax, no `on:click`, no `export let`.

2. **Server actions over REST** — All mutations use SvelteKit form actions with `use:enhance`. Only one standalone API endpoint (`/logout`) exists.

3. **Direct Supabase queries over ORM** — No ORM or query builder abstraction. Supabase JS client is used directly in route files.

4. **Mobile-first centered layout** — `PageContainer` uses `max-w-screen-sm` as the primary constraint, confirming mobile-first as the default canvas.

5. **No global state** — The codebase uses `$state()` locally without any global store (Svelte writable, Zustand, or Context API).

6. **URL as state for search** — Product search state lives in URL query params, synced via `SvelteURLSearchParams`.

7. **Zod on server only** — Validation runs server-side in form actions. No client-side Zod validation exists.

8. **Toast for user feedback** — All mutation results are surfaced via svelte-sonner toasts rather than inline messages.

9. **Typography utilities over Tailwind defaults** — Custom `@utility` classes (`text-headline-md`, `text-body-md`, `text-price-display`, etc.) are defined in `layout.css` and used throughout.

### Missing / Needs Clarification

| Topic                              | Status                                                                                                 |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Error boundary strategy            | No global error handling pattern beyond route-level `+error.svelte`                                    |
| Loading state conventions          | `ProductListLoading` exists but only one feature uses it                                               |
| Pagination pattern                 | No pagination exists (product list loads all items)                                                    |
| Caching / revalidation             | No SWR, TanStack Query, or manual cache strategy                                                       |
| Client-side Supabase usage         | `createSupabaseBrowserClient()` is defined but never called                                            |
| E2E tests                          | No Playwright E2E tests exist                                                                          |
| Database migration management      | No migration files in repo — schema is managed via Supabase dashboard                                  |
| RLS policy documentation           | Policies exist in Supabase dashboard but are not documented in code                                    |
| Environment variable documentation | Only `.env` exists; no `.env.example` or schema documentation                                          |
| Storybook for custom components    | Only boilerplate stories exist                                                                         |
| Accessibility audit                | `a11y` addon configured but set to `todo` — no explicit audit done                                     |
| CI/CD pipeline                     | No CI configuration files in repo                                                                      |
| Dark mode toggle UI                | `mode-watcher` dependency and dark CSS variables exist but no toggle control is implemented            |
| `$effect` usage pattern            | Zero uses of `$effect` in the codebase. Side effects (search debounce) use manual `setTimeout` instead |

---

## Appendix: Current Data Flow

### Product Creation (the most complete flow)

```
User fills form in ProductForm.svelte
    → use:enhance captures submit
    → POST to /products/add (action: ?/createProduct)
        → +page.server.ts action handler
            → formData parsed
            → productSchema.safeParse() validates
                → fail(400) with fieldErrors if invalid
            → generateSku(name) creates SKU
            → supabase.from('products').insert({...})
                → fail(500) if DB error
            → return { message: 'Produk berhasil ditambahkan' }
    → Client receives ActionResult
        → handleFormToast() shows success toast
        → goto('/products') redirects to list
```

### Authentication Flow

```
hooks.server.ts (every request):
    → createServerClient() with cookie handling
    → auth.getSession() + auth.getUser()
    → attach to event.locals

(app)/+layout.server.ts (auth guard):
    → if no locals.session → redirect /login
    → else → render children with user data
```

---

## 11. Review Findings

This section documents issues found during the architecture review: missing conventions, inconsistent patterns, architectural smells, and areas that need clarification.

### 11.1 Missing Conventions

| Missing Convention                     | Details                                                                                                                                                                                                                                                             |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Import path alias convention**       | No path aliases (`$features`, `$shared`) exist. Route files use deep relative imports (`../../../../features/products/types/product`), while feature files mix relatives (`../../../shared/`) with `$lib`. This makes refactoring fragile and imports inconsistent. |
| **Test patterns**                      | No tests exist for any feature (products, auth). Testing infrastructure is configured (Vitest + Playwright) but only boilerplate examples exist. No pattern for testing server actions, load functions, or Supabase queries.                                        |
| **Database migration strategy**        | No migration files, no migration tooling. Schema is managed directly via Supabase dashboard — no version control, no code review, no rollback path.                                                                                                                 |
| **Environment variable documentation** | No `.env.example` file. Required variables are undocumented beyond the single `.env` file which is checked in with real values.                                                                                                                                     |
| **Page prop typing convention**        | Three different patterns coexist: `PageProps` from `./$types` (product add/edit), `PageData` from `./$types` (dashboard), and inline destructuring (product list). Two pages (POS, transactions) have no script at all.                                             |
| **Loading state convention**           | Only `ProductListLoading` exists but is not used by any route (products list has no loading state handling). No pattern established for when/how to show loading states.                                                                                            |

### 11.2 Inconsistent Patterns

| #   | Issue                          | Location A                                                                                | Location B                                                                            | Impact                                                                                                         |
| --- | ------------------------------ | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| 1   | **Import style**               | Route files use deep relatives: `../../../../features/products/schemas/product-schema.js` | Feature files use `$lib`: `$lib/utils/currency`                                       | No unified import strategy. File moves break silently.                                                         |
| 2   | **Validation approach**        | Product forms use Zod with `safeParse()` + `treeifyError()`                               | Auth forms (login/register) pass raw `formData` to Supabase with zero validation      | Auth is vulnerable to empty fields, missing data. Inconsistent UX.                                             |
| 3   | **Error message language**     | Login returns consistent Indonesian: `"Email atau password salah!"`                       | Register returns raw Supabase error: `error.message` (English)                        | Inconsistent user-facing language. Register exposes server error details.                                      |
| 4   | **Toast feedback**             | Product forms use `handleFormToast()` for success/failure/error                           | Auth forms use inline `Alert.Root` component for errors, no toast on success          | Two different UX feedback patterns. Auth has no success feedback.                                              |
| 5   | **Service extraction**         | `deleteProductService` extracted to `services/delete-product-service.ts`                  | Create, update, and list are inlined directly in `+page.server.ts` files              | No consistent criterion for when to extract services vs keep inline.                                           |
| 6   | **File extension in imports**  | Some imports include `.js`: `'../../../../features/products/schemas/product-schema.js'`   | Other imports omit extension: `'../../../../features/products/types/product'`         | Inconsistent. Imports with `.js` extension may break if resolution strategy changes.                           |
| 7   | **User ID scoping on queries** | `createProduct` explicitly sets `user_id: locals.user?.id`                                | `updateProduct`, `deleteProduct`, and product list queries do NOT filter by `user_id` | List/update/delete rely entirely on RLS. If RLS is misconfigured, users may see/edit/delete other users' data. |
| 8   | **Server file structure**      | Products list has `+page.server.ts` with both `load` + `actions`                          | Login/register have only `actions` (no `load`)                                        | No convention for when a route needs a server file vs relying on layout data.                                  |

### 11.3 Architectural Smells

| #   | Smell                               | Location                                                                                                                         | Why It's a Smell                                                                                                                             |
| --- | ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Dead code**                       | `src/lib/supabase/client.ts` — `createSupabaseBrowserClient()` is defined and exported but never imported anywhere               | Unused code increases maintenance burden. No client-side Supabase pattern exists.                                                            |
| 2   | **Deep relative imports**           | `../../../../features/products/types/product` in multiple route files (16 occurrences across 8 files)                            | Extremely fragile — renaming or moving a feature folder breaks all imports. No path alias to mitigate.                                       |
| 3   | **Business logic in presentation**  | `product-delete-dialog.svelte` has form submission logic, `enhance`, `goto()`, and `handleFormToast()` inside a dialog component | Couples UI component to navigation and toast logic. Hard to test, reuse, or change.                                                          |
| 4   | **Global CSS in routes directory**  | `src/routes/layout.css` contains the global theme, Tailwind imports, and dark mode variables                                     | Co-location with root layout is valid but unconventional. SvelteKit typically uses `src/app.css` for global styles. Could confuse newcomers. |
| 5   | **RLS-only security**               | Product list, update, and delete omit `user_id` filtering — rely entirely on Supabase Row Level Security                         | RLS is not visible in code, not documented, and not testable locally. A misconfigured RLS policy causes data leaks silently.                 |
| 6   | **No client data fetching pattern** | `createSupabaseBrowserClient()` exists but is unused. All data fetching is SSR-only via `load` functions                         | No pattern for client-side real-time features, optimistic updates, or offline support (all documented as future needs in PRD).               |
| 7   | **Unused dependency**               | `mode-watcher` is imported only by the sonner component for detecting dark mode                                                  | Dark mode CSS exists but no toggle UI. The dependency is used for a single read, adding weight to the bundle.                                |
| 8   | **Side effects without `$effect`**  | `product-list-search.svelte` uses manual `clearTimeout`/`setTimeout` for debounce                                                | Codebase has zero uses of `$effect` despite having side-effect logic. No established pattern for reactive side effects in Svelte 5 runes.    |

### 11.4 Areas Needing Clarification

| Question                                                             | Context                                                                                                                                                                                                                                                |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Is `layout.css` in `routes/` intentional?**                        | Global CSS is inside `src/routes/` instead of `src/` root. The root `+layout.svelte` imports it as `'./layout.css'`. This works but is unconventional.                                                                                                 |
| **Why is delete extracted to a service but not create/update/list?** | Only `deleteProductService` lives in `services/`. All other CRUD operations are inline. No documented reason for this distinction.                                                                                                                     |
| **Why do auth forms skip Zod validation?**                           | Product forms validate with Zod. Auth forms pass raw data to Supabase. Both involve user input with the same validation needs.                                                                                                                         |
| **Route group boundary for product forms?**                          | Product add and edit routes are under `(app)/products/` (outside `(main)`) — they don't show BottomNav. All other app pages (dashboard, POS, list, transactions) are under `(main)` and show BottomNav. Is the missing BottomNav on forms intentional? |
| **What is the role of `mode-watcher`?**                              | Dark mode CSS variables are fully defined in `layout.css` and `mode-watcher` is imported, but no dark mode toggle UI exists anywhere. The app always renders in light mode.                                                                            |
| **How should client-side Supabase interactions work?**               | `createSupabaseBrowserClient()` exists but is never called. Future features (real-time cart, optimistic updates) will need it, but no pattern is established.                                                                                          |
