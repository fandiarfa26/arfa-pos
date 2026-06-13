import type { Transaction } from '$features/transactions/types/transaction';

export interface DashboardSummary {
	todayRevenue: number;
	todayCount: number;
	recentTransactions: Transaction[];
}
