import { fail } from '@sveltejs/kit';
import z from 'zod';
import { expenseSchema } from '$features/expenses/schemas/expense-schema';

export const actions = {
	createExpense: async ({ request, locals }) => {
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

		const { error } = await locals.supabase.from('expenses').insert({
			user_id: locals.user?.id,
			description,
			category: result.data.category,
			amount,
			occurred_at
		});

		if (error) {
			return fail(500, {
				message: 'Gagal menyimpan pengeluaran',
				detail: error.message
			});
		}

		return {
			message: 'Pengeluaran berhasil ditambahkan'
		};
	}
};
