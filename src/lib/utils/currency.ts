const formatter = new Intl.NumberFormat('id-ID', {
	style: 'currency',
	currency: 'IDR',
	maximumFractionDigits: 0
});

export function formatCurrency(value: number) {
	return formatter.format(value);
}
