import { fail, redirect } from '@sveltejs/kit';
import { registerSchema } from '$features/auth/schemas/auth-schema';

export const actions = {
	register: async ({ request, locals }) => {
		const formData = await request.formData();

		const parsed = registerSchema.safeParse({
			name: formData.get('name'),
			email: formData.get('email'),
			password: formData.get('password')
		});

		if (!parsed.success) {
			const message = parsed.error.issues[0]?.message ?? 'Data tidak valid';
			return fail(400, { message });
		}

		const { name, email, password } = parsed.data;

		const { error } = await locals.supabase.auth.signUp({
			email,
			password,
			options: { data: { name } }
		});

		if (error) {
			return fail(400, {
				message: 'Gagal mendaftarkan akun. Silahkan coba lagi.'
			});
		}

		throw redirect(303, '/dashboard');
	}
};
