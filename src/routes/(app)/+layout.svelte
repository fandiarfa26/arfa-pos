<script lang="ts">
	import AppHeader from '../../shared/components/app-header.svelte';
	import PageContainer from '../../shared/components/page-container.svelte';

	const { data, children } = $props();
</script>

<PageContainer>
	<AppHeader name={data.user.user_metadata.name} />
	<div class="p-4">
		{@render children()}
	</div>
</PageContainer>
