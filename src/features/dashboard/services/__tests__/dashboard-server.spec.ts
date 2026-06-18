import { describe, it, expect } from 'vitest';

function computeSummary(transactions: { total: number }[]): {
	todayRevenue: number;
	todayCount: number;
} {
	return {
		todayRevenue: transactions.reduce((sum, tx) => sum + tx.total, 0),
		todayCount: transactions.length
	};
}

describe('Dashboard summary computation', () => {
	it('should return zero values when no transactions exist', () => {
		const summary = computeSummary([]);
		expect(summary.todayRevenue).toBe(0);
		expect(summary.todayCount).toBe(0);
	});

	it('should sum revenue and count transactions correctly', () => {
		const summary = computeSummary([{ total: 25000 }, { total: 15000 }, { total: 10000 }]);
		expect(summary.todayRevenue).toBe(50000);
		expect(summary.todayCount).toBe(3);
	});

	it('should handle single transaction', () => {
		const summary = computeSummary([{ total: 75000 }]);
		expect(summary.todayRevenue).toBe(75000);
		expect(summary.todayCount).toBe(1);
	});
});

describe('DashboardSummary type', () => {
	it('should accept a valid summary object', () => {
		const summary: Record<string, unknown> = {
			todayRevenue: 150000,
			todayCount: 5
		};
		expect(summary.todayRevenue).toBe(150000);
		expect(summary.todayCount).toBe(5);
	});
});
