import type { DashboardSummary } from '$features/dashboard/types/dashboard';

export async function load({ locals }) {
	const today = new Date();
	today.setHours(0, 0, 0, 0);

	const { data, error } = await locals.supabase
		.from('transactions')
		.select('total')
		.gte('created_at', today.toISOString());

	if (error) {
		throw error;
	}

	const summary: DashboardSummary = {
		todayRevenue: (data ?? []).reduce((sum, tx) => sum + tx.total, 0),
		todayCount: data?.length ?? 0
	};

	return { summary };
}
