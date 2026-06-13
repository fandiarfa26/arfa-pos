import z from 'zod';

export const checkoutItemSchema = z.object({
	productId: z.string().optional(),
	name: z.string().min(1, 'Nama item tidak boleh kosong'),
	price: z.number().min(0, 'Harga tidak valid'),
	qty: z.number().int().min(1, 'Kuantitas minimal 1')
});

export const checkoutSchema = z
	.object({
		items: z.array(checkoutItemSchema).min(1, 'Tidak ada item untuk checkout'),
		amountPaid: z.coerce.number().min(0, 'Jumlah bayar tidak valid')
	})
	.refine((data) => {
		const total = data.items.reduce((sum, i) => sum + i.price * i.qty, 0);
		return data.amountPaid >= total;
	}, 'Jumlah bayar kurang');
