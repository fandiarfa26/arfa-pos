export function generateSku(name: string): string {
	const prefix = name
		.trim()
		.toUpperCase()
		.replace(/[^A-Z0-9]/g, '')
		.padEnd(3, 'X')
		.slice(0, 3);

	const suffix = crypto.randomUUID().slice(0, 8).toUpperCase();

	return `${prefix}-${suffix}`;
}
