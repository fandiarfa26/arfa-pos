import { redirect } from '@sveltejs/kit';

export function load({ locals }) {
	if (locals.session) {
		throw redirect(303, '/dashboard');
	}

	throw redirect(303, '/login');
}
