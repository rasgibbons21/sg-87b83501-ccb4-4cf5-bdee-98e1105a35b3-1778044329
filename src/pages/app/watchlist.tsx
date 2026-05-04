import { useEffect, useState } from "react";
import { AppLayout } from "@/components/app/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus, TrendingUp, Newspaper } from "lucide-react";

export default function Watchlist() {
  const [watchlist, setWatchlist] = useState<any[]>([]);
  const [tab, setTab] = useState<string>("etf");
  const [news, setNews] = useState<any[]>([]);

  useEffect(() => {
    loadWatchlist();
    loadNews();
  }, [tab]);

  const loadWatchlist = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    let query = supabase.from("watchlist").select("*").eq("user_id", session.user.id);
    
    if (tab !== "all") {
      query = query.eq("type", tab);
    }

    const { data } = await query.order("added_at", { ascending: false });
    setWatchlist(data || []);
  };

  const loadNews = async () => {
    // Mock news data - in production would call /api/news
    setNews([
      { headline: "Market opens steady amid economic data", sentiment: "positive", source: "MarketWatch", datetime: "2 hours ago" },
      { headline: "Tech sector shows resilience", sentiment: "positive", source: "Bloomberg", datetime: "4 hours ago" },
      { headline: "Fed signals cautious approach", sentiment: "neutral", source: "Reuters", datetime: "6 hours ago" }
    ]);
  };

  const removeFromWatchlist = async (id: string) => {
    await supabase.from("watchlist").delete().eq("id", id);
    loadWatchlist();
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-serif text-sage-900 mb-2">Your Watchlist</h1>
            <p className="text-sage-600">Track stocks and ETFs you're interested in.</p>
          </div>
          <Button className="bg-sage-800 hover:bg-sage-900 text-white">
            <Plus className="w-4 h-4 mr-2" /> Add Symbol
          </Button>
        </div>

        <div className="flex gap-2">
          {["etf", "stock", "college"].map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === t 
                  ? "bg-sage-800 text-white" 
                  : "bg-white text-sage-700 border border-sage-200 hover:border-sage-400"
              }`}
            >
              {t === "etf" ? "ETFs" : t === "stock" ? "Stocks" : "College Fund"}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-3">
            {watchlist.length === 0 ? (
              <div className="bg-white border border-sage-200 rounded-xl p-12 text-center">
                <div className="w-16 h-16 bg-sage-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <TrendingUp className="w-8 h-8 text-sage-600" />
                </div>
                <h3 className="text-xl font-serif text-sage-900 mb-2">Your watchlist is empty</h3>
                <p className="text-sage-600 mb-4">Add stocks and ETFs you want to track.</p>
                <Button className="bg-sage-800 hover:bg-sage-900 text-white">
                  <Plus className="w-4 h-4 mr-2" /> Add Your First Pick
                </Button>
              </div>
            ) : (
              watchlist.map(item => (
                <div key={item.id} className="bg-white border border-sage-200 rounded-xl p-4 flex items-center justify-between hover:border-sage-300 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="text-2xl">
                      {item.type === "etf" ? "📊" : item.type === "stock" ? "📈" : "🎓"}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-lg font-bold text-sage-900">{item.ticker}</span>
                        <span className="px-2 py-0.5 bg-sage-100 text-sage-800 text-xs rounded uppercase">
                          {item.type}
                        </span>
                      </div>
                      <div className="text-sm text-sage-600">{item.name}</div>
                      {item.notes && <div className="text-xs text-sage-500 mt-1">{item.notes}</div>}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-mono text-lg text-sage-900">$--</div>
                      <div className="text-xs font-mono text-green-600">+---%</div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => removeFromWatchlist(item.id)}
                      className="text-sage-500 hover:text-red-600"
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-white border border-sage-200 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Newspaper className="w-5 h-5 text-sage-700" />
                <h3 className="font-medium text-sage-900">Market News</h3>
              </div>
              <div className="space-y-3">
                {news.map((item, i) => (
                  <div key={i} className="border-b border-sage-100 last:border-0 pb-3 last:pb-0">
                    <div className="flex items-start gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                        item.sentiment === "positive" ? "bg-green-50 text-green-700" :
                        item.sentiment === "negative" ? "bg-red-50 text-red-700" :
                        "bg-amber-50 text-amber-700"
                      }`}>
                        {item.sentiment}
                      </span>
                      <span className="text-[10px] text-sage-500">{item.datetime}</span>
                    </div>
                    <p className="text-sm text-sage-900 leading-snug mb-1">{item.headline}</p>
                    <p className="text-xs text-sage-500">{item.source}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-sage-200 rounded-xl p-6">
              <h3 className="font-medium text-sage-900 mb-4">Suggested Allocation</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-sage-600"></div>
                    <span>VTI Core</span>
                  </div>
                  <span className="font-mono">60%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-champagne-600"></div>
                    <span>SCHD Dividend</span>
                  </div>
                  <span className="font-mono">20%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-terracotta-600"></div>
                    <span>QQQ Growth</span>
                  </div>
                  <span className="font-mono">15%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-sage-300"></div>
                    <span>BND Bonds</span>
                  </div>
                  <span className="font-mono">5%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}