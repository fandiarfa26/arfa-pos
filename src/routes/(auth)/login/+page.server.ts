import { fail, redirect } from '@sveltejs/kit';
import { loginSchema } from '$features/auth/schemas/auth-schema';

export const actions = {
	login: async ({ request, locals }) => {
		const formData = await request.formData();

		const parsed = loginSchema.safeParse({
			email: formData.get('email'),
			password: formData.get('password')
		});

		if (!parsed.success) {
			const message = parsed.error.issues[0]?.message ?? 'Data tidak valid';
			return fail(400, { message });
		}

		const { email, password } = parsed.data;

		const { error } = await locals.supabase.auth.signInWithPassword({ email, password });

		if (error) {
			return fail(400, {
				message: 'Email atau password salah!'
			});
		}

		throw redirect(303, '/dashboard');
	}
};
