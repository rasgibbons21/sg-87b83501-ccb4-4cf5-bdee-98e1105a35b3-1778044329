import { useState, useEffect } from "react";
import { AppLayout } from "@/components/app/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { watchlistService } from "@/services/watchlistService";
import { Trash2, TrendingUp, TrendingDown } from "lucide-react";

interface WatchlistItem {
  id: string;
  ticker: string;
  name: string;
  type: string;
  notes: string | null;
  added_at: string;
  price?: number;
  change_pct?: number;
  price_up?: boolean;
  signal?: string;
}

export default function WatchlistPage() {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [userId, setUserId] = useState<string>("");
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        window.location.href = "/";
        return;
      }

      setUserId(session.user.id);
      await loadWatchlist(session.user.id);
    };

    fetchData();

    // Update prices every 60 seconds
    const interval = setInterval(updatePrices, 60000);
    return () => clearInterval(interval);
  }, []);

  const loadWatchlist = async (uid: string) => {
    try {
      const data = await watchlistService.getUserWatchlist(uid);
      
      // Fetch live prices
      const pricesResponse = await fetch("/api/prices").then(r => r.json()).catch(() => ({ data: [] }));
      const prices = pricesResponse.data || pricesResponse || [];

      // Fetch pick signals
      const { data: picksData } = await supabase
        .from("picks")
        .select("ticker, signal")
        .in("ticker", data.map(item => item.ticker));

      const enrichedData = data.map(item => {
        const priceData = prices.find((p: any) => p.ticker === item.ticker);
        const pickData = picksData?.find((p: any) => p.ticker === item.ticker);
        
        return {
          ...item,
          price: priceData?.price,
          change_pct: priceData?.changePct,
          price_up: priceData?.priceUp,
          signal: pickData?.signal
        };
      });

      setWatchlist(enrichedData);
      setLoading(false);
    } catch (error) {
      console.error("Failed to load watchlist:", error);
      setLoading(false);
    }
  };

  const updatePrices = async () => {
    try {
      const pricesResponse = await fetch("/api/prices").then(r => r.json()).catch(() => ({ data: [] }));
      const prices = pricesResponse.data || pricesResponse || [];

      setWatchlist(prev => prev.map(item => {
        const priceData = prices.find((p: any) => p.ticker === item.ticker);
        return priceData ? { ...item, price: priceData.price, change_pct: priceData.changePct, price_up: priceData.priceUp } : item;
      }));
    } catch (error) {
      console.error("Failed to update prices:", error);
    }
  };

  const removeFromWatchlist = async (ticker: string) => {
    try {
      await watchlistService.removeFromWatchlist(userId, ticker);
      setWatchlist(prev => prev.filter(item => item.ticker !== ticker));
      showToast(`${ticker} removed from watchlist`);
    } catch (error) {
      console.error("Failed to remove from watchlist:", error);
      showToast("Failed to remove item");
    }
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const getSignalColor = (signal?: string) => {
    switch(signal?.toLowerCase()) {
      case "buy": return "bg-[#E8F5EE] text-[#2D7A4A] border-[#2D7A4A]";
      case "hold": return "bg-[#FEF3DC] text-[#C4921A] border-[#C4921A]";
      case "wait": return "bg-[#FDEAEA] text-[#C04040] border-[#C04040]";
      default: return "bg-slate-100 text-slate-600 border-slate-300";
    }
  };

  const filteredWatchlist = filter === "all" 
    ? watchlist 
    : watchlist.filter(item => item.type.toLowerCase() === filter);

  if (loading) {
    return (
      <AppLayout>
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <div className="h-8 w-48 bg-slate-200 rounded animate-pulse mb-2"></div>
            <div className="h-4 w-64 bg-slate-200 rounded animate-pulse"></div>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-slate-200 rounded-xl animate-pulse"></div>
            ))}
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      {toastMessage && (
        <div className="fixed bottom-4 right-4 bg-sage-800 text-white px-6 py-3 rounded-lg shadow-lg z-50">
          {toastMessage}
        </div>
      )}

      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="font-serif text-3xl text-sage-800 mb-2">My Watchlist</h1>
          <p className="text-slate-600">Track your favorite picks with live prices and signals.</p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {["all", "etf", "stock", "bond"].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
                filter === f
                  ? "bg-sage-800 text-white"
                  : "bg-white text-slate-600 hover:bg-sage-50 border border-sage-200"
              }`}
            >
              {f === "all" ? "All" : f.toUpperCase()}s
            </button>
          ))}
        </div>

        {filteredWatchlist.length === 0 ? (
          <div className="bg-white rounded-xl border border-sage-200 p-12 text-center">
            <p className="text-slate-500 mb-4">Your watchlist is empty</p>
            <a href="/app/picks" className="inline-block px-6 py-2 bg-sage-800 text-white rounded-lg hover:bg-sage-900 transition-colors">
              Browse Picks
            </a>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredWatchlist.map((item) => (
              <div key={item.id} className="bg-white rounded-xl border border-sage-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 rounded-lg bg-sage-100 flex items-center justify-center">
                      {item.type === "etf" && <TrendingUp className="w-6 h-6 text-sage-700" />}
                      {item.type === "stock" && <TrendingUp className="w-6 h-6 text-terracotta-500" />}
                      {item.type === "bond" && <TrendingDown className="w-6 h-6 text-champagne-500" />}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-mono text-xl font-bold text-sage-800">{item.ticker}</h3>
                        <span className="px-2 py-0.5 bg-sage-100 text-sage-700 text-xs font-medium rounded uppercase">
                          {item.type}
                        </span>
                        {item.signal && (
                          <span className={`px-3 py-0.5 text-xs font-semibold rounded-full border ${getSignalColor(item.signal)}`}>
                            {item.signal.toUpperCase()}
                          </span>
                        )}
                      </div>
                      <p className="text-slate-600 text-sm">{item.name}</p>
                    </div>

                    <div className="text-right">
                      <div className="font-mono text-2xl font-bold text-sage-900">
                        {item.price ? `$${item.price.toFixed(2)}` : "—"}
                      </div>
                      {item.change_pct !== undefined && (
                        <div className={`font-mono text-sm font-semibold ${item.price_up ? 'text-[#6DD6A0]' : 'text-[#F09090]'}`}>
                          {item.price_up ? "+" : ""}{item.change_pct.toFixed(2)}%
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => removeFromWatchlist(item.ticker)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove from watchlist"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {item.notes && (
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <p className="text-sm text-slate-600 italic">{item.notes}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}