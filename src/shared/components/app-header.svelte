<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { User } from '@lucide/svelte';

	let { name } = $props();
</script>

<header class="sticky top-0 z-10 border-b bg-background">
	<div class="flex items-center justify-between px-4 py-3">
		<div>
			<p class="text-lg font-semibold">ArfaPOS</p>
		</div>

		<DropdownMenu.Root>
			<DropdownMenu.Trigger>
				<Button variant="outline" size="icon" aria-label="User menu">
					<User />
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
</header>
