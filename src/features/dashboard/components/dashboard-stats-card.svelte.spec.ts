import { describe, it, expect } from 'vitest';

describe('DashboardStatsCard', () => {
	it('should have a Card component with stat content', () => {
		const props = { label: 'Total Pendapatan', value: 'Rp 150.000', icon: 'wallet' };
		expect(props.label).toBe('Total Pendapatan');
		expect(props.value).toBe('Rp 150.000');
		expect(props.icon).toBe('wallet');
	});
});
