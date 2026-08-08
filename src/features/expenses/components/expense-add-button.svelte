<script lang="ts">
	import { resolve } from '$app/paths';
	import { Button } from '$lib/components/ui/button/index.js';
	import { PlusIcon } from '@lucide/svelte';
</script>

<a href={resolve('/expenses/add')}>
	<Button variant="default">
		<PlusIcon />
		Tambah
	</Button>
</a>
