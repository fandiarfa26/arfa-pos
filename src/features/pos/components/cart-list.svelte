<script lang="ts">
	import { ShoppingCartIcon } from '@lucide/svelte';
	import type { CartItem } from '../types/cart';
	import CartItemComponent from './cart-item.svelte';

	type Props = {
		items: CartItem[];
		onupdateqty: (id: string, delta: 1 | -1) => void;
		onremove: (id: string) => void;
	};

	let { items, onupdateqty, onremove }: Props = $props();
</script>

{#if items.length === 0}
	<div
		class="flex flex-col items-center justify-center gap-2 py-8 text-muted-foreground"
		aria-live="polite"
		aria-atomic="true"
	>
		<ShoppingCartIcon size={40} aria-hidden="true" />
		<p class="text-body-sm">Belum ada item</p>
	</div>
{:else}
	<div class="space-y-2">
		{#each items as item (item.id)}
			<CartItemComponent {item} {onupdateqty} {onremove} />
		{/each}
	</div>
{/if}
