import { useEffect, useState } from "react";
import { AppLayout } from "@/components/app/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { TrendingUp, Shield, DollarSign } from "lucide-react";

export default function Picks() {
  const [picks, setPicks] = useState<any[]>([]);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    loadPicks();
  }, [filter]);

  const loadPicks = async () => {
    let query = supabase.from("picks").select("*").eq("is_active", true);
    
    if (filter !== "all") {
      query = query.eq("type", filter);
    }

    const { data } = await query;
    setPicks(data || []);
  };

  const filtered = picks;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-serif text-sage-900 mb-2">Investment Picks</h1>
          <p className="text-sage-600">Expert-curated stocks and ETFs for your portfolio.</p>
        </div>

        <div className="flex gap-2">
          {["all", "etf", "stock", "bond"].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === f 
                  ? "bg-sage-800 text-white" 
                  : "bg-white text-sage-700 border border-sage-200 hover:border-sage-400"
              }`}
            >
              {f === "all" ? "All" : f === "etf" ? "ETFs" : f === "stock" ? "Stocks" : "Bonds"}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filtered.map(pick => (
            <div key={pick.id} className="bg-white border border-sage-200 rounded-xl p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-2xl font-bold text-sage-900">{pick.ticker}</span>
                    <span className="px-2 py-0.5 bg-sage-100 text-sage-800 text-xs rounded uppercase font-medium">
                      {pick.type}
                    </span>
                  </div>
                  <div className="text-sage-600">{pick.name}</div>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  pick.signal === "buy" ? "bg-green-50 text-green-700 border border-green-200" :
                  pick.signal === "hold" ? "bg-amber-50 text-amber-700 border border-amber-200" :
                  "bg-red-50 text-red-700 border border-red-200"
                }`}>
                  {pick.signal?.toUpperCase()}
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div>
                  <div className="text-xs text-sage-600 mb-1">Current Price</div>
                  <div className="font-mono text-2xl text-sage-900">${pick.price?.toFixed(2) || "--"}</div>
                </div>
                <div>
                  <div className="text-xs text-sage-600 mb-1">Change</div>
                  <div className={`font-mono text-xl ${pick.price_up ? "text-green-600" : "text-red-600"}`}>
                    {pick.change_pct > 0 ? "+" : ""}{pick.change_pct?.toFixed(2)}%
                  </div>
                </div>
              </div>

              {(pick.ret_1yr || pick.ret_5yr) && (
                <div className="bg-sage-50 rounded-lg p-4 border border-sage-100">
                  <div className="text-xs text-sage-600 mb-2 uppercase tracking-wider">Compounding Power</div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-sage-600 mb-0.5">$100 → 1 Year</div>
                      <div className="font-mono text-lg text-sage-900">${pick.ret_100_1yr || "--"}</div>
                      <div className="text-xs font-mono text-green-600">{pick.ret_1yr ? `+${pick.ret_1yr}%` : "--"}</div>
                    </div>
                    <div>
                      <div className="text-xs text-sage-600 mb-0.5">$100 → 5 Years</div>
                      <div className="font-mono text-lg text-sage-900">${pick.ret_100_5yr || "--"}</div>
                      <div className="text-xs font-mono text-green-600">{pick.ret_5yr ? `+${pick.ret_5yr}%` : "--"}</div>
                    </div>
                  </div>
                </div>
              )}

              {pick.entry_display && (
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-green-50 border border-green-200 rounded p-2">
                    <div className="text-[10px] text-green-700 uppercase tracking-wider mb-0.5">Entry</div>
                    <div className="text-xs font-mono text-green-800">{pick.entry_display}</div>
                  </div>
                  <div className="bg-amber-50 border border-amber-200 rounded p-2">
                    <div className="text-[10px] text-amber-700 uppercase tracking-wider mb-0.5">Target</div>
                    <div className="text-xs font-mono text-amber-800">{pick.target_display || "--"}</div>
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded p-2">
                    <div className="text-[10px] text-red-700 uppercase tracking-wider mb-0.5">Stop</div>
                    <div className="text-xs font-mono text-red-800">{pick.stop_display || "--"}</div>
                  </div>
                </div>
              )}

              {pick.advice && (
                <div className="border-l-4 border-sage-600 bg-sage-50 pl-4 pr-3 py-3">
                  <p className="text-sm text-sage-800 italic leading-relaxed">{pick.advice}</p>
                </div>
              )}

              {pick.signal_reason && (
                <div className="text-xs text-sage-600">
                  <strong>Signal:</strong> {pick.signal_reason}
                </div>
              )}

              <div className="grid grid-cols-3 gap-3 pt-2">
                {pick.expense_ratio && (
                  <div className="flex items-start gap-2">
                    <DollarSign className="w-4 h-4 text-sage-500 mt-0.5" />
                    <div>
                      <div className="text-xs text-sage-600">Expense</div>
                      <div className="text-sm font-medium text-sage-900">{pick.expense_ratio}</div>
                    </div>
                  </div>
                )}
                {pick.dividend_yield && (
                  <div className="flex items-start gap-2">
                    <TrendingUp className="w-4 h-4 text-sage-500 mt-0.5" />
                    <div>
                      <div className="text-xs text-sage-600">Dividend</div>
                      <div className="text-sm font-medium text-sage-900">{pick.dividend_yield}</div>
                    </div>
                  </div>
                )}
                {pick.risk_level && (
                  <div className="flex items-start gap-2">
                    <Shield className="w-4 h-4 text-sage-500 mt-0.5" />
                    <div>
                      <div className="text-xs text-sage-600">Risk</div>
                      <div className="text-sm font-medium text-sage-900">{pick.risk_level}</div>
                    </div>
                  </div>
                )}
              </div>

              <Button className="w-full bg-sage-800 hover:bg-sage-900 text-white">
                View Brokers to Buy
              </Button>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}