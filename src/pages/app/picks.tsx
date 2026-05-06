import { useState, useEffect } from "react";
import { AppLayout } from "@/components/app/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Pick {
  id: string;
  ticker: string;
  name: string;
  type: string;
  price: number;
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

  useEffect(() => {
    fetchPicks();
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
      if (data) setPicks(data);
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

  const handleBuyClick = async (pick: Pick) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("affiliate_clicks").insert({
          user_id: user.id,
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
    if (signal === "buy") return "bg-[#E8F5EE] text-[#2D7A4A] border-[#2D7A4A]";
    if (signal === "hold") return "bg-[#FEF3DC] text-[#C4921A] border-[#C4921A]";
    return "bg-[#FDEAEA] text-[#C04040] border-[#C04040]";
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
                  <Badge className="bg-sage-100 text-sage-700 border-sage-300 font-medium">
                    {pick.type.toUpperCase()}
                  </Badge>
                </div>

                {/* Price */}
                <div className="border-t border-sage-100 pt-4">
                  <div className="font-mono text-2xl text-slate-900">${pick.price.toFixed(2)}</div>
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
                    <div className="font-mono text-sm text-[#2D7A4A]">{pick.entry_display}</div>
                  </div>
                  <div className="bg-[#FEF3DC] rounded-lg p-3 text-center">
                    <div className="text-xs text-[#C4921A] font-semibold mb-1">Target</div>
                    <div className="font-mono text-sm text-[#C4921A]">{pick.target_display}</div>
                  </div>
                  <div className="bg-[#FDEAEA] rounded-lg p-3 text-center">
                    <div className="text-xs text-[#C04040] font-semibold mb-1">Stop</div>
                    <div className="font-mono text-sm text-[#C04040]">{pick.stop_display}</div>
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
                    {pick.signal}
                  </Badge>
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
    </AppLayout>
  );
}