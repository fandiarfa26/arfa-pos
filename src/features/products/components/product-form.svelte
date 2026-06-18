<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import * as InputGroup from '$lib/components/ui/input-group/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { SaveIcon } from '@lucide/svelte';
	import InputWrapper from '$shared/components/input-wrapper.svelte';
	import { enhance } from '$app/forms';
	import { Spinner } from '$lib/components/ui/spinner';
	import { handleFormToast } from '$lib/utils/handle-form-toast';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import type { ProductFormState } from '../types/product-form-state';

	type Props = {
		form: ProductFormState | null;
		action: string;
	};

	const { form, action }: Props = $props();

	const inputStates = $derived.by(() => {
		return {
			name: form?.values?.name ?? '',
			category: form?.values?.category ?? '',
			price: form?.values?.price,
			stock: form?.values?.stock
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
				goto(resolve('/products'));
			}
		};
	}}
	class="space-y-4"
>
	<!-- name -->
	<InputWrapper label="Nama Produk" id="name" isRequired error={form?.fieldErrors?.name}>
		<Input
			id="name"
			type="text"
			name="name"
			placeholder="Kopi Susu"
			bind:value={inputStates.name}
		/>
	</InputWrapper>
	<!-- category -->
	<InputWrapper label="Kategori" id="category">
		<Input
			id="category"
			type="text"
			name="category"
			placeholder="Sachet Bubuk"
			bind:value={inputStates.category}
		/>
	</InputWrapper>
	<!-- price & stock -->
	<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
		<InputWrapper label="Harga" id="price" isRequired error={form?.fieldErrors?.price}>
			<InputGroup.Root>
				<InputGroup.Input
					id="price"
					type="number"
					name="price"
					placeholder="10000"
					bind:value={inputStates.price}
				/>
				<InputGroup.Addon>
					<InputGroup.Text>Rp</InputGroup.Text>
				</InputGroup.Addon>
			</InputGroup.Root>
		</InputWrapper>
		<InputWrapper label="Stok" id="stock">
			<Input id="stock" type="number" name="stock" bind:value={inputStates.stock} />
		</InputWrapper>
	</div>
	<!-- buttons -->
	<div class="absolute inset-x-0 bottom-0 mx-auto w-full max-w-screen-sm">
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
