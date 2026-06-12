<script>
	import { Button } from '$lib/components/ui/button';
	import { ArrowLeftIcon } from '@lucide/svelte';

	const { title } = $props();
</script>

<div class="flex items-center gap-4">
	<Button variant="outline" onclick={() => window.history.back()}>
		<ArrowLeftIcon />
	</Button>
	<span class="text-lg font-bold text-primary">{title}</span>
</div>
