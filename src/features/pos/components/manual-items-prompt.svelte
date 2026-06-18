<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Spinner } from '$lib/components/ui/spinner';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import * as InputGroup from '$lib/components/ui/input-group/index.js';
	import { formatCurrency } from '$lib/utils/currency';
	import { toast } from 'svelte-sonner';

	type ManualItem = { name: string; price: number };

	type Props = {
		items: ManualItem[];
		total: number;
		onclose: () => void;
	};

	let { items, total, onclose }: Props = $props();

	let open = $state(true);
	let view = $state<'prompt' | 'list' | 'creating'>('prompt');
	let convertedIndices = $state(new Set<number>());
	let remainingItems = $derived(items.filter((_, i) => !convertedIndices.has(i)));
	let creatingItem = $state<ManualItem | null>(null);
	let formName = $state('');
	let formPrice = $state(0);
	let isSaving = $state(false);
	let formError = $state('');

	function openList() {
		view = 'list';
	}

	function startCreate(index: number) {
		const item = remainingItems[index];
		if (!item) return;
		creatingItem = item;
		formName = item.name;
		formPrice = item.price;
		formError = '';
		view = 'creating';
	}

	async function handleSave() {
		isSaving = true;
		formError = '';

		const formData = new FormData();
		formData.append('name', formName);
		formData.append('price', String(formPrice));

		const targetItem = creatingItem;
		if (!targetItem) {
			isSaving = false;
			return;
		}

		try {
			const response = await fetch('/products/add?/createProduct', {
				method: 'POST',
				body: formData
			});

			const actionResult = await response.json();

			if (actionResult.type === 'success') {
				toast.success('Produk berhasil ditambahkan');
				const origIndex = items.indexOf(targetItem);
				if (origIndex !== -1) {
					convertedIndices.add(origIndex);
				}
				if (convertedIndices.size === items.length) {
					handleClose();
				} else {
					view = 'list';
				}
			} else if (actionResult.type === 'failure') {
				const data = actionResult.data;
				formError =
					data?.fieldErrors?.name ??
					data?.fieldErrors?.price ??
					data?.message ??
					'Gagal menyimpan produk';
			} else {
				formError = 'Gagal menyimpan produk';
			}
		} catch {
			formError = 'Terjadi kesalahan. Coba lagi.';
		} finally {
			isSaving = false;
		}
	}

	function backToList() {
		view = 'list';
		creatingItem = null;
	}

	function handleClose() {
		onclose();
	}
</script>

<Dialog.Root
	bind:open
	onOpenChange={(o) => {
		open = o;
		if (!o) onclose();
	}}
>
	<Dialog.Content>
		{#if view === 'prompt'}
			<Dialog.Header>
				<Dialog.Title>Transaksi berhasil</Dialog.Title>
			</Dialog.Header>
			<div class="space-y-2">
				<p class="text-body-sm text-muted-foreground">Total: {formatCurrency(total)}</p>
				<p class="text-body-sm font-medium">Ditemukan {remainingItems.length} item manual</p>
			</div>
			<Dialog.Footer class="mt-4 flex-col gap-2">
				<Button class="w-full" onclick={openList}>Buat Produk</Button>
				<Button variant="outline" class="w-full" onclick={handleClose}>Nanti</Button>
			</Dialog.Footer>
		{:else if view === 'list'}
			<Dialog.Header>
				<Dialog.Title>Item Manual</Dialog.Title>
			</Dialog.Header>
			<div class="space-y-3">
				{#each remainingItems as item, i (item.name)}
					<div class="flex items-center justify-between gap-3 rounded-lg border p-3">
						<div class="min-w-0 shrink">
							<p class="truncate font-medium">{item.name}</p>
							<p class="text-body-sm text-muted-foreground">{formatCurrency(item.price)}</p>
						</div>
						<Button variant="outline" size="sm" class="shrink-0" onclick={() => startCreate(i)}>
							Tambah Sebagai Produk
						</Button>
					</div>
				{/each}
			</div>
			<Dialog.Footer class="flex-col gap-2">
				<Button variant="ghost" class="w-full" onclick={handleClose}>Nanti</Button>
			</Dialog.Footer>
		{:else if view === 'creating'}
			<Dialog.Header>
				<Dialog.Title>Buat Produk</Dialog.Title>
			</Dialog.Header>
			<div class="space-y-3">
				<div class="space-y-2">
					<Label for="product-name">Nama Produk</Label>
					<Input id="product-name" type="text" bind:value={formName} />
				</div>
				<div class="space-y-2">
					<Label for="product-price">Harga</Label>
					<InputGroup.Root>
						<InputGroup.Input
							id="product-price"
							type="number"
							bind:value={formPrice}
							placeholder="10000"
						/>
						<InputGroup.Addon>Rp</InputGroup.Addon>
					</InputGroup.Root>
				</div>
				{#if formError}
					<p class="text-body-sm text-semantic-danger" role="alert">{formError}</p>
				{/if}
			</div>
			<Dialog.Footer class="flex-col gap-2">
				<Button class="w-full" onclick={handleSave} disabled={isSaving}>
					{#if isSaving}
						<Spinner /> Menyimpan..
					{:else}
						Simpan Produk
					{/if}
				</Button>
				<Button variant="outline" class="w-full" onclick={backToList}>Kembali</Button>
			</Dialog.Footer>
		{/if}
	</Dialog.Content>
</Dialog.Root>
