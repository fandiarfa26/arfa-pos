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

<Card.Root size="sm" class="gap-0">
	<Card.Content class="space-y-1 pb-0">
		<div class="flex items-start justify-between gap-2">
			<span class="text-sm font-semibold">{product.name}</span>
			<span class="shrink-0 text-sm font-medium text-primary">{formatCurrency(product.price)}</span>
		</div>
		{#if product.category || (product.stock !== undefined && product.stock !== null)}
			<div class="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
				{#if product.category}
					<span>Kategori: {product.category}</span>
				{/if}
				{#if product.stock !== undefined && product.stock !== null}
					<span>Stok: {product.stock}</span>
				{/if}
			</div>
		{/if}
	</Card.Content>
	<Card.Footer class="pt-0">
		<div class="flex w-full items-center justify-end gap-1">
			<a href={resolve(`/products/${product.sku}`)} class="-m-2 inline-flex p-2">
				<Button variant="ghost" size="sm" class="px-2 text-primary">
					<PencilIcon class="size-3.5" /> Ubah
				</Button>
			</a>
			<ProductDeleteDialog productId={product.id}>
				<span class="-m-2 inline-flex p-2">
					<Button variant="ghost" size="sm" class="px-2 text-semantic-danger">
						<TrashIcon class="size-3.5" /> Hapus
					</Button>
				</span>
			</ProductDeleteDialog>
		</div>
	</Card.Footer>
</Card.Root>
