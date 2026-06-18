<script lang="ts">
	import TransactionList from '$features/transactions/components/transaction-list.svelte';

	const { data } = $props();
</script>

<svelte:head>
	<title>Riwayat Transaksi - ArfaPOS</title>
</svelte:head>

<TransactionList transactions={data.transactions} />
