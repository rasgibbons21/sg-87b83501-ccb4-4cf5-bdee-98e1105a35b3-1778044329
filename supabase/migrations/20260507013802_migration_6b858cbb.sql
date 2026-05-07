-- Create advisor_conversations table for chat history
CREATE TABLE IF NOT EXISTS advisor_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_advisor_user_id ON advisor_conversations(user_id);
CREATE INDEX idx_advisor_created ON advisor_conversations(created_at DESC);

ALTER TABLE advisor_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own conversations" ON advisor_conversations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users insert own messages" ON advisor_conversations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own conversations" ON advisor_conversations
  FOR DELETE USING (auth.uid() = user_id);