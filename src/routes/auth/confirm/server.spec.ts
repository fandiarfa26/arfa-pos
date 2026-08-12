import { describe, expect, it, vi } from 'vitest';
import { GET } from './+server';

function makeEvent({ verifyOtp }: { verifyOtp: (p: unknown) => Promise<{ error: unknown }> }) {
	const url = new URL('https://app.arfa.com/auth/confirm?token_hash=abc&type=email');
	return {
		url,
		locals: {
			supabase: { auth: { verifyOtp } },
			session: null,
			user: null
		}
	} as unknown as Parameters<typeof GET>[0];
}

function locationPathname(location: unknown): string {
	if (location instanceof URL) return location.pathname;
	return new URL(String(location), 'https://app.arfa.com').pathname;
}

describe('auth/confirm GET', () => {
	it('exchanges a valid token and redirects to /dashboard', async () => {
		const verifyOtp = vi.fn().mockResolvedValue({ error: null });
		const event = makeEvent({ verifyOtp });

		await expect(GET(event)).rejects.toMatchObject({ status: 303 });
		expect(verifyOtp).toHaveBeenCalledWith({ token_hash: 'abc', type: 'email' });
		await expect(GET(event)).rejects.toSatisfy(
			(err) => locationPathname((err as { location: unknown }).location) === '/dashboard'
		);
	});

	it('redirects to /dashboard when next is empty', async () => {
		const verifyOtp = vi.fn().mockResolvedValue({ error: null });
		const event = makeEvent({ verifyOtp });
		event.url = new URL('https://app.arfa.com/auth/confirm?token_hash=abc&type=email&next=');

		await expect(GET(event)).rejects.toMatchObject({ status: 303 });
		expect(verifyOtp).toHaveBeenCalledWith({ token_hash: 'abc', type: 'email' });
		await expect(GET(event)).rejects.toSatisfy(
			(err) => locationPathname((err as { location: unknown }).location) === '/dashboard'
		);
	});

	it('redirects to /login?verify=failed when the token is invalid', async () => {
		const verifyOtp = vi.fn().mockResolvedValue({ error: new Error('invalid token') });
		const event = makeEvent({ verifyOtp });

		await expect(GET(event)).rejects.toMatchObject({
			status: 303,
			location: '/login?verify=failed'
		});
	});

	it('redirects to /login?verify=failed when verifyOtp throws', async () => {
		const verifyOtp = vi.fn().mockRejectedValue(new Error('network down'));
		const event = makeEvent({ verifyOtp });

		await expect(GET(event)).rejects.toMatchObject({
			status: 303,
			location: '/login?verify=failed'
		});
		expect(verifyOtp).toHaveBeenCalledWith({ token_hash: 'abc', type: 'email' });
	});

	it('does not call verifyOtp when token_hash is missing', async () => {
		const verifyOtp = vi.fn();
		const event = makeEvent({ verifyOtp });
		event.url = new URL('https://app.arfa.com/auth/confirm');

		await expect(GET(event)).rejects.toMatchObject({
			status: 303,
			location: '/login?verify=failed'
		});
		expect(verifyOtp).not.toHaveBeenCalled();
	});
});
