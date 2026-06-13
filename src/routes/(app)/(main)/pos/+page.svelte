<script lang="ts">
	import type { PageData } from './$types';
	import { createCartState } from '$features/pos/lib/cart-state.svelte';
	import ProductGrid from '$features/pos/components/product-grid.svelte';
	import ManualItemForm from '$features/pos/components/manual-item-form.svelte';
	import CartList from '$features/pos/components/cart-list.svelte';
	import PageHeader from '../../../../shared/components/page-header.svelte';
	import { Button } from '$lib/components/ui/button';
	import { formatCurrency } from '$lib/utils/currency';
	import { ShoppingCartIcon } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';

	type Props = {
		data: PageData;
	};

	let { data }: Props = $props();

	let cart = createCartState();
	let loading = $state(false);
	let view = $state<'select' | 'cart'>('select');

	let total = $derived(cart.items.reduce((sum, i) => sum + i.price * i.qty, 0));
	let itemCount = $derived(cart.items.reduce((sum, i) => sum + i.qty, 0));

	function handleSelectProduct(product: (typeof data.products)[number]) {
		cart.addProduct(product);
	}

	function openCart() {
		if (cart.items.length === 0) {
			toast.warning('Pilih produk atau tambah produk lain terlebih dahulu');
			return;
		}
		view = 'cart';
	}

	function handleCheckout() {
		if (cart.items.length === 0) {
			toast.warning('Cart kosong, tambah produk terlebih dahulu');
			view = 'select';
			return;
		}
	}
</script>

<svelte:head>
	<title>POS - ArfaPOS</title>
</svelte:head>

<!-- ===== SELECT VIEW ===== -->
{#if view === 'select'}
	<div class="space-y-6">
		<div class="space-y-3">
			<h2 class="text-headline-md">Pilih Produk</h2>
			<ProductGrid
				products={data.products}
				{loading}
				cartItems={cart.items}
				onselect={handleSelectProduct}
			/>
		</div>
	</div>

	<!-- Floating bottom bar -->
	<div class="fixed right-0 bottom-16 left-0 z-10 border-t bg-background">
		<div class="mx-auto w-full max-w-screen-sm space-y-2 px-4 py-3">
			<ManualItemForm onadd={cart.addManual} />
			<Button size="lg" onclick={openCart} class="w-full">
				<ShoppingCartIcon size={20} />
				Lihat Cart
				{#if cart.items.length > 0}
					<span
						class="flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 text-xs font-bold text-primary"
					>
						{itemCount}
					</span>
				{/if}
			</Button>
		</div>
	</div>

	<!-- ===== CART VIEW ===== -->
{:else}
	<div class="flex min-h-[calc(100dvh-8rem)] flex-col">
		<PageHeader title="Cart" onclick={() => (view = 'select')} class="mb-4" />

		<!-- Items -->
		<div class="flex-1 pb-40">
			<CartList items={cart.items} onupdateqty={cart.updateQty} onremove={cart.removeItem} />
		</div>
	</div>

	<!-- Fixed bottom bar -->
	<div class="fixed right-0 bottom-16 left-0 z-10 border-t bg-background">
		<div class="mx-auto w-full max-w-screen-sm space-y-3 px-4 py-4">
			<div class="flex items-center justify-between">
				<p class="text-body-sm text-muted-foreground">{itemCount} item</p>
				<p class="text-price-display text-primary">{formatCurrency(total)}</p>
			</div>
			<Button size="lg" onclick={handleCheckout} class="w-full">Lanjut ke Pembayaran</Button>
		</div>
	</div>
{/if}
