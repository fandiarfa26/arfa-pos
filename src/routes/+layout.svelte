<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { Toaster } from '$lib/components/ui/sonner';
	import { ModeWatcher } from 'mode-watcher';
	import TopLoader from '../shared/components/top-loader.svelte';

	let { children } = $props();
</script>

<ModeWatcher themeColors={{ dark: '#1c1511', light: '#faf7f2' }} />

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<TopLoader />

<Toaster position="top-center" />

{@render children()}
