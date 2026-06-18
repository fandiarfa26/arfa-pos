import { createServerClient } from '@supabase/ssr';
import { error } from '@sveltejs/kit';
import type { Handle } from '@sveltejs/kit';
import { building } from '$app/environment';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_PUBLISHABLE_KEY } from '$env/static/public';

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string, maxRequests = 10, windowMs = 60000): boolean {
	const now = Date.now();
	const entry = rateLimitMap.get(ip);

	if (!entry || now > entry.resetAt) {
		rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs });
		return true;
	}

	if (entry.count >= maxRequests) {
		return false;
	}

	entry.count++;
	return true;
}

export const handle: Handle = async ({ event, resolve }) => {
	event.locals.supabase = createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_PUBLISHABLE_KEY, {
		cookies: {
			getAll: () => event.cookies.getAll(),
			setAll: (cookiesToSet) => {
				cookiesToSet.forEach(({ name, value, options }) => {
					event.cookies.set(name, value, {
						...options,
						path: '/'
					});
				});
			}
		}
	});

	const {
		data: { session }
	} = await event.locals.supabase.auth.getSession();

	const {
		data: { user }
	} = await event.locals.supabase.auth.getUser();

	event.locals.session = session;
	event.locals.user = user;

	if (
		!building &&
		(event.url.pathname.startsWith('/login') || event.url.pathname.startsWith('/register'))
	) {
		const ip = event.request.headers.get('x-forwarded-for') ?? 'unknown';
		if (!checkRateLimit(ip)) {
			throw error(429, 'Terlalu banyak permintaan. Silahkan coba lagi nanti.');
		}
	}

	return resolve(event);
};
