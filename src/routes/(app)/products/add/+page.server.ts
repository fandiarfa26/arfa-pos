import { fail } from '@sveltejs/kit';
import { productSchema } from '$features/products/schemas/product-schema';
import z from 'zod';
import { generateSku } from '$lib/utils/generate-sku';

export const actions = {
	createProduct: async ({ request, locals }) => {
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
					category: tree.properties?.category?.errors?.[0],
					price: tree.properties?.price?.errors?.[0],
					stock: tree.properties?.stock?.errors?.[0]
				}
			});
		}

		const { name, category, price, stock } = result.data;

		const sku = generateSku(name);

		const { error } = await locals.supabase.from('products').insert({
			user_id: locals.user?.id,
			name,
			category,
			price,
			stock,
			sku
		});

		if (error) {
			return fail(500, {
				message: 'Gagal menyimpan produk',
				detail: error.message
			});
		}

		return {
			message: 'Produk berhasil ditambahkan'
		};
	}
};
