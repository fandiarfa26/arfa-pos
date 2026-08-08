import { fail } from '@sveltejs/kit';
import { deleteExpenseService } from '$features/expenses/services/delete-expense-service';
import type { Expense } from '$features/expenses/types/expense';
import type { Transaction } from '$features/transactions/types/transaction';

export async function load({ locals }) {
	const userId = locals.user?.id;

	const [transactionsResult, expensesResult] = await Promise.all([
		locals.supabase
			.from('transactions')
			.select('id, total, amount_paid, created_at')
			.eq('user_id', userId)
			.order('created_at', { ascending: false }),
		locals.supabase
			.from('expenses')
			.select('id, description, category, amount, occurred_at')
			.eq('user_id', userId)
			.order('occurred_at', { ascending: false })
	]);

	if (transactionsResult.error) {
		throw transactionsResult.error;
	}

	if (expensesResult.error) {
		throw expensesResult.error;
	}

	const transactions: Transaction[] = (transactionsResult.data ?? []).map((tx) => ({
		id: tx.id,
		total: tx.total,
		amount_paid: tx.amount_paid,
		created_at: tx.created_at
	}));

	const expenses: Expense[] = (expensesResult.data ?? []).map((expense) => ({
		id: expense.id,
		description: expense.description,
		category: expense.category,
		amount: expense.amount,
		occurred_at: expense.occurred_at
	}));

	return { transactions, expenses };
}

export const actions = {
	deleteExpense: async ({ request, locals }) => {
		const formData = await request.formData();
		const expenseId = formData.get('expenseId') as string;

		const { error } = await deleteExpenseService(locals.supabase, expenseId, locals.user?.id);

		if (error) {
			return fail(500, {
				message: 'Gagal menghapus pengeluaran',
				detail: error.message
			});
		}

		return {
			message: 'Pengeluaran berhasil dihapus'
		};
	}
};
