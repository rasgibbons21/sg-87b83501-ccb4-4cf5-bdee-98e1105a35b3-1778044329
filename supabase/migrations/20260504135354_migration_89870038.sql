-- Update profiles table with additional columns
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'member' CHECK (role IN ('member', 'admin')),
ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'trial' CHECK (plan IN ('trial', 'member', 'cancelled')),
ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '14 days'),
ADD COLUMN IF NOT EXISTS paypal_sub_id TEXT,
ADD COLUMN IF NOT EXISTS monthly_budget NUMERIC,
ADD COLUMN IF NOT EXISTS college_goal NUMERIC,
ADD COLUMN IF NOT EXISTS child_age INTEGER,
ADD COLUMN IF NOT EXISTS invest_monthly NUMERIC,
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS onboarding_step INTEGER DEFAULT 0;

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  paypal_sub_id TEXT UNIQUE,
  plan_id TEXT,
  status TEXT CHECK (status IN ('active', 'cancelled', 'expired', 'trial')),
  amount NUMERIC DEFAULT 9.99,
  billing_cycle TEXT DEFAULT 'monthly',
  started_at TIMESTAMPTZ DEFAULT NOW(),
  next_billing TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ
);

-- Create picks table
CREATE TABLE IF NOT EXISTS picks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticker TEXT NOT NULL,
  name TEXT,
  type TEXT CHECK (type IN ('etf', 'stock', 'bond')),
  price NUMERIC,
  change_pct NUMERIC,
  price_up BOOLEAN,
  entry_display TEXT,
  target_display TEXT,
  stop_display TEXT,
  expense_ratio TEXT,
  dividend_yield TEXT,
  risk_level TEXT,
  goal TEXT,
  timeframe TEXT,
  ret_1yr NUMERIC,
  ret_5yr NUMERIC,
  ret_100_1yr TEXT,
  ret_100_5yr TEXT,
  signal TEXT CHECK (signal IN ('buy', 'hold', 'wait')),
  signal_reason TEXT,
  advice TEXT,
  is_featured BOOLEAN DEFAULT false,
  is_college_pick BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  published_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id)
);

-- Create watchlist table
CREATE TABLE IF NOT EXISTS watchlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  ticker TEXT NOT NULL,
  name TEXT,
  type TEXT,
  notes TEXT,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, ticker)
);

-- Create journal table
CREATE TABLE IF NOT EXISTS journal (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  ticker TEXT,
  market TEXT,
  direction TEXT CHECK (direction IN ('buy', 'sell')),
  entry_price NUMERIC,
  exit_price NUMERIC,
  quantity NUMERIC,
  pnl NUMERIC,
  emotion TEXT,
  notes TEXT,
  trade_date DATE
);

-- Create testimonials table
CREATE TABLE IF NOT EXISTS testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  display_name TEXT,
  location TEXT,
  situation TEXT,
  quote TEXT,
  started_with TEXT,
  result TEXT,
  avatar_emoji TEXT,
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER
);

-- Create pdf_products table
CREATE TABLE IF NOT EXISTS pdf_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT,
  description TEXT,
  price NUMERIC,
  payhip_url TEXT,
  short_link TEXT,
  cover_emoji TEXT,
  page_count INTEGER,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER
);

-- Create affiliate_clicks table
CREATE TABLE IF NOT EXISTS affiliate_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  broker_name TEXT,
  product_name TEXT,
  click_type TEXT CHECK (click_type IN ('broker', 'pdf', 'payhip')),
  converted BOOLEAN DEFAULT false,
  commission NUMERIC,
  clicked_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create admin_settings table
CREATE TABLE IF NOT EXISTS admin_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value TEXT,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES profiles(id)
);

-- Create price_cache table
CREATE TABLE IF NOT EXISTS price_cache (
  ticker TEXT PRIMARY KEY,
  price NUMERIC,
  change_pct NUMERIC,
  price_up BOOLEAN,
  cached_at TIMESTAMPTZ DEFAULT NOW()
);