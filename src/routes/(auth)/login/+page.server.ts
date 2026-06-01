import { fail, redirect } from '@sveltejs/kit';

export const actions = {
	login: async ({ request, locals }) => {
		const formData = await request.formData();

		const email = formData.get('email')?.toString() ?? '';
		const password = formData.get('password')?.toString() ?? '';

		const { error } = await locals.supabase.auth.signInWithPassword({ email, password });

		if (error) {
			return fail(400, {
				message: 'Email atau password salah!'
			});
		}

		throw redirect(303, '/dashboard');
	}
};
