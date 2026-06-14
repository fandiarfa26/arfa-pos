<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import { formatCurrency } from '$lib/utils/currency';
	import { formatDateTime } from '$lib/utils/date';
	import { ChevronRightIcon } from '@lucide/svelte';
	import type { Transaction } from '../types/transaction';
	import { resolve } from '$app/paths';

	type Props = {
		transaction: Transaction;
	};

	const { transaction }: Props = $props();
</script>

<a href={resolve(`/transactions/${transaction.id}`)} class="block">
	<Card.Root>
		<Card.Content class="flex items-center justify-between">
			<div class="space-y-1">
				<p class="text-body-sm text-muted-foreground">{formatDateTime(transaction.created_at)}</p>
				<p class="text-lg font-semibold text-primary">{formatCurrency(transaction.total)}</p>
			</div>
			<ChevronRightIcon class="size-5 text-muted-foreground" />
		</Card.Content>
	</Card.Root>
</a>
