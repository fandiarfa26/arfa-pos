<script lang="ts">
	import ExpenseForm from '$features/expenses/components/expense-form.svelte';
	import PageHeader from '$shared/components/page-header.svelte';
	import type { PageProps } from './$types';

	let { form }: PageProps = $props();
</script>

<svelte:head>
	<title>Tambah Pengeluaran - ArfaPOS</title>
</svelte:head>

<div class="space-y-6">
	<PageHeader title="Tambah Pengeluaran" />
	<ExpenseForm action="?/createExpense" {form} />
</div>
