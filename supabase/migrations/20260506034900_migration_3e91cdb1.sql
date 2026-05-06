-- Create price_alerts table
CREATE TABLE IF NOT EXISTS price_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  ticker TEXT NOT NULL,
  name TEXT NOT NULL,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('above', 'below', 'target', 'stop')),
  alert_price NUMERIC NOT NULL,
  current_price NUMERIC,
  is_active BOOLEAN DEFAULT true,
  triggered_at TIMESTAMPTZ,
  notified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS policies
ALTER TABLE price_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_manage_own_alerts" ON price_alerts
  FOR ALL USING (auth.uid() = user_id);

-- Index for performance
CREATE INDEX idx_price_alerts_user_active ON price_alerts(user_id, is_active) WHERE is_active = true;
CREATE INDEX idx_price_alerts_ticker ON price_alerts(ticker) WHERE is_active = true;