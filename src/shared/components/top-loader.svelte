<script lang="ts">
	import { navigating } from '$app/state';

	let loading = $state(false);
	let minTimer: ReturnType<typeof setTimeout> | null = null;

	$effect(() => {
		if (navigating.to) {
			if (minTimer) {
				clearTimeout(minTimer);
				minTimer = null;
			}
			loading = true;
		} else if (loading) {
			minTimer = setTimeout(() => {
				loading = false;
			}, 300);

			return () => {
				if (minTimer) clearTimeout(minTimer);
			};
		}
	});
</script>

{#if loading}
	<div class="top-loader" role="progressbar" aria-label="Loading page"></div>
{/if}

<style>
	.top-loader {
		position: fixed;
		top: 0;
		left: 0;
		z-index: 9999;
		width: 100%;
		height: 3px;
		overflow: hidden;
		background: var(--color-primary, #84532a);
		pointer-events: none;
	}

	.top-loader::after {
		content: '';
		position: absolute;
		inset: 0;
		width: 40%;
		background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.35), transparent);
		animation: loader-slide 1s ease-in-out infinite;
	}

	@keyframes loader-slide {
		0% {
			transform: translateX(-100%);
		}
		100% {
			transform: translateX(350%);
		}
	}
</style>
