<script lang="ts">
	import PageHeader from '../../../../shared/components/page-header.svelte';
	import ProductList from '$features/products/components/product-list.svelte';

	const { data } = $props();
</script>

<svelte:head>
	<title>Products - ArfaPOS</title>
</svelte:head>

<PageHeader title="Produk" />

<ProductList products={data.products} search={data.search} />
