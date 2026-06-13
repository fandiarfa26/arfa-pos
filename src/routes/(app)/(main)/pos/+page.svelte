<script lang="ts">
	import type { PageData } from './$types';
	import { createCartState } from '$features/pos/lib/cart-state.svelte';
	import ProductGrid from '$features/pos/components/product-grid.svelte';
	import ManualItemForm from '$features/pos/components/manual-item-form.svelte';
	import CartList from '$features/pos/components/cart-list.svelte';
	import PageHeader from '../../../../shared/components/page-header.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Spinner } from '$lib/components/ui/spinner';
	import NumericKeypad from '$features/pos/components/numeric-keypad.svelte';
	import { formatCurrency } from '$lib/utils/currency';
	import { ShoppingCartIcon } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';
	import { enhance } from '$app/forms';
	import { handleFormToast } from '$lib/utils/handle-form-toast';

	type Props = {
		data: PageData;
	};

	let { data }: Props = $props();

	let cart = createCartState();
	let loading = $state(false);
	let view = $state<'select' | 'cart' | 'payment'>('select');

	let total = $derived(cart.items.reduce((sum, i) => sum + i.price * i.qty, 0));
	let itemCount = $derived(cart.items.reduce((sum, i) => sum + i.qty, 0));

	let amountPaid = $state(0);
	let isSubmitting = $state(false);
	let change = $derived(amountPaid - total);

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

	function goToPayment() {
		view = 'payment';
		amountPaid = 0;
	}
</script>

<svelte:head>
	<title>POS - ArfaPOS</title>
</svelte:head>

<!-- ===== SELECT VIEW ===== -->
{#if view === 'select'}
	<div class="flex min-h-[calc(100dvh-4rem)] flex-col">
		<div class="flex-1 overflow-y-auto px-4 pt-4 pb-44">
			<div class="space-y-6">
				<h2 class="text-headline-md">Pilih Produk</h2>
				<ProductGrid
					products={data.products}
					{loading}
					cartItems={cart.items}
					onselect={handleSelectProduct}
				/>
			</div>
		</div>

		<!-- Fixed bottom bar -->
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
	</div>

	<!-- ===== CART VIEW ===== -->
{:else if view === 'cart'}
	<div class="flex min-h-[calc(100dvh-4rem)] flex-col">
		<div class="flex-1 overflow-y-auto px-4 pt-4 pb-44">
			<PageHeader title="Cart" onclick={() => (view = 'select')} class="mb-4" />
			<CartList items={cart.items} onupdateqty={cart.updateQty} onremove={cart.removeItem} />
		</div>

		<!-- Fixed bottom bar -->
		<div class="fixed right-0 bottom-16 left-0 z-10 border-t bg-background">
			<div class="mx-auto w-full max-w-screen-sm space-y-3 px-4 py-4">
				<div class="flex items-center justify-between">
					<p class="text-body-sm text-muted-foreground">{itemCount} item</p>
					<p class="text-price-display text-primary">{formatCurrency(total)}</p>
				</div>
				<Button size="lg" onclick={goToPayment} class="w-full">Lanjut ke Pembayaran</Button>
			</div>
		</div>
	</div>

	<!-- ===== PAYMENT VIEW ===== -->
{:else}
	<form
		method="POST"
		action="?/checkout"
		use:enhance={() => {
			isSubmitting = true;
			return async ({ result, update }) => {
				await update();
				handleFormToast(result);
				isSubmitting = false;
				if (result.type === 'success') {
					cart.clearCart();
					view = 'select';
				}
			};
		}}
	>
		<input type="hidden" name="items" value={JSON.stringify(cart.items)} />
		<input type="hidden" name="amountPaid" value={amountPaid} />

		<div class="flex min-h-[calc(100dvh-4rem)] flex-col">
			<div class="flex-1 overflow-y-auto px-4 pt-4 pb-44">
				<PageHeader title="Pembayaran" onclick={() => (view = 'cart')} class="mb-4" />

				<div class="space-y-6">
					<!-- Total Display -->
					<div class="rounded-xl bg-primary/5 p-6 text-center">
						<p class="text-body-sm text-muted-foreground">Total Belanja</p>
						<p class="mt-1 text-price-display text-primary">{formatCurrency(total)}</p>
					</div>

					<!-- Amount Paid Display + Keypad -->
					<div class="space-y-4">
						<div class="text-center">
							<p class="text-label-caps text-muted-foreground mb-1">JUMLAH BAYAR</p>
							<p class="text-price-display text-foreground">
								{amountPaid > 0 ? formatCurrency(amountPaid) : 'Rp 0'}
							</p>
						</div>
						<NumericKeypad bind:value={amountPaid} />
					</div>
				</div>
			</div>

			<!-- Fixed bottom bar -->
			<div class="fixed right-0 bottom-16 left-0 z-10 border-t bg-background">
				<div class="mx-auto w-full max-w-screen-sm space-y-3 px-4 py-4">
					<!-- Change / Shortfall Display -->
					{#if amountPaid >= total && total > 0}
						<div class="rounded-lg bg-emerald-50 p-3 text-center">
							<p class="text-xs text-emerald-600">Kembalian</p>
							<p class="text-xl font-bold text-emerald-700">{formatCurrency(change)}</p>
						</div>
					{:else if amountPaid > 0 && amountPaid < total}
						<div class="rounded-lg bg-amber-50 p-3 text-center">
							<p class="text-xs text-amber-600">Kurang</p>
							<p class="text-xl font-bold text-amber-700">
								{formatCurrency(total - amountPaid)}
							</p>
						</div>
					{/if}

					<Button
						type="submit"
						size="lg"
						class="w-full"
						disabled={isSubmitting || amountPaid < total || total === 0}
					>
						{#if isSubmitting}
							<Spinner /> Memproses...
						{:else}
							Bayar {formatCurrency(total)}
						{/if}
					</Button>
				</div>
			</div>
		</div>
	</form>
{/if}
