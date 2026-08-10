import type { Transaction } from '$features/transactions/types/transaction';

export interface DailyRevenue {
	date: string;
	net: number;
	revenue: number;
}

export interface DashboardSummary {
	todayRevenue: number;
	todayExpenses: number;
	totalRevenue: number;
	netRevenue: number;
	todayCount: number;
	recentTransactions: Transaction[];
	weeklyRevenue: DailyRevenue[];
	weeklyTotal: number;
}
