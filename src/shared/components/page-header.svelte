<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { cn } from '$lib/utils';
	import { ArrowLeftIcon } from '@lucide/svelte';

	let {
		title,
		onclick = () => window.history.back(),
		class: className = ''
	}: {
		title: string;
		onclick?: () => void;
		class?: string;
	} = $props();
</script>

<div class={cn('flex items-center gap-4', className)}>
	<Button variant="outline" {onclick}>
		<ArrowLeftIcon />
	</Button>
	<span class="text-lg font-bold text-primary">{title}</span>
</div>
