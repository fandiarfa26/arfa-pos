export interface Expense {
	id: string;
	description: string;
	category?: string;
	amount: number;
	occurred_at: string;
}
