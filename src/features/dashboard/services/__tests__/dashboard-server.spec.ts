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
