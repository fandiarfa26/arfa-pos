<script lang="ts">
	import { DeleteIcon } from '@lucide/svelte';

	let { value = $bindable(0) } = $props();

	function appendDigit(digit: number) {
		value = value * 10 + digit;
	}

	function appendDoubleZero() {
		value = value * 100;
	}

	function appendTripleZero() {
		value = value * 1000;
	}

	function backspace() {
		value = Math.floor(value / 10);
	}
</script>

<div class="grid grid-cols-3 gap-3" role="group" aria-label="Keypad nominal pembayaran">
	<!-- Row 1 -->
	<button class="keypad-btn" onclick={() => appendDigit(7)} type="button"> 7 </button>
	<button class="keypad-btn" onclick={() => appendDigit(8)} type="button"> 8 </button>
	<button class="keypad-btn" onclick={() => appendDigit(9)} type="button"> 9 </button>

	<!-- Row 2 -->
	<button class="keypad-btn" onclick={() => appendDigit(4)} type="button"> 4 </button>
	<button class="keypad-btn" onclick={() => appendDigit(5)} type="button"> 5 </button>
	<button class="keypad-btn" onclick={() => appendDigit(6)} type="button"> 6 </button>

	<!-- Row 3 -->
	<button class="keypad-btn" onclick={() => appendDigit(1)} type="button"> 1 </button>
	<button class="keypad-btn" onclick={() => appendDigit(2)} type="button"> 2 </button>
	<button class="keypad-btn" onclick={() => appendDigit(3)} type="button"> 3 </button>

	<!-- Row 4 -->
	<button class="keypad-btn" onclick={() => appendDigit(0)} type="button"> 0 </button>
	<button class="keypad-btn" onclick={() => appendDoubleZero()} type="button"> 00 </button>
	<button class="keypad-btn" onclick={() => appendTripleZero()} type="button"> 000 </button>

	<!-- Row 5: Backspace -->
	<button
		class="col-span-3 h-14 w-full rounded-xl border bg-destructive/10 text-base font-semibold text-semantic-danger transition-transform hover:bg-destructive/20 focus-visible:ring-2 focus-visible:ring-ring active:scale-95"
		onclick={() => backspace()}
		aria-label="Hapus digit terakhir"
		type="button"
	>
		<DeleteIcon class="mx-auto size-5" />
	</button>
</div>

<style>
	.keypad-btn {
		height: 4rem;
		width: 100%;
		border-radius: 0.75rem;
		border: 1px solid var(--color-border);
		background-color: var(--color-background);
		font-size: 1.125rem;
		line-height: 1.75rem;
		font-weight: 600;
		transition:
			transform 0.15s,
			background-color 0.15s;
	}

	.keypad-btn:hover {
		background-color: var(--color-muted);
	}

	.keypad-btn:focus-visible {
		outline: none;
		box-shadow: 0 0 0 2px var(--color-ring);
	}

	.keypad-btn:active {
		transform: scale(0.95);
	}
</style>
