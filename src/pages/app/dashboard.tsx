import { useEffect, useState } from "react";
import { AppLayout } from "@/components/app/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { TrendingUp, TrendingDown, DollarSign, Target, Bell, Star } from "lucide-react";
import Link from "next/link";
import { Line, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface Profile {
  full_name: string;
  monthly_budget: number;
  invest_monthly: number;
  college_goal: number;
  child_age: number;
}

interface Pick {
  id: string;
  ticker: string;
  name: string;
  type: string;
  price: number;
  change_pct: number;
  price_up: boolean;
  signal: string;
  is_featured: boolean;
}

export default function Dashboard() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [featuredPicks, setFeaturedPicks] = useState<Pick[]>([]);
  const [watchlistCount, setWatchlistCount] = useState(0);
  const [alertsCount, setAlertsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Mock portfolio data - in production this would come from user's actual holdings
  const portfolioValue = 4287.50;
  const todayChange = 48.20;
  const todayChangePct = 1.14;
  const totalGain = 287.50;
  const totalGainPct = 7.19;

  useEffect(() => {
    loadDashboard();

    const interval = setInterval(async () => {
      const { data: pricesData } = await fetch("/api/prices").then(r => r.json()).catch(() => ({ data: [] }));
      if (pricesData && Array.isArray(pricesData)) {
        setFeaturedPicks(prev => prev.map(pick => {
          const priceUpdate = pricesData.find((p: any) => p.ticker === pick.ticker);
          return priceUpdate ? { ...pick, price: priceUpdate.price, change_pct: priceUpdate.changePct, price_up: priceUpdate.priceUp } : pick;
        }));
      }
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const loadDashboard = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    const [profileData, picksData, watchlistData, alertsData] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", session.user.id).single(),
      supabase.from("picks").select("*").eq("is_featured", true).eq("is_active", true).limit(4),
      supabase.from("watchlist").select("id").eq("user_id", session.user.id),
      supabase.from("price_alerts").select("id").eq("user_id", session.user.id).eq("is_active", true)
    ]);

    if (profileData.data) setProfile(profileData.data);
    if (picksData.data) setFeaturedPicks(picksData.data);
    if (watchlistData.data) setWatchlistCount(watchlistData.data.length);
    if (alertsData.data) setAlertsCount(alertsData.data.length);

    setLoading(false);
  };

  const getSignalColor = (signal: string) => {
    const s = signal?.toLowerCase() || "wait";
    if (s === "buy") return "text-[#2D7A4A] bg-[#E8F5EE]";
    if (s === "hold") return "text-[#C4921A] bg-[#FEF3DC]";
    return "text-[#C04040] bg-[#FDEAEA]";
  };

  // Performance chart data (last 30 days)
  const performanceData = {
    labels: ["30d", "25d", "20d", "15d", "10d", "5d", "Today"],
    datasets: [
      {
        label: "Portfolio Value",
        data: [4000, 4050, 4120, 4180, 4220, 4250, 4287.50],
        borderColor: "#2D4A3E",
        backgroundColor: "rgba(45, 74, 62, 0.1)",
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointBackgroundColor: "#2D4A3E",
      }
    ]
  };

  const performanceOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#2D4A3E",
        padding: 12,
        titleFont: { size: 13 },
        bodyFont: { size: 14, family: "JetBrains Mono" },
        callbacks: {
          label: (context: any) => `$${context.parsed.y.toFixed(2)}`
        }
      }
    },
    scales: {
      y: {
        ticks: {
          callback: (value: any) => `$${value}`,
          font: { family: "JetBrains Mono", size: 11 }
        },
        grid: { color: "#E8F2ED" }
      },
      x: {
        ticks: { font: { size: 11 } },
        grid: { display: false }
      }
    }
  };

  // Allocation donut chart
  const allocationData = {
    labels: ["ETFs", "Stocks", "Bonds"],
    datasets: [
      {
        data: [58, 35, 7],
        backgroundColor: ["#2D4A3E", "#C4714A", "#D4AF6A"],
        borderWidth: 0
      }
    ]
  };

  const allocationOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          padding: 16,
          font: { size: 12 },
          generateLabels: (chart: any) => {
            const data = chart.data;
            return data.labels.map((label: string, i: number) => ({
              text: `${label} ${data.datasets[0].data[i]}%`,
              fillStyle: data.datasets[0].backgroundColor[i],
              hidden: false,
              index: i
            }));
          }
        }
      },
      tooltip: {
        callbacks: {
          label: (context: any) => `${context.label}: ${context.parsed}%`
        }
      }
    }
  };

  const collegeProjection = profile?.college_goal && profile?.child_age
    ? (profile.invest_monthly * 0.2 * 12 * (18 - profile.child_age) * 1.12).toFixed(0)
    : "0";

  if (loading) {
    return (
      <AppLayout>
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-slate-200 rounded w-1/3"></div>
            <div className="grid md:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => <div key={i} className="h-32 bg-slate-200 rounded-xl"></div>)}
            </div>
            <div className="h-64 bg-slate-200 rounded-xl"></div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="font-serif text-3xl text-sage-800 mb-2">
            Welcome back, {profile?.full_name?.split(" ")[0] || "there"}
          </h1>
          <p className="text-slate-600">Here's how your investments are performing today.</p>
        </div>

        {/* Portfolio Overview Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl border border-sage-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="text-slate-600 text-sm font-medium">Total Portfolio Value</span>
              <DollarSign className="w-5 h-5 text-sage-600" />
            </div>
            <div className="font-serif text-4xl text-sage-900 mb-2">${portfolioValue.toLocaleString()}</div>
            <div className="flex items-center gap-2">
              {todayChange >= 0 ? (
                <TrendingUp className="w-4 h-4 text-[#6DD6A0]" />
              ) : (
                <TrendingDown className="w-4 h-4 text-[#F09090]" />
              )}
              <span className={`font-mono text-sm font-semibold ${todayChange >= 0 ? 'text-[#6DD6A0]' : 'text-[#F09090]'}`}>
                {todayChange >= 0 ? '+' : ''}${Math.abs(todayChange).toFixed(2)} ({todayChange >= 0 ? '+' : ''}{todayChangePct.toFixed(2)}%)
              </span>
              <span className="text-xs text-slate-500">today</span>
            </div>
          </div>

          <div className="bg-[#E8F5EE] rounded-xl border border-[#BCE8D3] p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[#2D6A4F] text-sm font-medium">All-Time Return</span>
              <TrendingUp className="w-5 h-5 text-[#2D7A4A]" />
            </div>
            <div className="font-serif text-4xl text-[#1B4332] mb-2">+${totalGain.toFixed(2)}</div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-semibold text-[#2D7A4A]">+{totalGainPct.toFixed(2)}%</span>
              <span className="text-xs text-[#52796F]">since you started</span>
            </div>
          </div>

          <div className="bg-sage-50 rounded-xl border border-sage-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sage-700 text-sm font-medium">Monthly Budget</span>
              <Target className="w-5 h-5 text-sage-600" />
            </div>
            <div className="font-serif text-4xl text-sage-900 mb-2">${profile?.invest_monthly?.toFixed(0) || "0"}</div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-600">allocated for investing</span>
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: Performance Chart */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl border border-sage-200 p-6 shadow-sm">
              <h2 className="font-serif text-xl text-sage-800 mb-6">Portfolio Performance</h2>
              <div className="h-64">
                <Line data={performanceData} options={performanceOptions} />
              </div>
            </div>

            {/* Featured Picks */}
            <div className="bg-white rounded-xl border border-sage-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-serif text-xl text-sage-800">Featured Picks</h2>
                <Link href="/app/picks" className="text-sm text-sage-600 hover:text-sage-800 font-medium">
                  View all →
                </Link>
              </div>
              <div className="space-y-3">
                {featuredPicks.map((pick) => (
                  <div key={pick.id} className="flex items-center justify-between p-4 rounded-lg border border-sage-100 hover:border-sage-300 transition-colors">
                    <div className="flex items-center gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-lg font-bold text-sage-800">{pick.ticker}</span>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium uppercase ${getSignalColor(pick.signal)}`}>
                            {pick.signal}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600">{pick.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-lg font-semibold text-slate-900">${pick.price?.toFixed(2) || "—"}</div>
                      <div className={`font-mono text-sm ${pick.price_up ? 'text-[#6DD6A0]' : 'text-[#F09090]'}`}>
                        {pick.price_up ? '+' : ''}{pick.change_pct?.toFixed(2) || "0.00"}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-white rounded-xl border border-sage-200 p-6 shadow-sm">
              <h3 className="font-serif text-lg text-sage-800 mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <Link href="/app/watchlist" className="flex items-center justify-between p-3 rounded-lg hover:bg-sage-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <Star className="w-5 h-5 text-champagne-500" />
                    <span className="text-sm font-medium text-slate-700">Watchlist</span>
                  </div>
                  <span className="font-mono text-lg font-bold text-sage-800">{watchlistCount}</span>
                </Link>

                <Link href="/app/alerts" className="flex items-center justify-between p-3 rounded-lg hover:bg-sage-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-champagne-500" />
                    <span className="text-sm font-medium text-slate-700">Active Alerts</span>
                  </div>
                  <span className="font-mono text-lg font-bold text-sage-800">{alertsCount}</span>
                </Link>

                <Link href="/app/college" className="flex items-center justify-between p-3 rounded-lg hover:bg-sage-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <Target className="w-5 h-5 text-[#2D7A4A]" />
                    <span className="text-sm font-medium text-slate-700">College Fund</span>
                  </div>
                  <span className="font-mono text-lg font-bold text-[#2D7A4A]">${collegeProjection}</span>
                </Link>
              </div>
            </div>

            {/* Allocation Chart */}
            <div className="bg-white rounded-xl border border-sage-200 p-6 shadow-sm">
              <h3 className="font-serif text-lg text-sage-800 mb-4">Asset Allocation</h3>
              <div className="h-48">
                <Doughnut data={allocationData} options={allocationOptions} />
              </div>
            </div>

            {/* Weekly Tip */}
            <div className="bg-gradient-to-br from-sage-50 to-champagne-50 rounded-xl border border-sage-200 p-6">
              <h3 className="font-serif text-lg text-sage-800 mb-3">💡 Weekly Tip</h3>
              <p className="text-sm text-slate-700 leading-relaxed">
                Dollar-cost averaging means investing the same amount monthly regardless of price. 
                When prices are high you buy fewer shares. When prices dip you buy more. 
                Over time this smooths out volatility and often beats trying to time the market.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}