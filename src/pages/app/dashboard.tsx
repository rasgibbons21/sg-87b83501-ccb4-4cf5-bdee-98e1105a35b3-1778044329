import { useEffect, useState } from "react";
import { AppLayout } from "@/components/app/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { TrendingUp, DollarSign, Target, Building2 } from "lucide-react";

export default function Dashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [featuredPicks, setFeaturedPicks] = useState<any[]>([]);
  const [stats, setStats] = useState({ budget: 0, college: 0, picks: 0, brokers: 6 });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data: prof } = await supabase.from("profiles").select("*").eq("id", session.user.id).single();
    setProfile(prof);

    const { data: picks } = await supabase.from("picks").select("*").eq("is_featured", true).eq("is_active", true).limit(4);
    setFeaturedPicks(picks || []);

    const { count } = await supabase.from("picks").select("*", { count: "exact", head: true }).eq("is_active", true);

    setStats({
      budget: prof?.invest_monthly || 0,
      college: calculateCollege(prof),
      picks: count || 0,
      brokers: 6
    });
  };

  const calculateCollege = (prof: any) => {
    if (!prof?.college_goal || !prof?.child_age) return 0;
    const yearsToCollege = 18 - prof.child_age;
    const monthlyContribution = (prof.invest_monthly || 0) * 0.2;
    const annualReturn = 0.09;
    const months = yearsToCollege * 12;
    const rate = annualReturn / 12;
    return monthlyContribution * (((1 + rate) ** months - 1) / rate);
  };

  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-serif text-sage-900 mb-2">Good morning, {profile?.full_name?.split(" ")[0]}.</h1>
          <p className="text-sage-600">Here's what's happening with your investments today.</p>
        </div>

        <div className="bg-white border border-sage-200 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-champagne-100 rounded-full flex items-center justify-center">
              <span className="text-lg">☀️</span>
            </div>
            <div>
              <h3 className="font-medium text-sage-900 mb-2">Morning Brief</h3>
              <p className="text-sage-700 text-sm leading-relaxed">
                Markets opened steady this morning. Your featured picks are performing well. VTI is up 0.3% today, continuing its strong year. 
                Consider adding to your positions if you have available capital this month.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white border border-sage-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-sage-100 rounded-full flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-sage-700" />
              </div>
              <div className="text-sm text-sage-600">Monthly Budget</div>
            </div>
            <div className="text-3xl font-serif text-sage-900">${stats.budget.toFixed(0)}</div>
          </div>

          <div className="bg-white border border-sage-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-champagne-100 rounded-full flex items-center justify-center">
                <Target className="w-5 h-5 text-champagne-600" />
              </div>
              <div className="text-sm text-sage-600">College Projection</div>
            </div>
            <div className="text-3xl font-serif text-sage-900">${stats.college.toFixed(0)}</div>
          </div>

          <div className="bg-white border border-sage-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-terracotta-100 rounded-full flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-terracotta-600" />
              </div>
              <div className="text-sm text-sage-600">Active Picks</div>
            </div>
            <div className="text-3xl font-serif text-sage-900">{stats.picks}</div>
          </div>

          <div className="bg-white border border-sage-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-sage-100 rounded-full flex items-center justify-center">
                <Building2 className="w-5 h-5 text-sage-700" />
              </div>
              <div className="text-sm text-sage-600">Brokers Reviewed</div>
            </div>
            <div className="text-3xl font-serif text-sage-900">{stats.brokers}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-2xl font-serif text-sage-900">Featured Picks</h2>
            <div className="space-y-3">
              {featuredPicks.map(pick => (
                <div key={pick.id} className="bg-white border border-sage-200 rounded-xl p-4 flex items-center justify-between hover:border-sage-300 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col">
                      <span className="font-mono text-lg font-bold text-sage-900">{pick.ticker}</span>
                      <span className="text-xs text-sage-600">{pick.type.toUpperCase()}</span>
                    </div>
                    <div>
                      <div className="text-sage-900 font-medium">{pick.name}</div>
                      <div className="text-xs text-sage-600">{pick.entry_display || "Entry: Market"}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-mono text-lg text-sage-900">${pick.price?.toFixed(2) || "--"}</div>
                      <div className={`text-xs font-mono ${pick.price_up ? "text-green-600" : "text-red-600"}`}>
                        {pick.change_pct > 0 ? "+" : ""}{pick.change_pct?.toFixed(2)}%
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                      pick.signal === "buy" ? "bg-green-50 text-green-700 border border-green-200" :
                      pick.signal === "hold" ? "bg-amber-50 text-amber-700 border border-amber-200" :
                      "bg-red-50 text-red-700 border border-red-200"
                    }`}>
                      {pick.signal?.toUpperCase()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-gradient-to-br from-sage-800 to-sage-900 rounded-xl p-6 text-white">
              <h3 className="text-lg font-serif mb-2">College Fund Snapshot</h3>
              <div className="text-3xl font-serif mb-1">${stats.college.toFixed(0)}</div>
              <div className="text-sage-200 text-sm">Projected at age 18</div>
              <div className="mt-4 pt-4 border-t border-sage-700">
                <div className="text-xs text-sage-300 mb-1">Monthly Contribution</div>
                <div className="text-lg font-mono">${((profile?.invest_monthly || 0) * 0.2).toFixed(0)}</div>
              </div>
            </div>

            <div className="bg-white border border-sage-200 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">💡</span>
                <h3 className="font-medium text-sage-900">Weekly Tip</h3>
              </div>
              <p className="text-sm text-sage-700 leading-relaxed">
                Consider dollar-cost averaging: investing the same amount each month reduces the impact of market volatility and builds discipline.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}