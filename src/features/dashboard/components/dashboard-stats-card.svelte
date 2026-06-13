<script lang="ts">
	import type { Snippet } from 'svelte';
	import { Card } from '$lib/components/ui/card';

	interface Props {
		label: string;
		value: string;
		children?: Snippet;
		loading?: boolean;
	}

	let { label, value, children, loading = false }: Props = $props();
</script>

<Card class="flex items-center gap-4 p-5">
	{#if loading}
		<div class="flex h-12 w-12 animate-pulse items-center justify-center rounded-xl bg-muted"></div>
		<div class="flex flex-col gap-2">
			<div class="h-3 w-20 animate-pulse rounded bg-muted"></div>
			<div class="h-5 w-24 animate-pulse rounded bg-muted"></div>
		</div>
	{:else}
		<div class="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
			{#if children}{@render children()}{/if}
		</div>
		<div class="flex flex-col">
			<span class="text-body-sm text-muted-foreground">{label}</span>
			<span class="text-price-display text-foreground">{value}</span>
		</div>
	{/if}
</Card>
