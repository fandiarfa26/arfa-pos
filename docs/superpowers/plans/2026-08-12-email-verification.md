# Email Verification Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Require email verification before an account becomes usable, so registration is not open to anyone with a random email address.

**Architecture:** Supabase Auth already supports email confirmations (on by default for hosted projects). Because the app uses `@supabase/ssr` (server-side, PKCE flow), the correct integration is the official **token-hash exchange pattern**: the Confirm signup email template links to `/auth/confirm?token_hash=...&type=email`, a new `+server.ts` GET route exchanges the token via `supabase.auth.verifyOtp()` (works across browsers/devices, unlike `exchangeCodeForSession`), and then redirects to `/dashboard`. The register action stops auto-logging-in when no session is returned (signals "check your email" instead), and login surfaces a clear message for unconfirmed emails.

**Tech Stack:** SvelteKit 2 + Svelte 5 runes, TypeScript, Supabase SSR (`@supabase/ssr` ^0.10.3, `@supabase/supabase-js` ^2.106.2), Zod, Vitest, shadcn-svelte, lucide-svelte.

## Global Constraints

- **Svelte 5 runes only** — no `$:`, `export let`, `on:click`. Use `$state()`, `$derived()`, `$props()`.
- **All mutations are SvelteKit form actions** (no REST endpoints except existing `/logout`). The `/auth/confirm` route is a GET _callback_, not a mutation — it's the documented Supabase exception.
- **Server-only Zod validation** — already in place via `$features/auth/schemas/auth-schema`.
- **Supabase queries/actions inlined** in `+page.server.ts` — no repository layer.
- **Indonesian UI copy** (e.g. "Cek Email Anda", "Email belum diverifikasi").
- **Prettier**: tabs, single quotes, no trailing commas, 100 print width. Run `pnpm format` before finishing.
- **Tests**: `expect.requireAssertions: true`. Server tests run in the node Vitest project (`src/**/*.{test,spec}.{js,ts}`, non-svelte). Spec files inside `src/routes/` are ignored by the SvelteKit router (only `+`-prefixed files are routes).
- **Spec files inside `src/routes/` must NOT be `+`-prefixed** (`+server.spec.ts`, `+page.server.spec.ts` break `svelte-kit sync` — "Files prefixed with + are reserved"). Name them `server.spec.ts` / `page.server.spec.ts`; Vitest's `src/**/*.{test,spec}.{js,ts}` glob still matches. In specs, type the mocked event as `Parameters<typeof GET>[0]` (or `Parameters<typeof actions.register>[0]`) instead of `App.Locals` so `svelte-check` passes.
- **Setup first**: `nvm use latest && pnpm install && pnpm prepare`.
- **Manual Supabase step required** (Task 1): enable "Confirm email" + set Site URL + update the Confirm signup email template. This cannot be done from this repo (no `supabase/config.toml` — hosted project).

---

### Task 1: Enable email confirmation in Supabase (manual, no code)

**Files:** none (hosted Supabase dashboard).

**Interfaces:** none.

Manual configuration so that `signUp()` returns no session and the confirmation email uses the token-hash link.

- [ ] **Step 1: Enable email confirmations**

In the [Supabase dashboard](https://supabase.com/dashboard) for the project referenced by `.env`:

1. Go to **Authentication → Sign In / Up → Email**.
2. Ensure **"Confirm email"** is **on** (default for hosted projects; if it was disabled, this is the one that stops "any email can register").
3. **Email content**: leave "Double confirm email changes" off for now (out of scope).

- [ ] **Step 2: Set Site URL**

Go to **Authentication → URL Configuration**.

- Set **Site URL** to the deployed app origin (e.g. `https://<app-domain>`). For local development, set it to `http://localhost:5173`.
- Add the callback path to **Redirect URLs**: `https://<app-domain>/auth/confirm` (and `http://localhost:5173/auth/confirm` for local dev).

- [ ] **Step 3: Update the "Confirm signup" email template**

Go to **Authentication → Emails → Templates → Confirm signup** and replace the `{{ .ConfirmationURL }}` link with a token-hash link:

```html
<h2>Confirm your email address</h2>

<p>Follow the link below to confirm this email address and finish signing up.</p>
<p>
	<a
		href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&next={{ .RedirectTo }}"
		>Confirm email address</a
	>
</p>
```

We do **not** pass `emailRedirectTo` in `signUp`, so `.RedirectTo` is empty and `next` falls back to `/dashboard` (handled in Task 2). Save the template.

- [ ] **Step 4: Commit note (no code changed)**

```bash
git status  # expect: clean
```

No commit needed for this task — it's external configuration. Record it in the final verification (Task 7).

---

### Task 2: Token exchange route `auth/confirm`

**Files:**

- Create: `src/routes/auth/confirm/+server.ts`
- Test: `src/routes/auth/confirm/server.spec.ts`

**Interfaces:**

- Consumes: `event.locals.supabase` (typed `SupabaseClient`, already set by `hooks.server.ts`).
- Produces: `GET` handler that:
  - reads `token_hash`, `type` (`EmailOtpType | null`), `next` (default `'/dashboard'`),
  - on success calls `supabase.auth.verifyOtp({ token_hash, type })` and redirects `303` to `next`,
  - on missing/invalid token redirects `303` to `/login?verify=failed`.

- [ ] **Step 1: Write the failing test**

`src/routes/auth/confirm/server.spec.ts`:

```ts
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

describe('auth/confirm GET', () => {
	it('exchanges a valid token and redirects to /dashboard', async () => {
		const verifyOtp = vi.fn().mockResolvedValue({ error: null });
		const event = makeEvent({ verifyOtp });

		await expect(GET(event)).rejects.toMatchObject({ status: 303 });
		expect(verifyOtp).toHaveBeenCalledWith({ token_hash: 'abc', type: 'email' });
	});

	it('redirects to /login?verify=failed when the token is invalid', async () => {
		const verifyOtp = vi.fn().mockResolvedValue({ error: new Error('invalid token') });
		const event = makeEvent({ verifyOtp });

		await expect(GET(event)).rejects.toMatchObject({
			status: 303,
			location: '/login?verify=failed'
		});
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/routes/auth/confirm/server.spec.ts`
Expected: FAIL with "Cannot find module './+server'".

- [ ] **Step 3: Write minimal implementation**

`src/routes/auth/confirm/+server.ts`:

```ts
import type { EmailOtpType } from '@supabase/supabase-js';
import { redirect } from '@sveltejs/kit';

export const GET = async ({ url, locals: { supabase } }: { url: URL; locals: App.Locals }) => {
	const token_hash = url.searchParams.get('token_hash') as string;
	const type = url.searchParams.get('type') as EmailOtpType | null;
	const next = url.searchParams.get('next') ?? '/dashboard';

	const redirectTo = new URL(url);
	redirectTo.pathname = next;
	redirectTo.searchParams.delete('token_hash');
	redirectTo.searchParams.delete('type');

	if (token_hash && type) {
		const { error } = await supabase.auth.verifyOtp({ token_hash, type });
		if (!error) {
			redirectTo.searchParams.delete('next');
			redirect(303, redirectTo);
		}
	}

	redirect(303, '/login?verify=failed');
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/routes/auth/confirm/server.spec.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/routes/auth/confirm/+server.ts src/routes/auth/confirm/server.spec.ts
git commit -m "feat(auth): add email verification token exchange route"
```

---

### Task 3: Register action — stop auto-login, signal "check your email"

**Files:**

- Modify: `src/routes/(auth)/register/+page.server.ts`
- Test: `src/routes/(auth)/register/page.server.spec.ts`

**Interfaces:**

- Consumes: `locals.supabase.auth.signUp`, `registerSchema` (unchanged).
- Produces: `actions.register` returns either
  - `redirect(303, '/dashboard')` when a session is returned, or
  - `{ success: true }` (Success action) when confirmation is required — consumed by the register page in Task 4.

- [ ] **Step 1: Write the failing test**

`src/routes/(auth)/register/page.server.spec.ts`:

```ts
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run "src/routes/(auth)/register/page.server.spec.ts"`
Expected: FAIL — the "no session" case currently throws `redirect(303, '/dashboard')` instead of returning `{ success: true }`.

- [ ] **Step 3: Write minimal implementation**

`src/routes/(auth)/register/+page.server.ts` — full file:

```ts
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

		const { data, error } = await locals.supabase.auth.signUp({
			email,
			password,
			options: { data: { name } }
		});

		if (error) {
			return fail(400, {
				message: 'Gagal mendaftarkan akun. Silahkan coba lagi.'
			});
		}

		if (data.session) {
			throw redirect(303, '/dashboard');
		}

		return { success: true };
	}
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run "src/routes/(auth)/register/page.server.spec.ts"`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add "src/routes/(auth)/register/+page.server.ts" "src/routes/(auth)/register/page.server.spec.ts"
git commit -m "feat(auth): require email confirmation before auto-login on register"
```

---

### Task 4: Register page — "check your email" success screen

**Files:**

- Modify: `src/routes/(auth)/register/+page.svelte`

**Interfaces:**

- Consumes: `form?.success` (boolean) from Task 3's register action.

- [ ] **Step 1: Wrap the form and footer in a success check**

In `src/routes/(auth)/register/+page.svelte`:

1. Replace the existing `<Card.Content class="p-0">` open + `<form ...>` open (lines 45–57) with a conditional that renders the success screen first:

```svelte
	<Card.Content class="p-0">
		{#if form?.success}
			<div class="flex flex-col items-center py-4 text-center">
				<div class="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
					<Mail class="h-8 w-8 text-primary" aria-hidden="true" />
				</div>
				<h2 class="text-headline-md font-bold tracking-tight">Cek Email Anda</h2>
				<p class="mt-2 text-body-sm text-muted-foreground">
					Kami telah mengirimkan tautan verifikasi ke email Anda. Silakan klik tautan
					tersebut untuk mengaktifkan akun, lalu masuk kembali.
				</p>
				<Button
					class="mt-6 flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary text-body-md font-semibold text-primary-foreground shadow-sm transition-[color,background-color,transform] hover:bg-primary-dark active:scale-[0.98]"
					href={resolve('/login')}
				>
					Masuk Sekarang
				</Button>
			</div>
		{:else}
			<form
				method="POST"
				action="?/register"
				use:enhance={() => {
					loading = true;
					return async ({ update }) => {
						await update();
						loading = false;
					};
				}}
				class="space-y-6"
			>
```

2. Close the `{/if}` after the form's closing `</form>`:

```svelte
			</form>
		{/if}
	</Card.Content>
```

3. Wrap `Card.Footer` in the same condition so the "Sudah punya akun?" link doesn't duplicate the success screen's button:

```svelte
{#if !form?.success}
	<Card.Footer class="mt-6 flex flex-col items-center border-t border-border/20 px-0 pt-6 pb-0">
		<p class="text-center text-body-sm font-body-sm text-muted-foreground">
			Sudah punya akun ArfaPOS?
			<a
				class="ml-1 font-label-bold font-semibold text-primary hover:underline"
				href={resolve('/login')}>Masuk Sekarang</a
			>
		</p>
	</Card.Footer>
{/if}
```

No `<script>` changes needed — `Mail`, `Button`, and `resolve` are already imported.

- [ ] **Step 2: Manual verification**

Run: `pnpm dev`, then open `/register`.
Expected: form renders as before; with Supabase confirmations enabled, submitting a new email shows the success screen ("Cek Email Anda") and the form + footer disappear.

- [ ] **Step 3: Run typecheck + lint**

Run: `pnpm check && pnpm lint`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add "src/routes/(auth)/register/+page.svelte"
git commit -m "feat(auth): show check-your-email screen after registration"
```

---

### Task 5: Login action — clear message for unconfirmed email

**Files:**

- Modify: `src/routes/(auth)/login/+page.server.ts`
- Test: `src/routes/(auth)/login/page.server.spec.ts`

**Interfaces:**

- Consumes: `locals.supabase.auth.signInWithPassword`, `loginSchema` (unchanged).
- Produces: `actions.login` returns `fail(400, { message })` where `message` is a verification-specific string when `error.code === 'email_not_confirmed'`.

- [ ] **Step 1: Write the failing test**

`src/routes/(auth)/login/page.server.spec.ts`:

```ts
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
			expect(result.data.message).toBe(
				'Email belum diverifikasi. Silakan cek email Anda terlebih dahulu.'
			);
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run "src/routes/(auth)/login/page.server.spec.ts"`
Expected: FAIL — first test gets the generic "Email atau password salah!" message.

- [ ] **Step 3: Write minimal implementation**

`src/routes/(auth)/login/+page.server.ts` — modify the error block:

```ts
const { error } = await locals.supabase.auth.signInWithPassword({ email, password });

if (error) {
	if (error.code === 'email_not_confirmed') {
		return fail(400, {
			message: 'Email belum diverifikasi. Silakan cek email Anda terlebih dahulu.'
		});
	}
	return fail(400, {
		message: 'Email atau password salah!'
	});
}

throw redirect(303, '/dashboard');
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run "src/routes/(auth)/login/page.server.spec.ts"`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add "src/routes/(auth)/login/+page.server.ts" "src/routes/(auth)/login/page.server.spec.ts"
git commit -m "feat(auth): surface clear message when email is unconfirmed at login"
```

---

### Task 6: Login page — notice when a verification link failed

**Files:**

- Modify: `src/routes/(auth)/login/+page.svelte`

**Interfaces:**

- Consumes: `page.url.searchParams.get('verify')` set to `'failed'` by `/auth/confirm` (Task 2).

- [ ] **Step 1: Import page state and render the notice**

In `src/routes/(auth)/login/+page.svelte`:

1. Add the import after the existing `import { resolve } from '$app/paths';`:

```svelte
import {page} from '$app/state';
```

2. Insert this block just after `<Card.Header>` closes (before `<Card.Content>`), so the alert appears above the form:

```svelte
{#if page.url.searchParams.get('verify') === 'failed'}
	<Alert.Root variant="destructive" role="alert" class="mb-6">
		<CircleAlert aria-hidden="true" />
		<Alert.Title>Tautan Tidak Valid</Alert.Title>
		<Alert.Description>
			Tautan verifikasi tidak valid atau sudah kedaluwarsa. Silakan daftar ulang untuk mendapatkan
			tautan baru.
		</Alert.Description>
	</Alert.Root>
{/if}
```

`Alert`, `CircleAlert` are already imported in this file (line 7–8).

- [ ] **Step 2: Manual verification**

Run: `pnpm dev`, then open `/login?verify=failed`.
Expected: destructive alert "Tautan Tidak Valid" renders above the form.

- [ ] **Step 3: Run typecheck + lint**

Run: `pnpm check && pnpm lint`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add "src/routes/(auth)/login/+page.svelte"
git commit -m "feat(auth): show notice on login when verification link is invalid"
```

---

### Task 7: Docs sync + full verification

**Files:**

- Modify: `PRD.md`
- Modify: `ARCHITECTURE.md`

**Interfaces:** none.

- [ ] **Step 1: Update PRD.md**

1. In §7 MVP Scope, `### 1. Authentication` (line ~168), append a line:

```text
Register memerlukan verifikasi email — akun hanya aktif setelah user mengkonfirmasi emailnya.
```

2. In §9 Functional Requirements, `## Authentication` → `### Register`, replace the "login otomatis setelah register" bullet (line ~334):

```text
- membuat akun
- verifikasi email wajib sebelum akun aktif
```

- [ ] **Step 2: Update ARCHITECTURE.md**

In §"Authentication Flow" (line ~462), after the existing flow description, add one line:

```text
Register → signUp() → (email confirmation enabled) no session → /register shows "Cek Email Anda" → user clicks /auth/confirm?token_hash=...&type=email → verifyOtp() sets session → redirect /dashboard
```

- [ ] **Step 3: Full verification suite**

Run:

```bash
pnpm format
pnpm check
pnpm lint
pnpm test
```

Expected: format clean, typecheck PASS, lint PASS, all Vitest projects PASS (including the 3 new spec files).

- [ ] **Step 4: End-to-end manual verification**

With `pnpm dev` running and the Supabase dashboard configured per Task 1:

1. Open `/register`, register with a new email → expect "Cek Email Anda" screen (no auto-login, URL stays on `/register`).
2. Check the inbox, click the confirm link → lands on `/dashboard` and session persists on refresh.
3. Logout, then log in before confirming (register a second fresh email, do NOT confirm) → expect "Email belum diverifikasi. Silakan cek email Anda terlebih dahulu."
4. Open `/login?verify=failed` → expect "Tautan Tidak Valid" alert.
5. Old accounts are unaffected (their email was already confirmed when they signed up pre-feature).

- [ ] **Step 5: Commit**

```bash
git add PRD.md ARCHITECTURE.md
git commit -m "docs: document email verification in PRD and architecture"
```
