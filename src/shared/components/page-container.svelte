<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();
</script>

<div class="mx-auto w-full max-w-160 md:max-w-3xl lg:max-w-5xl xl:max-w-7xl">
	{@render children()}
</div>
