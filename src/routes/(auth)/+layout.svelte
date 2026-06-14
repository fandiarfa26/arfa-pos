<script lang="ts">
	import { Store, Moon, Sun, Coffee, TrendingUp, ShieldCheck } from '@lucide/svelte';
	import { toggleMode, mode } from 'mode-watcher';
	const { children } = $props();
</script>

<!-- Mobile Layout (< lg) -->
<div class="flex min-h-screen flex-col bg-background text-foreground lg:hidden">
	<header
		class="top-0 mx-auto flex h-16 w-full max-w-7xl items-center justify-between bg-background px-gutter"
	>
		<div class="flex-1"></div>
		<div class="text-headline-md font-headline-md font-bold text-primary">ArfaPOS</div>
		<div class="flex flex-1 items-center justify-end">
			<button
				onclick={toggleMode}
				aria-label={mode.current === 'dark' ? 'Mode terang' : 'Mode gelap'}
				class="flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
			>
				{#if mode.current === 'dark'}
					<Sun size={20} aria-hidden="true" />
				{:else}
					<Moon size={20} aria-hidden="true" />
				{/if}
			</button>
		</div>
	</header>

	<main class="flex grow items-center justify-center px-gutter py-xl">
		<div class="w-full max-w-110">
			{@render children()}

			<div class="mt-6 flex items-center justify-center gap-4 opacity-40">
				<div class="h-px w-12 bg-muted-foreground"></div>
				<Store class="size-5 text-primary" />
				<div class="h-px w-12 bg-muted-foreground"></div>
			</div>
		</div>
	</main>

	<footer class="bottom-0 flex w-full flex-col items-center gap-4 bg-transparent py-8">
		<p class="text-body-sm font-body-sm text-muted-foreground opacity-80">
			&copy; 2026 ArfaPOS. Warmth in every transaction.
		</p>
	</footer>
</div>

<!-- Desktop Layout (lg+) -->
<div class="hidden min-h-screen lg:flex">
	<!-- Left: Brand Hero Panel -->
	<div
		class="relative flex w-1/2 flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-primary/[0.04] via-primary/[0.01] to-background p-16"
	>
		<!-- Decorative blur orbs -->
		<div
			class="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-primary/5 blur-3xl"
		></div>
		<div
			class="pointer-events-none absolute -right-20 -bottom-20 h-72 w-72 rounded-full bg-primary/10 blur-2xl"
		></div>
		<div
			class="pointer-events-none absolute top-1/3 right-1/4 h-48 w-48 rounded-full bg-primary/[0.03] blur-xl"
		></div>

		<div class="relative z-10 flex flex-col items-center">
			<div
				class="mb-8 flex h-24 w-24 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/20"
			>
				<Store class="h-12 w-12 text-primary-foreground" />
			</div>

			<h1 class="text-center text-headline-lg font-bold text-primary">ArfaPOS</h1>

			<p class="mt-4 max-w-2xl text-center text-body-lg text-muted-foreground">
				Sistem kasir modern untuk UMKM Indonesia. Kelola bisnis Anda dengan mudah, cepat, dan
				hangat.
			</p>

			<div class="mt-12 grid grid-cols-3 gap-8">
				<div class="flex flex-col items-center gap-2">
					<div class="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
						<Coffee class="h-6 w-6 text-primary" />
					</div>
					<span class="text-label-caps text-muted-foreground">Mudah</span>
				</div>
				<div class="flex flex-col items-center gap-2">
					<div class="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
						<TrendingUp class="h-6 w-6 text-primary" />
					</div>
					<span class="text-label-caps text-muted-foreground">Berkembang</span>
				</div>
				<div class="flex flex-col items-center gap-2">
					<div class="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
						<ShieldCheck class="h-6 w-6 text-primary" />
					</div>
					<span class="text-label-caps text-muted-foreground">Aman</span>
				</div>
			</div>

			<div class="mt-16 flex items-center gap-3">
				<div class="h-px w-8 bg-primary/20"></div>
				<span class="text-label-caps tracking-[0.15em] text-primary/40"
					>WARMTH IN EVERY TRANSACTION</span
				>
				<div class="h-px w-8 bg-primary/20"></div>
			</div>
		</div>
	</div>

	<!-- Right: Form Panel -->
	<div class="relative flex w-1/2 flex-col items-center justify-center bg-background p-16">
		<div class="absolute top-6 right-6">
			<button
				onclick={toggleMode}
				aria-label={mode.current === 'dark' ? 'Mode terang' : 'Mode gelap'}
				class="flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
			>
				{#if mode.current === 'dark'}
					<Sun size={20} aria-hidden="true" />
				{:else}
					<Moon size={20} aria-hidden="true" />
				{/if}
			</button>
		</div>

		<div class="w-full max-w-2xl">
			{@render children()}
		</div>

		<p class="absolute bottom-6 text-body-sm text-muted-foreground opacity-50">
			&copy; 2026 ArfaPOS
		</p>
	</div>
</div>

<style>
	:global(.card-enter) {
		animation: card-enter 0.4s ease-out both;
	}

	@keyframes card-enter {
		from {
			opacity: 0;
			transform: translateY(12px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>
