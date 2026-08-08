<script lang="ts">
	import ExpenseForm from '$features/expenses/components/expense-form.svelte';
	import type { ExpenseFormState } from '$features/expenses/types/expense-form-state';
	import PageHeader from '$shared/components/page-header.svelte';
	import { formatDateOnly } from '$lib/utils/date';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	const formState: ExpenseFormState = $derived({
		message: form?.message,
		fieldErrors: form?.fieldErrors,
		values: {
			id: data.expense.id,
			description: data.expense.description,
			category: data.expense.category,
			amount: data.expense.amount,
			date: formatDateOnly(data.expense.occurred_at)
		}
	});
</script>

<svelte:head>
	<title>Ubah Pengeluaran - ArfaPOS</title>
</svelte:head>

<div class="space-y-6">
	<PageHeader title="Ubah Pengeluaran" />
	<ExpenseForm action="?/updateExpense" form={formState} />
</div>
