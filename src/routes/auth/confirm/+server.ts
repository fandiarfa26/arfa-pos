import type { EmailOtpType } from '@supabase/supabase-js';
import { redirect } from '@sveltejs/kit';

export const GET = async ({ url, locals: { supabase } }: { url: URL; locals: App.Locals }) => {
	const token_hash = url.searchParams.get('token_hash') as string;
	const type = url.searchParams.get('type') as EmailOtpType | null;
	const next = url.searchParams.get('next') || '/dashboard';

	const redirectTo = new URL(url);
	redirectTo.pathname = next;
	redirectTo.searchParams.delete('token_hash');
	redirectTo.searchParams.delete('type');

	if (token_hash && type) {
		let verifyFailed = false;
		try {
			const { error } = await supabase.auth.verifyOtp({ token_hash, type });
			verifyFailed = Boolean(error);
		} catch {
			verifyFailed = true;
		}

		if (!verifyFailed) {
			redirectTo.searchParams.delete('next');
			redirect(303, redirectTo);
		}
	}

	redirect(303, '/login?verify=failed');
};
