<script lang="ts">
	import TransactionDetail from '$features/transactions/components/transaction-detail.svelte';

	const { data } = $props();
</script>

<svelte:head>
	<title>Detail Transaksi - ArfaPOS</title>
</svelte:head>

<TransactionDetail transaction={data.transaction} items={data.items} />
