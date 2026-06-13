# Transaction History Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a read-only transaction history feature with a list page (sorted newest-first) and a detail page showing line items.

**Architecture:** Follows the existing products feature pattern — list route under `(main)/` with BottomNav, detail route outside `(main)/` without BottomNav. Feature code in `src/features/transactions/`. Server load functions query Supabase directly (inlined, per codebase convention). Read-only — no form actions.

**Tech Stack:** Svelte 5 runes, shadcn-svelte Card, Tailwind 4, Supabase SSR, `Intl.DateTimeFormat` for dates

---

## File Structure

### New files

```
src/features/transactions/
├── types/
│   └── transaction.ts
└── components/
    ├── transaction-card.svelte
    ├── transaction-list.svelte
    ├── transaction-list-loading.svelte
    └── transaction-detail.svelte

src/routes/(app)/transactions/
└── [id]/
    ├── +page.server.ts
    └── +page.svelte

src/lib/utils/
└── date.ts
```

### Modified files

```
src/routes/(app)/(main)/transactions/
├── +page.server.ts    (CREATE — replaces no-load state)
└── +page.svelte       (REWRITE — replaces placeholder)
```

---

### Task 1: Transaction Types

**Files:**

- Create: `src/features/transactions/types/transaction.ts`

- [ ] **Step 1: Create the types file**

```ts
export interface Transaction {
	id: string;
	total: number;
	created_at: string;
}

export interface TransactionItem {
	id: string;
	transaction_id: string;
	product_id: string | null;
	name: string;
	price: number;
	qty: number;
	subtotal: number;
}
```

Matches the DB schema from `supabase/migrations/001_create_transactions.sql`. `Transaction` is used in the list view; both `Transaction` + `TransactionItem` are used in the detail view.

- [ ] **Step 2: Commit**

```bash
git add src/features/transactions/types/transaction.ts
git commit -m "feat(transactions): add Transaction and TransactionItem types"
```

---

### Task 2: Date Formatting Utility

**Files:**

- Create: `src/lib/utils/date.ts`

- [ ] **Step 1: Create `src/lib/utils/date.ts`**

```ts
export function formatDateTime(isoString: string) {
	return new Intl.DateTimeFormat('id-ID', {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit'
	}).format(new Date(isoString));
}
```

Produces output like "15 Januari 2024 10.30". Used in both `TransactionCard` and `TransactionDetail` to format `created_at`.

- [ ] **Step 2: Commit**

```bash
git add src/lib/utils/date.ts
git commit -m "feat(utils): add formatDateTime for Indonesian locale dates"
```

---

### Task 3: TransactionCard Component

**Files:**

- Create: `src/features/transactions/components/transaction-card.svelte`

- [ ] **Step 1: Create the component**

```svelte
<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import { formatCurrency } from '$lib/utils/currency';
	import { formatDateTime } from '$lib/utils/date';
	import { ChevronRightIcon } from '@lucide/svelte';
	import type { Transaction } from '../types/transaction';
	import { resolve } from '$app/paths';

	type Props = {
		transaction: Transaction;
	};

	const { transaction }: Props = $props();
</script>

<a href={resolve(`/transactions/${transaction.id}`)} class="block">
	<Card.Root>
		<Card.Content class="flex items-center justify-between">
			<div class="space-y-1">
				<p class="text-sm text-gray-500">{formatDateTime(transaction.created_at)}</p>
				<p class="text-lg font-semibold text-primary">{formatCurrency(transaction.total)}</p>
			</div>
			<ChevronRightIcon class="size-5 text-gray-400" />
		</Card.Content>
	</Card.Root>
</a>
```

Note: The `<a>` wraps the entire card so the whole card is tappable, following mobile-first UX. The `href` is built with `resolve()` to ensure correct base path handling.

- [ ] **Step 2: Commit**

```bash
git add src/features/transactions/components/transaction-card.svelte
git commit -m "feat(transactions): add TransactionCard component"
```

---

### Task 4: TransactionList + Loading Components

**Files:**

- Create: `src/features/transactions/components/transaction-list.svelte`
- Create: `src/features/transactions/components/transaction-list-loading.svelte`

- [ ] **Step 1: Create `src/features/transactions/components/transaction-list-loading.svelte`**

```svelte
<script>
	import { Spinner } from '$lib/components/ui/spinner';
</script>

<div class="flex flex-col items-center justify-center gap-2 p-4">
	<Spinner class="size-10 text-primary" />
	<p class="text-sm text-primary">Tunggu sebentar, transaksi sedang dimuat.</p>
</div>
```

Follows the exact pattern of `ProductListLoading`.

- [ ] **Step 2: Create `src/features/transactions/components/transaction-list.svelte`**

```svelte
<script lang="ts">
	import { ReceiptIcon } from '@lucide/svelte';
	import type { Transaction } from '../types/transaction';
	import TransactionCard from './transaction-card.svelte';

	type Props = {
		transactions: Transaction[];
	};

	const { transactions }: Props = $props();
</script>

{#if transactions.length === 0}
	<div class="my-6 flex flex-col items-center justify-center gap-2 p-4">
		<ReceiptIcon size={48} class="text-primary" />
		<p class="text-sm text-primary">Belum ada transaksi.</p>
	</div>
{:else}
	<div class="space-y-3">
		{#each transactions as transaction (transaction.id)}
			<TransactionCard {transaction} />
		{/each}
	</div>
{/if}
```

Follows the `ProductInfo` pattern: lucide `ReceiptIcon` for the empty state icon, same class structure. The list uses `space-y-3` for vertical gap between cards.

- [ ] **Step 3: Commit**

```bash
git add src/features/transactions/components/transaction-list.svelte src/features/transactions/components/transaction-list-loading.svelte
git commit -m "feat(transactions): add TransactionList and TransactionListLoading components"
```

---

### Task 5: Transaction List Page Route

**Files:**

- Create: `src/routes/(app)/(main)/transactions/+page.server.ts`
- Modify: `src/routes/(app)/(main)/transactions/+page.svelte`

- [ ] **Step 1: Create `src/routes/(app)/(main)/transactions/+page.server.ts`**

```ts
import type { Transaction } from '$features/transactions/types/transaction';

export async function load({ locals }) {
	const { data, error } = await locals.supabase
		.from('transactions')
		.select('id, total, created_at')
		.order('created_at', { ascending: false });

	if (error) {
		throw error;
	}

	const transactions: Transaction[] = (data ?? []).map((tx) => ({
		id: tx.id,
		total: tx.total,
		created_at: tx.created_at
	}));

	return { transactions };
}
```

Follows the pattern from `(main)/products/+page.server.ts`: bare `select`, no explicit `user_id` filter (relies on RLS, matching the codebase convention). Orders by `created_at DESC` so newest transactions appear first. Selects only the fields needed for the list view.

- [ ] **Step 2: Rewrite `src/routes/(app)/(main)/transactions/+page.svelte`**

```svelte
<script lang="ts">
	import TransactionList from '$features/transactions/components/transaction-list.svelte';

	const { data } = $props();
</script>

<svelte:head>
	<title>Riwayat Transaksi - ArfaPOS</title>
</svelte:head>

<TransactionList transactions={data.transactions} />
```

Replaces the existing `<h1>transactions</h1>` placeholder. Passes server-loaded `transactions` array to the list component.

- [ ] **Step 3: Verify the route works**

```bash
git status
```

Expected: shows the two files as new/modified.

- [ ] **Step 4: Commit**

```bash
git add src/routes/\(app\)/\(main\)/transactions/
git commit -m "feat(transactions): add list page route with Supabase load function"
```

---

### Task 6: TransactionDetail Component

**Files:**

- Create: `src/features/transactions/components/transaction-detail.svelte`

- [ ] **Step 1: Create the component**

```svelte
<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import { formatCurrency } from '$lib/utils/currency';
	import { formatDateTime } from '$lib/utils/date';
	import type { Transaction, TransactionItem } from '../types/transaction';

	type Props = {
		transaction: Transaction;
		items: TransactionItem[];
	};

	const { transaction, items }: Props = $props();
</script>

<Card.Root>
	<Card.Content class="space-y-4">
		<div class="space-y-1">
			<p class="text-sm text-gray-500">{formatDateTime(transaction.created_at)}</p>
			<p class="text-2xl font-bold text-primary">{formatCurrency(transaction.total)}</p>
		</div>
	</Card.Content>
</Card.Root>

{#if items.length > 0}
	<div class="mt-4 space-y-2">
		{#each items as item (item.id)}
			<Card.Root>
				<Card.Content>
					<div class="flex items-center justify-between">
						<div class="space-y-1">
							<p class="font-medium">{item.name}</p>
							<p class="text-sm text-gray-500">
								{formatCurrency(item.price)} &times; {item.qty}
							</p>
						</div>
						<p class="font-semibold">{formatCurrency(item.subtotal)}</p>
					</div>
				</Card.Content>
			</Card.Root>
		{/each}
	</div>
{/if}

<Card.Root class="mt-4">
	<Card.Content class="flex items-center justify-between">
		<p class="font-semibold">Total</p>
		<p class="text-xl font-bold text-primary">{formatCurrency(transaction.total)}</p>
	</Card.Content>
</Card.Root>
```

Three sections: (1) a summary card with date and total, (2) a list of item cards each showing name, unit price, quantity, and subtotal, (3) a total footer card. Matches the mobile-first card layout pattern used throughout the codebase.

- [ ] **Step 2: Commit**

```bash
git add src/features/transactions/components/transaction-detail.svelte
git commit -m "feat(transactions): add TransactionDetail component"
```

---

### Task 7: Transaction Detail Page Route

**Files:**

- Create: `src/routes/(app)/transactions/[id]/+page.server.ts`
- Create: `src/routes/(app)/transactions/[id]/+page.svelte`

- [ ] **Step 1: Create the directory and server load file**

```bash
mkdir -p src/routes/\(app\)/transactions/\[id\]
```

- [ ] **Step 2: Create `src/routes/(app)/transactions/[id]/+page.server.ts`**

```ts
import { error } from '@sveltejs/kit';
import type { Transaction, TransactionItem } from '$features/transactions/types/transaction';

export async function load({ locals, params }) {
	const { data, error: txError } = await locals.supabase
		.from('transactions')
		.select('*, transaction_items(*)')
		.eq('id', params.id)
		.single();

	if (txError || !data) {
		error(404, 'Transaksi tidak ditemukan');
	}

	const transaction: Transaction = {
		id: data.id,
		total: data.total,
		created_at: data.created_at
	};

	const items: TransactionItem[] = (data.transaction_items ?? []).map(
		(item: Record<string, unknown>) => ({
			id: item.id as string,
			transaction_id: item.transaction_id as string,
			product_id: (item.product_id as string | null) ?? null,
			name: item.name as string,
			price: item.price as number,
			qty: item.qty as number,
			subtotal: item.subtotal as number
		})
	);

	return { transaction, items };
}
```

Uses Supabase's nested `select('*, transaction_items(*)')` to fetch the transaction and its items in a single query. Returns 404 if the transaction is not found (matching `products/[sku]/+page.server.ts` pattern).

- [ ] **Step 3: Create `src/routes/(app)/transactions/[id]/+page.svelte`**

```svelte
<script lang="ts">
	import PageHeader from '../../../../shared/components/page-header.svelte';
	import TransactionDetail from '$features/transactions/components/transaction-detail.svelte';

	const { data } = $props();
</script>

<svelte:head>
	<title>Detail Transaksi - ArfaPOS</title>
</svelte:head>

<div class="space-y-6">
	<PageHeader title="Detail Transaksi" />
	<TransactionDetail transaction={data.transaction} items={data.items} />
</div>
```

Follows the product edit page pattern (`products/[sku]/+page.svelte`): wraps with `space-y-6`, uses `PageHeader` with back button, then renders the feature component. The back button calls `window.history.back()` by default (handled by `PageHeader`).

- [ ] **Step 4: Commit**

```bash
git add src/routes/\(app\)/transactions/
git commit -m "feat(transactions): add detail page route with nested Supabase query"
```

---

## Verification

After all tasks are complete:

1. **Start the dev server:**

   ```bash
   pnpm dev
   ```

2. **Navigate to `/transactions`** — should see either "Belum ada transaksi" (if no transactions exist) or a list of transaction cards sorted newest-first.

3. **Click a transaction card** — should navigate to `/transactions/[id]` showing the detail view with date, total, and line items.

4. **Run typecheck:**

   ```bash
   pnpm check
   ```

   Expected: no errors.

5. **Run lint:**

   ```bash
   pnpm lint
   ```

   Expected: no errors.

6. **Run format:**
   ```bash
   pnpm format
   ```
   Ensure consistent formatting.

---

## Database Note

Data already exists in the `transactions` and `transaction_items` tables from the POS checkout flow (`pos/+page.server.ts` action inserts data). RLS policies from `supabase/migrations/001_create_transactions.sql` ensure users only see their own transactions. No schema changes needed.
