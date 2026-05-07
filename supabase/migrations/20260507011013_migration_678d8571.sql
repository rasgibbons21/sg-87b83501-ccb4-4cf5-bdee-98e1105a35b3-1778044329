-- Add missing columns to journal_entries table
ALTER TABLE journal_entries 
ADD COLUMN IF NOT EXISTS broker TEXT,
ADD COLUMN IF NOT EXISTS emotion TEXT CHECK (emotion IN ('calm', 'focused', 'greedy', 'fearful', 'neutral')),
ADD COLUMN IF NOT EXISTS exit_price NUMERIC,
ADD COLUMN IF NOT EXISTS exit_date DATE,
ADD COLUMN IF NOT EXISTS pnl NUMERIC;

-- Update RLS policies to ensure users can only access their own entries
DROP POLICY IF EXISTS "Users manage own journal" ON journal_entries;
CREATE POLICY "Users manage own journal" ON journal_entries
  FOR ALL USING (auth.uid() = user_id);