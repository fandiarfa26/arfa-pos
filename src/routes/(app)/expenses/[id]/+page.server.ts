import z from 'zod';
import { fail, error } from '@sveltejs/kit';
import { expenseSchema } from '$features/expenses/schemas/expense-schema';
import type { Expense } from '$features/expenses/types/expense';

export async function load({ locals, params }) {
	const userId = locals.user?.id;

	const { data, error: expenseError } = await locals.supabase
		.from('expenses')
		.select('id, description, category, amount, occurred_at')
		.eq('id', params.id)
		.eq('user_id', userId)
		.single();

	if (expenseError || !data) {
		error(404, 'Pengeluaran tidak ditemukan');
	}

	const expense: Expense = {
		id: data.id,
		description: data.description,
		category: data.category,
		amount: data.amount,
		occurred_at: data.occurred_at
	};

	return { expense };
}

export const actions = {
	updateExpense: async ({ request, locals, params }) => {
		const formData = await request.formData();

		const categoryRaw = formData.get('category');
		const category =
			typeof categoryRaw === 'string' && categoryRaw.trim() ? categoryRaw.trim() : null;

		const result = expenseSchema.safeParse({
			description: formData.get('description'),
			category,
			amount: formData.get('amount'),
			date: formData.get('date')
		});

		if (!result.success) {
			const tree = z.treeifyError(result.error);
			return fail(400, {
				message: 'Periksa kembali data yang Anda masukkan',
				fieldErrors: {
					description: tree.properties?.description?.errors?.[0],
					category: tree.properties?.category?.errors?.[0],
					amount: tree.properties?.amount?.errors?.[0],
					date: tree.properties?.date?.errors?.[0]
				}
			});
		}

		const { description, amount, date } = result.data;
		const occurred_at = new Date(`${date}T00:00:00`).toISOString();
		const userId = locals.user?.id;

		const { error } = await locals.supabase
			.from('expenses')
			.update({
				description,
				category: result.data.category,
				amount,
				occurred_at
			})
			.eq('id', params.id)
			.eq('user_id', userId);

		if (error) {
			return fail(500, {
				message: 'Gagal menyimpan pengeluaran',
				detail: error.message
			});
		}

		return {
			message: 'Pengeluaran berhasil diperbarui'
		};
	}
};
