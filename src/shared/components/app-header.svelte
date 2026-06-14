<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { User, Moon, Sun } from '@lucide/svelte';
	import { toggleMode, mode } from 'mode-watcher';

	let { name } = $props();
</script>

<header class="sticky top-0 z-10 border-b bg-background">
	<div class="flex items-center justify-between px-4 py-3">
		<div>
			<p class="text-body-lg font-semibold">ArfaPOS</p>
		</div>

		<div class="flex items-center gap-2">
			<button
				onclick={toggleMode}
				aria-label={mode.current === 'dark' ? 'Mode terang' : 'Mode gelap'}
				class="flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
			>
				{#if mode.current === 'dark'}
					<Sun size={20} aria-hidden="true" />
				{:else}
					<Moon size={20} aria-hidden="true" />
				{/if}
			</button>

			<DropdownMenu.Root>
				<DropdownMenu.Trigger>
					<Button variant="outline" size="icon" aria-label="Menu pengguna" class="h-11 w-11">
						<User aria-hidden="true" />
					</Button>
				</DropdownMenu.Trigger>

				<DropdownMenu.Content align="end">
					<DropdownMenu.Label>{name}</DropdownMenu.Label>
					<DropdownMenu.Separator />

					<form method="POST" action="/logout">
						<button
							type="submit"
							class="w-full cursor-pointer px-2 py-1.5 text-left text-sm text-destructive"
						>
							Logout
						</button>
					</form>
				</DropdownMenu.Content>
			</DropdownMenu.Root>
		</div>
	</div>
</header>
