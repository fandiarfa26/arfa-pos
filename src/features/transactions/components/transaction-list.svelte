<script lang="ts">
	import { ReceiptIcon } from '@lucide/svelte';
	import type { Transaction } from '../types/transaction';
	import TransactionCard from './transaction-card.svelte';

	type Props = {
		transactions: Transaction[];
	};

	const { transactions }: Props = $props();
</script>

{#if transactions.length === 0}
	<div class="my-6 flex flex-col items-center justify-center gap-2 p-4">
		<ReceiptIcon size={48} class="text-muted-foreground" />
		<p class="text-body-sm text-muted-foreground">Belum ada transaksi.</p>
	</div>
{:else}
	<div class="space-y-3">
		{#each transactions as transaction (transaction.id)}
			<TransactionCard {transaction} />
		{/each}
	</div>
{/if}
