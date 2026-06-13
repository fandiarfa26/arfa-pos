export interface Transaction {
	id: string;
	total: number;
	created_at: string;
}

export interface TransactionItem {
	id: string;
	transaction_id: string;
	product_id: string | null;
	name: string;
	price: number;
	qty: number;
	subtotal: number;
}
