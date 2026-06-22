<script lang="ts">
	import type { DailyRevenue } from '$features/dashboard/types/dashboard';
	import * as Card from '$lib/components/ui/card/index.js';
	import { formatCurrency } from '$lib/utils/currency';
	import { TrendingUpIcon, TrendingDownIcon } from '@lucide/svelte';

	interface Props {
		weeklyRevenue: DailyRevenue[];
		weeklyTotal: number;
	}

	let { weeklyRevenue, weeklyTotal }: Props = $props();

	let maxRevenue = $derived(Math.max(...weeklyRevenue.map((d) => d.revenue), 1));
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
		<Card.Title class="text-label-bold">Pendapatan 7 Hari</Card.Title>
	</Card.Header>
	<Card.Content class="space-y-3">
		{#each weeklyRevenue as day, i (day.date)}
			{@const isToday = day.date === todayStr}
			{@const barWidth = maxRevenue > 0 ? (day.revenue / maxRevenue) * 100 : 0}
			{@const prevRevenue = i < weeklyRevenue.length - 1 ? weeklyRevenue[i + 1].revenue : null}
			{@const up = prevRevenue !== null && day.revenue > prevRevenue}
			{@const down = prevRevenue !== null && day.revenue < prevRevenue}
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
							{formatCurrency(day.revenue)}
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
			<span class="text-price-display">{formatCurrency(weeklyTotal)}</span>
		</div>
	</Card.Footer>
</Card.Root>
