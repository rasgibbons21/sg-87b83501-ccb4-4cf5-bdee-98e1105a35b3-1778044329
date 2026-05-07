import { useState, useEffect } from "react";
import { AppLayout } from "@/components/app/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { TrendingUp, AlertCircle, Star, Bell } from "lucide-react";
import { watchlistService } from "@/services/watchlistService";
import { alertService } from "@/services/alertService";
import { AlertModal } from "@/components/app/AlertModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Pick {
  id: string;
  ticker: string;
  name: string;
  type: string;
  price: number;
  change_pct: number;
  price_up: boolean;
  signal: string;
  entry_display: string;
  target_display: string;
  stop_display: string;
  advice: string;
  expense_ratio: string;
  dividend_yield: string;
  risk_level: string;
  ret_1yr: number;
  ret_5yr: number;
  ret_100_1yr: string;
  ret_100_5yr: string;
}

export default function Picks() {
  const [picks, setPicks] = useState<Pick[]>([]);
  const [filter, setFilter] = useState<string>("All");
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string>("");
  const [watchlistItems, setWatchlistItems] = useState<Set<string>>(new Set());
  const [toastMessage, setToastMessage] = useState("");
  const [alertModal, setAlertModal] = useState<{ ticker: string; name: string; price: number } | null>(null);
  const [userAlerts, setUserAlerts] = useState<any[]>([]);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUserId(session.user.id);
        const watchlist = await watchlistService.getUserWatchlist(session.user.id);
        setWatchlistItems(new Set(watchlist.map(item => item.ticker)));
        const alerts = await alertService.getUserAlerts(session.user.id);
        setUserAlerts(alerts);
      }
      fetchPicks();
    };
    init();

    const interval = setInterval(fetchPicks, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchPicks = async () => {
    try {
      const { data, error } = await supabase
        .from("picks")
        .select("*")
        .eq("is_active", true)
        .order("published_at", { ascending: false });

      if (error) throw error;
      if (data) setPicks(data as Pick[]);
    } catch (err) {
      console.error("Error fetching picks:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredPicks = picks.filter(pick => {
    if (filter === "All") return true;
    return pick.type.toLowerCase() === filter.toLowerCase();
  });

  const toggleWatchlist = async (pick: Pick) => {
    if (!userId) {
      showToast("Please sign in to use watchlist");
      return;
    }

    try {
      const isInWatchlist = watchlistItems.has(pick.ticker);
      if (isInWatchlist) {
        await watchlistService.removeFromWatchlist(userId, pick.ticker);
        setWatchlistItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(pick.ticker);
          return newSet;
        });
        showToast(`${pick.ticker} removed from watchlist`);
      } else {
        await watchlistService.addToWatchlist(userId, pick.ticker, pick.name, pick.type);
        setWatchlistItems(prev => new Set(prev).add(pick.ticker));
        showToast(`${pick.ticker} added to watchlist`);
      }
    } catch (error) {
      console.error("Watchlist error:", error);
      showToast("Failed to update watchlist");
    }
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const handleBuyClick = async (pick: Pick) => {
    try {
      if (userId) {
        await supabase.from("affiliate_clicks").insert({
          user_id: userId,
          broker_name: "General",
          product_name: pick.ticker,
          click_type: "broker",
          converted: false,
          clicked_at: new Date().toISOString(),
        });
      }
      alert(`Great choice! Opening broker options for ${pick.ticker}...`);
    } catch (err) {
      console.error("Error logging click:", err);
    }
  };

  const getSignalColor = (signal: string) => {
    const s = signal?.toLowerCase() || "wait";
    if (s === "buy") return "bg-[#E8F5EE] text-[#2D7A4A] border-[#2D7A4A]";
    if (s === "hold") return "bg-[#FEF3DC] text-[#C4921A] border-[#C4921A]";
    return "bg-[#FDEAEA] text-[#C04040] border-[#C04040]";
  };

  const getWhyBuyNow = (pick: Pick): string[] => {
    const signal = pick.signal?.toLowerCase() || "wait";
    const ticker = pick.ticker;
    const price = pick.price || 0;
    
    if (signal === "buy") {
      return [
        `Current price $${price.toFixed(2)} is in the optimal buy zone (${pick.entry_display})`,
        `${pick.type === 'etf' ? 'Broad market diversification' : 'Strong fundamentals'} + momentum pointing upward`,
        `Dollar-cost averaging this month locks in a favorable entry before potential breakout`
      ];
    } else if (signal === "hold") {
      return [
        `Already at a strong position — no need to chase higher prices right now`,
        `Current price $${price.toFixed(2)} is above optimal entry range`,
        `Better to hold existing shares and wait for a pullback to add more`
      ];
    } else {
      return [
        `Price is outside the safe buy zone — patience pays here`,
        `Market conditions suggest waiting for better entry point`,
        `Use this time to research and prepare your strategy for the next dip`
      ];
    }
  };

  const getWhatToDo = (pick: Pick): { budget: number; shares: number; value: number }[] => {
    const price = pick.price || 1;
    return [
      { budget: 50, shares: Number((50 / price).toFixed(4)), value: 50 },
      { budget: 100, shares: Number((100 / price).toFixed(4)), value: 100 },
      { budget: 200, shares: Number((200 / price).toFixed(4)), value: 200 }
    ];
  };

  const getWhatToWatch = (pick: Pick): string[] => {
    const signal = pick.signal?.toLowerCase() || "wait";
    const stopPrice = pick.stop_display || "$—";
    
    if (signal === "buy") {
      return [
        `If ${pick.ticker} drops below ${stopPrice}, the stop-loss is triggered — reassess position`,
        `Watch for major sector news or Fed announcements that could shift market sentiment`
      ];
    } else if (signal === "hold") {
      return [
        `If price falls back into buy zone (${pick.entry_display}), consider adding shares`,
        `Monitor quarterly earnings — any negative surprise could create a better entry point`
      ];
    } else {
      return [
        `Set an alert for when price drops to ${pick.entry_display} — that's your buy signal`,
        `Track the broader market trend — wait for a clear reversal before entering`
      ];
    }
  };

  const handleCreateAlert = async (alertType: "above" | "below" | "target" | "stop", alertPrice: number) => {
    if (!userId || !alertModal) return;

    try {
      await alertService.createAlert(
        userId,
        alertModal.ticker,
        alertModal.name,
        alertType,
        alertPrice,
        alertModal.price
      );
      
      const freshAlerts = await alertService.getUserAlerts(userId);
      setUserAlerts(freshAlerts);
      
      setAlertModal(null);
      showToast(`Alert set for ${alertModal.ticker} at $${alertPrice.toFixed(2)}`);
    } catch (error) {
      console.error("Create alert error:", error);
      showToast("Failed to create alert");
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="font-serif text-3xl text-sage-800 mb-2">Investment Picks</h1>
            <p className="text-slate-600">Curated ETFs and stocks selected for long-term growth.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-96 bg-slate-100 animate-pulse rounded-xl" />
            ))}
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      {toastMessage && (
        <div className="fixed bottom-4 right-4 bg-sage-800 text-white px-6 py-3 rounded-lg shadow-lg z-[200]">
          {toastMessage}
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="font-serif text-3xl text-sage-800 mb-2">Investment Picks</h1>
          <p className="text-slate-600">Curated ETFs and stocks selected for long-term growth.</p>
        </div>

        <div className="flex gap-2 mb-6">
          {["All", "ETF", "Stock", "Bond"].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === f
                  ? "bg-sage-800 text-white"
                  : "bg-white text-slate-600 border border-sage-200 hover:border-sage-400"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPicks.map(pick => (
            <div
              key={pick.id}
              className="bg-white rounded-xl border border-sage-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
            >
              <div className="p-6 space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-mono text-lg font-bold text-sage-800">{pick.ticker}</h3>
                    <p className="text-sm text-slate-600 mt-1">{pick.name}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge className="bg-sage-100 text-sage-700 border-sage-300 font-medium">
                      {pick.type.toUpperCase()}
                    </Badge>
                    <div className="flex gap-1">
                      <button
                        onClick={() => setAlertModal({ ticker: pick.ticker, name: pick.name, price: pick.price })}
                        className="p-2 hover:bg-sage-50 rounded-lg transition-colors"
                        title="Set price alert"
                      >
                        <Bell className={`w-5 h-5 ${userAlerts.some(a => a.ticker === pick.ticker) ? 'text-champagne-500 fill-champagne-400' : 'text-slate-400'}`} />
                      </button>
                      <button
                        onClick={() => toggleWatchlist(pick)}
                        className="p-2 hover:bg-sage-50 rounded-lg transition-colors"
                        title={watchlistItems.has(pick.ticker) ? "Remove from watchlist" : "Add to watchlist"}
                      >
                        <Star 
                          className={`w-5 h-5 ${watchlistItems.has(pick.ticker) ? 'fill-champagne-400 text-champagne-400' : 'text-slate-400'}`}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Price */}
                <div className="border-t border-sage-100 pt-4">
                  <div className="font-mono text-2xl text-slate-900">${pick.price?.toFixed(2) || "0.00"}</div>
                </div>

                {/* Compounding Box */}
                <div className="bg-sage-50 rounded-lg p-4 border border-sage-200">
                  <h4 className="text-xs uppercase tracking-wide text-sage-700 font-semibold mb-3">
                    $100 Invested
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-slate-500 mb-1">1 Year Ago</div>
                      <div className="font-mono text-lg font-bold text-sage-800">
                        {pick.ret_100_1yr || "$112"}
                      </div>
                      <div className="text-xs text-[#6DD6A0] font-medium">
                        +{pick.ret_1yr ? pick.ret_1yr.toFixed(1) : "12.0"}%
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 mb-1">5 Years Ago</div>
                      <div className="font-mono text-lg font-bold text-sage-800">
                        {pick.ret_100_5yr || "$168"}
                      </div>
                      <div className="text-xs text-[#6DD6A0] font-medium">
                        +{pick.ret_5yr ? pick.ret_5yr.toFixed(1) : "68.0"}%
                      </div>
                    </div>
                  </div>
                </div>

                {/* Entry/Target/Stop */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-[#E8F5EE] rounded-lg p-3 text-center">
                    <div className="text-xs text-[#2D7A4A] font-semibold mb-1">Entry</div>
                    <div className="font-mono text-sm text-[#2D7A4A]">{pick.entry_display || "$0"}</div>
                  </div>
                  <div className="bg-[#FEF3DC] rounded-lg p-3 text-center">
                    <div className="text-xs text-[#C4921A] font-semibold mb-1">Target</div>
                    <div className="font-mono text-sm text-[#C4921A]">{pick.target_display || "$0"}</div>
                  </div>
                  <div className="bg-[#FDEAEA] rounded-lg p-3 text-center">
                    <div className="text-xs text-[#C04040] font-semibold mb-1">Stop</div>
                    <div className="font-mono text-sm text-[#C04040]">{pick.stop_display || "$0"}</div>
                  </div>
                </div>

                {/* Rationale */}
                <div className="bg-white border-l-4 border-sage-400 pl-4 py-3">
                  <p className="text-sm text-slate-700 leading-relaxed italic">
                    {pick.advice || "Investment rationale coming soon."}
                  </p>
                </div>

                {/* Signal Badge */}
                <div className="flex items-center justify-between">
                  <Badge className={`${getSignalColor(pick.signal)} border font-semibold uppercase tracking-wide`}>
                    {pick.signal || "WAIT"}
                  </Badge>
                </div>

                {/* Trading Decision Panel */}
                <div className="px-6 pb-6">
                  <div className="bg-gradient-to-br from-sage-800 to-sage-700 rounded-xl p-6 text-white space-y-6">
                    <div className="text-center border-b border-sage-600 pb-3 mb-4">
                      <h3 className="font-serif text-xl font-semibold">Trading Decision Panel</h3>
                      <p className="text-sage-200 text-xs mt-1">Turn information into action</p>
                    </div>

                    {/* WHY BUY NOW */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 rounded-full bg-champagne-400 flex items-center justify-center text-sage-900 text-xs font-bold">1</div>
                        <h4 className="font-semibold text-sm uppercase tracking-wide">Why Buy Now</h4>
                      </div>
                      <ul className="space-y-2 text-sm text-sage-100">
                        {getWhyBuyNow(pick).map((reason, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-champagne-400 mt-0.5">•</span>
                            <span>{reason}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* WHAT TO DO */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 rounded-full bg-champagne-400 flex items-center justify-center text-sage-900 text-xs font-bold">2</div>
                        <h4 className="font-semibold text-sm uppercase tracking-wide">What To Do</h4>
                      </div>
                      <div className="bg-white/10 rounded-lg p-4 space-y-2">
                        {getWhatToDo(pick).map((option) => (
                          <div key={option.budget} className="flex items-center justify-between text-sm">
                            <span className="text-sage-100">If you have <span className="font-mono font-bold text-white">${option.budget}</span> to invest</span>
                            <div className="flex items-center gap-2">
                              <span className="text-sage-200">→</span>
                              <span className="font-mono font-bold text-champagne-300">{option.shares}</span>
                              <span className="text-sage-200 text-xs">shares</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* WHAT TO WATCH */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 rounded-full bg-champagne-400 flex items-center justify-center text-sage-900 text-xs font-bold">3</div>
                        <h4 className="font-semibold text-sm uppercase tracking-wide">What To Watch</h4>
                      </div>
                      <ul className="space-y-2 text-sm text-sage-100">
                        {getWhatToWatch(pick).map((warning, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-terracotta-300 mt-0.5">⚠</span>
                            <span>{warning}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-3 pt-4 border-t border-sage-100">
                  <div className="text-center">
                    <div className="text-xs text-slate-500 mb-1">Expense</div>
                    <div className="font-mono text-sm font-semibold text-slate-800">
                      {pick.expense_ratio || "0.03%"}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-slate-500 mb-1">Dividend</div>
                    <div className="font-mono text-sm font-semibold text-slate-800">
                      {pick.dividend_yield || "1.5%"}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-slate-500 mb-1">Risk</div>
                    <div className="text-sm font-semibold text-slate-800 capitalize">
                      {pick.risk_level || "Medium"}
                    </div>
                  </div>
                </div>

                {/* Buy Button */}
                <Button
                  onClick={() => handleBuyClick(pick)}
                  className="w-full bg-sage-800 hover:bg-sage-900 text-white"
                  size="lg"
                >
                  Buy {pick.ticker}
                </Button>
              </div>
            </div>
          ))}
        </div>

        {filteredPicks.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-500">No picks found for this filter.</p>
          </div>
        )}
      </div>

      {alertModal && (
        <AlertModal
          ticker={alertModal.ticker}
          name={alertModal.name}
          currentPrice={alertModal.price}
          onClose={() => setAlertModal(null)}
          onCreateAlert={handleCreateAlert}
        />
      )}
    </AppLayout>
  );
}