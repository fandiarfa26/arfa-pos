import { describe, expect, it } from 'vitest';
import { expenseSchema } from '../expense-schema';

const validInput = {
	description: 'Beli beras 5 kg',
	category: null,
	amount: 25000,
	date: '2026-08-08'
};

describe('expenseSchema', () => {
	it('accepts a valid expense', () => {
		expect(expenseSchema.safeParse(validInput).success).toBe(true);
	});

	it('accepts an optional category', () => {
		expect(expenseSchema.safeParse({ ...validInput, category: 'Bahan Baku' }).success).toBe(true);
	});

	it('rejects empty description', () => {
		expect(expenseSchema.safeParse({ ...validInput, description: '' }).success).toBe(false);
	});

	it('rejects amount below Rp 500', () => {
		expect(expenseSchema.safeParse({ ...validInput, amount: 100 }).success).toBe(false);
	});

	it('rejects an invalid date format', () => {
		expect(expenseSchema.safeParse({ ...validInput, date: '08-08-2026' }).success).toBe(false);
	});
});
