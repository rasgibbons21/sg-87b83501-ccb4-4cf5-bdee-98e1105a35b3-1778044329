import { useState, useEffect } from "react";
import { AppLayout } from "@/components/app/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { watchlistService } from "@/services/watchlistService";
import { Plus, Trash2, TrendingUp, TrendingDown, Newspaper } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface WatchlistItem {
  id: string;
  ticker: string;
  name: string;
  type: string;
  added_at: string;
  price?: number;
  change_pct?: number;
  price_up?: boolean;
  signal?: string;
  entry_display?: string;
  news_headline?: string;
  news_sentiment?: "positive" | "neutral" | "negative";
  portfolio_shares?: number;
  portfolio_value?: number;
}

export default function WatchlistPage() {
  const [userId, setUserId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [newTicker, setNewTicker] = useState("");
  const [addingTicker, setAddingTicker] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [totalPortfolioValue, setTotalPortfolioValue] = useState(0);

  useEffect(() => {
    loadWatchlistData();

    const priceInterval = setInterval(() => {
      refreshPrices();
    }, 60000);

    return () => clearInterval(priceInterval);
  }, []);

  const loadWatchlistData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      setLoading(false);
      return;
    }

    setUserId(session.user.id);

    const items = await watchlistService.getUserWatchlist(session.user.id);

    const { data: picks } = await supabase
      .from("picks")
      .select("ticker, price, change_pct, price_up, signal, entry_display, name, type")
      .in("ticker", items.map(i => i.ticker));

    const { data: journal } = await supabase
      .from("journal_entries")
      .select("ticker, shares, trade_type")
      .eq("user_id", session.user.id);

    const portfolioShares = journal?.reduce((acc: any, entry) => {
      if (!acc[entry.ticker]) acc[entry.ticker] = 0;
      acc[entry.ticker] += entry.trade_type === "buy" ? entry.shares : -entry.shares;
      return acc;
    }, {});

    const enrichedItems = await Promise.all(items.map(async (item) => {
      const pickData = picks?.find(p => p.ticker === item.ticker);
      const shares = portfolioShares?.[item.ticker] || 0;
      const price = pickData?.price || 0;
      const portfolioValue = shares * price;

      const newsResponse = await fetch(`/api/news?ticker=${item.ticker}`).catch(() => null);
      const newsData = newsResponse?.ok ? await newsResponse.json() : null;
      const latestNews = newsData?.[0];

      return {
        ...item,
        name: pickData?.name || item.name,
        type: pickData?.type || item.type,
        price: pickData?.price,
        change_pct: pickData?.change_pct,
        price_up: pickData?.price_up,
        signal: pickData?.signal,
        entry_display: pickData?.entry_display,
        news_headline: latestNews?.headline,
        news_sentiment: latestNews?.sentiment,
        portfolio_shares: shares > 0 ? shares : undefined,
        portfolio_value: shares > 0 ? portfolioValue : undefined
      };
    }));

    setWatchlist(enrichedItems);
    setTotalPortfolioValue(enrichedItems.reduce((sum, item) => sum + (item.portfolio_value || 0), 0));
    setLoading(false);
  };

  const refreshPrices = async () => {
    const pricesResponse = await fetch("/api/prices").catch(() => null);
    if (!pricesResponse?.ok) return;

    const pricesData = await pricesResponse.json();
    setWatchlist(prev => prev.map(item => {
      const priceUpdate = pricesData.find((p: any) => p.ticker === item.ticker);
      if (!priceUpdate) return item;

      const portfolioValue = (item.portfolio_shares || 0) * priceUpdate.price;
      return {
        ...item,
        price: priceUpdate.price,
        change_pct: priceUpdate.changePct,
        price_up: priceUpdate.priceUp,
        portfolio_value: item.portfolio_shares ? portfolioValue : undefined
      };
    }));

    const newTotal = watchlist.reduce((sum, item) => {
      const priceUpdate = pricesData.find((p: any) => p.ticker === item.ticker);
      const shares = item.portfolio_shares || 0;
      return sum + (shares * (priceUpdate?.price || item.price || 0));
    }, 0);
    setTotalPortfolioValue(newTotal);
  };

  const handleAddTicker = async () => {
    if (!newTicker.trim() || !userId) return;

    const ticker = newTicker.trim().toUpperCase();
    if (watchlist.some(item => item.ticker === ticker)) {
      showToast(`${ticker} is already in your watchlist`);
      return;
    }

    setAddingTicker(true);

    try {
      const { data: pickData } = await supabase
        .from("picks")
        .select("name, type")
        .eq("ticker", ticker)
        .single();

      await watchlistService.addToWatchlist(
        userId,
        ticker,
        pickData?.name || ticker,
        pickData?.type || "stock"
      );

      showToast(`${ticker} added to watchlist`);
      setNewTicker("");
      await loadWatchlistData();
    } catch (error) {
      console.error("Add ticker error:", error);
      showToast("Failed to add ticker");
    } finally {
      setAddingTicker(false);
    }
  };

  const handleRemove = async (ticker: string) => {
    if (!userId) return;

    try {
      await watchlistService.removeFromWatchlist(userId, ticker);
      setWatchlist(prev => prev.filter(item => item.ticker !== ticker));
      showToast(`${ticker} removed from watchlist`);
    } catch (error) {
      console.error("Remove error:", error);
      showToast("Failed to remove ticker");
    }
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const getSignalColor = (signal?: string) => {
    const s = signal?.toLowerCase() || "wait";
    if (s === "buy") return "bg-[#E8F5EE] text-[#2D7A4A] border-[#2D7A4A]";
    if (s === "hold") return "bg-[#FEF3DC] text-[#C4921A] border-[#C4921A]";
    return "bg-[#FDEAEA] text-[#C04040] border-[#C04040]";
  };

  const getSentimentColor = (sentiment?: string) => {
    if (sentiment === "positive") return "bg-green-100 text-green-700";
    if (sentiment === "negative") return "bg-red-100 text-red-700";
    return "bg-slate-100 text-slate-600";
  };

  const getSignalReason = (item: WatchlistItem): string => {
    const signal = item.signal?.toLowerCase() || "wait";
    const price = item.price || 0;

    if (signal === "buy") {
      return `Price at $${price.toFixed(2)} is in the optimal buy zone`;
    } else if (signal === "hold") {
      return `Currently above entry range — hold existing position`;
    } else {
      return `Outside safe buy zone — wait for better entry`;
    }
  };

  const getShouldBuyToday = (item: WatchlistItem): { answer: "yes" | "no"; reason: string } => {
    const signal = item.signal?.toLowerCase() || "wait";
    const price = item.price || 0;

    if (signal === "buy") {
      return {
        answer: "yes",
        reason: `Price is in the entry zone (${item.entry_display}). Good time to buy or add to position.`
      };
    } else if (signal === "hold") {
      return {
        answer: "no",
        reason: `Already at a strong level. If you own shares, hold. If not, wait for a pullback.`
      };
    } else {
      return {
        answer: "no",
        reason: `Price is outside optimal range. Set an alert for ${item.entry_display} and wait.`
      };
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="mb-8">
          <h1 className="font-serif text-4xl text-sage-800 mb-2">Watchlist</h1>
          <p className="text-slate-600">Loading your tracked investments...</p>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="h-24 bg-sage-100 rounded-xl"></div>
          <div className="h-64 bg-sage-100 rounded-xl"></div>
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

      <div className="mb-8">
        <h1 className="font-serif text-4xl text-sage-800 mb-2">Watchlist</h1>
        <p className="text-slate-600">Track the investments you're watching</p>
      </div>

      {/* Quick Add Form & Portfolio Value */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl border border-sage-200 p-6">
          <h3 className="font-serif text-lg text-sage-800 mb-4">Quick Add</h3>
          <div className="flex gap-2">
            <Input
              placeholder="Enter ticker symbol..."
              value={newTicker}
              onChange={(e) => setNewTicker(e.target.value.toUpperCase())}
              onKeyPress={(e) => e.key === "Enter" && handleAddTicker()}
              className="flex-1"
            />
            <Button
              onClick={handleAddTicker}
              disabled={addingTicker || !newTicker.trim()}
              className="bg-sage-800 hover:bg-sage-900 text-white"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add
            </Button>
          </div>
        </div>

        {totalPortfolioValue > 0 && (
          <div className="bg-gradient-to-br from-sage-800 to-sage-700 rounded-xl p-6 text-white">
            <div className="text-sm text-sage-200 mb-1">Total Watchlist Portfolio Value</div>
            <div className="font-mono text-3xl font-bold">
              ${totalPortfolioValue.toFixed(2)}
            </div>
            <div className="text-xs text-sage-300 mt-2">
              Based on your logged journal trades
            </div>
          </div>
        )}
      </div>

      {/* Watchlist Items */}
      {watchlist.length === 0 ? (
        <div className="bg-white rounded-xl border border-sage-200 p-12 text-center">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="font-serif text-2xl text-sage-800 mb-2">Your watchlist is empty</h3>
          <p className="text-slate-600 mb-6">Add tickers above to start tracking investments</p>
        </div>
      ) : (
        <div className="space-y-4">
          {watchlist.map((item) => {
            const shouldBuy = getShouldBuyToday(item);

            return (
              <div key={item.id} className="bg-white rounded-xl border border-sage-200 p-6 hover:shadow-md transition-shadow">
                <div className="grid lg:grid-cols-12 gap-6">
                  {/* Left: Ticker Info */}
                  <div className="lg:col-span-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-mono text-2xl font-bold text-sage-900">{item.ticker}</h3>
                        <p className="text-sm text-slate-600 mt-1">{item.name}</p>
                        <span className="inline-block mt-2 px-2 py-1 bg-sage-100 text-sage-700 text-xs font-medium rounded uppercase">
                          {item.type}
                        </span>
                      </div>
                      <button
                        onClick={() => handleRemove(item.ticker)}
                        className="text-slate-400 hover:text-terracotta-600 transition-colors"
                        title="Remove from watchlist"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {item.portfolio_shares && (
                      <div className="mt-4 p-3 bg-champagne-50 rounded-lg border border-champagne-200">
                        <div className="text-xs text-champagne-700 font-semibold uppercase mb-1">Your Position</div>
                        <div className="font-mono text-lg font-bold text-champagne-800">
                          {item.portfolio_shares.toFixed(4)} shares
                        </div>
                        <div className="text-sm text-champagne-700 mt-1">
                          Value: ${item.portfolio_value?.toFixed(2)}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Middle: Price & Signal */}
                  <div className="lg:col-span-4 border-l border-sage-100 pl-6">
                    <div className="mb-4">
                      <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Current Price</div>
                      <div className="flex items-baseline gap-3">
                        <span className="font-mono text-3xl font-bold text-sage-900">
                          ${item.price?.toFixed(2) || "—"}
                        </span>
                        {item.change_pct !== undefined && (
                          <span className={`font-mono text-sm font-semibold flex items-center gap-1 ${item.price_up ? 'text-[#6DD6A0]' : 'text-[#F09090]'}`}>
                            {item.price_up ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                            {item.price_up ? "+" : ""}{item.change_pct.toFixed(2)}%
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase border ${getSignalColor(item.signal)}`}>
                          {item.signal || "WAIT"}
                        </span>
                        <p className="text-sm text-slate-600 mt-2 italic">{getSignalReason(item)}</p>
                      </div>

                      {item.entry_display && (
                        <div>
                          <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Entry Zone</div>
                          <div className="font-mono text-sm font-bold text-sage-800">{item.entry_display}</div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Decision Support */}
                  <div className="lg:col-span-5 border-l border-sage-100 pl-6">
                    <div className="mb-4">
                      <div className="text-xs text-slate-500 uppercase tracking-wide mb-2">Should I Buy Today?</div>
                      <div className={`p-4 rounded-lg border-l-4 ${shouldBuy.answer === "yes" ? 'bg-green-50 border-green-500' : 'bg-amber-50 border-amber-500'}`}>
                        <div className={`font-bold text-lg mb-1 ${shouldBuy.answer === "yes" ? 'text-green-700' : 'text-amber-700'}`}>
                          {shouldBuy.answer.toUpperCase()}
                        </div>
                        <p className="text-sm text-slate-700">{shouldBuy.reason}</p>
                      </div>
                    </div>

                    {item.news_headline && (
                      <div className="mt-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Newspaper className="w-4 h-4 text-slate-400" />
                          <div className="text-xs text-slate-500 uppercase tracking-wide">Latest News</div>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${getSentimentColor(item.news_sentiment)}`}>
                            {item.news_sentiment || "neutral"}
                          </span>
                        </div>
                        <p className="text-sm text-slate-700 line-clamp-2">{item.news_headline}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AppLayout>
  );
}