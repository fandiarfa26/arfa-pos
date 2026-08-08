import { describe, expect, it } from 'vitest';
import { formatDateOnly, todayDateString } from '../date';

describe('formatDateOnly', () => {
	it('formats a local ISO string to YYYY-MM-DD', () => {
		const iso = new Date(2026, 7, 8, 9, 30).toISOString();
		expect(formatDateOnly(iso)).toBe('2026-08-08');
	});
});

describe('todayDateString', () => {
	it('returns a YYYY-MM-DD string', () => {
		expect(todayDateString()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
	});
});
