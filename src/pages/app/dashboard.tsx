import { useEffect, useState } from "react";
import { AppLayout } from "@/components/app/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import Link from "next/link";
import { TrendingUp, DollarSign, Target, BookOpen, Star, Sparkles, Calendar, TrendingDown } from "lucide-react";

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
  is_featured: boolean;
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string>("");
  const [userName, setUserName] = useState<string>("");
  const [monthlyBudget, setMonthlyBudget] = useState(0);
  const [collegeFundProjection, setCollegeFundProjection] = useState(0);
  const [watchlistCount, setWatchlistCount] = useState(0);
  const [journalCount, setJournalCount] = useState(0);
  const [featuredPicks, setFeaturedPicks] = useState<Pick[]>([]);
  const [signupDate, setSignupDate] = useState<Date | null>(null);
  const [monthsInvesting, setMonthsInvesting] = useState(0);
  const [totalContributions, setTotalContributions] = useState(0);
  const [todaysAction, setTodaysAction] = useState<string>("");

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
        .select("full_name, invest_monthly, college_goal, child_age, created_at")
        .eq("id", session.user.id)
        .single();

      if (profile) {
        setUserName(profile.full_name?.split(" ")[0] || "");
        const investMonthly = profile.invest_monthly || 0;
        setMonthlyBudget(investMonthly);
        
        // Calculate college fund projection
        if (profile.college_goal && profile.child_age !== null) {
          const yearsToCollege = Math.max(18 - profile.child_age, 1);
          const monthsToCollege = yearsToCollege * 12;
          
          // Future value of annuity formula with 8% annual return
          const monthlyRate = 0.08 / 12;
          const futureValue = investMonthly * (((Math.pow(1 + monthlyRate, monthsToCollege) - 1) / monthlyRate));
          
          setCollegeFundProjection(futureValue);
        }

        // Calculate months since signup
        if (profile.created_at) {
          const signup = new Date(profile.created_at);
          setSignupDate(signup);
          const now = new Date();
          const months = Math.floor((now.getTime() - signup.getTime()) / (1000 * 60 * 60 * 24 * 30));
          setMonthsInvesting(Math.max(months, 0));
          setTotalContributions(investMonthly * Math.max(months, 1));
        }
      }

      // Load watchlist count
      const { count: watchlistCnt } = await supabase
        .from("watchlist")
        .select("*", { count: "exact", head: true })
        .eq("user_id", session.user.id);
      setWatchlistCount(watchlistCnt || 0);

      // Load journal count
      const { count: journalCnt } = await supabase
        .from("journal_entries")
        .select("*", { count: "exact", head: true })
        .eq("user_id", session.user.id);
      setJournalCount(journalCnt || 0);

      // Load featured picks with current signals
      const { data: picks } = await supabase
        .from("picks")
        .select("*")
        .eq("is_featured", true)
        .eq("is_active", true)
        .limit(4);

      if (picks) {
        setFeaturedPicks(picks);
        
        // Generate today's action based on budget and signals
        const buySignals = picks.filter(p => p.signal?.toLowerCase() === "buy");
        const budget = profile?.invest_monthly || 0;
        
        if (budget === 0) {
          setTodaysAction("Set up your monthly budget in the Budget Planner to get started with investing!");
        } else if (budget < 50) {
          const topPick = buySignals[0] || picks[0];
          setTodaysAction(`You have $${budget.toFixed(0)} to invest this month. Start with fractional shares of ${topPick?.ticker} — even small amounts grow with time.`);
        } else if (budget < 100) {
          const topPick = buySignals[0] || picks[0];
          setTodaysAction(`You have $${budget.toFixed(0)} to invest this month. Put it all into ${topPick?.ticker} for broad diversification.`);
        } else if (budget < 200) {
          const pick1 = buySignals[0] || picks[0];
          const pick2 = buySignals[1] || picks[1];
          const split1 = Math.round(budget * 0.6);
          const split2 = budget - split1;
          setTodaysAction(`You have $${budget.toFixed(0)} to invest this month. Based on current signals: $${split1} into ${pick1?.ticker} and $${split2} into ${pick2?.ticker}.`);
        } else {
          const pick1 = buySignals[0] || picks[0];
          const pick2 = buySignals[1] || picks[1];
          const pick3 = buySignals[2] || picks[2];
          const split1 = Math.round(budget * 0.5);
          const split2 = Math.round(budget * 0.3);
          const split3 = budget - split1 - split2;
          setTodaysAction(`You have $${budget.toFixed(0)} to invest this month. Recommended split: $${split1} into ${pick1?.ticker}, $${split2} into ${pick2?.ticker}, and $${split3} into ${pick3?.ticker}.`);
        }
      }

      setLoading(false);
    };

    loadDashboardData();

    // Refresh prices every 60s
    const interval = setInterval(async () => {
      try {
        const pricesResponse = await fetch("/api/prices");
        if (pricesResponse.ok) {
          const pricesData = await pricesResponse.json();
          setFeaturedPicks(prev => prev.map(pick => {
            const priceUpdate = pricesData.find((p: any) => p.ticker === pick.ticker);
            return priceUpdate ? { ...pick, price: priceUpdate.price, change_pct: priceUpdate.changePct, price_up: priceUpdate.priceUp } : pick;
          }));
        }
      } catch (err) {
        console.error("Price update error:", err);
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
          <div className="grid md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-sage-100 rounded-xl"></div>
            ))}
          </div>
          <div className="h-64 bg-sage-100 rounded-xl"></div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="h-96 bg-sage-100 rounded-xl"></div>
            <div className="h-96 bg-sage-100 rounded-xl"></div>
          </div>
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
        <p className="text-slate-600">Your personalized investment overview</p>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-sage-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <DollarSign className="w-8 h-8 text-sage-600" />
          </div>
          <div className="font-mono text-3xl font-bold text-sage-900 mb-1">
            ${monthlyBudget.toFixed(0)}
          </div>
          <div className="text-sm text-slate-600">Monthly Investing Budget</div>
          <Link href="/app/budget" className="text-xs text-sage-600 hover:text-sage-800 mt-2 inline-block">
            Update budget →
          </Link>
        </div>

        <div className="bg-white rounded-xl border border-sage-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <Target className="w-8 h-8 text-champagne-500" />
          </div>
          <div className="font-mono text-3xl font-bold text-sage-900 mb-1">
            ${collegeFundProjection.toFixed(0)}
          </div>
          <div className="text-sm text-slate-600">College Fund Projection</div>
          <Link href="/app/college" className="text-xs text-sage-600 hover:text-sage-800 mt-2 inline-block">
            View details →
          </Link>
        </div>

        <div className="bg-white rounded-xl border border-sage-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <Star className="w-8 h-8 text-champagne-500" />
          </div>
          <div className="font-mono text-3xl font-bold text-sage-900 mb-1">{watchlistCount}</div>
          <div className="text-sm text-slate-600">Watchlist Tickers</div>
          <Link href="/app/watchlist" className="text-xs text-sage-600 hover:text-sage-800 mt-2 inline-block">
            Manage watchlist →
          </Link>
        </div>

        <div className="bg-white rounded-xl border border-sage-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <BookOpen className="w-8 h-8 text-sage-600" />
          </div>
          <div className="font-mono text-3xl font-bold text-sage-900 mb-1">{journalCount}</div>
          <div className="text-sm text-slate-600">Trades Logged</div>
          <Link href="/app/journal" className="text-xs text-sage-600 hover:text-sage-800 mt-2 inline-block">
            View journal →
          </Link>
        </div>
      </div>

      {/* Today's Action Card */}
      <div className="bg-gradient-to-br from-sage-800 to-sage-700 rounded-xl p-8 text-white mb-8 shadow-lg">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-champagne-400 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-6 h-6 text-sage-900" />
          </div>
          <div className="flex-1">
            <h2 className="font-serif text-2xl mb-2">Today's Action</h2>
            <p className="text-sage-100 leading-relaxed text-lg">
              {todaysAction}
            </p>
            <Link 
              href="/app/picks" 
              className="inline-block mt-4 px-6 py-2 bg-champagne-400 text-sage-900 rounded-lg font-semibold hover:bg-champagne-300 transition-colors"
            >
              View All Picks →
            </Link>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Featured Picks */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-sage-200 p-8 shadow-sm">
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

        {/* Progress Card */}
        <div className="bg-white rounded-xl border border-sage-200 p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <Calendar className="w-6 h-6 text-sage-600" />
            <h2 className="font-serif text-xl text-sage-800">Your Progress</h2>
          </div>

          <div className="space-y-6">
            <div>
              <div className="text-sm text-slate-600 mb-1">Months Investing</div>
              <div className="font-mono text-3xl font-bold text-sage-900">
                {monthsInvesting === 0 ? "<1" : monthsInvesting}
              </div>
              {signupDate && (
                <div className="text-xs text-slate-500 mt-1">
                  Since {signupDate.toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                </div>
              )}
            </div>

            <div className="border-t border-sage-100 pt-6">
              <div className="text-sm text-slate-600 mb-1">Total Contributions</div>
              <div className="font-mono text-2xl font-bold text-sage-900 mb-2">
                ${totalContributions.toFixed(0)}
              </div>
              <div className="text-xs text-slate-500 leading-relaxed">
                If you invested ${monthlyBudget.toFixed(0)}/month consistently since signup
              </div>
            </div>

            <div className="border-t border-sage-100 pt-6">
              <div className="bg-sage-50 rounded-lg p-4">
                <div className="text-xs text-sage-700 font-semibold mb-2">💡 INSIGHT</div>
                <div className="text-sm text-sage-800 leading-relaxed">
                  {monthsInvesting < 3 
                    ? "The first 90 days are about building the habit. Stay consistent!"
                    : monthsInvesting < 12
                    ? "You're building momentum! Time in the market beats timing the market."
                    : "Over a year of investing! Compounding is working for you."}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Tip */}
      <div className="bg-gradient-to-r from-champagne-100 to-sage-100 rounded-xl p-6 border border-champagne-200">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5 text-sage-700" />
          </div>
          <div>
            <h3 className="font-serif text-lg text-sage-900 mb-2">Weekly Tip from Bloom</h3>
            <p className="text-sage-800 leading-relaxed">
              Dollar-cost averaging reduces risk. Invest the same amount monthly regardless of market conditions — you'll buy more shares when prices are low and fewer when high. This strategy has historically outperformed trying to time the market.
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}