# Riwayat Totals & Dashboard Revenue Toggle Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show per-tab totals (Total Pemasukan / Total Pengeluaran) on the Riwayat page below the tabs and above each list, and add a dashboard-only toggle that switches the "Pendapatan Bersih" card and the "Pendapatan 7 Hari" card between net (revenue − expenses) and gross (revenue only).

**Architecture:** Riwayat totals are pure client-side `$derived()` sums of the already-loaded `data.transactions` and `data.expenses` (no new queries), rendered by a small reusable `HistoryTotal` card. The dashboard toggle is client-side `$state` (`showGross`, default `false`) that only affects the two specified cards. To support gross mode, the dashboard `load` gains `summary.totalRevenue` (all-time gross) and each `DailyRevenue` gains a `revenue` field (that day's gross), keeping the existing `net` field. Docs (PRD, DESIGN) are synced per repo convention. No new tables, migrations, services, or routes.

**Tech Stack:** SvelteKit 2 + Svelte 5 runes, TypeScript, Supabase (PostgreSQL + RLS), Tailwind CSS 4, shadcn-svelte, lucide-svelte, Vitest (browser + node projects).

## Global Constraints

- **Svelte 5 runes only** — no `$:`, `export let`, `on:click`. Use `$state()`, `$derived()`, `$props()`, `$bindable()`.
- **Supabase queries inlined** in `+page.server.ts` `load`/`action` functions — no ORM, no repository layer (only delete services are extracted).
- **Money** stored/compared as integer rupiah, formatted with `formatCurrency()`.
- **Indonesian UI copy** (e.g. "Total Pemasukan", "Total Pengeluaran", "Tanpa dikurangi pengeluaran").
- **Prettier**: tabs, single quotes, no trailing commas, 100 print width. Run `pnpm format` before finishing.
- **Tests**: `expect.requireAssertions: true`. Client tests (`*.svelte.spec.ts`) run in the browser project and use `vitest/browser` + `vitest-browser-svelte`. Server mirror-tests (node project) duplicate the load computation; they do not import server code.
- **Setup first**: `nvm use latest && pnpm install && pnpm prepare`. If browser tests fail with "browser not installed", run `pnpm exec playwright install chromium`.
- Path aliases: `$features`, `$shared`, `$lib` (all configured).
- **Scope guard**: the toggle must NOT affect the "Transaksi Hari Ini" or "Pengeluaran Hari Ini" cards, and must not persist anywhere (client-only, resets on reload).

---

### Task 1: History total card + Riwayat page integration

**Files:**

- Create: `src/features/transactions/components/history-total.svelte`
- Test: `src/features/transactions/components/history-total.svelte.spec.ts`
- Modify: `src/routes/(app)/(main)/transactions/+page.svelte`

**Interfaces:**

- Consumes: nothing.
- Produces: `HistoryTotal` component with props `{ label: string; value: number }` rendering a full-width card with the label left and `formatCurrency(value)` right. The Riwayat page renders `<HistoryTotal label="Total Pemasukan" value={...} />` below the tablist in the Pemasukan branch and `<HistoryTotal label="Total Pengeluaran" value={...} />` below the header row in the Pengeluaran branch.

- [ ] **Step 1: Write the failing spec**

Create `src/features/transactions/components/history-total.svelte.spec.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import HistoryTotal from './history-total.svelte';

describe('HistoryTotal', () => {
	it('renders the label and formatted total', async () => {
		render(HistoryTotal, { label: 'Total Pemasukan', value: 150000 });

		await expect.element(page.getByText('Total Pemasukan')).toBeInTheDocument();
		await expect.element(page.getByText('Rp 150.000')).toBeInTheDocument();
	});
});
```

- [ ] **Step 2: Run the spec to verify it fails**

Run: `pnpm test -- src/features/transactions/components/history-total.svelte.spec.ts`
Expected: FAIL — cannot resolve `./history-total.svelte` (component does not exist yet).

- [ ] **Step 3: Write the component**

Create `src/features/transactions/components/history-total.svelte`:

```svelte
<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import { formatCurrency } from '$lib/utils/currency';

	type Props = {
		label: string;
		value: number;
	};

	const { label, value }: Props = $props();
</script>

<Card.Root>
	<Card.Content class="flex items-center justify-between gap-3">
		<span class="text-body-sm text-muted-foreground">{label}</span>
		<span class="text-price-display text-foreground">{formatCurrency(value)}</span>
	</Card.Content>
</Card.Root>
```

- [ ] **Step 4: Run the spec to verify it passes**

Run: `pnpm test -- src/features/transactions/components/history-total.svelte.spec.ts`
Expected: PASS (1 test, has assertions).

- [ ] **Step 5: Integrate into the Riwayat page**

In `src/routes/(app)/(main)/transactions/+page.svelte`:

1. Add the import to the script block:

```svelte
import HistoryTotal from '$features/transactions/components/history-total.svelte';
```

2. Add two derived totals after the `activeTab` state:

```svelte
let totalPemasukan = $derived(data.transactions.reduce((sum, tx) => sum + tx.total, 0)); let
totalPengeluaran = $derived(data.expenses.reduce((sum, expense) => sum + expense.amount, 0));
```

3. Replace the conditional block at the bottom of the file:

```svelte
{#if activeTab === 'pemasukan'}
	<HistoryTotal label="Total Pemasukan" value={totalPemasukan} />
	<TransactionList transactions={data.transactions} />
{:else}
	<div class="space-y-4">
		<div class="flex items-center justify-between">
			<h2 class="text-label-bold">Pengeluaran</h2>
			<ExpenseAddButton />
		</div>
		<HistoryTotal label="Total Pengeluaran" value={totalPengeluaran} />
		<ExpenseList expenses={data.expenses} />
	</div>
{/if}
```

- [ ] **Step 6: Typecheck**

Run: `pnpm check`
Expected: PASS (no errors from the new imports or `$derived` sums).

- [ ] **Step 7: Commit**

```bash
git add src/features/transactions/components/history-total.svelte src/features/transactions/components/history-total.svelte.spec.ts "src/routes/(app)/(main)/transactions/+page.svelte"
git commit -m "feat(transactions): add per-tab totals to riwayat page"
```

---

### Task 2: Expose gross data from the dashboard load

**Files:**

- Modify: `src/features/dashboard/types/dashboard.ts`
- Modify: `src/routes/(app)/(main)/dashboard/+page.server.ts`

**Interfaces:**

- Consumes: nothing.
- Produces: `DailyRevenue` with fields `{ date: string; net: number; revenue: number }`; `DashboardSummary` gains `totalRevenue: number` (all-time gross). `summary.netRevenue` stays all-time net, `summary.weeklyTotal` stays the sum of the 7 daily `net` values, `summary.weeklyRevenue` now carries both `net` and `revenue` per day.

- [ ] **Step 1: Update the dashboard types**

Rewrite `src/features/dashboard/types/dashboard.ts`:

```ts
import type { Transaction } from '$features/transactions/types/transaction';

export interface DailyRevenue {
	date: string;
	net: number;
	revenue: number;
}

export interface DashboardSummary {
	todayRevenue: number;
	todayExpenses: number;
	totalRevenue: number;
	netRevenue: number;
	todayCount: number;
	recentTransactions: Transaction[];
	weeklyRevenue: DailyRevenue[];
	weeklyTotal: number;
}
```

- [ ] **Step 2: Update the dashboard load**

In `src/routes/(app)/(main)/dashboard/+page.server.ts`, replace the weekly loop (lines 72-81) with one that also records per-day gross revenue:

```ts
const weeklyRevenue: DailyRevenue[] = [];
let weeklyTotal = 0;
for (let i = 0; i <= 6; i++) {
	const date = new Date(today);
	date.setDate(date.getDate() - i);
	const dateStr = date.toISOString().slice(0, 10);
	const revenue = revenueByDate.get(dateStr) ?? 0;
	const net = revenue - (expenseByDate.get(dateStr) ?? 0);
	weeklyRevenue.push({ date: dateStr, net, revenue });
	weeklyTotal += net;
}
```

Then replace the `summary` object (lines 96-104) to add `totalRevenue`:

```ts
const summary: DashboardSummary = {
	todayRevenue,
	todayExpenses,
	totalRevenue,
	netRevenue: totalRevenue - totalExpenses,
	todayCount: todayData?.length ?? 0,
	recentTransactions,
	weeklyRevenue,
	weeklyTotal
};
```

(`totalRevenue` is already computed at line 93 as `(allTransactions ?? []).reduce((sum, tx) => sum + tx.total, 0)`.)

- [ ] **Step 3: Typecheck**

Run: `pnpm check`
Expected: PASS (no errors from `DashboardSummary`, `DailyRevenue`, or the load).

- [ ] **Step 4: Commit**

```bash
git add src/features/dashboard/types/dashboard.ts "src/routes/(app)/(main)/dashboard/+page.server.ts"
git commit -m "feat(dashboard): expose gross revenue and per-day gross in summary"
```

### Task 3: Dashboard revenue toggle component

**Files:**

- Create: `src/features/dashboard/components/dashboard-revenue-toggle.svelte`
- Test: `src/features/dashboard/components/dashboard-revenue-toggle.svelte.spec.ts`

**Interfaces:**

- Consumes: nothing.
- Produces: `DashboardRevenueToggle` with a `$bindable()` prop `checked?: boolean` (default `false`). Renders a full-width `role="switch"` button labeled "Tanpa dikurangi pengeluaran" with a track+knob. Clicking flips `checked`.

- [ ] **Step 1: Write the failing spec**

Create `src/features/dashboard/components/dashboard-revenue-toggle.svelte.spec.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import DashboardRevenueToggle from './dashboard-revenue-toggle.svelte';

describe('DashboardRevenueToggle', () => {
	it('renders the switch with its label', async () => {
		render(DashboardRevenueToggle, { checked: false });

		await expect.element(page.getByRole('switch')).toBeInTheDocument();
		await expect.element(page.getByText('Tanpa dikurangi pengeluaran')).toBeInTheDocument();
	});

	it('toggles aria-checked when clicked', async () => {
		render(DashboardRevenueToggle, { checked: false });

		const switchButton = page.getByRole('switch');
		await expect.element(switchButton).toHaveAttribute('aria-checked', 'false');

		await switchButton.click();

		await expect.element(switchButton).toHaveAttribute('aria-checked', 'true');
	});
});
```

- [ ] **Step 2: Run the spec to verify it fails**

Run: `pnpm test -- src/features/dashboard/components/dashboard-revenue-toggle.svelte.spec.ts`
Expected: FAIL — cannot resolve `./dashboard-revenue-toggle.svelte` (component does not exist yet).

- [ ] **Step 3: Write the component**

Create `src/features/dashboard/components/dashboard-revenue-toggle.svelte`:

```svelte
<script lang="ts">
	interface Props {
		checked?: boolean;
	}

	let { checked = $bindable(false) }: Props = $props();
</script>

<button
	type="button"
	role="switch"
	aria-checked={checked}
	onclick={() => (checked = !checked)}
	class="flex w-full items-center justify-between gap-3 rounded-xl border bg-card p-4 text-left"
>
	<span class="text-body-sm font-medium text-foreground">Tanpa dikurangi pengeluaran</span>
	<span
		class="relative h-6 w-11 shrink-0 rounded-full transition-colors {checked
			? 'bg-primary'
			: 'bg-muted'}"
		aria-hidden="true"
	>
		<span
			class="absolute top-0.5 h-5 w-5 rounded-full bg-background shadow-sm transition-transform {checked
				? 'translate-x-[22px]'
				: 'translate-x-0.5'}"
		></span>
	</span>
</button>
```

- [ ] **Step 4: Run the spec to verify it passes**

Run: `pnpm test -- src/features/dashboard/components/dashboard-revenue-toggle.svelte.spec.ts`
Expected: PASS (2 tests, both with assertions).

- [ ] **Step 5: Typecheck**

Run: `pnpm check`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/features/dashboard/components/dashboard-revenue-toggle.svelte src/features/dashboard/components/dashboard-revenue-toggle.svelte.spec.ts
git commit -m "feat(dashboard): add revenue mode toggle component"
```

---

### Task 4: Gross mode in the weekly revenue card

**Files:**

- Modify: `src/features/dashboard/components/dashboard-weekly-revenue.svelte`
- Test: `src/features/dashboard/components/dashboard-weekly-revenue.svelte.spec.ts`

**Interfaces:**

- Consumes: `DailyRevenue` from Task 2 (now `{ date, net, revenue }`) and prop `showGross?: boolean`.
- Produces: `DashboardWeeklyRevenue` with props `{ weeklyRevenue: DailyRevenue[]; weeklyTotal: number; showGross?: boolean }`. When `showGross` is true: bars/values/total use `day.revenue`, title becomes "Pendapatan 7 Hari"; otherwise it uses `day.net`, title stays "Pendapatan Bersih 7 Hari".

- [ ] **Step 1: Write the failing spec**

Create `src/features/dashboard/components/dashboard-weekly-revenue.svelte.spec.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import DashboardWeeklyRevenue from './dashboard-weekly-revenue.svelte';

const weeklyRevenue = [
	{ date: '2026-08-09', net: 30000, revenue: 50000 },
	{ date: '2026-08-08', net: 10000, revenue: 10000 }
];
const weeklyTotal = 40000;

describe('DashboardWeeklyRevenue', () => {
	it('shows net values by default', async () => {
		render(DashboardWeeklyRevenue, { weeklyRevenue, weeklyTotal });

		await expect.element(page.getByText('Pendapatan Bersih 7 Hari')).toBeInTheDocument();
		await expect.element(page.getByText('Rp 30.000')).toBeInTheDocument();
		await expect.element(page.getByText('Rp 40.000')).toBeInTheDocument();
	});

	it('shows gross values and total when showGross is true', async () => {
		render(DashboardWeeklyRevenue, { weeklyRevenue, weeklyTotal, showGross: true });

		await expect.element(page.getByText('Pendapatan 7 Hari')).toBeInTheDocument();
		await expect.element(page.getByText('Rp 50.000')).toBeInTheDocument();
		await expect.element(page.getByText('Rp 60.000')).toBeInTheDocument();
	});
});
```

- [ ] **Step 2: Run the spec to verify it fails**

Run: `pnpm test -- src/features/dashboard/components/dashboard-weekly-revenue.svelte.spec.ts`
Expected: FAIL — the second test expects "Pendapatan 7 Hari" / "Rp 50.000" / "Rp 60.000", but the current component has no `showGross` handling and no `revenue` usage, so it renders net values and the net title.

- [ ] **Step 3: Update the component**

Rewrite `src/features/dashboard/components/dashboard-weekly-revenue.svelte` in full:

```svelte
<script lang="ts">
	import type { DailyRevenue } from '$features/dashboard/types/dashboard';
	import * as Card from '$lib/components/ui/card/index.js';
	import { formatCurrency } from '$lib/utils/currency';
	import { TrendingUpIcon, TrendingDownIcon } from '@lucide/svelte';

	interface Props {
		weeklyRevenue: DailyRevenue[];
		weeklyTotal: number;
		showGross?: boolean;
	}

	let { weeklyRevenue, weeklyTotal, showGross = false }: Props = $props();

	let maxRevenue = $derived(
		Math.max(...weeklyRevenue.map((d) => (showGross ? d.revenue : d.net)), 1)
	);
	let grossTotal = $derived(weeklyRevenue.reduce((sum, d) => sum + d.revenue, 0));
	let todayStr = $derived(new Date().toISOString().slice(0, 10));

	function label(dateStr: string): string {
		const date = new Date(dateStr + 'T00:00:00');
		const hari = new Intl.DateTimeFormat('id-ID', { weekday: 'long' }).format(date);
		const tgl = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short' }).format(date);
		return `${hari}, ${tgl}`;
	}
</script>

<Card.Root>
	<Card.Header>
		<Card.Title class="text-label-bold"
			>{showGross ? 'Pendapatan 7 Hari' : 'Pendapatan Bersih 7 Hari'}</Card.Title
		>
	</Card.Header>
	<Card.Content class="space-y-3">
		{#each weeklyRevenue as day, i (day.date)}
			{@const isToday = day.date === todayStr}
			{@const value = showGross ? day.revenue : day.net}
			{@const barWidth = maxRevenue > 0 ? Math.max(0, (value / maxRevenue) * 100) : 0}
			{@const prevValue =
				i < weeklyRevenue.length - 1
					? showGross
						? weeklyRevenue[i + 1].revenue
						: weeklyRevenue[i + 1].net
					: null}
			{@const up = prevValue !== null && value > prevValue}
			{@const down = prevValue !== null && value < prevValue}
			<div class="space-y-1">
				<div class="flex items-center justify-between">
					<span
						class="text-body-sm {isToday ? 'font-semibold text-primary' : 'text-muted-foreground'}"
					>
						{label(day.date)}
					</span>
					<div class="flex items-center gap-1.5">
						{#if up}
							<TrendingUpIcon class="size-4 text-green-600" aria-hidden="true" />
						{/if}
						{#if down}
							<TrendingDownIcon class="size-4 text-red-600" aria-hidden="true" />
						{/if}
						<span
							class="text-body-sm tabular-nums {isToday
								? 'font-semibold text-foreground'
								: 'text-foreground'}"
						>
							{formatCurrency(value)}
						</span>
					</div>
				</div>
				<div class="h-2 w-full rounded-full bg-muted">
					<div
						class="h-full rounded-full transition-all {isToday ? 'bg-primary' : 'bg-primary/40'}"
						style="width: {barWidth}%"
					></div>
				</div>
			</div>
		{/each}
	</Card.Content>
	<Card.Footer>
		<div class="flex w-full items-baseline justify-between">
			<span class="text-body-md font-semibold">Total 7 Hari</span>
			<span class="text-price-display">{formatCurrency(showGross ? grossTotal : weeklyTotal)}</span>
		</div>
	</Card.Footer>
</Card.Root>
```

- [ ] **Step 4: Run the spec to verify it passes**

Run: `pnpm test -- src/features/dashboard/components/dashboard-weekly-revenue.svelte.spec.ts`
Expected: PASS (2 tests, both with assertions).

- [ ] **Step 5: Typecheck**

Run: `pnpm check`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/features/dashboard/components/dashboard-weekly-revenue.svelte src/features/dashboard/components/dashboard-weekly-revenue.svelte.spec.ts
git commit -m "feat(dashboard): support gross mode in weekly revenue card"
```

### Task 5: Wire the toggle into the dashboard page

**Files:**

- Modify: `src/routes/(app)/(main)/dashboard/+page.svelte`

**Interfaces:**

- Consumes: `summary.totalRevenue`, `summary.netRevenue`, `summary.weeklyRevenue`, `summary.weeklyTotal` (Task 2); `DashboardRevenueToggle` (Task 3); `DashboardWeeklyRevenue` with `showGross` (Task 4).
- Produces: a `showGross` `$state()` (default `false`) bound to the toggle. In gross mode the top card shows label "Total Pendapatan" with `totalRevenue`; in net mode it shows "Pendapatan Bersih" with `netRevenue`. The weekly card receives `showGross={showGross}`. The two "Hari Ini" cards are untouched.

- [ ] **Step 1: Add the import and state**

In `src/routes/(app)/(main)/dashboard/+page.svelte`, add to the script block:

```svelte
import DashboardRevenueToggle from '$features/dashboard/components/dashboard-revenue-toggle.svelte';
```

and after the `isEmpty` derived:

```svelte
let showGross = $state(false);
```

- [ ] **Step 2: Render the toggle above the Pendapatan Bersih card**

Replace the start of the non-loading block (the `DashboardStatsCard` for Pendapatan Bersih, lines 56-58) with:

```svelte
<DashboardRevenueToggle bind:checked={showGross} />

<DashboardStatsCard
	label={showGross ? 'Total Pendapatan' : 'Pendapatan Bersih'}
	value={formatCurrency(showGross ? data.summary.totalRevenue : data.summary.netRevenue)}
>
	<DollarSignIcon size={24} aria-hidden="true" />
</DashboardStatsCard>
```

- [ ] **Step 3: Pass `showGross` to the weekly card**

Replace the `DashboardWeeklyRevenue` invocation (lines 107-110) with:

```svelte
<DashboardWeeklyRevenue
	weeklyRevenue={data.summary.weeklyRevenue}
	weeklyTotal={data.summary.weeklyTotal}
	{showGross}
/>
```

- [ ] **Step 4: Typecheck**

Run: `pnpm check`
Expected: PASS (no errors in the dashboard page; `summary.totalRevenue` resolves from Task 2).

- [ ] **Step 5: Commit**

```bash
git add "src/routes/(app)/(main)/dashboard/+page.svelte"
git commit -m "feat(dashboard): wire gross/net toggle into revenue cards"
```

---

### Task 6: Extend the dashboard server spec with gross values

**Files:**

- Modify: `src/features/dashboard/services/__tests__/dashboard-server.spec.ts`

**Interfaces:**

- Consumes: nothing at runtime — mirrors the Task 2 computation (repo mirror-test convention).
- Produces: tests proving per-day `revenue` + `net`, weekly net total, all-time `total` (gross) and `net`.

- [ ] **Step 1: Replace the spec**

Rewrite `src/features/dashboard/services/__tests__/dashboard-server.spec.ts` in full:

```ts
import { describe, it, expect } from 'vitest';

type Txn = { total: number; created_at: string };
type Exp = { amount: number; occurred_at: string };

function computeWeekly(
	transactions: Txn[],
	expenses: Exp[],
	today: Date
): { weeklyRevenue: { date: string; net: number; revenue: number }[]; weeklyTotal: number } {
	const revenueByDate = new Map<string, number>();
	for (const tx of transactions) {
		const dateStr = tx.created_at.slice(0, 10);
		revenueByDate.set(dateStr, (revenueByDate.get(dateStr) ?? 0) + tx.total);
	}

	const expenseByDate = new Map<string, number>();
	for (const expense of expenses) {
		const dateStr = expense.occurred_at.slice(0, 10);
		expenseByDate.set(dateStr, (expenseByDate.get(dateStr) ?? 0) + expense.amount);
	}

	const weeklyRevenue: { date: string; net: number; revenue: number }[] = [];
	let weeklyTotal = 0;
	for (let i = 0; i <= 6; i++) {
		const date = new Date(today);
		date.setDate(date.getDate() - i);
		const dateStr = date.toISOString().slice(0, 10);
		const revenue = revenueByDate.get(dateStr) ?? 0;
		const net = revenue - (expenseByDate.get(dateStr) ?? 0);
		weeklyRevenue.push({ date: dateStr, net, revenue });
		weeklyTotal += net;
	}
	return { weeklyRevenue, weeklyTotal };
}

function computeAllTime(transactions: Txn[], expenses: Exp[]): { net: number; total: number } {
	const revenue = transactions.reduce((sum, tx) => sum + tx.total, 0);
	const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
	return { net: revenue - totalExpenses, total: revenue };
}

const today = new Date('2026-08-09T12:00:00');
const todayStr = today.toISOString().slice(0, 10);

describe('Dashboard weekly computation', () => {
	it('should return seven zero days when no data exists', () => {
		const { weeklyRevenue, weeklyTotal } = computeWeekly([], [], today);
		expect(weeklyRevenue).toHaveLength(7);
		expect(weeklyRevenue.every((d) => d.net === 0 && d.revenue === 0)).toBe(true);
		expect(weeklyTotal).toBe(0);
	});

	it('should subtract the same-day expense from revenue and keep gross revenue', () => {
		const { weeklyRevenue, weeklyTotal } = computeWeekly(
			[{ total: 50000, created_at: `${todayStr}T10:00:00` }],
			[{ amount: 20000, occurred_at: `${todayStr}T08:00:00` }],
			today
		);
		expect(weeklyRevenue[0].revenue).toBe(50000);
		expect(weeklyRevenue[0].net).toBe(30000);
		expect(weeklyTotal).toBe(30000);
	});

	it('should allow a negative net when expenses exceed revenue', () => {
		const { weeklyRevenue, weeklyTotal } = computeWeekly(
			[{ total: 10000, created_at: `${todayStr}T10:00:00` }],
			[{ amount: 15000, occurred_at: `${todayStr}T08:00:00` }],
			today
		);
		expect(weeklyRevenue[0].revenue).toBe(10000);
		expect(weeklyRevenue[0].net).toBe(-5000);
		expect(weeklyTotal).toBe(-5000);
	});

	it('should include an older in-window day in the correct slot', () => {
		const sixDaysAgo = new Date(today);
		sixDaysAgo.setDate(sixDaysAgo.getDate() - 6);
		const sixDaysAgoStr = sixDaysAgo.toISOString().slice(0, 10);
		const { weeklyRevenue, weeklyTotal } = computeWeekly(
			[{ total: 20000, created_at: `${sixDaysAgoStr}T09:00:00` }],
			[],
			today
		);
		expect(weeklyRevenue[6].revenue).toBe(20000);
		expect(weeklyRevenue[6].net).toBe(20000);
		expect(weeklyTotal).toBe(20000);
	});
});

describe('Dashboard all-time totals computation', () => {
	it('should return zero when no data exists', () => {
		expect(computeAllTime([], [])).toMatchObject({ net: 0, total: 0 });
	});

	it('should compute gross total and net after subtracting expenses', () => {
		const result = computeAllTime(
			[
				{ total: 10000, created_at: `${todayStr}T10:00:00` },
				{ total: 20000, created_at: '2026-08-01T10:00:00' }
			],
			[{ amount: 5000, occurred_at: `${todayStr}T08:00:00` }]
		);
		expect(result.total).toBe(30000);
		expect(result.net).toBe(25000);
	});
});
```

- [ ] **Step 2: Run the spec**

Run: `pnpm test -- src/features/dashboard/services/__tests__/dashboard-server.spec.ts`
Expected: PASS (6 tests, all with assertions — satisfies `expect.requireAssertions`).

- [ ] **Step 3: Commit**

```bash
git add src/features/dashboard/services/__tests__/dashboard-server.spec.ts
git commit -m "test(dashboard): cover gross revenue and per-day totals"
```

---

### Task 7: Sync PRD and DESIGN copy

**Files:**

- Modify: `PRD.md`
- Modify: `DESIGN.md`

**Interfaces:**

- Consumes: the new Riwayat totals (Task 1) and the dashboard toggle (Tasks 2-5).
- Produces: docs that describe per-tab totals and the gross/net toggle.

- [ ] **Step 1: Update the PRD Riwayat section**

In `PRD.md`, in the "5. Riwayat Transaksi" section (line ~229), after the two bullet points for the tabs, add:

```markdown
- total pemasukan dan total pengeluaran ditampilkan di atas daftar masing-masing tab
```

- [ ] **Step 2: Update the PRD Dashboard section**

In `PRD.md`, in the "6. Dashboard Sederhana" list (lines ~244-251), add a bullet:

```markdown
- toggle untuk menampilkan total pendapatan dengan atau tanpa dikurangi pengeluaran (hanya memengaruhi card Pendapatan Bersih dan Pendapatan 7 Hari)
```

- [ ] **Step 3: Update DESIGN Transaction History section**

In `DESIGN.md`, in section "17. Transaction History Design" (line ~481), after the paragraph about the two tabs, add:

```markdown
Di bawah tab dan di atas daftar, tampilkan ringkasan total untuk tab aktif (Total Pemasukan / Total Pengeluaran).
```

- [ ] **Step 4: Update DESIGN Dashboard section**

In `DESIGN.md`, in section "15. Dashboard Design" (lines ~454-457), after the "pendapatan bersih keseluruhan" bullet, add:

```markdown
- toggle pendapatan bersih/kotor (hanya memengaruhi card Pendapatan Bersih dan grafik mingguan)
```

- [ ] **Step 5: Commit**

```bash
git add PRD.md DESIGN.md
git commit -m "docs: sync PRD and DESIGN with riwayat totals and dashboard toggle"
```

---

### Task 8: Full verification

**Files:**

- None (run-only).

**Interfaces:**

- Consumes: all prior tasks.

- [ ] **Step 1: Format**

Run: `pnpm format`
Expected: no formatting drift remains.

- [ ] **Step 2: Typecheck**

Run: `pnpm check`
Expected: PASS.

- [ ] **Step 3: Lint**

Run: `pnpm lint`
Expected: PASS.

- [ ] **Step 4: Full test suite**

Run: `pnpm test`
Expected: PASS (all Vitest projects, including the new component specs).

- [ ] **Step 5: Manual smoke check**

Run: `pnpm dev` and open `/dashboard`:

- The toggle row "Tanpa dikurangi pengeluaran" sits above the Pendapatan Bersih card.
- Default (toggle off): card shows "Pendapatan Bersih" = all revenue − all expenses; "Pendapatan Bersih 7 Hari" shows per-day net; "Total 7 Hari" equals the sum of the 7 daily nets.
- Toggle on: the same card shows "Total Pendapatan" = all revenue only; the weekly card title becomes "Pendapatan 7 Hari" and bars/values/Total show gross revenue per day; the "Transaksi Hari Ini" and "Pengeluaran Hari Ini" cards do not change.
- Toggle state resets after a full page reload (client-only).

Then open `/transactions`:

- Tab Pemasukan: "Total Pemasukan" card sits between the tabs and the transaction list and equals the sum of all transaction totals.
- Tab Pengeluaran: "Total Pengeluaran" card sits between the header row and the expense list and equals the sum of all expense amounts.

- [ ] **Step 6: Commit any format/test fallout**

```bash
git add -A
git commit -m "chore: post-verification cleanup"
```

(Only if the previous steps produced changes; otherwise skip this commit.)

---

## Self-Review

**1. Spec coverage:**

- Per-tab totals on Riwayat, below the tabs and above each list → Task 1 (component + page integration).
- Each tab has its own total (Total Pemasukan / Total Pengeluaran) → Task 1 (`totalPemasukan` / `totalPengeluaran` derived).
- Dashboard toggle for "dengan dan tanpa dikurangi pengeluaran" → Task 3 (toggle component) + Task 5 (wiring).
- Toggle affects only "card pendapatan bersih" and "card pendapatan 7 hari" → Task 5 (only the top card and the weekly card read `showGross`; the two "Hari Ini" cards are untouched).
- Gross data available server-side → Task 2 (`totalRevenue` + per-day `revenue`).

**2. Placeholder scan:** No TBDs, no "add error handling", all code shown inline; every code step contains the exact file content or replacement.

**3. Type consistency:** `DailyRevenue` gains `revenue` (Task 2) and is consumed by the load (Task 2), the weekly component (Task 4, `d.revenue` / `day.revenue`), and the server spec (Task 6). `DashboardSummary.totalRevenue` is set in the load (Task 2) and read in the dashboard page (Task 5). The `showGross` prop name is identical across Task 3 (`bind:checked={showGross}`), Task 4 (`showGross?: boolean`), and Task 5. `HistoryTotal` props `{ label, value }` match their usage in Task 1. ✓
