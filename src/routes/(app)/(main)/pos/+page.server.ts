import { fail } from '@sveltejs/kit';
import type { Product } from '$features/products/types/product';
import { checkoutSchema } from '$features/pos/schemas/checkout-schema';

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

export const actions = {
	checkout: async ({ request, locals }) => {
		const formData = await request.formData();

		let items: unknown;
		try {
			items = JSON.parse(formData.get('items') as string);
		} catch {
			return fail(400, { message: 'Data item tidak valid' });
		}

		const amountPaid = formData.get('amountPaid');

		const parsed = checkoutSchema.safeParse({ items, amountPaid });

		if (!parsed.success) {
			const message = parsed.error.issues[0]?.message ?? 'Data transaksi tidak valid';
			return fail(400, { message });
		}

		const { items: validatedItems, amountPaid: validatedAmount } = parsed.data;

		const total = validatedItems.reduce((sum, i) => sum + i.price * i.qty, 0);

		const { data: transaction, error: txError } = await locals.supabase
			.from('transactions')
			.insert({ total, user_id: locals.user?.id })
			.select()
			.single();

		if (txError) {
			return fail(500, {
				message: 'Gagal menyimpan transaksi',
				detail: txError.message
			});
		}

		const txItems = validatedItems.map((i) => ({
			transaction_id: transaction.id,
			product_id: i.productId ?? null,
			name: i.name,
			price: i.price,
			qty: i.qty,
			subtotal: i.price * i.qty
		}));

		const { error: itemsError } = await locals.supabase
			.from('transaction_items')
			.insert(txItems);

		if (itemsError) {
			return fail(500, {
				message: 'Gagal menyimpan item transaksi',
				detail: itemsError.message
			});
		}

		return {
			message: 'Transaksi berhasil',
			transactionId: transaction.id
		};
	}
};
