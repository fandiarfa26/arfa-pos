-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
	id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
	total BIGINT NOT NULL,
	user_id UUID NOT NULL REFERENCES auth.users(id),
	created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create transaction_items table
CREATE TABLE IF NOT EXISTS transaction_items (
	id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
	transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
	product_id UUID REFERENCES products(id) ON DELETE SET NULL,
	name TEXT NOT NULL,
	price BIGINT NOT NULL,
	qty INT NOT NULL,
	subtotal BIGINT NOT NULL
);

-- Enable RLS
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_items ENABLE ROW LEVEL SECURITY;

-- RLS policies for transactions
CREATE POLICY "Users can view own transactions"
	ON transactions FOR SELECT
	USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions"
	ON transactions FOR INSERT
	WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions"
	ON transactions FOR UPDATE
	USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions"
	ON transactions FOR DELETE
	USING (auth.uid() = user_id);

-- RLS policies for transaction_items
CREATE POLICY "Users can view own transaction items"
	ON transaction_items FOR SELECT
	USING (
		EXISTS (
			SELECT 1 FROM transactions
			WHERE transactions.id = transaction_items.transaction_id
			AND transactions.user_id = auth.uid()
		)
	);

CREATE POLICY "Users can insert own transaction items"
	ON transaction_items FOR INSERT
	WITH CHECK (
		EXISTS (
			SELECT 1 FROM transactions
			WHERE transactions.id = transaction_items.transaction_id
			AND transactions.user_id = auth.uid()
		)
	);

CREATE POLICY "Users can update own transaction items"
	ON transaction_items FOR UPDATE
	USING (
		EXISTS (
			SELECT 1 FROM transactions
			WHERE transactions.id = transaction_items.transaction_id
			AND transactions.user_id = auth.uid()
		)
	);

CREATE POLICY "Users can delete own transaction items"
	ON transaction_items FOR DELETE
	USING (
		EXISTS (
			SELECT 1 FROM transactions
			WHERE transactions.id = transaction_items.transaction_id
			AND transactions.user_id = auth.uid()
		)
	);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transaction_items_transaction_id ON transaction_items(transaction_id);
