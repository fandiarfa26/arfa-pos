# Expenses Feature Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an expenses feature (full CRUD: description, category, amount, date) surfaced from the dashboard, with today's expenses and net revenue shown on the dashboard.

**Architecture:** Mirrors the fully-implemented `products` feature: feature folder under `src/features/expenses/`, server-only Zod validation in form actions, SvelteKit form actions + `use:enhance` + toasts, direct Supabase queries with RLS. A new `expenses` table with per-user RLS policies. Navigation surface is the dashboard only (no bottom-nav change). Money stored as `BIGINT` rupiah.

**Tech Stack:** SvelteKit 2 + Svelte 5 runes, TypeScript, Tailwind CSS 4, shadcn-svelte, Supabase (PostgreSQL + RLS), Zod, lucide-svelte, Vitest.

## Global Constraints

- **Svelte 5 runes only** — no `$:`, `export let`, `on:click`. Use `$state()`, `$derived()`, `$props()`.
- **Server-only Zod validation** — schemas in `features/<name>/schemas/`, parsed in form actions.
- **All mutations are form actions** with `use:enhance` + `handleFormToast()`; no REST endpoints.
- **Supabase queries inlined** in `+page.server.ts` (only delete has a service, mirroring `delete-product-service`).
- **Money** stored/compared as integer rupiah (`BIGINT`), formatted with `formatCurrency()`.
- **Indonesian UI copy** (e.g. "Pengeluaran", "Nominal", "Tanggal wajib diisi").
- **Prettier**: tabs, single quotes, no trailing commas, 100 print width. Run `pnpm format` before finishing.
- **Tests**: `expect.requireAssertions: true`. Server tests live in `src/**/*.{test,spec}.{js,ts}` (node project). Follow repo convention: only presentational components get component specs; the expense UI follows the untested `products` pattern.
- **Setup first**: `nvm use latest && pnpm install && pnpm prepare`.
- Path aliases: `$features`, `$shared`, `$lib` (all already configured).

---

### Task 1: Expenses table migration

**Files:**

- Create: `supabase/migrations/003_create_expenses.sql`

**Interfaces:**

- Consumes: nothing.
- Produces: `expenses` table with columns `id`, `user_id`, `description`, `category`, `amount`, `occurred_at`, `created_at`; RLS enabled with 4 policies; indexes.

- [ ] **Step 1: Create the migration file**

`supabase/migrations/003_create_expenses.sql`:

```sql
-- Create expenses table
CREATE TABLE IF NOT EXISTS expenses (
	id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
	user_id UUID NOT NULL REFERENCES auth.users(id),
	description TEXT NOT NULL,
	category TEXT,
	amount BIGINT NOT NULL,
	occurred_at TIMESTAMPTZ DEFAULT now() NOT NULL,
	created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view own expenses"
	ON expenses FOR SELECT
	USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own expenses"
	ON expenses FOR INSERT
	WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own expenses"
	ON expenses FOR UPDATE
	USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own expenses"
	ON expenses FOR DELETE
	USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_occurred_at ON expenses(occurred_at DESC);
```

- [ ] **Step 2: Verify SQL reads correctly**

Re-read the file and confirm it mirrors `supabase/migrations/001_create_transactions.sql` (table + RLS + 4 policies + indexes).

- [ ] **Step 3: Note manual apply**

The repo has no migration runner. The user must run this in the Supabase dashboard SQL editor (or `supabase db push` if CLI is configured) before the app pages will work.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/003_create_expenses.sql
git commit -m "feat(expenses): add expenses table migration"
```

---

### Task 2: Date helpers (local YYYY-MM-DD) with TDD

**Files:**

- Modify: `src/lib/utils/date.ts`
- Test: `src/lib/utils/__tests__/date.spec.ts`

**Interfaces:**

- Consumes: nothing.
- Produces:
  - `formatDateOnly(isoString: string): string` → local `YYYY-MM-DD`
  - `todayDateString(): string` → today's local `YYYY-MM-DD`

- [ ] **Step 1: Write the failing test**

`src/lib/utils/__tests__/date.spec.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { formatDateOnly, todayDateString } from '../date';

describe('formatDateOnly', () => {
	it('formats a local ISO string to YYYY-MM-DD', () => {
		const iso = new Date(2026, 7, 8, 9, 30).toISOString();
		expect(formatDateOnly(iso)).toBe('2026-08-08');
	});
});

describe('todayDateString', () => {
	it('returns a YYYY-MM-DD string', () => {
		expect(todayDateString()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
	});
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm exec vitest run src/lib/utils/__tests__/date.spec.ts --project server`
Expected: FAIL with `formatDateOnly` / `todayDateString` not exported.

- [ ] **Step 3: Implement the helpers**

Append to `src/lib/utils/date.ts`:

```ts
export function formatDateOnly(isoString: string): string {
	return localDateString(new Date(isoString));
}

export function todayDateString(): string {
	return localDateString(new Date());
}

function localDateString(d: Date): string {
	const year = d.getFullYear();
	const month = String(d.getMonth() + 1).padStart(2, '0');
	const day = String(d.getDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm exec vitest run src/lib/utils/__tests__/date.spec.ts --project server`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/utils/date.ts src/lib/utils/__tests__/date.spec.ts
git commit -m "feat(expenses): add date helpers for YYYY-MM-DD"
```

---

### Task 3: Expense types and Zod schema with TDD

**Files:**

- Create: `src/features/expenses/types/expense.ts`
- Create: `src/features/expenses/types/expense-form-state.ts`
- Create: `src/features/expenses/schemas/expense-schema.ts`
- Test: `src/features/expenses/schemas/__tests__/expense-schema.spec.ts`

**Interfaces:**

- Consumes: nothing.
- Produces:
  - `interface Expense { id: string; description: string; category?: string; amount: number; occurred_at: string }`
  - `interface ExpenseFormState { message?; fieldErrors?: { description?, category?, amount?, date? }; values?: { id?, description?, category?, amount?, date? } }`
  - `expenseSchema` (Zod object with keys `description`, `category`, `amount`, `date`)

- [ ] **Step 1: Write the failing test**

`src/features/expenses/schemas/__tests__/expense-schema.spec.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { expenseSchema } from '../expense-schema';

const validInput = {
	description: 'Beli beras 5 kg',
	category: null,
	amount: 25000,
	date: '2026-08-08'
};

describe('expenseSchema', () => {
	it('accepts a valid expense', () => {
		expect(expenseSchema.safeParse(validInput).success).toBe(true);
	});

	it('accepts an optional category', () => {
		expect(expenseSchema.safeParse({ ...validInput, category: 'Bahan Baku' }).success).toBe(true);
	});

	it('rejects empty description', () => {
		expect(expenseSchema.safeParse({ ...validInput, description: '' }).success).toBe(false);
	});

	it('rejects amount below Rp 500', () => {
		expect(expenseSchema.safeParse({ ...validInput, amount: 100 }).success).toBe(false);
	});

	it('rejects an invalid date format', () => {
		expect(expenseSchema.safeParse({ ...validInput, date: '08-08-2026' }).success).toBe(false);
	});
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm exec vitest run src/features/expenses/schemas/__tests__/expense-schema.spec.ts --project server`
Expected: FAIL with "Cannot find module .../expense-schema".

- [ ] **Step 3: Create the types and schema**

`src/features/expenses/types/expense.ts`:

```ts
export interface Expense {
	id: string;
	description: string;
	category?: string;
	amount: number;
	occurred_at: string;
}
```

`src/features/expenses/types/expense-form-state.ts`:

```ts
export interface ExpenseFormState {
	message?: string;
	fieldErrors?: {
		description?: string;
		category?: string;
		amount?: string;
		date?: string;
	};
	values?: {
		id?: string;
		description?: string;
		category?: string;
		amount?: number;
		date?: string;
	};
}
```

`src/features/expenses/schemas/expense-schema.ts`:

```ts
import z from 'zod';

export const expenseSchema = z.object({
	description: z.string().trim().min(1, 'Deskripsi tidak boleh kosong'),
	category: z.string().trim().nullable(),
	amount: z.coerce.number().min(500, 'Nominal pengeluaran tidak boleh kurang dari Rp 500'),
	date: z
		.string()
		.min(1, 'Tanggal wajib diisi')
		.refine((val) => /^\d{4}-\d{2}-\d{2}$/.test(val), {
			message: 'Format tanggal tidak valid',
			path: ['date']
		})
});
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm exec vitest run src/features/expenses/schemas/__tests__/expense-schema.spec.ts --project server`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add src/features/expenses/types src/features/expenses/schemas
git commit -m "feat(expenses): add expense types and zod schema"
```

---

### Task 4: Delete service and expenses list page (server)

**Files:**

- Create: `src/features/expenses/services/delete-expense-service.ts`
- Create: `src/routes/(app)/(main)/expenses/+page.server.ts`

**Interfaces:**

- Consumes: `Expense` type (Task 3).
- Produces:
  - `deleteExpenseService(supabase: App.Locals['supabase'], expenseId: string, userId?: string): Promise<{ error: PostgrestError | null }>`
  - `load` returning `{ expenses: Expense[] }`
  - form action `deleteExpense`

- [ ] **Step 1: Create the delete service**

`src/features/expenses/services/delete-expense-service.ts`:

```ts
export async function deleteExpenseService(
	supabase: App.Locals['supabase'],
	expenseId: string,
	userId?: string
) {
	let query = supabase.from('expenses').delete().eq('id', expenseId);
	if (userId) query = query.eq('user_id', userId);
	return await query;
}
```

- [ ] **Step 2: Create the list page server**

`src/routes/(app)/(main)/expenses/+page.server.ts`:

```ts
import { fail } from '@sveltejs/kit';
import { deleteExpenseService } from '$features/expenses/services/delete-expense-service';
import type { Expense } from '$features/expenses/types/expense';

export async function load({ locals }) {
	const userId = locals.user?.id;

	const { data, error } = await locals.supabase
		.from('expenses')
		.select('id, description, category, amount, occurred_at')
		.eq('user_id', userId)
		.order('occurred_at', { ascending: false });

	if (error) {
		throw error;
	}

	const expenses: Expense[] = (data ?? []).map((expense) => ({
		id: expense.id,
		description: expense.description,
		category: expense.category,
		amount: expense.amount,
		occurred_at: expense.occurred_at
	}));

	return { expenses };
}

export const actions = {
	deleteExpense: async ({ request, locals }) => {
		const formData = await request.formData();
		const expenseId = formData.get('expenseId') as string;

		const { error } = await deleteExpenseService(locals.supabase, expenseId, locals.user?.id);

		if (error) {
			return fail(500, {
				message: 'Gagal menghapus pengeluaran',
				detail: error.message
			});
		}

		return {
			message: 'Pengeluaran berhasil dihapus'
		};
	}
};
```

- [ ] **Step 3: Verify**

Run: `pnpm check`
Expected: No type errors.

- [ ] **Step 4: Commit**

```bash
git add src/features/expenses/services/delete-expense-service.ts "src/routes/(app)/(main)/expenses/+page.server.ts"
git commit -m "feat(expenses): add delete service and list page server"
```

---

### Task 5: Expenses list UI

**Files:**

- Create: `src/features/expenses/components/expense-add-button.svelte`
- Create: `src/features/expenses/components/expense-card.svelte`
- Create: `src/features/expenses/components/expense-delete-dialog.svelte`
- Create: `src/features/expenses/components/expense-list.svelte`
- Create: `src/routes/(app)/(main)/expenses/+page.svelte`

**Interfaces:**

- Consumes: `Expense` (Task 3), `deleteExpenseService`/`deleteExpense` action (Task 4), `formatCurrency`, `formatDateOnly` (Task 2).
- Produces: `/expenses` page rendering the list with add/edit/delete.

- [ ] **Step 1: Create `expense-add-button.svelte`**

```svelte
<script lang="ts">
	import { resolve } from '$app/paths';
	import { Button } from '$lib/components/ui/button/index.js';
	import { PlusIcon } from '@lucide/svelte';
</script>

<a href={resolve('/expenses/add')}>
	<Button variant="default">
		<PlusIcon />
		Tambah
	</Button>
</a>
```

- [ ] **Step 2: Create `expense-delete-dialog.svelte`**

```svelte
<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { handleFormToast } from '$lib/utils/handle-form-toast';
	import type { Snippet } from 'svelte';

	type Props = {
		child: Snippet<[{ props: Record<string, unknown> }]>;
		expenseId: string;
	};

	let { child, expenseId }: Props = $props();

	let isOpen = $state(false);

	function handleConfirmYes() {
		isOpen = false;
	}
</script>

<Dialog.Root bind:open={isOpen}>
	<Dialog.Trigger {child}></Dialog.Trigger>
	<Dialog.Content>
		<form
			method="POST"
			action="?/deleteExpense"
			use:enhance={() => {
				return async ({ result, update }) => {
					await update();

					handleFormToast(result);

					if (result.type === 'success') {
						goto(resolve('/expenses'));
					}
				};
			}}
			class="space-y-6"
		>
			<Dialog.Header>
				<Dialog.Title>Hapus Pengeluaran</Dialog.Title>
				<Dialog.Description>Apakah Anda yakin ingin menghapus pengeluaran ini?</Dialog.Description>
			</Dialog.Header>
			<input type="hidden" name="expenseId" value={expenseId} />
			<Dialog.Footer class="sm:justify-end">
				<Dialog.Close class="w-full md:w-auto">
					<Button variant="outline" size="sm" class="w-full text-semantic-danger">Tidak</Button>
				</Dialog.Close>
				<Button type="submit" variant="destructive" size="sm" onclick={handleConfirmYes}
					>Ya, Hapus</Button
				>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
```

- [ ] **Step 3: Create `expense-card.svelte`**

```svelte
<script lang="ts">
	import { resolve } from '$app/paths';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { PencilIcon, TrashIcon } from '@lucide/svelte';
	import { formatCurrency } from '$lib/utils/currency';
	import { formatDateOnly } from '$lib/utils/date';
	import type { Expense } from '../types/expense';
	import ExpenseDeleteDialog from './expense-delete-dialog.svelte';

	type Props = {
		expense: Expense;
	};

	const { expense }: Props = $props();
</script>

<Card.Root size="sm" class="gap-0">
	<Card.Content class="space-y-1 pb-0">
		<div class="flex items-start justify-between gap-2">
			<span class="text-sm font-semibold">{expense.description}</span>
			<span class="shrink-0 text-sm font-medium text-primary">{formatCurrency(expense.amount)}</span
			>
		</div>
		<div class="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
			{#if expense.category}
				<span>Kategori: {expense.category}</span>
			{/if}
			<span>{formatDateOnly(expense.occurred_at)}</span>
		</div>
	</Card.Content>
	<Card.Footer class="pt-0">
		<div class="flex w-full items-center justify-end gap-1">
			<a href={resolve(`/expenses/${expense.id}`)} class="-m-2 inline-flex p-2">
				<Button variant="ghost" size="sm" class="px-2 text-primary">
					<PencilIcon class="size-3.5" /> Ubah
				</Button>
			</a>
			<ExpenseDeleteDialog expenseId={expense.id}>
				{#snippet child({ props })}
					<span class="-m-2 inline-flex p-2">
						<Button {...props} variant="ghost" size="sm" class="px-2 text-semantic-danger">
							<TrashIcon class="size-3.5" /> Hapus
						</Button>
					</span>
				{/snippet}
			</ExpenseDeleteDialog>
		</div>
	</Card.Footer>
</Card.Root>
```

- [ ] **Step 4: Create `expense-list.svelte`**

```svelte
<script lang="ts">
	import { WalletIcon } from '@lucide/svelte';
	import type { Expense } from '../types/expense';
	import ExpenseAddButton from './expense-add-button.svelte';
	import ExpenseCard from './expense-card.svelte';

	type Props = {
		expenses: Expense[];
	};

	const { expenses }: Props = $props();
</script>

<div class="flex items-center justify-between">
	<h1 class="text-label-bold">Pengeluaran</h1>
	<ExpenseAddButton />
</div>

{#if expenses.length === 0}
	<div class="my-6 flex flex-col items-center justify-center gap-2 p-4">
		<WalletIcon size={48} class="text-muted-foreground" />
		<p class="text-body-sm text-muted-foreground">Belum ada pengeluaran.</p>
	</div>
{:else}
	<div class="mt-4 grid grid-cols-1 gap-4">
		{#each expenses as expense (expense.id)}
			<ExpenseCard {expense} />
		{/each}
	</div>
{/if}
```

- [ ] **Step 5: Create the list page**

`src/routes/(app)/(main)/expenses/+page.svelte`:

```svelte
<script lang="ts">
	import ExpenseList from '$features/expenses/components/expense-list.svelte';

	const { data } = $props();
</script>

<svelte:head>
	<title>Pengeluaran - ArfaPOS</title>
</svelte:head>

<ExpenseList expenses={data.expenses} />
```

- [ ] **Step 6: Verify**

Run: `pnpm check`
Expected: No type errors.

- [ ] **Step 7: Commit**

```bash
git add src/features/expenses/components "src/routes/(app)/(main)/expenses/+page.svelte"
git commit -m "feat(expenses): add expense list UI"
```

---

### Task 6: Expense form component

**Files:**

- Create: `src/features/expenses/components/expense-form.svelte`

**Interfaces:**

- Consumes: `ExpenseFormState` (Task 3), `todayDateString` (Task 2), `handleFormToast`.
- Produces: `ExpenseForm` with props `{ form: ExpenseFormState | null; action: string }`. On success navigates to `/expenses`.

- [ ] **Step 1: Create `expense-form.svelte`**

```svelte
<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Input } from '$lib/components/ui/input';
	import * as InputGroup from '$lib/components/ui/input-group/index.js';
	import { Spinner } from '$lib/components/ui/spinner';
	import { handleFormToast } from '$lib/utils/handle-form-toast';
	import { todayDateString } from '$lib/utils/date';
	import { SaveIcon } from '@lucide/svelte';
	import InputWrapper from '$shared/components/input-wrapper.svelte';
	import type { ExpenseFormState } from '../types/expense-form-state';

	type Props = {
		form: ExpenseFormState | null;
		action: string;
	};

	const { form, action }: Props = $props();

	const inputStates = $derived.by(() => {
		return {
			description: form?.values?.description ?? '',
			category: form?.values?.category ?? '',
			amount: form?.values?.amount,
			date: form?.values?.date ?? todayDateString()
		};
	});

	let isSubmitting = $state(false);
</script>

<form
	method="POST"
	{action}
	use:enhance={() => {
		isSubmitting = true;

		return async ({ result, update }) => {
			await update();

			handleFormToast(result);

			isSubmitting = false;

			if (result.type === 'success') {
				goto(resolve('/expenses'));
			}
		};
	}}
	class="space-y-4"
>
	<InputWrapper
		label="Deskripsi"
		id="description"
		isRequired
		error={form?.fieldErrors?.description}
	>
		<Input
			id="description"
			type="text"
			name="description"
			placeholder="Beli beras 5 kg"
			bind:value={inputStates.description}
		/>
	</InputWrapper>

	<InputWrapper label="Kategori" id="category" error={form?.fieldErrors?.category}>
		<Input
			id="category"
			type="text"
			name="category"
			placeholder="Bahan Baku"
			bind:value={inputStates.category}
		/>
	</InputWrapper>

	<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
		<InputWrapper label="Nominal" id="amount" isRequired error={form?.fieldErrors?.amount}>
			<InputGroup.Root>
				<InputGroup.Input
					id="amount"
					type="number"
					name="amount"
					placeholder="25000"
					bind:value={inputStates.amount}
				/>
				<InputGroup.Addon>
					<InputGroup.Text>Rp</InputGroup.Text>
				</InputGroup.Addon>
			</InputGroup.Root>
		</InputWrapper>

		<InputWrapper label="Tanggal" id="date" isRequired error={form?.fieldErrors?.date}>
			<Input id="date" type="date" name="date" bind:value={inputStates.date} />
		</InputWrapper>
	</div>

	<div class="absolute inset-x-0 bottom-0 mx-auto w-full max-w-160">
		<Card.Root class="rounded-b-none">
			<Card.Content>
				<div class="grid grid-cols-1 gap-4">
					<Button type="submit" variant="default" size="lg" disabled={isSubmitting}>
						{#if isSubmitting}
							<Spinner /> Menyimpan..
						{:else}
							<SaveIcon /> Simpan
						{/if}
					</Button>
					<Button variant="outline" size="lg" onclick={() => window.history.back()}>Batal</Button>
				</div>
			</Card.Content>
		</Card.Root>
	</div>
</form>
```

- [ ] **Step 2: Verify**

Run: `pnpm check`
Expected: No type errors.

- [ ] **Step 3: Commit**

```bash
git add src/features/expenses/components/expense-form.svelte
git commit -m "feat(expenses): add expense form component"
```

---

### Task 7: Create expense route

**Files:**

- Create: `src/routes/(app)/expenses/add/+page.server.ts`
- Create: `src/routes/(app)/expenses/add/+page.svelte`

**Interfaces:**

- Consumes: `expenseSchema` (Task 3), `ExpenseForm` (Task 6).
- Produces: form action `createExpense` on `/expenses/add`.

- [ ] **Step 1: Create the create action**

`src/routes/(app)/expenses/add/+page.server.ts`:

```ts
import { fail } from '@sveltejs/kit';
import z from 'zod';
import { expenseSchema } from '$features/expenses/schemas/expense-schema';

export const actions = {
	createExpense: async ({ request, locals }) => {
		const formData = await request.formData();

		const categoryRaw = formData.get('category');
		const category =
			typeof categoryRaw === 'string' && categoryRaw.trim() ? categoryRaw.trim() : null;

		const result = expenseSchema.safeParse({
			description: formData.get('description'),
			category,
			amount: formData.get('amount'),
			date: formData.get('date')
		});

		if (!result.success) {
			const tree = z.treeifyError(result.error);
			return fail(400, {
				message: 'Periksa kembali data yang Anda masukkan',
				fieldErrors: {
					description: tree.properties?.description?.errors?.[0],
					category: tree.properties?.category?.errors?.[0],
					amount: tree.properties?.amount?.errors?.[0],
					date: tree.properties?.date?.errors?.[0]
				}
			});
		}

		const { description, amount, date } = result.data;
		const occurred_at = new Date(`${date}T00:00:00`).toISOString();

		const { error } = await locals.supabase.from('expenses').insert({
			user_id: locals.user?.id,
			description,
			category: result.data.category,
			amount,
			occurred_at
		});

		if (error) {
			return fail(500, {
				message: 'Gagal menyimpan pengeluaran',
				detail: error.message
			});
		}

		return {
			message: 'Pengeluaran berhasil ditambahkan'
		};
	}
};
```

- [ ] **Step 2: Create the page**

`src/routes/(app)/expenses/add/+page.svelte`:

```svelte
<script lang="ts">
	import ExpenseForm from '$features/expenses/components/expense-form.svelte';
	import PageHeader from '$shared/components/page-header.svelte';
	import type { PageProps } from './$types';

	let { form }: PageProps = $props();
</script>

<svelte:head>
	<title>Tambah Pengeluaran - ArfaPOS</title>
</svelte:head>

<div class="space-y-6">
	<PageHeader title="Tambah Pengeluaran" />
	<ExpenseForm action="?/createExpense" {form} />
</div>
```

- [ ] **Step 3: Verify**

Run: `pnpm check`
Expected: No type errors.

- [ ] **Step 4: Commit**

```bash
git add "src/routes/(app)/expenses/add"
git commit -m "feat(expenses): add create expense route"
```

---

### Task 8: Edit expense route

**Files:**

- Create: `src/routes/(app)/expenses/[id]/+page.server.ts`
- Create: `src/routes/(app)/expenses/[id]/+page.svelte`

**Interfaces:**

- Consumes: `Expense` (Task 3), `expenseSchema` (Task 3), `ExpenseForm` (Task 6), `formatDateOnly` (Task 2).
- Produces: `load` returning `{ expense: Expense }`; form action `updateExpense` on `/expenses/[id]`.

- [ ] **Step 1: Create the edit page server**

`src/routes/(app)/expenses/[id]/+page.server.ts`:

```ts
import z from 'zod';
import { fail, error } from '@sveltejs/kit';
import { expenseSchema } from '$features/expenses/schemas/expense-schema';
import type { Expense } from '$features/expenses/types/expense';

export async function load({ locals, params }) {
	const userId = locals.user?.id;

	const { data, error: expenseError } = await locals.supabase
		.from('expenses')
		.select('id, description, category, amount, occurred_at')
		.eq('id', params.id)
		.eq('user_id', userId)
		.single();

	if (expenseError || !data) {
		error(404, 'Pengeluaran tidak ditemukan');
	}

	const expense: Expense = {
		id: data.id,
		description: data.description,
		category: data.category,
		amount: data.amount,
		occurred_at: data.occurred_at
	};

	return { expense };
}

export const actions = {
	updateExpense: async ({ request, locals, params }) => {
		const formData = await request.formData();

		const categoryRaw = formData.get('category');
		const category =
			typeof categoryRaw === 'string' && categoryRaw.trim() ? categoryRaw.trim() : null;

		const result = expenseSchema.safeParse({
			description: formData.get('description'),
			category,
			amount: formData.get('amount'),
			date: formData.get('date')
		});

		if (!result.success) {
			const tree = z.treeifyError(result.error);
			return fail(400, {
				message: 'Periksa kembali data yang Anda masukkan',
				fieldErrors: {
					description: tree.properties?.description?.errors?.[0],
					category: tree.properties?.category?.errors?.[0],
					amount: tree.properties?.amount?.errors?.[0],
					date: tree.properties?.date?.errors?.[0]
				}
			});
		}

		const { description, amount, date } = result.data;
		const occurred_at = new Date(`${date}T00:00:00`).toISOString();
		const userId = locals.user?.id;

		const { error } = await locals.supabase
			.from('expenses')
			.update({
				description,
				category: result.data.category,
				amount,
				occurred_at
			})
			.eq('id', params.id)
			.eq('user_id', userId);

		if (error) {
			return fail(500, {
				message: 'Gagal menyimpan pengeluaran',
				detail: error.message
			});
		}

		return {
			message: 'Pengeluaran berhasil diperbarui'
		};
	}
};
```

- [ ] **Step 2: Create the page**

`src/routes/(app)/expenses/[id]/+page.svelte`:

```svelte
<script lang="ts">
	import ExpenseForm from '$features/expenses/components/expense-form.svelte';
	import type { ExpenseFormState } from '$features/expenses/types/expense-form-state';
	import PageHeader from '$shared/components/page-header.svelte';
	import { formatDateOnly } from '$lib/utils/date';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	const formState: ExpenseFormState = $derived({
		message: form?.message,
		fieldErrors: form?.fieldErrors,
		values: {
			id: data.expense.id,
			description: data.expense.description,
			category: data.expense.category,
			amount: data.expense.amount,
			date: formatDateOnly(data.expense.occurred_at)
		}
	});
</script>

<svelte:head>
	<title>Ubah Pengeluaran - ArfaPOS</title>
</svelte:head>

<div class="space-y-6">
	<PageHeader title="Ubah Pengeluaran" />
	<ExpenseForm action="?/updateExpense" form={formState} />
</div>
```

- [ ] **Step 3: Verify**

Run: `pnpm check`
Expected: No type errors.

- [ ] **Step 4: Commit**

```bash
git add "src/routes/(app)/expenses/[id]"
git commit -m "feat(expenses): add update expense route"
```

---

### Task 9: Dashboard integration

**Files:**

- Modify: `src/features/dashboard/types/dashboard.ts`
- Modify: `src/routes/(app)/(main)/dashboard/+page.server.ts`
- Modify: `src/routes/(app)/(main)/dashboard/+page.svelte`

**Interfaces:**

- Consumes: `expenses` table (Task 1).
- Produces: `DashboardSummary` gains `todayExpenses: number` and `netRevenue: number`; dashboard shows a clickable "Pengeluaran Hari Ini" card (→ `/expenses`) and a "Catat Pengeluaran" button (→ `/expenses/add`).

- [ ] **Step 1: Extend `DashboardSummary`**

In `src/features/dashboard/types/dashboard.ts`:

```ts
import type { Transaction } from '$features/transactions/types/transaction';

export interface DailyRevenue {
	date: string;
	revenue: number;
}

export interface DashboardSummary {
	todayRevenue: number;
	todayExpenses: number;
	netRevenue: number;
	todayCount: number;
	recentTransactions: Transaction[];
	weeklyRevenue: DailyRevenue[];
	weeklyTotal: number;
}
```

- [ ] **Step 2: Add the expenses query to the dashboard server**

In `src/routes/(app)/(main)/dashboard/+page.server.ts`, after the existing `todayError` check (line 18), insert:

```ts
const { data: todayExpensesData, error: todayExpensesError } = await locals.supabase
	.from('expenses')
	.select('amount')
	.gte('occurred_at', today.toISOString())
	.eq('user_id', userId);

if (todayExpensesError) {
	throw error(500, 'Gagal memuat data dashboard. Silahkan coba lagi.');
}
```

Then replace the summary construction at the end:

```ts
const todayRevenue = (todayData ?? []).reduce((sum, tx) => sum + tx.total, 0);
const todayExpenses = (todayExpensesData ?? []).reduce((sum, expense) => sum + expense.amount, 0);

const summary: DashboardSummary = {
	todayRevenue,
	todayExpenses,
	netRevenue: todayRevenue - todayExpenses,
	todayCount: todayData?.length ?? 0,
	recentTransactions,
	weeklyRevenue,
	weeklyTotal
};
```

- [ ] **Step 3: Update the dashboard page**

In `src/routes/(app)/(main)/dashboard/+page.svelte`:

1. Add `WalletIcon` to the lucide import list.
2. Replace the `isEmpty` derived:

```ts
let isEmpty = $derived(
	data.summary.todayCount === 0 &&
		data.summary.todayRevenue === 0 &&
		data.summary.todayExpenses === 0
);
```

3. Replace the stats grid + empty-state block (`{#if loading}` … `{/if}`) with:

```svelte
{#if loading}
	<div class="grid grid-cols-2 gap-4">
		<DashboardStatsCard label="Pendapatan Hari Ini" value="" loading={true} />
		<DashboardStatsCard label="Transaksi Hari Ini" value="" loading={true} />
	</div>
{:else}
	<div class="grid grid-cols-2 gap-4">
		<DashboardStatsCard label="Pendapatan Bersih" value={formatCurrency(data.summary.netRevenue)}>
			<DollarSignIcon size={24} aria-hidden="true" />
		</DashboardStatsCard>

		<DashboardStatsCard label="Transaksi Hari Ini" value={String(data.summary.todayCount)}>
			<ReceiptIcon size={24} aria-hidden="true" />
		</DashboardStatsCard>
	</div>

	<a href={resolve('/expenses')} class="block">
		<DashboardStatsCard
			label="Pengeluaran Hari Ini"
			value={formatCurrency(data.summary.todayExpenses)}
		>
			<WalletIcon size={24} aria-hidden="true" />
		</DashboardStatsCard>
	</a>

	{#if isEmpty}
		<div class="my-4 flex flex-col items-center justify-center gap-3">
			<ReceiptIcon size={48} class="text-muted-foreground" aria-hidden="true" />
			<p class="text-body-sm text-muted-foreground">Belum ada transaksi hari ini.</p>
			<p class="text-body-sm text-muted-foreground">
				Mulai transaksi baru atau tambahkan produk terlebih dahulu.
			</p>
		</div>
	{/if}
{/if}
```

4. In the buttons row, after the "Kelola Produk" anchor, add:

```svelte
<a href={resolve('/expenses/add')} class="w-full">
	<Button variant="outline" class="w-full" size="lg">
		<WalletIcon aria-hidden="true" />
		Catat Pengeluaran
	</Button>
</a>
```

5. Remove the `isEmpty` gate from the recent-transactions section condition so it reads:

```svelte
	{#if !loading && data.summary.recentTransactions.length > 0}
```

- [ ] **Step 4: Verify**

Run: `pnpm check`
Expected: No type errors.

- [ ] **Step 5: Commit**

```bash
git add src/features/dashboard/types/dashboard.ts "src/routes/(app)/(main)/dashboard"
git commit -m "feat(dashboard): show today's expenses and net revenue"
```

---

### Task 10: Final verification

- [ ] **Step 1: Format, check, lint, and test**

```bash
nvm use latest
pnpm format
pnpm check
pnpm lint
pnpm test
```

Expected: `pnpm format` reformats nothing unexpected; `pnpm check` no errors; `pnpm lint` clean; `pnpm test` all pass (existing boilerplate tests + the 7 new date/schema tests).

- [ ] **Step 2: Manual smoke test (requires migration applied in Supabase)**

1. `/login` → Dashboard shows "Pendapatan Bersih", "Transaksi Hari Ini", and "Pengeluaran Hari Ini" (Rp 0).
2. Tap "Catat Pengeluaran" → form with date defaulted to today; save → toast "Pengeluaran berhasil ditambahkan" → redirected to `/expenses`.
3. `/expenses` shows the card with description, category, date, amount, Ubah/Hapus.
4. Tap "Ubah" → edit → save → toast "Pengeluaran berhasil diperbarui".
5. Tap "Hapus" → confirm → toast "Pengeluaran berhasil dihapus".
6. Dashboard "Pengeluaran Hari Ini" reflects the total; "Pendapatan Bersih" = revenue − expenses.
7. Verify another user cannot see/edit these rows (RLS).

---

## Self-Review notes

- **Spec coverage:** migration (T1), date helper (T2), types+schema (T3), list+delete (T4–5), create (T7), edit (T8), dashboard nav surface + stats (T9), full CRUD per user request. ✓
- **Placeholder scan:** all steps contain complete code; no TBD/TODO. ✓
- **Type consistency:** `formatDateOnly`/`todayDateString`, `Expense`, `ExpenseFormState`, `expenseSchema`, `deleteExpenseService`, and `DashboardSummary.todayExpenses/netRevenue` are defined in Tasks 2–3 and used identically in Tasks 4–9. ✓
- **Convention deviations (deliberate):** TDD applied to pure logic (date/schema); UI tasks follow the repo's untested `products` pattern since form/dialog components pull in `$app/*` modules. The existing `dashboard-server.spec.ts` is untouched boilerplate.
