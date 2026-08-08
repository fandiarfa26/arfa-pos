<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Input } from '$lib/components/ui/input';
	import * as InputGroup from '$lib/components/ui/input-group/index.js';
	import { Spinner } from '$lib/components/ui/spinner';
	import { handleFormToast } from '$lib/utils/handle-form-toast';
	import { todayDateString } from '$lib/utils/date';
	import { SaveIcon } from '@lucide/svelte';
	import InputWrapper from '$shared/components/input-wrapper.svelte';
	import type { ExpenseFormState } from '../types/expense-form-state';

	type Props = {
		form: ExpenseFormState | null;
		action: string;
	};

	const { form, action }: Props = $props();

	const inputStates = $derived.by(() => {
		return {
			description: form?.values?.description ?? '',
			category: form?.values?.category ?? '',
			amount: form?.values?.amount,
			date: form?.values?.date ?? todayDateString()
		};
	});

	let isSubmitting = $state(false);
</script>

<form
	method="POST"
	{action}
	use:enhance={() => {
		isSubmitting = true;

		return async ({ result, update }) => {
			await update();

			handleFormToast(result);

			isSubmitting = false;

			if (result.type === 'success') {
				goto(resolve('/expenses'));
			}
		};
	}}
	class="space-y-4"
>
	<InputWrapper label="Deskripsi" id="description" isRequired error={form?.fieldErrors?.description}>
		<Input
			id="description"
			type="text"
			name="description"
			placeholder="Beli beras 5 kg"
			bind:value={inputStates.description}
		/>
	</InputWrapper>

	<InputWrapper label="Kategori" id="category" error={form?.fieldErrors?.category}>
		<Input
			id="category"
			type="text"
			name="category"
			placeholder="Bahan Baku"
			bind:value={inputStates.category}
		/>
	</InputWrapper>

	<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
		<InputWrapper label="Nominal" id="amount" isRequired error={form?.fieldErrors?.amount}>
			<InputGroup.Root>
				<InputGroup.Input
					id="amount"
					type="number"
					name="amount"
					placeholder="25000"
					bind:value={inputStates.amount}
				/>
				<InputGroup.Addon>
					<InputGroup.Text>Rp</InputGroup.Text>
				</InputGroup.Addon>
			</InputGroup.Root>
		</InputWrapper>

		<InputWrapper label="Tanggal" id="date" isRequired error={form?.fieldErrors?.date}>
			<Input id="date" type="date" name="date" bind:value={inputStates.date} />
		</InputWrapper>
	</div>

	<div class="absolute inset-x-0 bottom-0 mx-auto w-full max-w-160">
		<Card.Root class="rounded-b-none">
			<Card.Content>
				<div class="grid grid-cols-1 gap-4">
					<Button type="submit" variant="default" size="lg" disabled={isSubmitting}>
						{#if isSubmitting}
							<Spinner /> Menyimpan..
						{:else}
							<SaveIcon /> Simpan
						{/if}
					</Button>
					<Button variant="outline" size="lg" onclick={() => window.history.back()}>Batal</Button>
				</div>
			</Card.Content>
		</Card.Root>
	</div>
</form>
