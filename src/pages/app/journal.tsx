import { useState, useEffect } from "react";
import { AppLayout } from "@/components/app/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { journalService, JournalEntry } from "@/services/journalService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, TrendingUp, TrendingDown, BookOpen } from "lucide-react";

export default function JournalPage() {
  const [userId, setUserId] = useState<string>("");
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");

  // Form State
  const [ticker, setTicker] = useState("");
  const [tradeType, setTradeType] = useState<"buy" | "sell">("buy");
  const [price, setPrice] = useState("");
  const [shares, setShares] = useState("");
  const [tradeDate, setTradeDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUserId(session.user.id);
        const data = await journalService.getEntries(session.user.id);
        setEntries(data);
      }
      setLoading(false);
    };

    loadData();
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const handleAddTrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !ticker || !price || !shares || !tradeDate) {
      showToast("Please fill all required fields");
      return;
    }

    setSubmitting(true);
    try {
      const newEntry = await journalService.addEntry(
        userId,
        ticker,
        tradeType,
        parseFloat(price),
        parseFloat(shares),
        tradeDate,
        notes
      );
      setEntries([newEntry, ...entries]);
      setTicker("");
      setPrice("");
      setShares("");
      setNotes("");
      showToast("Trade logged successfully!");
    } catch (error) {
      console.error("Error adding trade:", error);
      showToast("Failed to log trade");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await journalService.deleteEntry(id);
      setEntries(entries.filter(e => e.id !== id));
      showToast("Trade deleted");
    } catch (error) {
      console.error("Error deleting trade:", error);
      showToast("Failed to delete trade");
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="mb-8">
          <h1 className="font-serif text-4xl text-sage-800 mb-2">Trade Journal</h1>
          <p className="text-slate-600">Loading your trade history...</p>
        </div>
        <div className="animate-pulse space-y-6">
          <div className="h-64 bg-sage-100 rounded-xl"></div>
          <div className="h-96 bg-sage-100 rounded-xl"></div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      {toast && (
        <div className="fixed bottom-4 right-4 bg-sage-800 text-white px-6 py-3 rounded-lg shadow-lg z-50">
          {toast}
        </div>
      )}

      <div className="mb-8">
        <h1 className="font-serif text-4xl text-sage-800 mb-2">Trade Journal</h1>
        <p className="text-slate-600">Log your trades and track your investment journey</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Add Trade Form */}
        <div className="bg-white rounded-xl border border-sage-200 p-6 h-fit sticky top-24 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <BookOpen className="text-sage-600 w-6 h-6" />
            <h2 className="font-serif text-xl text-sage-800">Log a Trade</h2>
          </div>

          <form onSubmit={handleAddTrade} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Ticker Symbol *</Label>
                <Input 
                  placeholder="e.g. AAPL" 
                  value={ticker} 
                  onChange={e => setTicker(e.target.value.toUpperCase())}
                  required 
                  className="uppercase font-mono"
                />
              </div>
              <div>
                <Label>Trade Type</Label>
                <Select value={tradeType} onValueChange={(v: "buy" | "sell") => setTradeType(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="buy">Buy</SelectItem>
                    <SelectItem value="sell">Sell</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Price per Share *</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                  <Input 
                    type="number" 
                    step="0.01" 
                    min="0.01"
                    placeholder="0.00" 
                    value={price} 
                    onChange={e => setPrice(e.target.value)}
                    required 
                    className="pl-7"
                  />
                </div>
              </div>
              <div>
                <Label>Number of Shares *</Label>
                <Input 
                  type="number" 
                  step="any"
                  min="0.0001"
                  placeholder="0" 
                  value={shares} 
                  onChange={e => setShares(e.target.value)}
                  required 
                />
              </div>
            </div>

            <div>
              <Label>Trade Date *</Label>
              <Input 
                type="date" 
                value={tradeDate} 
                onChange={e => setTradeDate(e.target.value)}
                required 
              />
            </div>

            <div>
              <Label>Rationale & Notes</Label>
              <Textarea 
                placeholder="Why did you make this trade? What is your strategy?"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="h-24 resize-none"
              />
            </div>

            <Button type="submit" disabled={submitting} className="w-full bg-sage-800 hover:bg-sage-900 text-white">
              {submitting ? "Saving..." : "Log Trade"}
            </Button>
          </form>
        </div>

        {/* Trade History */}
        <div className="lg:col-span-2">
          {entries.length === 0 ? (
            <div className="bg-sage-50 rounded-xl border border-sage-200 p-12 text-center">
              <BookOpen className="w-12 h-12 text-sage-300 mx-auto mb-4" />
              <h3 className="font-serif text-2xl text-sage-800 mb-2">No trades logged yet</h3>
              <p className="text-sage-600 mb-6">Record your first trade to start tracking your history.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {entries.map(entry => (
                <div key={entry.id} className="bg-white rounded-xl border border-sage-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        entry.trade_type === 'buy' ? 'bg-[#E6F7EF] text-[#2D6A4F]' : 'bg-[#FDEAEA] text-[#C04040]'
                      }`}>
                        {entry.trade_type === 'buy' ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-mono text-xl font-bold text-sage-900">{entry.ticker}</h3>
                          <span className={`px-2 py-0.5 rounded text-xs font-semibold uppercase ${
                            entry.trade_type === 'buy' ? 'bg-[#E6F7EF] text-[#2D6A4F]' : 'bg-[#FDEAEA] text-[#C04040]'
                          }`}>
                            {entry.trade_type}
                          </span>
                        </div>
                        <div className="text-sm text-slate-500">
                          {new Date(entry.trade_date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="font-mono text-xl font-bold text-sage-900">
                        ${(entry.price * entry.shares).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                      <div className="text-sm text-slate-600">
                        {entry.shares} shares @ ${entry.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                  </div>

                  {entry.notes && (
                    <div className="bg-sage-50 rounded-lg p-4 text-sm text-sage-800 border border-sage-100 italic">
                      "{entry.notes}"
                    </div>
                  )}

                  <div className="mt-4 pt-4 border-t border-sage-100 flex justify-end">
                    <button 
                      onClick={() => handleDelete(entry.id)}
                      className="text-slate-400 hover:text-terracotta-500 transition-colors flex items-center gap-1 text-sm font-medium"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete Entry
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}