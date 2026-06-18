<script lang="ts">
	import BottomNav from '$shared/components/bottom-nav.svelte';

	const { children } = $props();
</script>

<a href="#main-content" class="skip-link">Langsung ke konten</a>

<div class="pb-18">
	{@render children()}
</div>

<BottomNav />
