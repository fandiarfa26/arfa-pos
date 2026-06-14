<script lang="ts">
	import type { Product } from '$features/products/types/product';
	import type { CartItem } from '../types/cart';
	import { formatCurrency } from '$lib/utils/currency';
	import * as InputGroup from '$lib/components/ui/input-group/index.js';
	import { SearchIcon, PackageIcon } from '@lucide/svelte';

	type Props = {
		products: Product[];
		loading: boolean;
		cartItems: CartItem[];
		onselect: (product: Product) => void;
	};

	let { products, loading, cartItems, onselect }: Props = $props();

	let cartMap = $derived(
		cartItems.reduce((map, item) => {
			if (item.productId) map.set(item.productId, item.qty);
			return map;
		}, new Map<string, number>())
	);

	let search = $state('');
	let filtered = $derived(
		search.trim()
			? products.filter((p) => p.name.toLowerCase().includes(search.trim().toLowerCase()))
			: products
	);
	let displayItems = $derived(filtered);
</script>

{#if loading}
	<div class="grid grid-cols-2 gap-3">
		<div class="h-24 animate-pulse rounded-xl bg-muted"></div>
		<div class="h-24 animate-pulse rounded-xl bg-muted"></div>
		<div class="h-24 animate-pulse rounded-xl bg-muted"></div>
		<div class="h-24 animate-pulse rounded-xl bg-muted"></div>
	</div>
{:else if products.length === 0}
	<div class="flex flex-col items-center justify-center gap-2 py-8 text-muted-foreground">
		<PackageIcon size={40} />
		<p class="text-body-sm">Belum ada produk</p>
	</div>
{:else}
	<label for="pos-search" class="sr-only">Cari produk</label>
	<InputGroup.Root class="mb-3 bg-background">
		<InputGroup.Input
			id="pos-search"
			type="search"
			placeholder="Cari produk..."
			bind:value={search}
		/>
		<InputGroup.Addon>
			<SearchIcon />
		</InputGroup.Addon>
	</InputGroup.Root>

	{#if filtered.length === 0}
		<div class="flex flex-col items-center justify-center gap-2 py-8 text-muted-foreground">
			<PackageIcon size={40} />
			<p class="text-body-sm">
				Produk tidak ditemukan. Gunakan input manual untuk menambahkan item custom.
			</p>
		</div>
	{:else}
		<div class="grid grid-cols-2 gap-3">
			{#each displayItems as product (product.id)}
				{@const qty = cartMap.get(product.id) ?? 0}
				<button
					type="button"
					onclick={() => onselect(product)}
					aria-pressed={qty > 0}
					class="relative flex min-h-18 cursor-pointer flex-col items-start justify-center gap-1 rounded-xl bg-card p-4 text-left shadow-sm transition-all hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.97] {qty >
					0
						? 'border-2 border-primary'
						: 'border border-transparent'}"
				>
					{#if qty > 0}
						<span
							aria-label="{qty} item dipilih"
							class="absolute top-1 right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-xs font-bold text-primary-foreground"
						>
							{qty}
						</span>
					{/if}
					<span class="line-clamp-2 text-body-md font-semibold">{product.name}</span>
					<span class="text-price-display text-primary">{formatCurrency(product.price)}</span>
				</button>
			{/each}
		</div>
	{/if}
{/if}
