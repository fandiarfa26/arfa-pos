<script lang="ts">
	import type { Snippet } from 'svelte';
	import { Card } from '$lib/components/ui/card';

	interface Props {
		label: string;
		value: string;
		children: Snippet;
	}

	let { label, value, children }: Props = $props();
</script>

<Card class="flex items-center gap-4 p-5">
	<div class="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
		{@render children()}
	</div>
	<div class="flex flex-col">
		<span class="text-body-sm text-muted-foreground">{label}</span>
		<span class="text-price-display text-foreground">{value}</span>
	</div>
</Card>
