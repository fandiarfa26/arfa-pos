<script lang="ts">
	import type { DailyRevenue } from '$features/dashboard/types/dashboard';
	import * as Card from '$lib/components/ui/card/index.js';
	import { formatCurrency } from '$lib/utils/currency';
	import { TrendingUpIcon, TrendingDownIcon } from '@lucide/svelte';

	interface Props {
		weeklyRevenue: DailyRevenue[];
		weeklyTotal: number;
		showGross?: boolean;
	}

	let { weeklyRevenue, weeklyTotal, showGross = false }: Props = $props();

	let maxRevenue = $derived(
		Math.max(...weeklyRevenue.map((d) => (showGross ? d.revenue : d.net)), 1)
	);
	let grossTotal = $derived(weeklyRevenue.reduce((sum, d) => sum + d.revenue, 0));
	let todayStr = $derived(new Date().toISOString().slice(0, 10));

	function label(dateStr: string): string {
		const date = new Date(dateStr + 'T00:00:00');
		const hari = new Intl.DateTimeFormat('id-ID', { weekday: 'long' }).format(date);
		const tgl = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short' }).format(date);
		return `${hari}, ${tgl}`;
	}
</script>

<Card.Root>
	<Card.Header>
		<Card.Title class="text-label-bold"
			>{showGross ? 'Pendapatan 7 Hari' : 'Pendapatan Bersih 7 Hari'}</Card.Title
		>
	</Card.Header>
	<Card.Content class="space-y-3">
		{#each weeklyRevenue as day, i (day.date)}
			{@const isToday = day.date === todayStr}
			{@const value = showGross ? day.revenue : day.net}
			{@const barWidth = maxRevenue > 0 ? Math.max(0, (value / maxRevenue) * 100) : 0}
			{@const prevValue =
				i < weeklyRevenue.length - 1
					? showGross
						? weeklyRevenue[i + 1].revenue
						: weeklyRevenue[i + 1].net
					: null}
			{@const up = prevValue !== null && value > prevValue}
			{@const down = prevValue !== null && value < prevValue}
			<div class="space-y-1">
				<div class="flex items-center justify-between">
					<span
						class="text-body-sm {isToday ? 'font-semibold text-primary' : 'text-muted-foreground'}"
					>
						{label(day.date)}
					</span>
					<div class="flex items-center gap-1.5">
						{#if up}
							<TrendingUpIcon class="size-4 text-green-600" aria-hidden="true" />
						{/if}
						{#if down}
							<TrendingDownIcon class="size-4 text-red-600" aria-hidden="true" />
						{/if}
						<span
							class="text-body-sm tabular-nums {isToday
								? 'font-semibold text-foreground'
								: 'text-foreground'}"
						>
							{formatCurrency(value)}
						</span>
					</div>
				</div>
				<div class="h-2 w-full rounded-full bg-muted">
					<div
						class="h-full rounded-full transition-all {isToday ? 'bg-primary' : 'bg-primary/40'}"
						style="width: {barWidth}%"
					></div>
				</div>
			</div>
		{/each}
	</Card.Content>
	<Card.Footer>
		<div class="flex w-full items-baseline justify-between">
			<span class="text-body-md font-semibold">Total 7 Hari</span>
			<span class="text-price-display">{formatCurrency(showGross ? grossTotal : weeklyTotal)}</span>
		</div>
	</Card.Footer>
</Card.Root>
