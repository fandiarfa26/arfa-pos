export function generateSku(name: string): string {
	const prefix = name
		.trim()
		.toUpperCase()
		.replace(/[^A-Z0-9]/g, '')
		.padEnd(3, 'X')
		.slice(0, 3);

	const random = Math.floor(1000 + Math.random() * 9000);

	return `${prefix}-${random}`;
}
