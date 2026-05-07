import { useEffect, useState } from "react";
import { AppLayout } from "@/components/app/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import Link from "next/link";
import { TrendingUp, DollarSign, Target, Users } from "lucide-react";

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string>("");
  const [userName, setUserName] = useState<string>("");
  const [monthlyBudget, setMonthlyBudget] = useState(0);
  const [collegeFund, setCollegeFund] = useState(0);
  const [watchlistCount, setWatchlistCount] = useState(0);
  const [alertsCount, setAlertsCount] = useState(0);
  const [featuredPicks, setFeaturedPicks] = useState<any[]>([]);

  useEffect(() => {
    const loadDashboardData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setLoading(false);
        return;
      }

      setUserId(session.user.id);

      // Load user profile and settings
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, invest_monthly, college_goal, child_age")
        .eq("id", session.user.id)
        .single();

      if (profile) {
        setUserName(profile.full_name?.split(" ")[0] || "");
        setMonthlyBudget(profile.invest_monthly || 0);
        
        // Simple college fund projection if data exists
        if (profile.college_goal && profile.child_age !== null) {
          const yearsToCollege = Math.max(18 - profile.child_age, 1);
          const monthlyNeeded = profile.college_goal / (yearsToCollege * 12);
          setCollegeFund(monthlyNeeded);
        }
      }

      // Load watchlist count
      const { count: watchlistCnt } = await supabase
        .from("watchlist")
        .select("*", { count: "exact", head: true })
        .eq("user_id", session.user.id);
      setWatchlistCount(watchlistCnt || 0);

      // Load active alerts count
      const { count: alertsCnt } = await supabase
        .from("price_alerts")
        .select("*", { count: "exact", head: true })
        .eq("user_id", session.user.id)
        .eq("is_active", true);
      setAlertsCount(alertsCnt || 0);

      // Load featured picks
      const { data: picks } = await supabase
        .from("picks")
        .select("*")
        .eq("is_featured", true)
        .eq("is_active", true)
        .limit(4);
      setFeaturedPicks(picks || []);

      setLoading(false);
    };

    loadDashboardData();

    // Refresh prices every 60s
    const interval = setInterval(async () => {
      const pricesResponse = await fetch("/api/prices").catch(() => null);
      if (pricesResponse?.ok) {
        const pricesData = await pricesResponse.json();
        setFeaturedPicks(prev => prev.map(pick => {
          const priceUpdate = pricesData.find((p: any) => p.ticker === pick.ticker);
          return priceUpdate ? { ...pick, price: priceUpdate.price, change_pct: priceUpdate.changePct, price_up: priceUpdate.priceUp } : pick;
        }));
      }
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <AppLayout>
        <div className="mb-8">
          <h1 className="font-serif text-4xl text-sage-800 mb-2">Dashboard</h1>
          <p className="text-slate-600">Loading your portfolio...</p>
        </div>
        <div className="animate-pulse space-y-6">
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-sage-100 rounded-xl"></div>
            ))}
          </div>
          <div className="h-96 bg-sage-100 rounded-xl"></div>
        </div>
      </AppLayout>
    );
  }

  const getSignalColor = (signal: string) => {
    const s = signal?.toLowerCase() || "wait";
    if (s === "buy") return "bg-[#E8F5EE] text-[#2D7A4A]";
    if (s === "hold") return "bg-[#FEF3DC] text-[#C4921A]";
    return "bg-[#FDEAEA] text-[#C04040]";
  };

  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="font-serif text-4xl text-sage-800 mb-2">
          {userName ? `Welcome back, ${userName}` : "Dashboard"}
        </h1>
        <p className="text-slate-600">Your investment portfolio at a glance</p>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-sage-200 p-6">
          <div className="flex items-center justify-between mb-3">
            <DollarSign className="w-8 h-8 text-sage-600" />
          </div>
          <div className="font-mono text-3xl font-bold text-sage-900 mb-1">
            ${monthlyBudget.toFixed(0)}
          </div>
          <div className="text-sm text-slate-600">Monthly Investing Budget</div>
        </div>

        <div className="bg-white rounded-xl border border-sage-200 p-6">
          <div className="flex items-center justify-between mb-3">
            <Target className="w-8 h-8 text-champagne-500" />
          </div>
          <div className="font-mono text-3xl font-bold text-sage-900 mb-1">
            ${collegeFund.toFixed(0)}
          </div>
          <div className="text-sm text-slate-600">College Fund Monthly Need</div>
        </div>

        <div className="bg-white rounded-xl border border-sage-200 p-6">
          <div className="flex items-center justify-between mb-3">
            <Users className="w-8 h-8 text-sage-600" />
          </div>
          <div className="font-mono text-3xl font-bold text-sage-900 mb-1">9</div>
          <div className="text-sm text-slate-600">Active Picks Available</div>
        </div>
      </div>

      {/* Featured Picks & Quick Stats */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-sage-200 p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif text-2xl text-sage-800">Featured Picks</h2>
            <Link href="/app/picks" className="text-sage-600 hover:text-sage-800 text-sm font-medium">
              View All →
            </Link>
          </div>

          <div className="space-y-3">
            {featuredPicks.map((pick) => (
              <div key={pick.id} className="flex items-center justify-between p-4 bg-sage-50 rounded-lg hover:bg-sage-100 transition-colors">
                <div className="flex items-center gap-4">
                  <div>
                    <div className="font-mono text-lg font-bold text-sage-900">{pick.ticker}</div>
                    <div className="text-sm text-slate-600">{pick.name}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="font-mono text-lg font-bold text-sage-900">
                      ${pick.price?.toFixed(2) || "—"}
                    </div>
                    <div className={`text-sm font-mono font-semibold ${pick.price_up ? 'text-[#6DD6A0]' : 'text-[#F09090]'}`}>
                      {pick.price_up ? "+" : ""}{pick.change_pct?.toFixed(2) || "0.00"}%
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${getSignalColor(pick.signal)}`}>
                    {pick.signal || "Wait"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-sage-200 p-6">
            <h3 className="font-serif text-lg text-sage-800 mb-4">Quick Stats</h3>
            <div className="space-y-4">
              <Link href="/app/watchlist" className="flex items-center justify-between p-3 bg-sage-50 rounded-lg hover:bg-sage-100 transition-colors">
                <span className="text-sm font-medium text-sage-900">Watchlist</span>
                <span className="font-mono text-lg font-bold text-sage-800">{watchlistCount}</span>
              </Link>
              <Link href="/app/alerts" className="flex items-center justify-between p-3 bg-sage-50 rounded-lg hover:bg-sage-100 transition-colors">
                <span className="text-sm font-medium text-sage-900">Active Alerts</span>
                <span className="font-mono text-lg font-bold text-sage-800">{alertsCount}</span>
              </Link>
            </div>
          </div>

          <div className="bg-gradient-to-br from-sage-800 to-sage-700 rounded-xl p-6 text-white">
            <h3 className="font-serif text-lg mb-2">Weekly Tip</h3>
            <p className="text-sm text-sage-100 leading-relaxed">
              Dollar-cost averaging reduces risk. Invest the same amount monthly regardless of market conditions — you'll buy more shares when prices are low and fewer when high.
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}