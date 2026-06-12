<script lang="ts">
	import BottomNav from '../../../shared/components/bottom-nav.svelte';

	const { children } = $props();
</script>

<div class="pb-16">
	{@render children()}
</div>

<BottomNav />
