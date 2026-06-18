<script lang="ts">
	import { resolve } from '$app/paths';
	import PageContainer from '$shared/components/page-container.svelte';
	import { WifiOff } from '@lucide/svelte';
</script>

<PageContainer>
	<div class="flex min-h-dvh flex-col items-center justify-center gap-6 p-8 text-center">
		<WifiOff class="h-16 w-16 text-muted-foreground" />
		<h1 class="text-headline-md">Anda sedang offline</h1>
		<p class="text-body-md text-muted-foreground">Periksa koneksi internet Anda dan coba lagi</p>
		<a
			href={resolve('/')}
			class="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-label-bold text-primary-foreground"
		>
			Coba Lagi
		</a>
	</div>
</PageContainer>
