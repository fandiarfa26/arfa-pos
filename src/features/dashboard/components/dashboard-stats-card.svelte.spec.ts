import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import DashboardStatsCard from './dashboard-stats-card.svelte';

describe('DashboardStatsCard', () => {
	it('renders label and value', async () => {
		render(DashboardStatsCard, {
			label: 'Total Pendapatan',
			value: 'Rp 150.000'
		});

		await expect.element(page.getByText('Total Pendapatan')).toBeInTheDocument();
		await expect.element(page.getByText('Rp 150.000')).toBeInTheDocument();
	});

	it('renders skeleton when loading', async () => {
		const container = render(DashboardStatsCard, {
			label: 'Total Pendapatan',
			value: 'Rp 150.000',
			loading: true
		});

		const skeletons = container.container.querySelectorAll('.animate-pulse');
		expect(skeletons.length).toBeGreaterThan(0);
	});
});
