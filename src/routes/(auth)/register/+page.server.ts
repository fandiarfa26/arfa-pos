import { fail, redirect } from '@sveltejs/kit';

export const actions = {
	register: async ({ request, locals }) => {
		const formData = await request.formData();

		const name = formData.get('name')?.toString() ?? '';
		const email = formData.get('email')?.toString() ?? '';
		const password = formData.get('password')?.toString() ?? '';

		const { error } = await locals.supabase.auth.signUp({
			email,
			password,
			options: { data: { name } }
		});

		if (error) {
			return fail(400, {
				message: error.message
			});
		}

		throw redirect(303, '/dashboard');
	}
};
