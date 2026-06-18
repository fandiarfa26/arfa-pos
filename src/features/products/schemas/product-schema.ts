import z from 'zod';

export const productSchema = z.object({
	name: z.string().trim().min(1, 'Nama produk tidak boleh kosong'),
	category: z
		.string()
		.trim()
		.nullable()
		.refine((val) => val === null || val.length > 0, {
			message: 'Minimal satu kategori harus dipilih',
			path: ['category']
		}),
	price: z.coerce.number().min(500, 'Harga produk tidak boleh kurang dari Rp 500'),
	stock: z.coerce
		.number()
		.nullable()
		.refine((val) => val === null || val >= 0, {
			message: 'Stok tidak boleh negatif',
			path: ['stock']
		})
});
