<script lang="ts">
	import { Label } from '$lib/components/ui/label';
	import type { Snippet } from 'svelte';

	type Props = {
		children: Snippet;
		label?: string;
		id?: string;
		isRequired?: boolean;
		error?: string;
	};

	const { children, label, id, isRequired = false, error }: Props = $props();
</script>

<div class="space-y-2">
	{#if label}
		<Label for={id}
			>{label}
			{#if isRequired}
				<span class="text-red-500">*</span>
			{:else}
				<span class="text-xs text-gray-400">(OPSIONAL)</span>
			{/if}</Label
		>
	{/if}
	{@render children()}
	{#if error}
		<p class="text-sm text-red-500">{error}</p>
	{/if}
</div>
