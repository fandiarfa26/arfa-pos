import type { Transaction } from '$features/transactions/types/transaction';

export interface DailyRevenue {
	date: string;
	revenue: number;
}

export interface DashboardSummary {
	todayRevenue: number;
	todayCount: number;
	recentTransactions: Transaction[];
	weeklyRevenue: DailyRevenue[];
	weeklyTotal: number;
}
