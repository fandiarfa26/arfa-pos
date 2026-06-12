import { toast } from 'svelte-sonner';
import type { ActionResult } from '@sveltejs/kit';

export function handleFormToast(
	result: ActionResult<Record<string, unknown>, Record<string, unknown>>
) {
	switch (result.type) {
		case 'success':
			if (typeof result.data?.message === 'string') {
				toast.success(result.data.message);
			}
			break;

		case 'failure':
			if (typeof result.data?.message === 'string') {
				toast.warning(result.data.message);
			}
			break;

		case 'error':
			if (typeof result.error?.message === 'string') {
				toast.error(result.error.message);
			}
			break;
	}
}
