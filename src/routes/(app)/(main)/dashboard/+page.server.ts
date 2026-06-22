import { error } from '@sveltejs/kit';
import type { DailyRevenue, DashboardSummary } from '$features/dashboard/types/dashboard';
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

	const sevenDaysAgo = new Date(today);
	sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

	const { data: weekData, error: weekError } = await locals.supabase
		.from('transactions')
		.select('total, created_at')
		.gte('created_at', sevenDaysAgo.toISOString())
		.eq('user_id', userId);

	if (weekError) {
		throw error(500, 'Gagal memuat data dashboard. Silahkan coba lagi.');
	}

	const revenueByDate = new Map<string, number>();
	for (const tx of weekData ?? []) {
		const dateStr = tx.created_at.slice(0, 10);
		revenueByDate.set(dateStr, (revenueByDate.get(dateStr) ?? 0) + tx.total);
	}

	const weeklyRevenue: DailyRevenue[] = [];
	let weeklyTotal = 0;
	for (let i = 0; i <= 6; i++) {
		const date = new Date(today);
		date.setDate(date.getDate() - i);
		const dateStr = date.toISOString().slice(0, 10);
		const revenue = revenueByDate.get(dateStr) ?? 0;
		weeklyRevenue.push({ date: dateStr, revenue });
		weeklyTotal += revenue;
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
		recentTransactions,
		weeklyRevenue,
		weeklyTotal
	};

	return { summary };
}
