<script lang="ts">
	import House from '@lucide/svelte/icons/house';
	import Package from '@lucide/svelte/icons/package';
	import ShoppingCart from '@lucide/svelte/icons/shopping-cart';
	import Receipt from '@lucide/svelte/icons/receipt';

	import { page } from '$app/state';
	import { resolve } from '$app/paths';
</script>

<nav class="fixed right-0 bottom-0 left-0 z-20 border-t bg-background pb-safe">
	<div class="flex items-center justify-around px-4">
		<a
			href={resolve('/dashboard')}
			class="flex flex-col items-center gap-1 px-3 py-3 text-xs"
			class:text-primary={page.url.pathname.startsWith('/dashboard')}
			aria-current={page.url.pathname.startsWith('/dashboard') ? 'page' : undefined}
		>
			<div
				class="rounded-lg px-4 py-1 transition-colors {page.url.pathname.startsWith('/dashboard')
					? 'bg-primary/10'
					: ''}"
			>
				<House size={20} aria-hidden="true" />
			</div>
			<span>Dashboard</span>
		</a>

		<a
			href={resolve('/pos')}
			class="flex flex-col items-center gap-1 px-3 py-3 text-xs"
			class:text-primary={page.url.pathname.startsWith('/pos')}
			aria-current={page.url.pathname.startsWith('/pos') ? 'page' : undefined}
		>
			<div
				class="rounded-lg px-4 py-1 transition-colors {page.url.pathname.startsWith('/pos')
					? 'bg-primary/10'
					: ''}"
			>
				<ShoppingCart size={20} aria-hidden="true" />
			</div>
			<span>POS</span>
		</a>

		<a
			href={resolve('/products')}
			class="flex flex-col items-center gap-1 px-3 py-3 text-xs"
			class:text-primary={page.url.pathname.startsWith('/products')}
			aria-current={page.url.pathname.startsWith('/products') ? 'page' : undefined}
		>
			<div
				class="rounded-lg px-4 py-1 transition-colors {page.url.pathname.startsWith('/products')
					? 'bg-primary/10'
					: ''}"
			>
				<Package size={20} aria-hidden="true" />
			</div>
			<span>Produk</span>
		</a>

		<a
			href={resolve('/transactions')}
			class="flex flex-col items-center gap-1 px-3 py-3 text-xs"
			class:text-primary={page.url.pathname.startsWith('/transactions')}
			aria-current={page.url.pathname.startsWith('/transactions') ? 'page' : undefined}
		>
			<div
				class="rounded-lg px-4 py-1 transition-colors {page.url.pathname.startsWith('/transactions')
					? 'bg-primary/10'
					: ''}"
			>
				<Receipt size={20} aria-hidden="true" />
			</div>
			<span>Riwayat</span>
		</a>
	</div>
</nav>
