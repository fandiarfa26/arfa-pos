<script lang="ts">
	import House from '@lucide/svelte/icons/house';
	import Package from '@lucide/svelte/icons/package';
	import ShoppingCart from '@lucide/svelte/icons/shopping-cart';

	import { page } from '$app/state';
	import { resolve } from '$app/paths';
</script>

<nav class="fixed right-0 bottom-0 left-0 border-t bg-background">
	<div class="flex items-center justify-around px-4">
		<a
			href={resolve('/dashboard')}
			class="flex flex-col items-center gap-1 py-3 text-xs"
			class:text-primary={page.url.pathname.startsWith('/dashboard')}
		>
			<House size={20} />
			<span>Dashboard</span>
		</a>

		<a
			href={resolve('/pos')}
			class="flex flex-col items-center gap-1 py-3 text-xs"
			class:text-primary={page.url.pathname.startsWith('/pos')}
		>
			<ShoppingCart size={20} />
			<span>POS</span>
		</a>

		<a
			href={resolve('/products')}
			class="flex flex-col items-center gap-1 py-3 text-xs"
			class:text-primary={page.url.pathname.startsWith('/products')}
		>
			<Package size={20} />
			<span>Produk</span>
		</a>
	</div>
</nav>
