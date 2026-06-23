<script lang="ts">
	import './layout.css';
	import { Toaster } from '$lib/components/ui/sonner';
	import { ModeWatcher } from 'mode-watcher';
	import TopLoader from '../shared/components/top-loader.svelte';
	import { dev } from '$app/environment';
	import { injectAnalytics } from '@vercel/analytics/sveltekit';

	injectAnalytics({ mode: dev ? 'development' : 'production' });

	let { children } = $props();
</script>

<ModeWatcher themeColors={{ dark: '#1c1511', light: '#faf7f2' }} />

<svelte:head><link rel="icon" href="/favicon.ico" /></svelte:head>

<TopLoader />

<Toaster position="top-center" />

{@render children()}
