<script lang="ts">
	import TransactionList from '$features/transactions/components/transaction-list.svelte';
	import PageHeader from '../../../shared/components/page-header.svelte';

	const { data } = $props();
</script>

<svelte:head>
	<title>Riwayat Transaksi - ArfaPOS</title>
</svelte:head>

<div class="space-y-6">
	<PageHeader title="Riwayat Transaksi" />
	<TransactionList transactions={data.transactions} />
</div>
