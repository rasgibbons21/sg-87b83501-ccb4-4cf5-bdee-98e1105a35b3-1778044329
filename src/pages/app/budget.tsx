import { useState, useEffect } from "react";
import { AppLayout } from "@/components/app/AppLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Download, CheckCircle2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function BudgetPage() {
  const [userId, setUserId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedRecently, setSavedRecently] = useState(false);
  
  const [income, setIncome] = useState(0);
  const [housing, setHousing] = useState(0);
  const [food, setFood] = useState(0);
  const [transport, setTransport] = useState(0);
  const [childcare, setChildcare] = useState(0);
  const [bills, setBills] = useState(0);
  const [leisure, setLeisure] = useState(0);
  const [collegeFundPct, setCollegeFundPct] = useState(20);

  useEffect(() => {
    const loadUserData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setLoading(false);
        return;
      }

      setUserId(session.user.id);

      // Load saved budget data from profiles table
      const { data: profile } = await supabase
        .from("profiles")
        .select("monthly_budget, invest_monthly, child_age, college_goal")
        .eq("id", session.user.id)
        .single();

      if (profile?.monthly_budget) {
        // Budget data is stored as Json in Supabase
        try {
          const budgetData = typeof profile.monthly_budget === 'string' 
            ? JSON.parse(profile.monthly_budget) 
            : profile.monthly_budget as any;
            
          setIncome(Number(budgetData.income) || 0);
          setHousing(Number(budgetData.housing) || 0);
          setFood(Number(budgetData.food) || 0);
          setTransport(Number(budgetData.transport) || 0);
          setChildcare(Number(budgetData.childcare) || 0);
          setBills(Number(budgetData.bills) || 0);
          setLeisure(Number(budgetData.leisure) || 0);
          setCollegeFundPct(Number(budgetData.collegeFundPct) || 20);
        } catch (e) {
          console.error("Failed to parse budget data", e);
        }
      }

      setLoading(false);
    };

    loadUserData();
  }, []);

  // Auto-save budget data whenever inputs change
  useEffect(() => {
    if (!userId || loading) return;

    const saveBudget = async () => {
      setSaving(true);
      setSavedRecently(false);
      
      const totalExpenses = housing + food + transport + childcare + bills + leisure;
      const disposable = income - totalExpenses;
      const collegeFundAmount = (disposable * collegeFundPct) / 100;
      const investingBudget = disposable - collegeFundAmount;

      const budgetData = {
        income,
        housing,
        food,
        transport,
        childcare,
        bills,
        leisure,
        collegeFundPct,
        totalExpenses,
        disposable,
        collegeFundAmount,
        investingBudget
      };

      await supabase
        .from("profiles")
        .update({
          monthly_budget: budgetData as any,
          invest_monthly: investingBudget
        })
        .eq("id", userId);

      setSaving(false);
      setSavedRecently(true);
      
      // Hide checkmark after 2 seconds
      setTimeout(() => setSavedRecently(false), 2000);
    };

    const debounce = setTimeout(saveBudget, 1000);
    return () => clearTimeout(debounce);
  }, [income, housing, food, transport, childcare, bills, leisure, collegeFundPct, userId, loading]);

  const totalExpenses = housing + food + transport + childcare + bills + leisure;
  const disposable = income - totalExpenses;
  const collegeFundAmount = (disposable * collegeFundPct) / 100;
  const investingBudget = disposable - collegeFundAmount;
  const investmentPct = income > 0 ? (investingBudget / income) * 100 : 0;

  const getBarWidth = (amount: number) => {
    if (income === 0) return "0%";
    return `${Math.min((amount / income) * 100, 100)}%`;
  };

  const categories = [
    { name: "Housing", value: housing, color: "bg-terracotta-400" },
    { name: "Food", value: food, color: "bg-sage-400" },
    { name: "Transport", value: transport, color: "bg-champagne-500" },
    { name: "Childcare", value: childcare, color: "bg-slate-400" },
    { name: "Bills", value: bills, color: "bg-terracotta-300" },
    { name: "Leisure", value: leisure, color: "bg-sage-300" },
    { name: "College Fund", value: collegeFundAmount, color: "bg-[#6DD6A0]" },
    { name: "Investing", value: investingBudget, color: "bg-sage-600" },
  ];

  const handleExportCSV = () => {
    const headers = ["Category", "Amount", "Percentage of Income"];
    const rows = categories.map(c => [
      c.name,
      c.value.toFixed(2),
      ((c.value / income) * 100).toFixed(1) + "%"
    ]);
    
    // Add income and totals
    rows.unshift(["Monthly Take-Home Pay", income.toFixed(2), "100%"]);
    rows.push(["Total Expenses", totalExpenses.toFixed(2), ((totalExpenses / income) * 100).toFixed(1) + "%"]);
    rows.push(["Total Remaining", disposable.toFixed(2), ((disposable / income) * 100).toFixed(1) + "%"]);

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "bloom_budget_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getAITip = () => {
    if (investingBudget <= 0) {
      return "Your expenses equal or exceed your income. Focus on reducing costs or increasing income before investing.";
    } else if (investingBudget < 50) {
      return "With less than $50 monthly, start with fractional shares of VTI. Every dollar counts — even $20/month becomes $2,500+ in 5 years at 8% returns.";
    } else if (investingBudget < 200) {
      return `$${investingBudget.toFixed(0)}/month is a solid start. Split it 60% VTI and 40% QQQ. Set up automatic monthly purchases on the 1st of each month.`;
    } else if (investingBudget < 500) {
      return `Excellent! $${investingBudget.toFixed(0)}/month can build serious wealth. Allocate: 50% VTI, 30% QQQ, 20% SCHD for dividends. You're on track for $35,000+ in 5 years.`;
    } else {
      return `Outstanding! With $${investingBudget.toFixed(0)}/month you're in the top 10% of investors. Diversify: 40% VTI, 25% QQQ, 20% SCHD, 10% NVDA, 5% BND. Projected 5-year value: $${((investingBudget * 60) * 1.65).toFixed(0)}.`;
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="mb-8">
          <h1 className="font-serif text-4xl text-sage-800 mb-2">Budget Planner</h1>
          <p className="text-slate-600">Loading your budget data...</p>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="h-64 bg-sage-100 rounded-xl"></div>
          <div className="h-64 bg-sage-100 rounded-xl"></div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="font-serif text-4xl text-sage-800 mb-2">Budget Planner</h1>
        <div className="flex items-center gap-3">
          <p className="text-slate-600">Track your monthly finances and investing capacity</p>
          {saving && <span className="text-xs text-sage-600 italic animate-pulse">Saving...</span>}
          {savedRecently && !saving && (
            <div className="flex items-center gap-1.5 text-[#2D7A4A] text-xs font-medium">
              <CheckCircle2 className="w-4 h-4" />
              <span>Saved</span>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column: Inputs */}
          <div className="bg-white rounded-xl border border-sage-200 p-6 shadow-sm">
            <h2 className="font-serif text-xl text-sage-800 mb-6">Monthly Cash Flow</h2>
            
            <div className="space-y-6">
              <div>
                <Label htmlFor="income" className="text-sage-700">Monthly Take-Home Pay</Label>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                  <Input 
                    id="income" 
                    type="number" 
                    value={income || ""} 
                    onChange={(e) => setIncome(Number(e.target.value))}
                    className="pl-8"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 pt-4 border-t border-sage-100">
                <div>
                  <Label htmlFor="housing" className="text-slate-600">Housing</Label>
                  <div className="relative mt-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                    <Input id="housing" type="number" value={housing || ""} onChange={(e) => setHousing(Number(e.target.value))} className="pl-8" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="food" className="text-slate-600">Food & Groceries</Label>
                  <div className="relative mt-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                    <Input id="food" type="number" value={food || ""} onChange={(e) => setFood(Number(e.target.value))} className="pl-8" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="transport" className="text-slate-600">Transportation</Label>
                  <div className="relative mt-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                    <Input id="transport" type="number" value={transport || ""} onChange={(e) => setTransport(Number(e.target.value))} className="pl-8" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="childcare" className="text-slate-600">Childcare</Label>
                  <div className="relative mt-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                    <Input id="childcare" type="number" value={childcare || ""} onChange={(e) => setChildcare(Number(e.target.value))} className="pl-8" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="bills" className="text-slate-600">Utilities & Bills</Label>
                  <div className="relative mt-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                    <Input id="bills" type="number" value={bills || ""} onChange={(e) => setBills(Number(e.target.value))} className="pl-8" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="leisure" className="text-slate-600">Leisure & Fun</Label>
                  <div className="relative mt-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                    <Input id="leisure" type="number" value={leisure || ""} onChange={(e) => setLeisure(Number(e.target.value))} className="pl-8" />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-sage-100">
                <Label htmlFor="collegePercent" className="text-sage-700">College Fund Allocation (% of remainder)</Label>
                <div className="mt-1">
                  <Select value={collegeFundPct.toString()} onValueChange={(v) => setCollegeFundPct(Number(v))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select percentage" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10%</SelectItem>
                      <SelectItem value="15">15%</SelectItem>
                      <SelectItem value="20">20%</SelectItem>
                      <SelectItem value="25">25%</SelectItem>
                      <SelectItem value="30">30%</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Of the money left after expenses, what percentage goes to college vs personal investing?
                </p>
              </div>

              <Button onClick={handleExportCSV} className="w-full bg-sage-800 hover:bg-sage-900 text-white mt-4" size="lg">
                <Download className="w-4 h-4 mr-2" />
                Download Budget Template (CSV)
              </Button>
            </div>
          </div>

          {/* Right Column: Summary & Visualization */}
          <div className="space-y-6">
            {/* Monthly Summary Card */}
            <div className="bg-gradient-to-br from-sage-800 to-sage-700 rounded-xl p-8 text-white shadow-lg">
              <h2 className="font-serif text-2xl mb-6">Monthly Summary</h2>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-center justify-between pb-3 border-b border-sage-600">
                  <span className="text-sage-200 text-sm">Total Income</span>
                  <span className="font-mono text-xl font-bold">${income.toFixed(0)}</span>
                </div>
                <div className="flex items-center justify-between pb-3 border-b border-sage-600">
                  <span className="text-sage-200 text-sm">Total Expenses</span>
                  <span className="font-mono text-xl font-bold text-terracotta-300">${totalExpenses.toFixed(0)}</span>
                </div>
                <div className="flex items-center justify-between pb-3 border-b border-sage-600">
                  <span className="text-sage-200 text-sm">Disposable Income</span>
                  <span className="font-mono text-xl font-bold text-champagne-300">${disposable.toFixed(0)}</span>
                </div>
                <div className="flex items-center justify-between pb-3 border-b border-sage-600">
                  <span className="text-sage-200 text-sm">College Fund</span>
                  <span className="font-mono text-xl font-bold text-[#6DD6A0]">${collegeFundAmount.toFixed(0)}</span>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-white text-base font-semibold">Available to Invest</span>
                  <span className="font-mono text-3xl font-bold text-white">${investingBudget.toFixed(0)}</span>
                </div>
              </div>

              {/* Investment Percentage Ring */}
              <div className="flex items-center justify-center">
                <div className="relative w-32 h-32">
                  <svg className="w-full h-full transform -rotate-90">
                    {/* Background circle */}
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      fill="none"
                      stroke="rgba(255,255,255,0.2)"
                      strokeWidth="8"
                    />
                    {/* Progress circle */}
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      fill="none"
                      stroke="#D4AF6A"
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 56}`}
                      strokeDashoffset={`${2 * Math.PI * 56 * (1 - Math.min(investmentPct / 100, 1))}`}
                      className="transition-all duration-500"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="font-mono text-3xl font-bold text-white">{investmentPct.toFixed(0)}%</div>
                    <div className="text-xs text-sage-200">of income</div>
                  </div>
                </div>
              </div>
              <p className="text-center text-sage-200 text-xs mt-4">
                {investmentPct >= 15 ? "Excellent savings rate!" : investmentPct >= 10 ? "Good progress!" : "Keep building your budget"}
              </p>
            </div>

            {/* AI Tip */}
            <div className="bg-white rounded-xl border border-sage-200 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-champagne-500" />
                <h3 className="font-serif text-lg text-sage-800">Bloom AI Recommendation</h3>
              </div>
              <p className="text-slate-700 leading-relaxed italic">
                "{getAITip()}"
              </p>
            </div>

            {/* Income Allocation Bars */}
            <div className="bg-white rounded-xl border border-sage-200 p-6 shadow-sm">
              <h3 className="font-serif text-xl text-sage-800 mb-6">Income Allocation</h3>
              
              <div className="space-y-4">
                {categories.filter(c => c.value > 0).map((category, idx) => {
                  const percentage = income > 0 ? (category.value / income) * 100 : 0;
                  return (
                    <div key={idx}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-slate-700">{category.name}</span>
                        <span className="text-slate-500">${category.value.toFixed(0)} ({percentage.toFixed(1)}%)</span>
                      </div>
                      <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${category.color} transition-all duration-500 ease-out`}
                          style={{ width: `${Math.min(100, percentage)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {totalExpenses > income && (
                <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 text-sm">
                  ⚠️ Your expenses (${totalExpenses.toFixed(0)}) exceed your income (${income.toFixed(0)}). Please adjust your budget.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}