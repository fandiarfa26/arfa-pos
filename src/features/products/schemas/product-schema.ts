import z from 'zod';

export const productSchema = z.object({
	name: z.string().trim().min(1, 'Nama produk tidak boleh kosong'),
	category: z.string().trim().nullable(),
	price: z.coerce.number().min(500, 'Harga produk tidak boleh kurang dari Rp 500'),
	stock: z.coerce.number().nullable()
});
