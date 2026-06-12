<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import * as InputGroup from '$lib/components/ui/input-group/index.js';
	import SearchIcon from '@lucide/svelte/icons/search';
	import { SvelteURLSearchParams } from 'svelte/reactivity';

	type Props = {
		search: string;
	};

	const { search }: Props = $props();

	let value = $derived(search);
	let timeout: ReturnType<typeof setTimeout>;

	function handleInput() {
		clearTimeout(timeout);
		timeout = setTimeout(async () => {
			const params = new SvelteURLSearchParams(window.location.search);
			if (value.trim()) {
				params.set('search', value);
			} else {
				params.delete('search');
			}

			await goto(resolve(`/products?${params.toString()}`), {
				replaceState: true,
				keepFocus: true,
				noScroll: true
			});
		}, 500);
	}
</script>

<InputGroup.Root class="bg-white">
	<InputGroup.Input type="search" placeholder="Cari produk..." bind:value oninput={handleInput} />
	<InputGroup.Addon>
		<SearchIcon />
	</InputGroup.Addon>
</InputGroup.Root>
