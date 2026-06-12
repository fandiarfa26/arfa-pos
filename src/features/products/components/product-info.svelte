<script lang="ts">
	import { PackageIcon } from '@lucide/svelte';

	type Props = {
		variant: 'searchEmpty' | 'empty' | 'error';
		message?: string;
	};

	const { variant, message }: Props = $props();

	const text = $derived.by(() => {
		switch (variant) {
			case 'searchEmpty':
				return 'Produk yang kamu cari tidak ada.';
			case 'empty':
				return 'Belum ada produk, silahkan tambahkan produk baru.';
			case 'error':
				return 'Terjadi kesalahan saat memuat produk.';
			default:
				return '';
		}
	});
</script>

<div class="my-6 flex flex-col items-center justify-center gap-2 p-4">
	<PackageIcon size={48} class="text-primary" />
	<p class="text-sm text-primary">{message ?? text}</p>
</div>
