<script lang="ts">
	import { page } from '$app/state';
	import { ReceiptIcon, WalletIcon } from '@lucide/svelte';
	import ExpenseAddButton from '$features/expenses/components/expense-add-button.svelte';
	import ExpenseList from '$features/expenses/components/expense-list.svelte';
	import HistoryTotal from '$features/transactions/components/history-total.svelte';
	import TransactionList from '$features/transactions/components/transaction-list.svelte';

	const { data } = $props();

	let activeTab = $state<'pemasukan' | 'pengeluaran'>(
		page.state.tab === 'pengeluaran' ? 'pengeluaran' : 'pemasukan'
	);

	let totalPemasukan = $derived(data.transactions.reduce((sum, tx) => sum + tx.total, 0));
	let totalPengeluaran = $derived(data.expenses.reduce((sum, expense) => sum + expense.amount, 0));
</script>

<svelte:head>
	<title>Riwayat - ArfaPOS</title>
</svelte:head>

<div class="space-y-4">
	<div role="tablist" aria-label="Riwayat" class="grid grid-cols-2 gap-1 rounded-xl bg-muted p-1">
		<button
			type="button"
			role="tab"
			aria-selected={activeTab === 'pemasukan'}
			class="flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-body-sm transition-colors"
			class:bg-background={activeTab === 'pemasukan'}
			class:text-primary={activeTab === 'pemasukan'}
			class:text-muted-foreground={activeTab !== 'pemasukan'}
			class:shadow-sm={activeTab === 'pemasukan'}
			onclick={() => (activeTab = 'pemasukan')}
		>
			<ReceiptIcon class="size-4" aria-hidden="true" />
			Pemasukan
		</button>
		<button
			type="button"
			role="tab"
			aria-selected={activeTab === 'pengeluaran'}
			class="flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-body-sm transition-colors"
			class:bg-background={activeTab === 'pengeluaran'}
			class:text-primary={activeTab === 'pengeluaran'}
			class:text-muted-foreground={activeTab !== 'pengeluaran'}
			class:shadow-sm={activeTab === 'pengeluaran'}
			onclick={() => (activeTab = 'pengeluaran')}
		>
			<WalletIcon class="size-4" aria-hidden="true" />
			Pengeluaran
		</button>
	</div>

	{#if activeTab === 'pemasukan'}
		<HistoryTotal label="Total Pemasukan" value={totalPemasukan} />
		<TransactionList transactions={data.transactions} />
	{:else}
		<div class="space-y-4">
			<div class="flex items-center justify-between">
				<h2 class="text-label-bold">Pengeluaran</h2>
				<ExpenseAddButton />
			</div>
			<HistoryTotal label="Total Pengeluaran" value={totalPengeluaran} />
			<ExpenseList expenses={data.expenses} />
		</div>
	{/if}
</div>
