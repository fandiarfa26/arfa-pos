<script lang="ts">
	import PageHeader from '../../../../shared/components/page-header.svelte';
	import TransactionDetail from '$features/transactions/components/transaction-detail.svelte';

	const { data } = $props();
</script>

<svelte:head>
	<title>Detail Transaksi - ArfaPOS</title>
</svelte:head>

<div class="space-y-6">
	<PageHeader title="Detail Transaksi" />
	<TransactionDetail transaction={data.transaction} items={data.items} />
</div>
