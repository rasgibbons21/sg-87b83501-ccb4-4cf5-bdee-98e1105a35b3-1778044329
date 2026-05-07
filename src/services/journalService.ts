import { supabase } from "@/integrations/supabase/client";

export interface JournalEntry {
  id: string;
  user_id: string;
  ticker: string;
  trade_type: "buy" | "sell";
  price: number;
  shares: number;
  trade_date: string;
  notes: string;
  created_at: string;
}

export const journalService = {
  async getEntries(userId: string) {
    const { data, error } = await supabase
      .from("journal_entries")
      .select("*")
      .eq("user_id", userId)
      .order("trade_date", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching journal entries:", error);
      return [];
    }
    return data as JournalEntry[];
  },

  async addEntry(
    userId: string,
    ticker: string,
    trade_type: "buy" | "sell",
    price: number,
    shares: number,
    trade_date: string,
    notes: string
  ) {
    const { data, error } = await supabase
      .from("journal_entries")
      .insert({
        user_id: userId,
        ticker: ticker.toUpperCase(),
        trade_type,
        price,
        shares,
        trade_date,
        notes,
      })
      .select()
      .single();

    if (error) throw error;
    return data as JournalEntry;
  },

  async deleteEntry(entryId: string) {
    const { error } = await supabase
      .from("journal_entries")
      .delete()
      .eq("id", entryId);

    if (error) throw error;
  }
};