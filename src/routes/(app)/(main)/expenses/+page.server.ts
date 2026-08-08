import { fail } from '@sveltejs/kit';
import { deleteExpenseService } from '$features/expenses/services/delete-expense-service';
import type { Expense } from '$features/expenses/types/expense';

export async function load({ locals }) {
	const userId = locals.user?.id;

	const { data, error } = await locals.supabase
		.from('expenses')
		.select('id, description, category, amount, occurred_at')
		.eq('user_id', userId)
		.order('occurred_at', { ascending: false });

	if (error) {
		throw error;
	}

	const expenses: Expense[] = (data ?? []).map((expense) => ({
		id: expense.id,
		description: expense.description,
		category: expense.category,
		amount: expense.amount,
		occurred_at: expense.occurred_at
	}));

	return { expenses };
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
