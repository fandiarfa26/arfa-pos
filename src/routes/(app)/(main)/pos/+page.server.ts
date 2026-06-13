import type { Product } from '$features/products/types/product';

export async function load({ locals }) {
	const query = locals.supabase
		.from('products')
		.select('*')
		.order('created_at', { ascending: false });

	const { data, error } = await query;

	if (error) {
		throw error;
	}

	const products: Product[] = (data ?? []).map((product) => ({
		id: product.id,
		name: product.name,
		category: product.category,
		price: product.price,
		stock: product.stock,
		sku: product.sku
	}));

	return { products };
}
