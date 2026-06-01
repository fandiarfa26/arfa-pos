<script lang="ts">
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Dashboard - ArfaPOS</title>
</svelte:head>

<h1 class="text-2xl font-bold">Selamat datang di {data.user.user_metadata.name}</h1>
