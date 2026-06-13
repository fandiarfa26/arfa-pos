export function formatDateTime(isoString: string) {
	return new Intl.DateTimeFormat('id-ID', {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit'
	}).format(new Date(isoString));
}
