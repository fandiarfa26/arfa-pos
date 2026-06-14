<script lang="ts">
	import { page } from '$app/state';
	import ProductInfo from '$features/products/components/product-info.svelte';
	import PageHeader from '../../../../shared/components/page-header.svelte';
</script>

<div class="space-y-6">
	<PageHeader title="Kesalahan Produk" />
	<ProductInfo variant="error" message={page.error?.message} />
</div>
