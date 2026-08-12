import { describe, expect, it, vi } from 'vitest';
import { actions } from './+page.server';

function makeRequest() {
	const formData = new FormData();
	formData.set('email', 'toko@berkah.com');
	formData.set('password', 'password123');
	return new Request('http://localhost:5173/login', { method: 'POST', body: formData });
}

function makeEvent(signInWithPassword: (p: unknown) => Promise<{ data: object; error: unknown }>) {
	return {
		request: makeRequest(),
		locals: {
			supabase: { auth: { signInWithPassword } },
			session: null,
			user: null
		}
	} as unknown as Parameters<typeof actions.login>[0];
}

describe('login action', () => {
	it('returns verification message when email is not confirmed', async () => {
		const signInWithPassword = vi.fn().mockResolvedValue({
			data: { session: null },
			error: { code: 'email_not_confirmed', message: 'Email not confirmed' }
		});

		const result = await actions.login(makeEvent(signInWithPassword));

		if ('status' in result) {
			expect(result.status).toBe(400);
			expect(result.data.message).toBe('Email belum diverifikasi. Silakan cek email Anda terlebih dahulu.');
		} else {
			expect.fail('expected an action failure');
		}
	});

	it('keeps the generic message for other failures', async () => {
		const signInWithPassword = vi.fn().mockResolvedValue({
			data: { session: null },
			error: { code: 'invalid_credentials', message: 'Invalid login credentials' }
		});

		const result = await actions.login(makeEvent(signInWithPassword));

		if ('status' in result) {
			expect(result.status).toBe(400);
			expect(result.data.message).toBe('Email atau password salah!');
		} else {
			expect.fail('expected an action failure');
		}
	});
});
