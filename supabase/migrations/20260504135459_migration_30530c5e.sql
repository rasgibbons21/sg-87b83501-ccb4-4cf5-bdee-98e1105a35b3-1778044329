-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE picks ENABLE ROW LEVEL SECURITY;
ALTER TABLE watchlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE pdf_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_cache ENABLE ROW LEVEL SECURITY;

-- Profiles RLS: Users can read and update their own profile, admins can read all
CREATE POLICY "users_read_own_profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "users_update_own_profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "admins_read_all_profiles" ON profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Subscriptions RLS: Users see own subscriptions, service role manages all
CREATE POLICY "users_read_own_subscriptions" ON subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "service_manage_subscriptions" ON subscriptions FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- Picks RLS: Authenticated users read active picks, only admin writes
CREATE POLICY "auth_read_active_picks" ON picks FOR SELECT USING (is_active = true AND auth.uid() IS NOT NULL);
CREATE POLICY "admin_manage_picks" ON picks FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Watchlist RLS: Users manage their own watchlist
CREATE POLICY "users_manage_own_watchlist" ON watchlist FOR ALL USING (auth.uid() = user_id);

-- Journal RLS: Users manage their own journal
CREATE POLICY "users_manage_own_journal" ON journal FOR ALL USING (auth.uid() = user_id);

-- Testimonials RLS: Anyone reads active testimonials, admin manages all
CREATE POLICY "public_read_active_testimonials" ON testimonials FOR SELECT USING (is_active = true);
CREATE POLICY "admin_manage_testimonials" ON testimonials FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- PDF Products RLS: Anyone reads active products, admin manages all
CREATE POLICY "public_read_active_products" ON pdf_products FOR SELECT USING (is_active = true);
CREATE POLICY "admin_manage_products" ON pdf_products FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Affiliate Clicks RLS: Users insert own clicks, admin reads all
CREATE POLICY "users_insert_own_clicks" ON affiliate_clicks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "admin_read_all_clicks" ON affiliate_clicks FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Admin Settings RLS: Admin only access
CREATE POLICY "admin_manage_settings" ON admin_settings FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Price Cache RLS: Anyone reads, service role updates
CREATE POLICY "public_read_price_cache" ON price_cache FOR SELECT USING (true);
CREATE POLICY "service_update_price_cache" ON price_cache FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- Auto-create profile trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();