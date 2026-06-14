import type { Transaction } from '$features/transactions/types/transaction';

export async function load({ locals }) {
	const userId = locals.user?.id;

	const { data, error } = await locals.supabase
		.from('transactions')
		.select('id, total, amount_paid, created_at')
		.eq('user_id', userId)
		.order('created_at', { ascending: false });

	if (error) {
		throw error;
	}

	const transactions: Transaction[] = (data ?? []).map((tx) => ({
		id: tx.id,
		total: tx.total,
		amount_paid: tx.amount_paid,
		created_at: tx.created_at
	}));

	return { transactions };
}
