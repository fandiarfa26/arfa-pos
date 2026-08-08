export interface ExpenseFormState {
	message?: string;
	fieldErrors?: {
		description?: string;
		category?: string;
		amount?: string;
		date?: string;
	};
	values?: {
		id?: string;
		description?: string;
		category?: string;
		amount?: number;
		date?: string;
	};
}
