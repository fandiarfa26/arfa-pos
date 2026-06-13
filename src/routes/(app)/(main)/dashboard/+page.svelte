<script lang="ts">
	import { navigating } from '$app/stores';
	import { resolve } from '$app/paths';
	import type { PageData } from './$types';
	import {
		DollarSignIcon,
		PackageIcon,
		ReceiptIcon,
		ShoppingCartIcon,
		ChevronRightIcon
	} from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import DashboardStatsCard from '$features/dashboard/components/dashboard-stats-card.svelte';
	import { formatCurrency } from '$lib/utils/currency';
	import { formatDateTime } from '$lib/utils/date';

	let { data }: { data: PageData } = $props();

	let loading = $derived($navigating);
	let isEmpty = $derived(data.summary.todayCount === 0 && data.summary.todayRevenue === 0);
</script>

<svelte:head>
	<title>Dashboard - ArfaPOS</title>
</svelte:head>

<div class="space-y-6 px-4 pt-6">
	<h1 class="text-headline-md">
		Selamat datang, {data.user?.user_metadata.name ?? 'Kasir'}
	</h1>

	{#if loading}
		<div class="grid grid-cols-2 gap-4">
			<DashboardStatsCard label="Total Pendapatan" value="" loading={true} />
			<DashboardStatsCard label="Transaksi Hari Ini" value="" loading={true} />
		</div>
	{:else if isEmpty}
		<div class="my-8 flex flex-col items-center justify-center gap-3">
			<ReceiptIcon size={48} class="text-muted-foreground" />
			<p class="text-body-sm text-muted-foreground">Belum ada transaksi hari ini.</p>
			<p class="text-body-xs text-muted-foreground">
				Mulai transaksi baru atau tambahkan produk terlebih dahulu.
			</p>
		</div>
	{:else}
		<div class="grid grid-cols-2 gap-4">
			<DashboardStatsCard
				label="Total Pendapatan"
				value={formatCurrency(data.summary.todayRevenue)}
			>
				<DollarSignIcon size={24} />
			</DashboardStatsCard>

			<DashboardStatsCard label="Transaksi Hari Ini" value={String(data.summary.todayCount)}>
				<ReceiptIcon size={24} />
			</DashboardStatsCard>
		</div>
	{/if}

	<div class="flex flex-col gap-3">
		<a href={resolve('/pos')} class="w-full">
			<Button class="w-full" size="lg">
				<ShoppingCartIcon />
				Buka POS
			</Button>
		</a>
		<a href={resolve('/products')} class="w-full">
			<Button variant="outline" class="w-full" size="lg">
				<PackageIcon />
				Kelola Produk
			</Button>
		</a>
	</div>

	{#if !loading && !isEmpty && data.summary.recentTransactions.length > 0}
		<section class="space-y-3">
			<div class="flex items-center justify-between">
				<h2 class="text-title-sm">Transaksi Terakhir</h2>
				<a href={resolve('/transactions')} class="text-body-sm text-primary"> Lihat Semua </a>
			</div>

			<div class="space-y-2">
				{#each data.summary.recentTransactions as tx (tx.id)}
					<a href={resolve(`/transactions/${tx.id}`)} class="block">
						<Card.Root>
							<Card.Content class="flex items-center justify-between">
								<div class="space-y-1">
									<p class="text-body-sm text-muted-foreground">{formatDateTime(tx.created_at)}</p>
									<p class="text-body-md font-semibold text-primary">{formatCurrency(tx.total)}</p>
								</div>
								<ChevronRightIcon class="size-5 text-muted-foreground" />
							</Card.Content>
						</Card.Root>
					</a>
				{/each}
			</div>
		</section>
	{/if}
</div>
