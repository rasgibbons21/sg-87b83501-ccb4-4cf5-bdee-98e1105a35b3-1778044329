"use client";

import { useState, useEffect } from "react";
import { AppLayout } from "@/components/app/AppLayout";
import { GraduationCap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import Link from "next/link";

export default function CollegeFundPage() {
  const [userId, setUserId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [monthlyContribution, setMonthlyContribution] = useState(200);
  const [childAge, setChildAge] = useState(5);
  const [expectedReturn, setExpectedReturn] = useState(8);
  const [targetCost, setTargetCost] = useState(100000);

  useEffect(() => {
    const loadUserData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setLoading(false);
        return;
      }

      setUserId(session.user.id);

      // Load saved college fund settings
      const { data: profile } = await supabase
        .from("profiles")
        .select("child_age, college_goal, invest_monthly")
        .eq("id", session.user.id)
        .single();

      if (profile) {
        if (profile.child_age) setChildAge(profile.child_age);
        if (profile.college_goal) setTargetCost(profile.college_goal);
        if (profile.invest_monthly) setMonthlyContribution(Math.min(profile.invest_monthly, 1000));
      }

      setLoading(false);
    };

    loadUserData();
  }, []);

  // Auto-save college settings when sliders change
  useEffect(() => {
    if (!userId || loading) return;

    const saveSettings = async () => {
      setSaving(true);

      await supabase
        .from("profiles")
        .update({
          child_age: childAge,
          college_goal: targetCost
        })
        .eq("id", userId);

      setSaving(false);
    };

    const debounce = setTimeout(saveSettings, 1000);
    return () => clearTimeout(debounce);
  }, [childAge, targetCost, userId, loading]);

  const yearsToCollege = 18 - childAge;
  const months = yearsToCollege * 12;
  const monthlyRate = expectedReturn / 100 / 12;
  
  const projectedValue = monthlyContribution * (((1 + monthlyRate) ** months - 1) / monthlyRate);
  const totalContributed = monthlyContribution * months;
  const investmentGrowth = projectedValue - totalContributed;
  const goalProgress = (projectedValue / targetCost) * 100;

  if (loading) {
    return (
      <AppLayout>
        <div className="mb-8">
          <h1 className="font-serif text-4xl text-sage-800 mb-2">College Fund Planner</h1>
          <p className="text-slate-600">Loading your college fund data...</p>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="h-96 bg-sage-100 rounded-xl"></div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="font-serif text-4xl text-sage-800 mb-2">College Fund Planner</h1>
        <div className="flex items-center gap-2">
          <p className="text-slate-600">Project your child's college savings growth</p>
          {saving && <span className="text-xs text-sage-600 italic">• Saving...</span>}
        </div>
      </div>

      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-serif text-sage-900 mb-2">College Fund Calculator</h1>
          <p className="text-sage-600">Plan for your child's education with compound interest.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-white border border-sage-200 rounded-xl p-6">
              <h3 className="font-medium text-sage-900 mb-6">Your Inputs</h3>
              
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm text-sage-600">Monthly Contribution</label>
                    <span className="font-mono text-lg text-sage-900">${monthlyContribution}</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="1000"
                    step="50"
                    value={monthlyContribution}
                    onChange={(e) => setMonthlyContribution(Number(e.target.value))}
                    className="w-full accent-sage-800"
                  />
                  <div className="flex justify-between text-xs text-sage-500 mt-1">
                    <span>$50</span>
                    <span>$1,000</span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm text-sage-600">Child's Current Age</label>
                    <span className="font-mono text-lg text-sage-900">{childAge} years</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="17"
                    value={childAge}
                    onChange={(e) => setChildAge(Number(e.target.value))}
                    className="w-full accent-sage-800"
                  />
                  <div className="flex justify-between text-xs text-sage-500 mt-1">
                    <span>0</span>
                    <span>17</span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm text-sage-600">Expected Annual Return</label>
                    <span className="font-mono text-lg text-sage-900">{expectedReturn}%</span>
                  </div>
                  <input
                    type="range"
                    min="4"
                    max="12"
                    value={expectedReturn}
                    onChange={(e) => setExpectedReturn(Number(e.target.value))}
                    className="w-full accent-sage-800"
                  />
                  <div className="flex justify-between text-xs text-sage-500 mt-1">
                    <span>4%</span>
                    <span>12%</span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm text-sage-600">Target College Cost</label>
                    <span className="font-mono text-lg text-sage-900">${targetCost.toLocaleString()}</span>
                  </div>
                  <input
                    type="range"
                    min="20000"
                    max="250000"
                    step="10000"
                    value={targetCost}
                    onChange={(e) => setTargetCost(Number(e.target.value))}
                    className="w-full accent-sage-800"
                  />
                  <div className="flex justify-between text-xs text-sage-500 mt-1">
                    <span>$20K</span>
                    <span>$250K</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-sage-200 rounded-xl p-6">
              <h3 className="font-medium text-sage-900 mb-4">Recommended College Portfolio</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-sage-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-sage-600"></div>
                    <span className="text-sm font-medium">VTI Total Market</span>
                  </div>
                  <span className="font-mono text-sm">60%</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-champagne-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-champagne-600"></div>
                    <span className="text-sm font-medium">QQQ Growth</span>
                  </div>
                  <span className="font-mono text-sm">20%</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-terracotta-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-terracotta-600"></div>
                    <span className="text-sm font-medium">SCHD Dividend</span>
                  </div>
                  <span className="font-mono text-sm">10%</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-sage-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-sage-300"></div>
                    <span className="text-sm font-medium">BND Bonds</span>
                  </div>
                  <span className="font-mono text-sm">10%</span>
                </div>
              </div>
              <p className="text-xs text-sage-600 mt-4 leading-relaxed">
                This balanced portfolio combines growth (VTI, QQQ), income (SCHD), and stability (BND). 
                As your child approaches college age, consider shifting more to bonds for capital preservation.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-gradient-to-br from-sage-800 to-sage-900 rounded-xl p-8 text-white">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-champagne-600 rounded-full flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-xs text-sage-300 uppercase tracking-wider">Projected at Age 18</div>
                  <div className="text-4xl font-serif">${projectedValue.toFixed(0)}</div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-sage-700">
                  <span className="text-sage-300 text-sm">Years to College</span>
                  <span className="font-mono text-xl">{yearsToCollege}</span>
                </div>
                <div className="flex items-center justify-between pb-3 border-b border-sage-700">
                  <span className="text-sage-300 text-sm">Total Contributed</span>
                  <span className="font-mono text-xl">${totalContributed.toFixed(0)}</span>
                </div>
                <div className="flex items-center justify-between pb-3 border-b border-sage-700">
                  <span className="text-sage-300 text-sm">Investment Growth</span>
                  <span className="font-mono text-xl text-champagne-300">${investmentGrowth.toFixed(0)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sage-300 text-sm">Goal Progress</span>
                  <span className="font-mono text-xl">{Math.min(goalProgress, 100).toFixed(0)}%</span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-sage-700">
                <div className="text-xs text-sage-300 mb-2">Monthly Amount Needed for Goal</div>
                <div className="text-3xl font-serif">
                  ${((targetCost * monthlyRate) / (((1 + monthlyRate) ** months - 1))).toFixed(0)}
                </div>
              </div>
            </div>

            <div className="bg-white border border-sage-200 rounded-xl p-6">
              <h3 className="font-medium text-sage-900 mb-4">Growth Over Time</h3>
              <div className="h-48 flex items-end justify-between gap-2">
                {Array.from({ length: yearsToCollege > 0 ? Math.min(yearsToCollege, 10) : 1 }).map((_, i) => {
                  const year = i + 1;
                  const m = year * 12;
                  const val = monthlyContribution * (((1 + monthlyRate) ** m - 1) / monthlyRate);
                  const height = (val / projectedValue) * 100;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full bg-sage-600 rounded-t transition-all" style={{ height: `${height}%` }} />
                      <span className="text-xs text-sage-600">Y{year}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}