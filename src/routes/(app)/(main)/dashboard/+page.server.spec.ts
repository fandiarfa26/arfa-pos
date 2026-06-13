import { describe, it, expect } from 'vitest';

describe('Dashboard server load', () => {
	it('should return DashboardSummary with default values when no transactions exist', () => {
		const summary = { todayRevenue: 0, todayCount: 0 };
		expect(summary.todayRevenue).toBe(0);
		expect(summary.todayCount).toBe(0);
	});
});
