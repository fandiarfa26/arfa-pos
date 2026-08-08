<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { PencilIcon, TrashIcon } from '@lucide/svelte';
	import { formatCurrency } from '$lib/utils/currency';
	import { formatDateOnly } from '$lib/utils/date';
	import type { Expense } from '../types/expense';
	import ExpenseDeleteDialog from './expense-delete-dialog.svelte';

	type Props = {
		expense: Expense;
	};

	const { expense }: Props = $props();
</script>

<Card.Root size="sm" class="gap-0">
	<Card.Content class="space-y-1 pb-0">
		<div class="flex items-start justify-between gap-2">
			<span class="text-sm font-semibold">{expense.description}</span>
			<span class="shrink-0 text-sm font-medium text-primary">{formatCurrency(expense.amount)}</span
			>
		</div>
		<div class="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
			{#if expense.category}
				<span>Kategori: {expense.category}</span>
			{/if}
			<span>{formatDateOnly(expense.occurred_at)}</span>
		</div>
	</Card.Content>
	<Card.Footer class="pt-0">
		<div class="flex w-full items-center justify-end gap-1">
			<a href={`/expenses/${expense.id}`} class="-m-2 inline-flex p-2">
				<Button variant="ghost" size="sm" class="px-2 text-primary">
					<PencilIcon class="size-3.5" /> Ubah
				</Button>
			</a>
			<ExpenseDeleteDialog expenseId={expense.id}>
				{#snippet child({ props })}
					<span class="-m-2 inline-flex p-2">
						<Button {...props} variant="ghost" size="sm" class="px-2 text-semantic-danger">
							<TrashIcon class="size-3.5" /> Hapus
						</Button>
					</span>
				{/snippet}
			</ExpenseDeleteDialog>
		</div>
	</Card.Footer>
</Card.Root>
