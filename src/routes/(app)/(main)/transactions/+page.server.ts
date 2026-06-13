import type { Transaction } from '$features/transactions/types/transaction';

export async function load({ locals }) {
	const { data, error } = await locals.supabase
		.from('transactions')
		.select('id, total, created_at')
		.order('created_at', { ascending: false });

	if (error) {
		throw error;
	}

	const transactions: Transaction[] = (data ?? []).map((tx) => ({
		id: tx.id,
		total: tx.total,
		created_at: tx.created_at
	}));

	return { transactions };
}
