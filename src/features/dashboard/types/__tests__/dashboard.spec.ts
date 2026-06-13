import { describe, it, expect } from 'vitest';

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
