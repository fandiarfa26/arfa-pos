<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { handleFormToast } from '$lib/utils/handle-form-toast';
	import type { Snippet } from 'svelte';

	type Props = {
		child: Snippet<[{ props: Record<string, unknown> }]>;
		productId: string;
	};

	let { child, productId }: Props = $props();

	let isOpen = $state(false);

	function handleConfirmYes() {
		isOpen = false;
	}
</script>

<Dialog.Root bind:open={isOpen}>
	<Dialog.Trigger {child}></Dialog.Trigger>
	<Dialog.Content>
		<form
			method="POST"
			action="?/deleteProduct"
			use:enhance={() => {
				return async ({ result, update }) => {
					await update();

					handleFormToast(result);

					if (result.type === 'success') {
						goto(resolve('/products'));
					}
				};
			}}
			class="space-y-6"
		>
			<Dialog.Header>
				<Dialog.Title>Hapus Produk</Dialog.Title>
				<Dialog.Description>Apakah Anda yakin ingin menghapus produk ini?</Dialog.Description>
			</Dialog.Header>
			<input type="hidden" name="productId" value={productId} />
			<Dialog.Footer class="sm:justify-end">
				<Dialog.Close class="w-full md:w-auto">
					<Button variant="outline" size="sm" class="w-full text-semantic-danger">Tidak</Button>
				</Dialog.Close>
				<Button type="submit" variant="destructive" size="sm" onclick={handleConfirmYes}
					>Ya, Hapus</Button
				>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
