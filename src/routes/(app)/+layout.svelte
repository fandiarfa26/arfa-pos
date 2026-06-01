<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	const { children } = $props();
</script>

<form method="POST" action="/logout">
	<Button type="submit">Logout</Button>
</form>

{@render children()}
