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
