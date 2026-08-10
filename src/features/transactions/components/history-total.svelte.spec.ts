import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import HistoryTotal from './history-total.svelte';

describe('HistoryTotal', () => {
	it('renders the label and formatted total', async () => {
		render(HistoryTotal, { label: 'Total Pemasukan', value: 150000 });

		await expect.element(page.getByText('Total Pemasukan')).toBeInTheDocument();
		await expect.element(page.getByText('Rp 150.000')).toBeInTheDocument();
	});
});
