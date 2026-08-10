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
