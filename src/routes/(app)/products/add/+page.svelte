<script lang="ts">
	import ProductForm from '../../../../features/products/components/product-form.svelte';
	import PageHeader from '../../../../shared/components/page-header.svelte';
	import type { PageProps } from './$types';

	let { form }: PageProps = $props();
</script>

<svelte:head>
	<title>Tambah Produk - ArfaPOS</title>
</svelte:head>

<div class="space-y-6">
	<PageHeader title="Tambah Produk" />
	<ProductForm action="?/createProduct" {form} />
</div>
