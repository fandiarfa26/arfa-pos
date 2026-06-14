<script lang="ts">
	import { Store, Moon, Sun } from '@lucide/svelte';
	import { toggleMode, mode } from 'mode-watcher';
	const { children } = $props();
</script>

<div class="flex min-h-screen flex-col bg-background text-foreground">
	<!-- Top Navigation Anchor -->
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
		<div class="w-full max-w-110 lg:max-w-lg">
			{@render children()}

			<!-- Warm Decorative Element -->
			<div class="mt-6 flex items-center justify-center gap-4 opacity-40">
				<div class="h-px w-12 bg-muted-foreground"></div>
				<Store class="size-5 text-primary" />
				<div class="h-px w-12 bg-muted-foreground"></div>
			</div>
		</div>
	</main>

	<!-- Footer Component -->
	<footer class="bottom-0 flex w-full flex-col items-center gap-4 bg-transparent py-8">
		<!-- <div class="text-headline-md font-headline-md font-bold text-primary">ArfaPOS</div>
		<div class="flex gap-6 text-body-sm font-body-sm text-muted-foreground">
			<a class="transition-colors hover:text-primary" href="#privacy">Privacy Policy</a>
			<a class="transition-colors hover:text-primary" href="#terms">Terms of Service</a>
			<a class="transition-colors hover:text-primary" href="#help">Help Center</a>
		</div> -->
		<p class="text-body-sm font-body-sm text-muted-foreground opacity-80">
			&copy; 2026 ArfaPOS. Warmth in every transaction.
		</p>
	</footer>
</div>
