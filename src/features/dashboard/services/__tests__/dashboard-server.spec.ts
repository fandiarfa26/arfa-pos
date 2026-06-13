import { describe, it, expect } from 'vitest';
import type { DashboardSummary } from '$features/dashboard/types/dashboard';

function computeSummary(transactions: { total: number }[]): DashboardSummary {
	return {
		todayRevenue: transactions.reduce((sum, tx) => sum + tx.total, 0),
		todayCount: transactions.length,
		recentTransactions: []
	};
}

describe('Dashboard server load', () => {
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
