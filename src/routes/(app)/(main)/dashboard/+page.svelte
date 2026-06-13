<script lang="ts">
	import type { PageData } from './$types';
	import { DollarSignIcon, ReceiptIcon } from '@lucide/svelte';
	import DashboardStatsCard from '$features/dashboard/components/dashboard-stats-card.svelte';
	import { formatCurrency } from '$lib/utils/currency';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Dashboard - ArfaPOS</title>
</svelte:head>

<div class="space-y-6 px-4 pt-6">
	<h1 class="text-headline-md">Selamat datang, {data.user?.user_metadata.name ?? 'Kasir'}</h1>

	<div class="grid grid-cols-2 gap-4">
		<DashboardStatsCard label="Total Pendapatan" value={formatCurrency(data.summary.todayRevenue)}>
			<DollarSignIcon size={24} />
		</DashboardStatsCard>

		<DashboardStatsCard label="Transaksi Hari Ini" value={String(data.summary.todayCount)}>
			<ReceiptIcon size={24} />
		</DashboardStatsCard>
	</div>
</div>
