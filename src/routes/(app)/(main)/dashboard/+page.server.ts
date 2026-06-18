import { error } from '@sveltejs/kit';
import type { DashboardSummary } from '$features/dashboard/types/dashboard';
import type { Transaction } from '$features/transactions/types/transaction';

export async function load({ locals }) {
	const today = new Date();
	today.setHours(0, 0, 0, 0);
	const userId = locals.user?.id;

	const { data: todayData, error: todayError } = await locals.supabase
		.from('transactions')
		.select('total')
		.gte('created_at', today.toISOString())
		.eq('user_id', userId);

	if (todayError) {
		throw error(500, 'Gagal memuat data dashboard. Silahkan coba lagi.');
	}

	const { data: recentData, error: recentError } = await locals.supabase
		.from('transactions')
		.select('id, total, amount_paid, created_at')
		.eq('user_id', userId)
		.gte('created_at', today.toISOString())
		.order('created_at', { ascending: false })
		.limit(5);

	if (recentError) {
		throw error(500, 'Gagal memuat data dashboard. Silahkan coba lagi.');
	}

	const recentTransactions: Transaction[] = (recentData ?? []).map((tx) => ({
		id: tx.id,
		total: tx.total,
		amount_paid: tx.amount_paid,
		created_at: tx.created_at
	}));

	const summary: DashboardSummary = {
		todayRevenue: (todayData ?? []).reduce((sum, tx) => sum + tx.total, 0),
		todayCount: todayData?.length ?? 0,
		recentTransactions
	};

	return { summary };
}
