<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import { formatCurrency } from '$lib/utils/currency';

	type Props = {
		label: string;
		value: number;
	};

	const { label, value }: Props = $props();
</script>

<Card.Root>
	<Card.Content class="flex items-center justify-between gap-3">
		<span class="text-body-sm text-muted-foreground">{label}</span>
		<span class="text-price-display text-foreground">{formatCurrency(value)}</span>
	</Card.Content>
</Card.Root>
