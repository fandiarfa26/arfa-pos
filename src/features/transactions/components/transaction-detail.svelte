<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import { formatCurrency } from '$lib/utils/currency';
	import { formatDateTime } from '$lib/utils/date';
	import type { Transaction, TransactionItem } from '../types/transaction';

	type Props = {
		transaction: Transaction;
		items: TransactionItem[];
	};

	const { transaction, items }: Props = $props();
</script>

<Card.Root>
	<Card.Content class="space-y-4">
		<div class="space-y-1">
			<p class="text-body-sm text-muted-foreground">{formatDateTime(transaction.created_at)}</p>
			<p class="text-2xl font-bold text-primary">{formatCurrency(transaction.total)}</p>
		</div>
	</Card.Content>
</Card.Root>

{#if items.length > 0}
	<div class="mt-4 space-y-2">
		{#each items as item (item.id)}
			<div class="flex items-center justify-between rounded-xl border bg-card p-4">
				<div class="space-y-1">
					<p class="font-medium">{item.name}</p>
					<p class="text-body-sm text-muted-foreground">
						{formatCurrency(item.price)} &times; {item.qty}
					</p>
				</div>
				<p class="font-semibold">{formatCurrency(item.subtotal)}</p>
			</div>
		{/each}
	</div>
{/if}

<Card.Root class="mt-4">
	<Card.Content class="space-y-2">
		<div class="flex items-center justify-between">
			<p class="font-semibold">Total</p>
			<p class="text-xl font-bold text-primary">{formatCurrency(transaction.total)}</p>
		</div>
		<div class="flex items-center justify-between">
			<p class="font-semibold">Bayar</p>
			<p class="text-lg font-medium text-primary">{formatCurrency(transaction.amount_paid)}</p>
		</div>
		{#if transaction.amount_paid >= transaction.total}
			<div class="flex items-center justify-between border-t pt-2">
				<p class="font-semibold">Kembalian</p>
				<p class="text-lg font-medium text-semantic-success">
					{formatCurrency(transaction.amount_paid - transaction.total)}
				</p>
			</div>
		{/if}
	</Card.Content>
</Card.Root>
