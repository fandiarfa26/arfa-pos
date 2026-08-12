import { describe, expect, it, vi } from 'vitest';
import { actions } from './+page.server';

function makeRequest() {
	const formData = new FormData();
	formData.set('name', 'Toko Berkah');
	formData.set('email', 'toko@berkah.com');
	formData.set('password', 'password123');
	return new Request('http://localhost:5173/register', { method: 'POST', body: formData });
}

function makeEvent(signUp: (p: unknown) => Promise<{ data: object; error: unknown }>) {
	return {
		request: makeRequest(),
		locals: {
			supabase: { auth: { signUp } },
			session: null,
			user: null
		}
	} as unknown as Parameters<typeof actions.register>[0];
}

describe('register action', () => {
	it('returns success state (no auto-login) when no session is returned', async () => {
		const signUp = vi.fn().mockResolvedValue({ data: { session: null }, error: null });
		const result = await actions.register(makeEvent(signUp));

		expect(result).toEqual({ success: true });
		expect(signUp).toHaveBeenCalledWith(
			expect.objectContaining({
				email: 'toko@berkah.com',
				password: 'password123',
				options: { data: { name: 'Toko Berkah' } }
			})
		);
	});

	it('redirects to /dashboard when a session is returned', async () => {
		const signUp = vi.fn().mockResolvedValue({
			data: { session: { user: { id: 'u1' } } },
			error: null
		});

		await expect(actions.register(makeEvent(signUp))).rejects.toMatchObject({
			status: 303,
			location: '/dashboard'
		});
	});

	it('returns a 400 fail on signup error', async () => {
		const signUp = vi.fn().mockResolvedValue({ data: {}, error: new Error('boom') });
		const result = await actions.register(makeEvent(signUp));

		if ('status' in result) {
			expect(result.status).toBe(400);
			expect(result.data.message).toBe('Gagal mendaftarkan akun. Silahkan coba lagi.');
		} else {
			expect.fail('expected an action failure');
		}
	});
});
