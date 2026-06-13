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

<div class="grid grid-cols-3 gap-3">
	<!-- Row 1 -->
	<button
		class="h-16 w-full rounded-xl border bg-background text-lg font-semibold transition-transform hover:bg-muted active:scale-95"
		onclick={() => appendDigit(7)}
		type="button"
	>
		7
	</button>
	<button
		class="h-16 w-full rounded-xl border bg-background text-lg font-semibold transition-transform hover:bg-muted active:scale-95"
		onclick={() => appendDigit(8)}
		type="button"
	>
		8
	</button>
	<button
		class="h-16 w-full rounded-xl border bg-background text-lg font-semibold transition-transform hover:bg-muted active:scale-95"
		onclick={() => appendDigit(9)}
		type="button"
	>
		9
	</button>

	<!-- Row 2 -->
	<button
		class="h-16 w-full rounded-xl border bg-background text-lg font-semibold transition-transform hover:bg-muted active:scale-95"
		onclick={() => appendDigit(4)}
		type="button"
	>
		4
	</button>
	<button
		class="h-16 w-full rounded-xl border bg-background text-lg font-semibold transition-transform hover:bg-muted active:scale-95"
		onclick={() => appendDigit(5)}
		type="button"
	>
		5
	</button>
	<button
		class="h-16 w-full rounded-xl border bg-background text-lg font-semibold transition-transform hover:bg-muted active:scale-95"
		onclick={() => appendDigit(6)}
		type="button"
	>
		6
	</button>

	<!-- Row 3 -->
	<button
		class="h-16 w-full rounded-xl border bg-background text-lg font-semibold transition-transform hover:bg-muted active:scale-95"
		onclick={() => appendDigit(1)}
		type="button"
	>
		1
	</button>
	<button
		class="h-16 w-full rounded-xl border bg-background text-lg font-semibold transition-transform hover:bg-muted active:scale-95"
		onclick={() => appendDigit(2)}
		type="button"
	>
		2
	</button>
	<button
		class="h-16 w-full rounded-xl border bg-background text-lg font-semibold transition-transform hover:bg-muted active:scale-95"
		onclick={() => appendDigit(3)}
		type="button"
	>
		3
	</button>

	<!-- Row 4 -->
	<button
		class="h-16 w-full rounded-xl border bg-background text-lg font-semibold transition-transform hover:bg-muted active:scale-95"
		onclick={() => appendDigit(0)}
		type="button"
	>
		0
	</button>
	<button
		class="h-16 w-full rounded-xl border bg-background text-lg font-semibold transition-transform hover:bg-muted active:scale-95"
		onclick={() => appendDoubleZero()}
		type="button"
	>
		00
	</button>
	<button
		class="h-16 w-full rounded-xl border bg-background text-lg font-semibold transition-transform hover:bg-muted active:scale-95"
		onclick={() => appendTripleZero()}
		type="button"
	>
		000
	</button>

	<!-- Row 5: Backspace -->
	<button
		class="col-span-3 h-14 w-full rounded-xl border bg-destructive/10 text-base font-semibold text-semantic-danger transition-transform hover:bg-destructive/20 active:scale-95"
		onclick={() => backspace()}
		type="button"
	>
		<DeleteIcon class="mx-auto size-5" />
	</button>
</div>
