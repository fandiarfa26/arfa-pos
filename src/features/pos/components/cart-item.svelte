<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { formatCurrency } from '$lib/utils/currency';
	import { MinusIcon, PlusIcon, TrashIcon } from '@lucide/svelte';
	import type { CartItem } from '../types/cart';

	type Props = {
		item: CartItem;
		onupdateqty: (id: string, delta: 1 | -1) => void;
		onremove: (id: string) => void;
	};

	let { item, onupdateqty, onremove }: Props = $props();

	let subtotal = $derived(item.price * item.qty);
</script>

<div class="space-y-1 rounded-xl bg-card p-3 shadow-sm">
	<!-- Top row: name + actions -->
	<div class="flex items-center justify-between gap-4">
		<p class="min-w-0 flex-1 truncate text-body-sm font-semibold">{item.name}</p>
		<div class="flex shrink-0 items-center gap-1">
			<Button
				size="icon-xs"
				variant="outline"
				disabled={item.qty <= 1}
				onclick={() => onupdateqty(item.id, -1)}
			>
				<MinusIcon />
			</Button>
			<span class="min-w-[24px] text-center text-body-md font-semibold">{item.qty}</span>
			<Button size="icon-xs" variant="outline" onclick={() => onupdateqty(item.id, 1)}>
				<PlusIcon />
			</Button>
		</div>
		<div class="flex shrink-0 items-center">
			<Button size="icon-xs" variant="destructive" onclick={() => onremove(item.id)}>
				<TrashIcon />
			</Button>
		</div>
	</div>
	<!-- Bottom row: unit price + subtotal -->
	<div class="flex items-center justify-between gap-2">
		<p class="text-body-sm text-muted-foreground">{formatCurrency(item.price)}</p>
		<p class="text-body-sm font-bold">{formatCurrency(subtotal)}</p>
	</div>
</div>
