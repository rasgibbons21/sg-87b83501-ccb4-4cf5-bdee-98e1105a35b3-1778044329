import { supabase } from "@/integrations/supabase/client";

export const watchlistService = {
  async addToWatchlist(userId: string, ticker: string, name: string, type: string) {
    const { data, error } = await supabase
      .from("watchlist")
      .insert({
        user_id: userId,
        ticker,
        name,
        type,
        added_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async removeFromWatchlist(userId: string, ticker: string) {
    const { error } = await supabase
      .from("watchlist")
      .delete()
      .eq("user_id", userId)
      .eq("ticker", ticker);

    if (error) throw error;
  },

  async getUserWatchlist(userId: string) {
    const { data, error } = await supabase
      .from("watchlist")
      .select("*")
      .eq("user_id", userId)
      .order("added_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async isInWatchlist(userId: string, ticker: string) {
    const { data, error } = await supabase
      .from("watchlist")
      .select("id")
      .eq("user_id", userId)
      .eq("ticker", ticker)
      .maybeSingle();

    if (error) throw error;
    return !!data;
  }
};