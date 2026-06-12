export interface ProductFormState {
	message?: string;
	fieldErrors?: {
		name?: string;
		price?: string;
	};
	values?: {
		id?: string;
		name?: string;
		category?: string;
		price?: number;
		stock?: number;
	};
}
