import { useState, useEffect } from "react";
import { AppLayout } from "@/components/app/AppLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function BudgetPage() {
  const [userId, setUserId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
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
        // Parse saved budget JSON if it exists
        try {
          const budgetData = JSON.parse(profile.monthly_budget);
          setIncome(budgetData.income || 0);
          setHousing(budgetData.housing || 0);
          setFood(budgetData.food || 0);
          setTransport(budgetData.transport || 0);
          setChildcare(budgetData.childcare || 0);
          setBills(budgetData.bills || 0);
          setLeisure(budgetData.leisure || 0);
          setCollegeFundPct(budgetData.collegeFundPct || 20);
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
          monthly_budget: JSON.stringify(budgetData),
          invest_monthly: investingBudget
        })
        .eq("id", userId);

      setSaving(false);
    };

    const debounce = setTimeout(saveBudget, 1000);
    return () => clearTimeout(debounce);
  }, [income, housing, food, transport, childcare, bills, leisure, collegeFundPct, userId, loading]);

  const totalExpenses = housing + food + transport + childcare + bills + leisure;
  const disposable = income - totalExpenses;
  const collegeFundAmount = (disposable * collegeFundPct) / 100;
  const investingBudget = disposable - collegeFundAmount;

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
        <div className="flex items-center gap-2">
          <p className="text-slate-600">Track your monthly finances and investing capacity</p>
          {saving && <span className="text-xs text-sage-600 italic">• Saving...</span>}
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

          {/* Right Column: Visualization & Results */}
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#E6F7EF] rounded-xl p-6 border border-[#BCE8D3]">
                <h3 className="text-[#2D6A4F] font-medium text-sm mb-1 uppercase tracking-wider">Monthly College Fund</h3>
                <div className="font-serif text-4xl text-[#1B4332]">${collegeFundAmount.toFixed(0)}</div>
              </div>
              <div className="bg-sage-50 rounded-xl p-6 border border-sage-200">
                <h3 className="text-sage-700 font-medium text-sm mb-1 uppercase tracking-wider">Personal Investing</h3>
                <div className="font-serif text-4xl text-sage-900">${investingBudget.toFixed(0)}</div>
              </div>
            </div>

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