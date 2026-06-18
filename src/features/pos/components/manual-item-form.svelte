<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import * as InputGroup from '$lib/components/ui/input-group/index.js';
	import { MinusIcon, PlusIcon } from '@lucide/svelte';

	type Props = {
		onadd: (name: string, price: number, qty: number) => void;
	};

	let { onadd }: Props = $props();

	let open = $state(false);
	let name = $state('');
	let priceStr = $state('');
	let qty = $state(1);
	let nameError = $state('');

	function handlePriceInput(e: Event) {
		let raw = (e.target as HTMLInputElement).value;
		raw = raw.replace(/^0+/, '');
		if (raw === '') raw = '0';
		priceStr = raw;
	}

	function reset() {
		open = false;
		name = '';
		priceStr = '';
		qty = 1;
		resetErrors();
	}

	let priceError = $state('');

	function handleSubmit() {
		let hasError = false;
		if (!name.trim()) {
			nameError = 'Nama item wajib diisi';
			hasError = true;
		} else {
			nameError = '';
		}
		const price = Number(priceStr);
		if (price <= 0) {
			priceError = 'Harga harus lebih dari 0';
			hasError = true;
		} else {
			priceError = '';
		}
		if (hasError) return;
		onadd(name.trim(), price, qty);
		reset();
	}

	function resetErrors() {
		nameError = '';
		priceError = '';
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Trigger class="w-full">
		{#snippet child({ props })}
			<Button {...props} variant="outline" class="w-full">
				<PlusIcon /> Tambah Produk Lain
			</Button>
		{/snippet}
	</Dialog.Trigger>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Tambah Produk Lain</Dialog.Title>
		</Dialog.Header>
		<div class="space-y-3">
			<div class="space-y-2">
				<Label for="manual-name">Nama Produk</Label>
				<Input id="manual-name" type="text" placeholder="Nama produk" bind:value={name} />
			</div>
			<div class="grid grid-cols-2 gap-3">
				<div class="space-y-2">
					<Label for="manual-price">Harga</Label>
					<InputGroup.Root>
						<InputGroup.Addon>Rp</InputGroup.Addon>
						<InputGroup.Input
							id="manual-price"
							type="number"
							placeholder="10000"
							value={priceStr}
							oninput={(e) => {
								handlePriceInput(e);
								priceError = '';
							}}
						/>
					</InputGroup.Root>
					{#if priceError}
						<p class="text-body-sm text-semantic-danger" role="alert">{priceError}</p>
					{/if}
				</div>
				<div class="space-y-2">
					<Label for="manual-qty">Qty</Label>
					<InputGroup.Root>
						<InputGroup.Addon>
							<InputGroup.Button disabled={qty <= 1} onclick={() => qty--}>
								<MinusIcon />
							</InputGroup.Button>
						</InputGroup.Addon>
						<InputGroup.Input
							id="manual-qty"
							type="number"
							min="1"
							bind:value={qty}
							class="text-center"
						/>
						<InputGroup.Addon align="inline-end">
							<InputGroup.Button onclick={() => qty++}>
								<PlusIcon />
							</InputGroup.Button>
						</InputGroup.Addon>
					</InputGroup.Root>
				</div>
			</div>
			{#if nameError}
				<p class="text-body-sm text-semantic-danger" role="alert">{nameError}</p>
			{/if}
		</div>
		<Dialog.Footer>
			<Button class="w-full" onclick={handleSubmit}>
				<PlusIcon /> Tambah ke Cart
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
