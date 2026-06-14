import { fail } from '@sveltejs/kit';
import type { Product } from '$features/products/types/product';
import { deleteProductService } from '$features/products/services/delete-product-service';

export async function load({ locals, url }) {
	const search = url.searchParams.get('search')?.trim() ?? '';
	const userId = locals.user?.id;

	let query = locals.supabase
		.from('products')
		.select('*')
		.eq('user_id', userId)
		.order('created_at', { ascending: false });

	if (search) {
		query = query.or(`name.ilike.%${search}%`);
	}

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

	return {
		search,
		products
	};
}

export const actions = {
	deleteProduct: async ({ request, locals }) => {
		const formData = await request.formData();
		const productId = formData.get('productId') as string;

		const { error } = await deleteProductService(locals.supabase, productId, locals.user?.id);

		if (error) {
			return fail(500, {
				message: 'Gagal menghapus produk',
				detail: error.message
			});
		}

		return {
			message: 'Produk berhasil dihapus'
		};
	}
};
