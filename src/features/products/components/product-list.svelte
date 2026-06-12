<script lang="ts">
	import type { Product } from '../types/product';
	import ProductAddButton from './product-add-button.svelte';
	import ProductCard from './product-card.svelte';
	import ProductInfo from './product-info.svelte';
	import ProductListSearch from './product-list-search.svelte';

	type Props = {
		products: Product[];
		search: string;
	};

	const { products, search }: Props = $props();
</script>

<div class="flex items-center gap-2">
	<ProductListSearch {search} />
	<ProductAddButton />
</div>

{#if products.length === 0}
	<ProductInfo variant={search.trim() === '' ? 'empty' : 'searchEmpty'} />
{:else}
	<div class="mt-4 grid grid-cols-1 gap-4">
		{#each products as product (product.sku)}
			<ProductCard {product} />
		{/each}
	</div>
{/if}
