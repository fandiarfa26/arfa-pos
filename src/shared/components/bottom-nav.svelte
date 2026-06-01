<script lang="ts">
	import House from '@lucide/svelte/icons/house';
	import Package from '@lucide/svelte/icons/package';
	import ShoppingCart from '@lucide/svelte/icons/shopping-cart';
	import Receipt from '@lucide/svelte/icons/receipt';

	import { page } from '$app/state';
	import { resolve } from '$app/paths';

	const items = [
		{
			href: resolve('/dashboard'),
			label: 'Dashboard',
			icon: House
		},
		{
			href: resolve('/products'),
			label: 'Produk',
			icon: Package
		},
		{
			href: resolve('/pos'),
			label: 'POS',
			icon: ShoppingCart
		},
		{
			href: resolve('/transactions'),
			label: 'Riwayat',
			icon: Receipt
		}
	] as const;
</script>

<nav class="fixed right-0 bottom-0 left-0 border-t bg-background">
	<div class="grid grid-cols-4">
		{#each items as item, i (i)}
			<a
				href={item.href}
				class="flex flex-col items-center gap-1 py-3 text-xs"
				class:text-primary={page.url.pathname.startsWith(item.href)}
			>
				<item.icon size={20} />
				<span>{item.label}</span>
			</a>
		{/each}
	</div>
</nav>
