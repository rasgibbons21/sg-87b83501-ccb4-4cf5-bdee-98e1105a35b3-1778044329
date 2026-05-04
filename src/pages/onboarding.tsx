import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Baby, Briefcase, Home, Sparkles, TrendingUp, GraduationCap, Sunset } from "lucide-react";

export default function Onboarding() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<any>(null);

  // Step 2
  const [situation, setSituation] = useState("");

  // Step 3
  const [income, setIncome] = useState(5000);
  const [expenses, setExpenses] = useState({ housing: 1500, food: 600, transport: 400, childcare: 800, bills: 300, leisure: 200 });
  const [collegePercent, setCollegePercent] = useState(20);

  const disposable = income - Object.values(expenses).reduce((a, b) => a + b, 0);
  const collegeAmount = Math.max(0, disposable * (collegePercent / 100));
  const investAmount = Math.max(0, disposable - collegeAmount);

  // Step 4
  const [goals, setGoals] = useState<string[]>([]);
  const [childAge, setChildAge] = useState(5);
  const [collegeTarget, setCollegeTarget] = useState(100000);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push("/");
      return;
    }
    const { data } = await supabase.from("profiles").select("*").eq("id", session.user.id).single();
    if (data?.onboarding_completed) {
      router.push("/app/dashboard");
      return;
    }
    setProfile(data);
    if (data?.onboarding_step) setStep(data.onboarding_step > 0 ? data.onboarding_step : 1);
    setLoading(false);
  };

  const saveProgress = async (nextStep: number) => {
    setStep(nextStep);
    await supabase.from("profiles").update({ onboarding_step: nextStep }).eq("id", profile.id);
  };

  const finishSetup = async () => {
    await supabase.from("profiles").update({
      monthly_budget: investAmount,
      college_goal: collegeTarget,
      child_age: childAge,
      invest_monthly: investAmount + collegeAmount,
      onboarding_completed: true,
      onboarding_step: 5
    }).eq("id", profile.id);
    router.push("/app/dashboard");
  };

  const toggleGoal = (g: string) => {
    setGoals(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g]);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-ivory">Loading...</div>;

  return (
    <div className="min-h-screen bg-ivory flex flex-col">
      <div className="h-1 bg-sage-100">
        <div className="h-full bg-sage-600 transition-all duration-500" style={{ width: `${(step / 5) * 100}%` }} />
      </div>

      <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full p-6 pt-12">
        {step > 1 && step < 5 && (
          <button onClick={() => saveProgress(step - 1)} className="flex items-center text-sage-600 mb-8 hover:text-sage-900 transition-colors w-fit">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </button>
        )}

        {/* STEP 1: Welcome */}
        {step === 1 && (
          <div className="flex-1 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-500">
            <div className="w-20 h-20 bg-sage-100 rounded-full flex items-center justify-center mb-8 text-4xl">🌿</div>
            <h1 className="text-4xl font-serif text-sage-900 mb-4">Welcome to Bloom, {profile?.full_name?.split(" ")[0] || "there"}.</h1>
            <p className="text-sage-700 text-lg mb-12 max-w-md">Let's set up your investing profile in 5 quick steps.</p>
            <Button onClick={() => saveProgress(2)} className="bg-sage-800 hover:bg-sage-900 text-white w-full sm:w-64 h-14 text-lg">
              Continue <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        )}

        {/* STEP 2: Situation */}
        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <h1 className="text-3xl font-serif text-sage-900 mb-2">Tell us about yourself.</h1>
            <p className="text-sage-600 mb-8">This helps us personalize your dashboard.</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
              {[
                { id: "single", label: "Single Mom", icon: Baby },
                { id: "sahm", label: "Stay-at-Home Mom", icon: Home },
                { id: "working", label: "Working Mom", icon: Briefcase },
                { id: "other", label: "Other", icon: Sparkles }
              ].map(s => (
                <button
                  key={s.id}
                  onClick={() => setSituation(s.id)}
                  className={`p-6 rounded-xl border-2 text-left transition-all ${
                    situation === s.id ? "border-sage-800 bg-sage-50" : "border-sage-200 hover:border-sage-300 bg-white"
                  }`}
                >
                  <s.icon className={`w-8 h-8 mb-4 ${situation === s.id ? "text-sage-800" : "text-sage-400"}`} />
                  <div className="font-medium text-sage-900 text-lg">{s.label}</div>
                </button>
              ))}
            </div>
            
            <Button disabled={!situation} onClick={() => saveProgress(3)} className="bg-sage-800 hover:bg-sage-900 text-white w-full h-14 text-lg">
              Continue <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        )}

        {/* STEP 3: Budget */}
        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <h1 className="text-3xl font-serif text-sage-900 mb-2">What does your monthly income look like?</h1>
            <p className="text-sage-600 mb-8">Let's find your comfortable investing number.</p>

            <div className="space-y-4 mb-8">
              <div>
                <label className="block text-sm font-medium text-sage-700 mb-1">Take-home Pay</label>
                <input type="number" value={income} onChange={e => setIncome(Number(e.target.value))} className="w-full p-3 border border-sage-200 rounded-lg focus:ring-2 focus:ring-sage-800 outline-none font-mono" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(expenses).map(([key, value]) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-sage-700 mb-1 capitalize">{key}</label>
                    <input type="number" value={value} onChange={e => setExpenses({...expenses, [key]: Number(e.target.value)})} className="w-full p-3 border border-sage-200 rounded-lg focus:ring-2 focus:ring-sage-800 outline-none font-mono" />
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-sage-200 p-6 rounded-xl mb-8">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sage-900 font-medium">Disposable Income</span>
                <span className="text-xl font-mono text-sage-800">${disposable}</span>
              </div>
              
              <label className="block text-sm text-sage-600 mb-2">College Fund Allocation ({collegePercent}%)</label>
              <input type="range" min="10" max="30" value={collegePercent} onChange={e => setCollegePercent(Number(e.target.value))} className="w-full mb-6 accent-sage-800" />
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-champagne-100 p-4 rounded-lg">
                  <div className="text-xs text-sage-700 uppercase tracking-wider mb-1">College Fund</div>
                  <div className="text-2xl font-serif text-sage-900">${collegeAmount.toFixed(0)}</div>
                </div>
                <div className="bg-sage-100 p-4 rounded-lg">
                  <div className="text-xs text-sage-700 uppercase tracking-wider mb-1">Investing Budget</div>
                  <div className="text-2xl font-serif text-sage-900">${investAmount.toFixed(0)}</div>
                </div>
              </div>
            </div>

            <Button onClick={() => saveProgress(4)} className="bg-sage-800 hover:bg-sage-900 text-white w-full h-14 text-lg">
              Continue <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        )}

        {/* STEP 4: Goals */}
        {step === 4 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <h1 className="text-3xl font-serif text-sage-900 mb-2">What are you investing for?</h1>
            <p className="text-sage-600 mb-8">Select all that apply.</p>

            <div className="space-y-4 mb-8">
              {[
                { id: "wealth", label: "Build My Wealth", icon: TrendingUp },
                { id: "college", label: "Fund My Child's Education", icon: GraduationCap },
                { id: "retire", label: "Retire Comfortably", icon: Sunset }
              ].map(g => (
                <button
                  key={g.id}
                  onClick={() => toggleGoal(g.id)}
                  className={`w-full p-6 rounded-xl border-2 flex items-center transition-all ${
                    goals.includes(g.id) ? "border-sage-800 bg-sage-50" : "border-sage-200 hover:border-sage-300 bg-white"
                  }`}
                >
                  <g.icon className={`w-6 h-6 mr-4 ${goals.includes(g.id) ? "text-sage-800" : "text-sage-400"}`} />
                  <span className="font-medium text-sage-900 text-lg">{g.label}</span>
                </button>
              ))}
            </div>

            {goals.includes("college") && (
              <div className="bg-white border border-sage-200 p-6 rounded-xl mb-8 animate-in fade-in slide-in-from-top-4">
                <h3 className="font-medium text-sage-900 mb-4">College Fund Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-sage-600 mb-1">Child's Current Age</label>
                    <input type="number" value={childAge} onChange={e => setChildAge(Number(e.target.value))} className="w-full p-3 border border-sage-200 rounded-lg outline-none focus:ring-2 focus:ring-sage-800" />
                  </div>
                  <div>
                    <label className="block text-sm text-sage-600 mb-1">Target Amount</label>
                    <input type="number" value={collegeTarget} onChange={e => setCollegeTarget(Number(e.target.value))} className="w-full p-3 border border-sage-200 rounded-lg outline-none focus:ring-2 focus:ring-sage-800 font-mono" />
                  </div>
                </div>
              </div>
            )}

            <Button disabled={goals.length === 0} onClick={() => saveProgress(5)} className="bg-sage-800 hover:bg-sage-900 text-white w-full h-14 text-lg">
              Continue <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        )}

        {/* STEP 5: First Pick */}
        {step === 5 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500 pb-12">
            <div className="w-16 h-16 bg-champagne-100 rounded-full flex items-center justify-center mb-6">
              <Sparkles className="w-8 h-8 text-champagne-400" />
            </div>
            <h1 className="text-3xl font-serif text-sage-900 mb-2">Here is your personalized starting pick.</h1>
            <p className="text-sage-600 mb-8">Based on your goals, this is where we suggest starting.</p>

            <div className="bg-white border border-sage-200 rounded-xl p-6 shadow-sm mb-8 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-sage-600"></div>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xl font-bold text-sage-900">
                      {goals.includes("college") ? "VTI" : goals.includes("wealth") ? "QQQ" : "SCHD"}
                    </span>
                    <span className="px-2 py-0.5 bg-sage-100 text-sage-800 text-xs rounded uppercase font-medium">ETF</span>
                  </div>
                  <div className="text-sage-600">
                    {goals.includes("college") ? "Vanguard Total Stock Market" : goals.includes("wealth") ? "Invesco QQQ Trust" : "Schwab US Dividend Equity"}
                  </div>
                </div>
                <div className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-medium border border-green-200">
                  Buy
                </div>
              </div>
              <div className="p-4 bg-sage-50 rounded-lg border border-sage-100 mb-4">
                <p className="text-sage-800 italic text-sm">
                  "This is an excellent foundational holding for {goals.includes("college") ? "a long-term college fund" : "building steady wealth"}. It provides broad diversification and historically strong returns with very low fees."
                </p>
              </div>
            </div>

            <h3 className="font-medium text-sage-900 mb-4">How to buy this:</h3>
            <div className="space-y-3 mb-10">
              {["Fidelity", "Charles Schwab", "Robinhood"].map(broker => (
                <button key={broker} className="w-full p-4 border border-sage-200 rounded-lg flex justify-between items-center hover:border-sage-400 bg-white transition-colors">
                  <span className="font-medium text-sage-900">{broker}</span>
                  <span className="text-sm text-sage-600">Open Account &rarr;</span>
                </button>
              ))}
            </div>

            <Button onClick={finishSetup} className="bg-sage-800 hover:bg-sage-900 text-white w-full h-14 text-lg">
              Finish Setup & Go to Dashboard
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}