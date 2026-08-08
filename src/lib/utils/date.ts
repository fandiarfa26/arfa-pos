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

export function formatDateOnly(isoString: string): string {
	return localDateString(new Date(isoString));
}

export function todayDateString(): string {
	return localDateString(new Date());
}

function localDateString(d: Date): string {
	const year = d.getFullYear();
	const month = String(d.getMonth() + 1).padStart(2, '0');
	const day = String(d.getDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
}
