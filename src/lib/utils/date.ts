const formatter = new Intl.DateTimeFormat('id-ID', {
	year: 'numeric',
	month: 'long',
	day: 'numeric',
	hour: '2-digit',
	minute: '2-digit'
});

export function formatDateTime(isoString: string): string {
	return formatter.format(new Date(isoString));
}
