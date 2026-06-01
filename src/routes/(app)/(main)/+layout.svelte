<script lang="ts">
	import BottomNav from '../../../shared/components/bottom-nav.svelte';

	const { children } = $props();
</script>

{@render children()}

<BottomNav />
