<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { handleFormToast } from '$lib/utils/handle-form-toast';
	import type { Snippet } from 'svelte';

	type Props = {
		child: Snippet<[{ props: Record<string, unknown> }]>;
		expenseId: string;
	};

	let { child, expenseId }: Props = $props();

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
			action="?/deleteExpense"
			use:enhance={() => {
				return async ({ result, update }) => {
					await update();

					handleFormToast(result);
				};
			}}
			class="space-y-6"
		>
			<Dialog.Header>
				<Dialog.Title>Hapus Pengeluaran</Dialog.Title>
				<Dialog.Description>Apakah Anda yakin ingin menghapus pengeluaran ini?</Dialog.Description>
			</Dialog.Header>
			<input type="hidden" name="expenseId" value={expenseId} />
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
