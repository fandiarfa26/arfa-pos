<script lang="ts">
	import ProductList from '$features/products/components/product-list.svelte';

	const { data } = $props();
</script>

<svelte:head>
	<title>Products - ArfaPOS</title>
</svelte:head>

<ProductList products={data.products} search={data.search} />
