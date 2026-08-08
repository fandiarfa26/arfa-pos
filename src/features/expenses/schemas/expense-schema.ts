import z from 'zod';

export const expenseSchema = z.object({
	description: z.string().trim().min(1, 'Deskripsi tidak boleh kosong'),
	category: z.string().trim().nullable(),
	amount: z.coerce.number().min(500, 'Nominal pengeluaran tidak boleh kurang dari Rp 500'),
	date: z
		.string()
		.min(1, 'Tanggal wajib diisi')
		.refine((val) => /^\d{4}-\d{2}-\d{2}$/.test(val), {
			message: 'Format tanggal tidak valid',
			path: ['date']
		})
});
