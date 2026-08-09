import type { Transaction } from '$features/transactions/types/transaction';

export interface DailyRevenue {
	date: string;
	net: number;
}

export interface DashboardSummary {
	todayRevenue: number;
	todayExpenses: number;
	netRevenue: number;
	todayCount: number;
	recentTransactions: Transaction[];
	weeklyRevenue: DailyRevenue[];
	weeklyTotal: number;
}
