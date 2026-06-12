<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { formatCurrency } from '$lib/utils/currency';
	import { PencilIcon, TrashIcon } from '@lucide/svelte';
	import type { Product } from '../types/product';
	import { resolve } from '$app/paths';
	import ProductDeleteDialog from './product-delete-dialog.svelte';

	type Props = {
		product: Product;
	};

	const { product }: Props = $props();
</script>

<Card.Root>
	<Card.Content class="space-y-2">
		<div class="flex flex-col items-start justify-between gap-2 md:flex-row md:items-center">
			<!-- name -->
			<span class="text-lg font-semibold">{product.name}</span>
			<!-- price -->
			<span class="text-lg font-medium text-primary">{formatCurrency(product.price)}</span>
		</div>
		{#if product.category || product.stock}
			<div class="flex items-center gap-2">
				{#if product.category}
					<div><span class="text-gray-600">Kategori: </span> {product.category}</div>
				{/if}
				{#if product.stock}
					<div><span class="text-gray-600">Stok: </span> {product.stock}</div>
				{/if}
			</div>
		{/if}
	</Card.Content>
	<Card.Footer>
		<div class="flex w-full items-center justify-end gap-2 border-t pt-2">
			<a href={resolve(`/products/${product.sku}`)}>
				<Button variant="ghost" size="sm" class="text-primary">
					<PencilIcon /> Ubah
				</Button>
			</a>
			<ProductDeleteDialog productId={product.id}>
				<Button variant="ghost" size="sm" class="text-semantic-danger">
					<TrashIcon /> Hapus
				</Button>
			</ProductDeleteDialog>
		</div>
	</Card.Footer>
</Card.Root>
