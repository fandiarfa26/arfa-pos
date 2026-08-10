import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import DashboardRevenueToggle from './dashboard-revenue-toggle.svelte';

describe('DashboardRevenueToggle', () => {
	it('renders the switch with its label', async () => {
		render(DashboardRevenueToggle, { checked: false });

		await expect.element(page.getByRole('switch')).toBeInTheDocument();
		await expect.element(page.getByText('Tanpa dikurangi pengeluaran')).toBeInTheDocument();
	});

	it('toggles aria-checked when clicked', async () => {
		render(DashboardRevenueToggle, { checked: false });

		const switchButton = page.getByRole('switch');
		await expect.element(switchButton).toHaveAttribute('aria-checked', 'false');

		await switchButton.click();

		await expect.element(switchButton).toHaveAttribute('aria-checked', 'true');
	});
});
