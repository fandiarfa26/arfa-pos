<script lang="ts">
	import { Store } from '@lucide/svelte';
	const { children } = $props();
</script>

<div class="flex min-h-screen flex-col bg-background text-foreground">
	<!-- Top Navigation Anchor -->
	<header
		class="top-0 mx-auto flex h-16 w-full max-w-7xl items-center justify-center bg-background px-gutter"
	>
		<div class="text-headline-md font-headline-md font-bold text-primary">ArfaPOS</div>
	</header>

	<main class="flex grow items-center justify-center px-gutter py-xl">
		<div class="w-full max-w-110">
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
		<div class="text-headline-md font-headline-md font-bold text-primary">ArfaPOS</div>
		<div class="flex gap-6 text-body-sm font-body-sm text-muted-foreground">
			<a class="transition-colors hover:text-primary" href="#privacy">Privacy Policy</a>
			<a class="transition-colors hover:text-primary" href="#terms">Terms of Service</a>
			<a class="transition-colors hover:text-primary" href="#help">Help Center</a>
		</div>
		<p class="text-body-sm font-body-sm text-muted-foreground opacity-80">
			&copy; 2026 ArfaPOS. Warmth in every transaction.
		</p>
	</footer>
</div>
