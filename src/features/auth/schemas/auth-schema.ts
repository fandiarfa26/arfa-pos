import z from 'zod';

export const loginSchema = z.object({
	email: z.string().email('Format email tidak valid'),
	password: z.string().min(1, 'Password wajib diisi')
});

export const registerSchema = z.object({
	name: z.string().trim().min(1, 'Nama toko tidak boleh kosong'),
	email: z.string().email('Format email tidak valid'),
	password: z.string().min(8, 'Password minimal 8 karakter')
});
