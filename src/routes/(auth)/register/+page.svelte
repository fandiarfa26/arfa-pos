<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Spinner } from '$lib/components/ui/spinner/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Alert from '$lib/components/ui/alert/index.js';
	import { Store, Mail, Lock, Eye, EyeOff, ArrowRight, CircleAlert } from '@lucide/svelte';
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';

	let name = $state('');
	let email = $state('');
	let password = $state('');
	let showPassword = $state(false);
	let loading = $state(false);

	let { form } = $props();

	function togglePassword() {
		showPassword = !showPassword;
	}
</script>

<svelte:head>
	<title>Register - ArfaPOS</title>
</svelte:head>

<!-- Register Card -->
<Card.Root class="rounded-2xl border-border/30 bg-card p-6 text-card-foreground shadow-md md:p-8">
	<Card.Header class="flex flex-col items-center pb-6">
		<div class="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
			<Store class="h-8 w-8 text-primary" aria-hidden="true" />
		</div>
		<Card.Title class="text-center text-headline-md font-bold tracking-tight"
			>Mulai Bisnis Anda</Card.Title
		>
		<Card.Description class="mt-1 text-center text-body-sm text-muted-foreground"
			>Bergabunglah dengan ribuan UMKM yang tumbuh bersama ArfaPOS</Card.Description
		>
	</Card.Header>

	<Card.Content class="p-0">
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
			<!-- Name Input -->
			<div class="space-y-2">
				<Label class="px-1 text-label-caps text-muted-foreground" for="name">NAMA</Label>
				<div class="group relative">
					<Store
						class="absolute top-1/2 left-3.5 size-5 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary"
						aria-hidden="true"
					/>
					<Input
						class="h-12 w-full rounded-xl border-transparent bg-secondary/10 pr-4 pl-11 text-body-md transition-colors placeholder:text-muted-foreground focus-visible:border-primary-light focus-visible:ring-2"
						id="name"
						name="name"
						type="text"
						placeholder="Contoh: Toko Berkah"
						bind:value={name}
						required
					/>
				</div>
			</div>

			<!-- Email Input -->
			<div class="space-y-2">
				<Label class="px-1 text-label-caps text-muted-foreground" for="email">EMAIL</Label>
				<div class="group relative">
					<Mail
						class="absolute top-1/2 left-3.5 size-5 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary"
						aria-hidden="true"
					/>
					<Input
						class="h-12 w-full rounded-xl border-transparent bg-secondary/10 pr-4 pl-11 text-body-md transition-colors placeholder:text-muted-foreground focus-visible:border-primary-light focus-visible:ring-2"
						id="email"
						name="email"
						type="email"
						placeholder="nama@toko.com"
						bind:value={email}
						required
					/>
				</div>
			</div>

			<!-- Password Input -->
			<div class="space-y-2">
				<div class="flex items-end justify-between px-1">
					<Label class="text-label-caps text-muted-foreground" for="password">PASSWORD</Label>
				</div>
				<div class="group relative">
					<Lock
						class="absolute top-1/2 left-3.5 size-5 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary"
						aria-hidden="true"
					/>
					<Input
						class="h-12 w-full rounded-xl border-transparent bg-secondary/10 pr-11 pl-11 text-body-md transition-colors placeholder:text-muted-foreground focus-visible:border-primary-light focus-visible:ring-2"
						id="password"
						name="password"
						type={showPassword ? 'text' : 'password'}
						placeholder="Minimal 8 karakter"
						bind:value={password}
						required
					/>
					<button
						class="absolute top-1/2 right-3.5 -translate-y-1/2 cursor-pointer text-muted-foreground transition-colors hover:text-foreground"
						onclick={togglePassword}
						type="button"
						aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
						aria-pressed={showPassword}
					>
						{#if showPassword}
							<EyeOff class="size-5" aria-hidden="true" />
						{:else}
							<Eye class="size-5" aria-hidden="true" />
						{/if}
					</button>
				</div>
			</div>

			<!-- Error Message -->
			{#if form?.message}
				<Alert.Root variant="destructive" role="alert">
					<CircleAlert aria-hidden="true" />
					<Alert.Title>Ups!</Alert.Title>
					<Alert.Description>
						{form.message}
					</Alert.Description>
				</Alert.Root>
			{/if}

			<!-- Login Button -->
			<Button
				class="flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary text-body-md font-semibold text-primary-foreground shadow-sm transition-[color,background-color,transform] hover:bg-primary-dark active:scale-[0.98]"
				type="submit"
				disabled={loading}
			>
				{#if loading}
					<Spinner />
					Memproses...
				{:else}
					Daftar
					<ArrowRight class="ml-1 size-5" aria-hidden="true" />
				{/if}
			</Button>
		</form>
	</Card.Content>

	<Card.Footer class="mt-6 flex flex-col items-center border-t border-border/20 px-0 pt-6 pb-0">
		<p class="text-center text-body-sm font-body-sm text-muted-foreground">
			Sudah punya akun ArfaPOS?
			<a
				class="ml-1 font-label-bold font-semibold text-primary hover:underline"
				href={resolve('/login')}>Masuk Sekarang</a
			>
		</p>
	</Card.Footer>
</Card.Root>
