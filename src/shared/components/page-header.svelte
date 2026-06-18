<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { cn } from '$lib/utils';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { ArrowLeftIcon } from '@lucide/svelte';

	let {
		title,
		href,
		onclick = href ? () => goto(resolve(href)) : () => window.history.back(),
		class: className = ''
	}: {
		title: string;
		href?: string;
		onclick?: () => void;
		class?: string;
	} = $props();
</script>

<div class={cn('flex items-center gap-4', className)}>
	<Button variant="outline" {onclick} aria-label="Kembali" class="min-h-11 min-w-11">
		<ArrowLeftIcon />
	</Button>
	<span class="text-lg font-bold text-primary">{title}</span>
</div>
