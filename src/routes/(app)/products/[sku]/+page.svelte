<script lang="ts">
	import ProductForm from '$features/products/components/product-form.svelte';
	import type { ProductFormState } from '$features/products/types/product-form-state';
	import PageHeader from '$shared/components/page-header.svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	const formState: ProductFormState = $derived({
		message: form?.message,
		fieldErrors: form?.fieldErrors,
		values: {
			id: data.product.id,
			name: data.product.name,
			category: data.product.category,
			price: data.product.price,
			stock: data.product.stock
		}
	});
</script>

<div class="space-y-6">
	<PageHeader title="Ubah Produk" />
	<ProductForm action="?/updateProduct" form={formState} />
</div>
