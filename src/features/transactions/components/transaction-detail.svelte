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
			<p class="text-sm text-gray-500">{formatDateTime(transaction.created_at)}</p>
			<p class="text-2xl font-bold text-primary">{formatCurrency(transaction.total)}</p>
		</div>
	</Card.Content>
</Card.Root>

{#if items.length > 0}
	<div class="mt-4 space-y-2">
		{#each items as item (item.id)}
			<Card.Root>
				<Card.Content>
					<div class="flex items-center justify-between">
						<div class="space-y-1">
							<p class="font-medium">{item.name}</p>
							<p class="text-sm text-gray-500">
								{formatCurrency(item.price)} &times; {item.qty}
							</p>
						</div>
						<p class="font-semibold">{formatCurrency(item.subtotal)}</p>
					</div>
				</Card.Content>
			</Card.Root>
		{/each}
	</div>
{/if}

<Card.Root class="mt-4">
	<Card.Content class="flex items-center justify-between">
		<p class="font-semibold">Total</p>
		<p class="text-xl font-bold text-primary">{formatCurrency(transaction.total)}</p>
	</Card.Content>
</Card.Root>
