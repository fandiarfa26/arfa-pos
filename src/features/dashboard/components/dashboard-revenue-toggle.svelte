<script lang="ts">
	interface Props {
		checked?: boolean;
	}

	let { checked = $bindable(false) }: Props = $props();
</script>

<button
	type="button"
	role="switch"
	aria-checked={checked}
	onclick={() => (checked = !checked)}
	class="flex w-full items-center justify-between gap-3 rounded-xl border bg-card p-4 text-left"
>
	<span class="text-body-sm font-medium text-foreground">Tanpa dikurangi pengeluaran</span>
	<span
		class="relative h-6 w-11 shrink-0 rounded-full transition-colors {checked ? 'bg-primary' : 'bg-muted'}"
		aria-hidden="true"
	>
		<span
			class="absolute top-0.5 h-5 w-5 rounded-full bg-background shadow-sm transition-transform {checked
				? 'translate-x-[22px]'
				: 'translate-x-0.5'}"
		></span>
	</span>
</button>
