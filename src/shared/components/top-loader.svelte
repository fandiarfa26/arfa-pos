<script lang="ts">
	import { navigating } from '$app/stores';

	let loading = $derived($navigating !== null);
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
		height: 3px;
		width: 100%;
		background: linear-gradient(90deg, transparent, var(--color-primary, #84532a) 50%, transparent);
		animation: loader-slide 1.2s ease-in-out infinite;
		pointer-events: none;
	}

	@keyframes loader-slide {
		0% {
			transform: translateX(-100%);
		}
		100% {
			transform: translateX(100%);
		}
	}
</style>
