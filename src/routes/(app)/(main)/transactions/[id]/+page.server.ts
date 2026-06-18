import { error } from '@sveltejs/kit';
import type { Transaction, TransactionItem } from '$features/transactions/types/transaction';

export async function load({ locals, params }) {
	const { data, error: txError } = await locals.supabase
		.from('transactions')
		.select('*, transaction_items(*)')
		.eq('id', params.id)
		.single();

	if (txError || !data) {
		error(404, 'Transaksi tidak ditemukan');
	}

	const transaction: Transaction = {
		id: data.id,
		total: data.total,
		amount_paid: data.amount_paid,
		created_at: data.created_at
	};

	const items: TransactionItem[] = (data.transaction_items ?? []).map(
		(item: Record<string, unknown>) => ({
			id: item.id as string,
			transaction_id: item.transaction_id as string,
			product_id: (item.product_id as string | null) ?? null,
			name: item.name as string,
			price: item.price as number,
			qty: item.qty as number,
			subtotal: item.subtotal as number
		})
	);

	return { transaction, items };
}
