<script lang="ts">
	import ExpenseList from '$features/expenses/components/expense-list.svelte';

	const { data } = $props();
</script>

<svelte:head>
	<title>Pengeluaran - ArfaPOS</title>
</svelte:head>

<ExpenseList expenses={data.expenses} />
