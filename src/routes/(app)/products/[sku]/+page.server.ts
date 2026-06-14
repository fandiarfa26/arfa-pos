import z from 'zod';
import { productSchema } from '$features/products/schemas/product-schema';
import type { Product } from '$features/products/types/product';
import { fail, error } from '@sveltejs/kit';

export async function load({ locals, params }) {
	const userId = locals.user?.id;

	const { data, error: productError } = await locals.supabase
		.from('products')
		.select('*')
		.eq('sku', params.sku)
		.eq('user_id', userId)
		.single();

	if (productError || !data) {
		error(404, 'Produk tidak ditemukan');
	}

	const product: Product = {
		id: data.id,
		name: data.name,
		category: data.category,
		price: data.price,
		stock: data.stock,
		sku: data.sku
	};

	return {
		sku: params.sku,
		product
	};
}

export const actions = {
	updateProduct: async ({ request, locals, params }) => {
		const formData = await request.formData();

		const result = productSchema.safeParse({
			name: formData.get('name'),
			category: formData.get('category'),
			price: formData.get('price'),
			stock: formData.get('stock')
		});

		if (!result.success) {
			const tree = z.treeifyError(result.error);
			return fail(400, {
				message: 'Periksa kembali data yang Anda masukkan',
				fieldErrors: {
					name: tree.properties?.name?.errors?.[0],
					price: tree.properties?.price?.errors?.[0]
				}
			});
		}

		const nameValue = formData.get('name') as string;
		const priceValue = formData.get('price');
		const stockValue = formData.get('stock');

		const parsedPrice = Number(priceValue);
		const parsedStock = stockValue ? Number(stockValue) : null;

		const sku = params.sku;
		const userId = locals.user?.id;

		const { error } = await locals.supabase
			.from('products')
			.update({
				name: nameValue,
				category: formData.get('category'),
				price: parsedPrice,
				stock: parsedStock
			})
			.eq('sku', sku)
			.eq('user_id', userId);

		if (error) {
			return fail(500, {
				message: 'Gagal menyimpan produk',
				detail: error.message
			});
		}

		return {
			message: 'Produk berhasil diperbarui'
		};
	}
};
