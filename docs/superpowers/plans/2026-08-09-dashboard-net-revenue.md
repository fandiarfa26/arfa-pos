# Dashboard Net Revenue Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the "Pendapatan 7 Hari" chart show per-day net revenue (that day's revenue minus that day's expenses), and make the "Pendapatan Bersih" card show all-time net (all revenue minus all expenses) instead of today-only.

**Architecture:** The dashboard `load` in `+page.server.ts` gains two aggregate queries (all transactions `total, created_at`, all expenses `amount, occurred_at`). Per-day net for the last 7 days and all-time net are computed server-side and fed to the existing components with an unchanged shape. `DailyRevenue.revenue` is renamed to `DailyRevenue.net` to reflect the new semantics. No new tables, migrations, services, or routes. Docs (PRD, DESIGN) are synced per repo convention.

**Tech Stack:** SvelteKit 2 + Svelte 5 runes, TypeScript, Supabase (PostgreSQL + RLS), Tailwind CSS 4, shadcn-svelte, lucide-svelte, Vitest.

## Global Constraints

- **Svelte 5 runes only** — no `$:`, `export let`, `on:click`. Use `$state()`, `$derived()`, `$props()`.
- **Supabase queries inlined** in `+page.server.ts` `load`/`action` functions — no ORM, no repository layer (only delete services are extracted).
- **Money** stored/compared as integer rupiah, formatted with `formatCurrency()`.
- **Indonesian UI copy** (e.g. "Pendapatan Bersih", "Total 7 Hari").
- **Prettier**: tabs, single quotes, no trailing commas, 100 print width. Run `pnpm format` before finishing.
- **Tests**: `expect.requireAssertions: true`. Server tests live in `src/**/*.{test,spec}.{js,ts}` (node project). Mirror-test convention: the spec duplicates the load computation, it does not import server code.
- **Setup first**: `nvm use latest && pnpm install && pnpm prepare`.
- Path aliases: `$features`, `$shared`, `$lib` (all configured).

---

### Task 1: Rename `DailyRevenue.revenue` to `DailyRevenue.net`

**Files:**

- Modify: `src/features/dashboard/types/dashboard.ts:3-16`

**Interfaces:**

- Consumes: nothing.
- Produces: `DailyRevenue` with fields `{ date: string; net: number }`; `DashboardSummary` keeps all six fields (`todayRevenue`, `todayExpenses`, `netRevenue`, `todayCount`, `recentTransactions`, `weeklyRevenue`, `weeklyTotal`). `netRevenue` is now all-time net; `weeklyTotal` is the sum of the 7 daily `net` values.

- [ ] **Step 1: Edit the type file**

Replace the `DailyRevenue` interface in `src/features/dashboard/types/dashboard.ts`:

```ts
export interface DailyRevenue {
	date: string;
	net: number;
}
```

- [ ] **Step 2: Verify the file**

`src/features/dashboard/types/dashboard.ts` should read:

```ts
import type { Transaction } from '$features/transactions/types/transaction';

export interface DailyRevenue {
	date: string;
	net: number;
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

- [ ] **Step 3: Commit**

```bash
git add src/features/dashboard/types/dashboard.ts
git commit -m "refactor(dashboard): rename DailyRevenue.revenue to net"
```

---

### Task 2: Compute per-day net and all-time net in the dashboard load

**Files:**

- Modify: `src/routes/(app)/(main)/dashboard/+page.server.ts`

**Interfaces:**

- Consumes: `DailyRevenue` from `$features/dashboard/types/dashboard` (now `{ date, net }`).
- Produces: `summary.weeklyRevenue` where each entry's `net` = that day's revenue − that day's expenses; `summary.weeklyTotal` = sum of the 7 daily `net` values; `summary.netRevenue` = (all transactions total) − (all expenses amount). Keeps `todayRevenue`, `todayExpenses`, `todayCount`, `recentTransactions` unchanged.

- [ ] **Step 1: Replace the load function**

Rewrite `src/routes/(app)/(main)/dashboard/+page.server.ts` in full:

```ts
import { error } from '@sveltejs/kit';
import type { DailyRevenue, DashboardSummary } from '$features/dashboard/types/dashboard';
import type { Transaction } from '$features/transactions/types/transaction';

export async function load({ locals }) {
	const today = new Date();
	today.setHours(0, 0, 0, 0);
	const userId = locals.user?.id;

	const { data: todayData, error: todayError } = await locals.supabase
		.from('transactions')
		.select('total')
		.gte('created_at', today.toISOString())
		.eq('user_id', userId);

	if (todayError) {
		throw error(500, 'Gagal memuat data dashboard. Silahkan coba lagi.');
	}

	const { data: todayExpensesData, error: todayExpensesError } = await locals.supabase
		.from('expenses')
		.select('amount')
		.gte('occurred_at', today.toISOString())
		.eq('user_id', userId);

	if (todayExpensesError) {
		throw error(500, 'Gagal memuat data dashboard. Silahkan coba lagi.');
	}

	const { data: recentData, error: recentError } = await locals.supabase
		.from('transactions')
		.select('id, total, amount_paid, created_at')
		.eq('user_id', userId)
		.gte('created_at', today.toISOString())
		.order('created_at', { ascending: false })
		.limit(5);

	if (recentError) {
		throw error(500, 'Gagal memuat data dashboard. Silahkan coba lagi.');
	}

	const { data: allTransactions, error: allTransactionsError } = await locals.supabase
		.from('transactions')
		.select('total, created_at')
		.eq('user_id', userId);

	if (allTransactionsError) {
		throw error(500, 'Gagal memuat data dashboard. Silahkan coba lagi.');
	}

	const { data: allExpenses, error: allExpensesError } = await locals.supabase
		.from('expenses')
		.select('amount, occurred_at')
		.eq('user_id', userId);

	if (allExpensesError) {
		throw error(500, 'Gagal memuat data dashboard. Silahkan coba lagi.');
	}

	const revenueByDate = new Map<string, number>();
	for (const tx of allTransactions ?? []) {
		const dateStr = tx.created_at.slice(0, 10);
		revenueByDate.set(dateStr, (revenueByDate.get(dateStr) ?? 0) + tx.total);
	}

	const expenseByDate = new Map<string, number>();
	for (const expense of allExpenses ?? []) {
		const dateStr = expense.occurred_at.slice(0, 10);
		expenseByDate.set(dateStr, (expenseByDate.get(dateStr) ?? 0) + expense.amount);
	}

	const weeklyRevenue: DailyRevenue[] = [];
	let weeklyTotal = 0;
	for (let i = 0; i <= 6; i++) {
		const date = new Date(today);
		date.setDate(date.getDate() - i);
		const dateStr = date.toISOString().slice(0, 10);
		const net = (revenueByDate.get(dateStr) ?? 0) - (expenseByDate.get(dateStr) ?? 0);
		weeklyRevenue.push({ date: dateStr, net });
		weeklyTotal += net;
	}

	const recentTransactions: Transaction[] = (recentData ?? []).map((tx) => ({
		id: tx.id,
		total: tx.total,
		amount_paid: tx.amount_paid,
		created_at: tx.created_at
	}));

	const todayRevenue = (todayData ?? []).reduce((sum, tx) => sum + tx.total, 0);
	const todayExpenses = (todayExpensesData ?? []).reduce((sum, expense) => sum + expense.amount, 0);

	const totalRevenue = (allTransactions ?? []).reduce((sum, tx) => sum + tx.total, 0);
	const totalExpenses = (allExpenses ?? []).reduce((sum, expense) => sum + expense.amount, 0);

	const summary: DashboardSummary = {
		todayRevenue,
		todayExpenses,
		netRevenue: totalRevenue - totalExpenses,
		todayCount: todayData?.length ?? 0,
		recentTransactions,
		weeklyRevenue,
		weeklyTotal
	};

	return { summary };
}
```

Note: this removes the old 7-day `weekData` query (`sevenDaysAgo` is no longer needed) — the weekly chart and all-time net both derive from `allTransactions` + `allExpenses`.

- [ ] **Step 2: Typecheck**

Run: `pnpm check`
Expected: PASS (no errors from `$features/dashboard/types/dashboard` or the load).

- [ ] **Step 3: Commit**

```bash
git add src/routes/(app)/(main)/dashboard/+page.server.ts
git commit -m "feat(dashboard): compute daily net revenue and all-time net"
```

---

### Task 3: Render net values in the weekly revenue card

**Files:**

- Modify: `src/features/dashboard/components/dashboard-weekly-revenue.svelte:14,25-35,55,61,71`

**Interfaces:**

- Consumes: `DailyRevenue` with field `net` (from Task 1) and `weeklyTotal`.
- Produces: a chart where each row's bar/value is that day's net, clamped so negative days show a zero-width bar; title reflects net semantics.

- [ ] **Step 1: Update the derived values**

In `src/features/dashboard/components/dashboard-weekly-revenue.svelte`, replace the `maxRevenue` line:

```svelte
let maxRevenue = $derived(Math.max(...weeklyRevenue.map((d) => d.net), 1));
```

- [ ] **Step 2: Clamp the bar width**

Replace the `barWidth` const inside the `{#each}` block:

```svelte
{@const barWidth = maxRevenue > 0 ? Math.max(0, (day.net / maxRevenue) * 100) : 0}
```

- [ ] **Step 3: Use `day.net` for trend + value**

Replace the two remaining `day.revenue` references:

```svelte
{@const prevRevenue = i < weeklyRevenue.length - 1 ? weeklyRevenue[i + 1].net : null}
```

```svelte
{formatCurrency(day.net)}
```

- [ ] **Step 4: Update the card title**

Replace the title in `Card.Header`:

```svelte
<Card.Title class="text-label-bold">Pendapatan Bersih 7 Hari</Card.Title>
```

- [ ] **Step 5: Typecheck + verify**

Run: `pnpm check`
Expected: PASS. The file should have no remaining `.revenue` references on `day`; the `isToday`/trend logic is unchanged.

- [ ] **Step 6: Commit**

```bash
git add src/features/dashboard/components/dashboard-weekly-revenue.svelte
git commit -m "feat(dashboard): show net revenue in weekly chart"
```

---

### Task 4: Update the dashboard summary spec

**Files:**

- Modify: `src/features/dashboard/services/__tests__/dashboard-server.spec.ts`

**Interfaces:**

- Consumes: nothing at runtime — mirrors the Task 2 computation (repo convention).
- Produces: tests proving daily net, weekly total, and all-time net behavior.

- [ ] **Step 1: Replace the spec**

Rewrite `src/features/dashboard/services/__tests__/dashboard-server.spec.ts` in full:

```ts
import { describe, it, expect } from 'vitest';

type Txn = { total: number; created_at: string };
type Exp = { amount: number; occurred_at: string };

function dailyNetByDate(transactions: Txn[], expenses: Exp[]): Map<string, number> {
	const netByDate = new Map<string, number>();
	for (const tx of transactions) {
		const date = tx.created_at.slice(0, 10);
		netByDate.set(date, (netByDate.get(date) ?? 0) + tx.total);
	}
	for (const expense of expenses) {
		const date = expense.occurred_at.slice(0, 10);
		netByDate.set(date, (netByDate.get(date) ?? 0) - expense.amount);
	}
	return netByDate;
}

function computeWeeklyNet(
	transactions: Txn[],
	expenses: Exp[],
	today: Date
): { weeklyRevenue: { date: string; net: number }[]; weeklyTotal: number } {
	const netByDate = dailyNetByDate(transactions, expenses);
	const weeklyRevenue = [];
	let weeklyTotal = 0;
	for (let i = 0; i <= 6; i++) {
		const date = new Date(today);
		date.setDate(date.getDate() - i);
		const dateStr = date.toISOString().slice(0, 10);
		const net = netByDate.get(dateStr) ?? 0;
		weeklyRevenue.push({ date: dateStr, net });
		weeklyTotal += net;
	}
	return { weeklyRevenue, weeklyTotal };
}

function computeAllTimeNet(transactions: Txn[], expenses: Exp[]): number {
	const revenue = transactions.reduce((sum, tx) => sum + tx.total, 0);
	const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
	return revenue - totalExpenses;
}

const today = new Date('2026-08-09T12:00:00');
const todayStr = today.toISOString().slice(0, 10);

describe('Dashboard weekly net computation', () => {
	it('should return seven zero days when no data exists', () => {
		const { weeklyRevenue, weeklyTotal } = computeWeeklyNet([], [], today);
		expect(weeklyRevenue).toHaveLength(7);
		expect(weeklyRevenue.every((d) => d.net === 0)).toBe(true);
		expect(weeklyTotal).toBe(0);
	});

	it('should subtract the same-day expense from revenue', () => {
		const { weeklyRevenue, weeklyTotal } = computeWeeklyNet(
			[{ total: 50000, created_at: `${todayStr}T10:00:00` }],
			[{ amount: 20000, occurred_at: `${todayStr}T08:00:00` }],
			today
		);
		expect(weeklyRevenue[0].net).toBe(30000);
		expect(weeklyTotal).toBe(30000);
	});

	it('should allow a negative net when expenses exceed revenue', () => {
		const { weeklyRevenue, weeklyTotal } = computeWeeklyNet(
			[{ total: 10000, created_at: `${todayStr}T10:00:00` }],
			[{ amount: 15000, occurred_at: `${todayStr}T08:00:00` }],
			today
		);
		expect(weeklyRevenue[0].net).toBe(-5000);
		expect(weeklyTotal).toBe(-5000);
	});

	it('should include an older in-window day in the correct slot', () => {
		const sixDaysAgo = new Date(today);
		sixDaysAgo.setDate(sixDaysAgo.getDate() - 6);
		const sixDaysAgoStr = sixDaysAgo.toISOString().slice(0, 10);
		const { weeklyRevenue, weeklyTotal } = computeWeeklyNet(
			[{ total: 20000, created_at: `${sixDaysAgoStr}T09:00:00` }],
			[],
			today
		);
		expect(weeklyRevenue[6].net).toBe(20000);
		expect(weeklyTotal).toBe(20000);
	});
});

describe('Dashboard all-time net computation', () => {
	it('should return zero when no data exists', () => {
		expect(computeAllTimeNet([], [])).toBe(0);
	});

	it('should subtract all expenses from all revenue', () => {
		const allTimeNet = computeAllTimeNet(
			[
				{ total: 10000, created_at: `${todayStr}T10:00:00` },
				{ total: 20000, created_at: '2026-08-01T10:00:00' }
			],
			[{ amount: 5000, occurred_at: `${todayStr}T08:00:00` }]
		);
		expect(allTimeNet).toBe(25000);
	});
});
```

- [ ] **Step 2: Run the spec**

Run: `pnpm test -- src/features/dashboard/services/__tests__/dashboard-server.spec.ts`
Expected: PASS (6 tests, all with assertions — satisfies `expect.requireAssertions`).

- [ ] **Step 3: Commit**

```bash
git add src/features/dashboard/services/__tests__/dashboard-server.spec.ts
git commit -m "test(dashboard): cover daily net and all-time net computation"
```

---

### Task 5: Sync PRD and DESIGN copy

**Files:**

- Modify: `PRD.md:246,249`
- Modify: `DESIGN.md:454`

**Interfaces:**

- Consumes: the new behavior from Task 2 (all-time `netRevenue`, per-day net weekly chart).
- Produces: docs that describe net revenue as all-time and the weekly chart as per-day net.

- [ ] **Step 1: Update PRD dashboard list**

In `PRD.md`, replace line 246:

```markdown
- pendapatan bersih (seluruh pendapatan − seluruh pengeluaran)
```

and line 249:

```markdown
- pendapatan mingguan (pendapatan bersih per hari)
```

- [ ] **Step 2: Update DESIGN dashboard list**

In `DESIGN.md`, replace line 454:

```markdown
- pendapatan bersih keseluruhan (nominal terbesar, paling atas)
```

Line 456 (`grafik pendapatan mingguan`) stays as-is.

- [ ] **Step 3: Commit**

```bash
git add PRD.md DESIGN.md
git commit -m "docs: sync PRD and DESIGN with dashboard net revenue"
```

---

### Task 6: Full verification

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
Expected: PASS (all Vitest projects).

- [ ] **Step 5: Manual smoke check**

Run: `pnpm dev`, open `/dashboard`.
Expected:

- "Pendapatan Bersih" card shows all-time net (all revenue − all expenses, across all dates).
- "Pendapatan Bersih 7 Hari" shows each day's net; "Total 7 Hari" equals the sum of the 7 daily nets.
- Add an expense dated yesterday (`/expenses/add`) → yesterday's row value drops by that amount; the all-time net card drops too; today's "Pengeluaran Hari Ini" is unaffected.

- [ ] **Step 6: Commit any format/test fallout**

```bash
git add -A
git commit -m "chore(dashboard): post-verification cleanup"
```

(Only if the previous steps produced changes; otherwise skip this commit.)

---

## Self-Review

**1. Spec coverage:**

- Per-day revenue reduced by that day's expenses → Task 2 + Task 3.
- 7-day total reflects the reduced daily values → Task 2 (`weeklyTotal`) + Task 4 test.
- "Pendapatan Bersih" card = all revenue − all expenses, not per-day → Task 2 (`netRevenue`) + Task 4 test.

**2. Placeholder scan:** No TBDs, no "add error handling", all code shown inline.

**3. Type consistency:** `DailyRevenue.net` (renamed in Task 1) is used by the load in Task 2 (`{ date: dateStr, net }`), the component in Task 3 (`d.net`, `day.net`), and the spec in Task 4 (`d.net`, `net`). `weeklyTotal` and `netRevenue` keep their names across all tasks. ✓
