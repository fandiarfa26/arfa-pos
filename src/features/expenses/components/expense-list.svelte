<script lang="ts">
	import { WalletIcon } from '@lucide/svelte';
	import type { Expense } from '../types/expense';
	import ExpenseAddButton from './expense-add-button.svelte';
	import ExpenseCard from './expense-card.svelte';

	type Props = {
		expenses: Expense[];
	};

	const { expenses }: Props = $props();
</script>

<div class="flex items-center justify-between">
	<h1 class="text-label-bold">Pengeluaran</h1>
	<ExpenseAddButton />
</div>

{#if expenses.length === 0}
	<div class="my-6 flex flex-col items-center justify-center gap-2 p-4">
		<WalletIcon size={48} class="text-muted-foreground" />
		<p class="text-body-sm text-muted-foreground">Belum ada pengeluaran.</p>
	</div>
{:else}
	<div class="mt-4 grid grid-cols-1 gap-4">
		{#each expenses as expense (expense.id)}
			<ExpenseCard {expense} />
		{/each}
	</div>
{/if}
