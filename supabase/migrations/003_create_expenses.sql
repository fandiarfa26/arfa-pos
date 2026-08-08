-- Create expenses table
CREATE TABLE IF NOT EXISTS expenses (
	id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
	user_id UUID NOT NULL REFERENCES auth.users(id),
	description TEXT NOT NULL,
	category TEXT,
	amount BIGINT NOT NULL,
	occurred_at TIMESTAMPTZ DEFAULT now() NOT NULL,
	created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view own expenses"
	ON expenses FOR SELECT
	USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own expenses"
	ON expenses FOR INSERT
	WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own expenses"
	ON expenses FOR UPDATE
	USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own expenses"
	ON expenses FOR DELETE
	USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_occurred_at ON expenses(occurred_at DESC);
