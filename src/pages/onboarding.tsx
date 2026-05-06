import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { CrawlerTicker } from "@/components/CrawlerTicker";

export default function Onboarding() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [userId, setUserId] = useState<string>("");
  const [firstName, setFirstName] = useState<string>("");
  const [loading, setLoading] = useState(true);

  // Step 2: Situation
  const [situation, setSituation] = useState<string>("");

  // Step 3: Budget
  const [income, setIncome] = useState<number>(5000);
  const [housing, setHousing] = useState<number>(1500);
  const [food, setFood] = useState<number>(600);
  const [transport, setTransport] = useState<number>(400);
  const [childcare, setChildcare] = useState<number>(800);
  const [bills, setBills] = useState<number>(300);
  const [leisure, setLeisure] = useState<number>(200);
  const [collegePercent, setCollegePercent] = useState<number>(20);

  // Step 4: Goals
  const [goals, setGoals] = useState<Set<string>>(new Set());
  const [childAge, setChildAge] = useState<number>(5);
  const [collegeGoal, setCollegeGoal] = useState<number>(100000);

  // Calculated values
  const totalExpenses = housing + food + transport + childcare + bills + leisure;
  const disposable = Math.max(0, income - totalExpenses);
  const collegeAmount = (disposable * collegePercent) / 100;
  const investAmount = disposable - collegeAmount;

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push("/");
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .single();

    if (!profile) {
      router.push("/");
      return;
    }

    if (profile.onboarding_completed) {
      router.push("/app/dashboard");
      return;
    }

    setUserId(session.user.id);
    setFirstName(profile.full_name?.split(" ")[0] || "");
    setStep(profile.onboarding_step || 1);
    setLoading(false);
  };

  const saveProgress = async (nextStep: number, updates: any = {}) => {
    await supabase
      .from("profiles")
      .update({ 
        onboarding_step: nextStep,
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq("id", userId);
    
    setStep(nextStep);
  };

  const handleContinueStep1 = () => {
    saveProgress(2);
  };

  const handleContinueStep2 = () => {
    if (!situation) return;
    saveProgress(3, { situation });
  };

  const handleContinueStep3 = () => {
    saveProgress(4, {
      monthly_budget: income,
      invest_monthly: investAmount
    });
  };

  const handleContinueStep4 = () => {
    if (goals.size === 0) return;
    
    const updates: any = { goals: Array.from(goals).join(",") };
    if (goals.has("college")) {
      updates.child_age = childAge;
      updates.college_goal = collegeGoal;
    }
    
    saveProgress(5, updates);
  };

  const handleFinish = async () => {
    await supabase
      .from("profiles")
      .update({ 
        onboarding_completed: true,
        onboarding_step: 5,
        updated_at: new Date().toISOString()
      })
      .eq("id", userId);

    router.push("/app/dashboard");
  };

  const toggleGoal = (goal: string) => {
    const newGoals = new Set(goals);
    if (newGoals.has(goal)) {
      newGoals.delete(goal);
    } else {
      newGoals.add(goal);
    }
    setGoals(newGoals);
  };

  const getRecommendedPick = () => {
    if (goals.has("college")) return "VTI";
    if (goals.has("wealth")) return "QQQ";
    if (goals.has("retirement")) return "SCHD";
    return "VTI";
  };

  const pickDetails: Record<string, any> = {
    VTI: {
      name: "Vanguard Total Stock Market ETF",
      price: 245.32,
      entry: "$235-$242",
      target: "$270",
      stop: "$218",
      rationale: "Think of VTI as owning a tiny piece of every major American company. Apple, Microsoft, Amazon and 3,800 others — all in one purchase for just 0.03% per year. Perfect for college savings with its 11.4% average annual return."
    },
    QQQ: {
      name: "Invesco Nasdaq-100 ETF",
      price: 387.14,
      entry: "$478-$492",
      target: "$550",
      stop: "$455",
      rationale: "If you believe technology will keep shaping the future, QQQ is your pick. Apple, Microsoft, Nvidia and 97 other tech leaders. ~18% average annual return over the last decade."
    },
    SCHD: {
      name: "Schwab US Dividend Equity ETF",
      price: 78.92,
      entry: "$26.50-$27.80",
      target: "$32",
      stop: "$24.80",
      rationale: "SCHD pays you just to hold it. Companies like Coca-Cola send you dividends quarterly that automatically buy more shares. The 3.5% yield means $10,000 invested earns ~$350/year in passive income."
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center">
        <div className="animate-pulse text-sage-600">Loading...</div>
      </div>
    );
  }

  const recommendedTicker = getRecommendedPick();
  const pick = pickDetails[recommendedTicker];

  return (
    <div className="min-h-screen bg-ivory flex flex-col">
      <CrawlerTicker />
      
      {/* Progress Bar */}
      <div className="bg-white border-b border-sage-200">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-sage-700">Step {step} of 5</span>
            <span className="text-sm text-slate-500">{Math.round((step / 5) * 100)}% Complete</span>
          </div>
          <div className="h-2 bg-sage-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-sage-600 transition-all duration-500 ease-out"
              style={{ width: `${(step / 5) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl">
          
          {/* Step 1: Welcome */}
          {step === 1 && (
            <div className="bg-white rounded-2xl border border-sage-200 shadow-lg p-12 text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-sage-500 to-sage-700 flex items-center justify-center">
                <span className="text-4xl">🌿</span>
              </div>
              <h1 className="font-serif text-4xl text-sage-800 mb-3">
                Welcome to Bloom, {firstName}!
              </h1>
              <p className="text-lg text-slate-600 mb-8">
                Let's set up your investing profile in 5 quick steps.
              </p>
              <div className="text-6xl mb-8">🌱 → 🌿 → 🌳</div>
              <Button 
                onClick={handleContinueStep1}
                className="bg-sage-800 hover:bg-sage-900 text-white px-12 py-6 text-lg"
                size="lg"
              >
                Continue
              </Button>
            </div>
          )}

          {/* Step 2: Your Situation */}
          {step === 2 && (
            <div className="bg-white rounded-2xl border border-sage-200 shadow-lg p-8">
              <h2 className="font-serif text-3xl text-sage-800 mb-2">Tell us about yourself</h2>
              <p className="text-slate-600 mb-8">This helps us personalize your investing journey.</p>
              
              <div className="grid grid-cols-2 gap-4 mb-8">
                {[
                  { value: "single_mom", label: "Single Mom", emoji: "👩‍👧" },
                  { value: "sahm", label: "Stay-at-Home Mom", emoji: "🏡" },
                  { value: "working_mom", label: "Working Mom", emoji: "💼" },
                  { value: "other", label: "Other", emoji: "✨" }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSituation(option.value)}
                    className={`p-6 rounded-xl border-2 transition-all ${
                      situation === option.value
                        ? "border-sage-600 bg-sage-50"
                        : "border-slate-200 hover:border-sage-300"
                    }`}
                  >
                    <div className="text-4xl mb-3">{option.emoji}</div>
                    <div className="font-medium text-slate-800">{option.label}</div>
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <Button 
                  onClick={() => setStep(1)}
                  variant="outline"
                  className="flex-1"
                >
                  Back
                </Button>
                <Button 
                  onClick={handleContinueStep2}
                  disabled={!situation}
                  className="flex-1 bg-sage-800 hover:bg-sage-900 text-white disabled:opacity-50"
                >
                  Continue
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Your Budget */}
          {step === 3 && (
            <div className="bg-white rounded-2xl border border-sage-200 shadow-lg p-8">
              <h2 className="font-serif text-3xl text-sage-800 mb-2">What does your monthly income look like?</h2>
              <p className="text-slate-600 mb-8">Don't worry, this stays private and helps us calculate your investing budget.</p>

              <div className="space-y-4 mb-8">
                <div>
                  <Label className="text-sage-700 font-medium mb-2 block">Monthly Take-Home Pay</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                    <Input 
                      type="number" 
                      value={income || ""} 
                      onChange={(e) => setIncome(Number(e.target.value))}
                      className="pl-8 text-lg"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "Housing", value: housing, setter: setHousing },
                    { label: "Food", value: food, setter: setFood },
                    { label: "Transport", value: transport, setter: setTransport },
                    { label: "Childcare", value: childcare, setter: setChildcare },
                    { label: "Bills", value: bills, setter: setBills },
                    { label: "Leisure", value: leisure, setter: setLeisure }
                  ].map((field) => (
                    <div key={field.label}>
                      <Label className="text-slate-600 text-sm mb-1 block">{field.label}</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">$</span>
                        <Input 
                          type="number" 
                          value={field.value || ""} 
                          onChange={(e) => field.setter(Number(e.target.value))}
                          className="pl-8"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-sage-50 rounded-lg p-4 border border-sage-200">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sage-700 font-medium">Disposable Income</span>
                    <span className="font-mono text-2xl font-bold text-sage-900">
                      ${disposable.toFixed(0)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">This is what's left after your expenses.</p>
                </div>

                <div>
                  <Label className="text-sage-700 font-medium mb-3 block">
                    College Fund Allocation: {collegePercent}%
                  </Label>
                  <Slider 
                    value={[collegePercent]} 
                    onValueChange={(val) => setCollegePercent(val[0])}
                    min={10}
                    max={30}
                    step={5}
                    className="mb-2"
                  />
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="bg-[#E8F5EE] rounded-lg p-3 border border-[#2D7A4A]">
                      <div className="text-xs text-[#2D7A4A] mb-1">College Fund</div>
                      <div className="font-mono text-lg font-bold text-[#2D7A4A]">
                        ${collegeAmount.toFixed(0)}/mo
                      </div>
                    </div>
                    <div className="bg-sage-50 rounded-lg p-3 border border-sage-300">
                      <div className="text-xs text-sage-700 mb-1">Your Investing</div>
                      <div className="font-mono text-lg font-bold text-sage-900">
                        ${investAmount.toFixed(0)}/mo
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button 
                  onClick={() => setStep(2)}
                  variant="outline"
                  className="flex-1"
                >
                  Back
                </Button>
                <Button 
                  onClick={handleContinueStep3}
                  className="flex-1 bg-sage-800 hover:bg-sage-900 text-white"
                >
                  Continue
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Your Goals */}
          {step === 4 && (
            <div className="bg-white rounded-2xl border border-sage-200 shadow-lg p-8">
              <h2 className="font-serif text-3xl text-sage-800 mb-2">What are you investing for?</h2>
              <p className="text-slate-600 mb-8">Select all that apply — you can have multiple goals.</p>

              <div className="space-y-4 mb-8">
                {[
                  { value: "wealth", label: "Build My Wealth", emoji: "📈", desc: "Long-term growth" },
                  { value: "college", label: "Fund My Child's Education", emoji: "🎓", desc: "College savings" },
                  { value: "retirement", label: "Retire Comfortably", emoji: "🌅", desc: "Future security" }
                ].map((goal) => (
                  <button
                    key={goal.value}
                    onClick={() => toggleGoal(goal.value)}
                    className={`w-full p-6 rounded-xl border-2 transition-all text-left ${
                      goals.has(goal.value)
                        ? "border-sage-600 bg-sage-50"
                        : "border-slate-200 hover:border-sage-300"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-4xl">{goal.emoji}</div>
                      <div className="flex-1">
                        <div className="font-semibold text-slate-800 mb-1">{goal.label}</div>
                        <div className="text-sm text-slate-500">{goal.desc}</div>
                      </div>
                      {goals.has(goal.value) && (
                        <div className="w-6 h-6 rounded-full bg-sage-600 flex items-center justify-center">
                          <span className="text-white text-sm">✓</span>
                        </div>
                      )}
                    </div>
                  </button>
                ))}

                {goals.has("college") && (
                  <div className="bg-sage-50 rounded-lg p-6 border border-sage-200 space-y-4">
                    <div>
                      <Label className="text-sage-700 font-medium mb-2 block">Child's Current Age</Label>
                      <Input 
                        type="number" 
                        value={childAge} 
                        onChange={(e) => setChildAge(Number(e.target.value))}
                        min={0}
                        max={17}
                      />
                    </div>
                    <div>
                      <Label className="text-sage-700 font-medium mb-2 block">College Fund Target</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                        <Input 
                          type="number" 
                          value={collegeGoal} 
                          onChange={(e) => setCollegeGoal(Number(e.target.value))}
                          className="pl-8"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <Button 
                  onClick={() => setStep(3)}
                  variant="outline"
                  className="flex-1"
                >
                  Back
                </Button>
                <Button 
                  onClick={handleContinueStep4}
                  disabled={goals.size === 0}
                  className="flex-1 bg-sage-800 hover:bg-sage-900 text-white disabled:opacity-50"
                >
                  Continue
                </Button>
              </div>
            </div>
          )}

          {/* Step 5: Your First Pick */}
          {step === 5 && (
            <div className="bg-white rounded-2xl border border-sage-200 shadow-lg p-8">
              <h2 className="font-serif text-3xl text-sage-800 mb-2">Here's your personalized starting pick</h2>
              <p className="text-slate-600 mb-8">
                Based on your goals, we recommend starting with {recommendedTicker}.
              </p>

              {/* Pick Card */}
              <div className="bg-sage-50 rounded-xl border-2 border-sage-300 p-6 mb-8">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-mono text-2xl font-bold text-sage-800 mb-1">{recommendedTicker}</h3>
                    <p className="text-sm text-slate-600">{pick.name}</p>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-3xl font-bold text-sage-900">${pick.price.toFixed(2)}</div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="bg-[#E8F5EE] rounded-lg p-3 text-center border border-[#2D7A4A]">
                    <div className="text-xs text-[#2D7A4A] font-semibold mb-1">Entry</div>
                    <div className="font-mono text-sm text-[#2D7A4A]">{pick.entry}</div>
                  </div>
                  <div className="bg-[#FEF3DC] rounded-lg p-3 text-center border border-[#C4921A]">
                    <div className="text-xs text-[#C4921A] font-semibold mb-1">Target</div>
                    <div className="font-mono text-sm text-[#C4921A]">{pick.target}</div>
                  </div>
                  <div className="bg-[#FDEAEA] rounded-lg p-3 text-center border border-[#C04040]">
                    <div className="text-xs text-[#C04040] font-semibold mb-1">Stop</div>
                    <div className="font-mono text-sm text-[#C04040]">{pick.stop}</div>
                  </div>
                </div>

                <div className="bg-white border-l-4 border-sage-600 pl-4 py-3 rounded">
                  <p className="text-sm text-slate-700 leading-relaxed italic">
                    {pick.rationale}
                  </p>
                </div>
              </div>

              {/* How to Buy */}
              <div className="mb-8">
                <h3 className="font-serif text-xl text-sage-800 mb-4">How to buy this</h3>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { name: "Fidelity", url: "https://www.fidelity.com", emoji: "🏦" },
                    { name: "Charles Schwab", url: "https://www.schwab.com", emoji: "💼" },
                    { name: "Robinhood", url: "https://www.robinhood.com", emoji: "🎯" }
                  ].map((broker) => (
                    <a
                      key={broker.name}
                      href={broker.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-4 bg-white border-2 border-sage-200 rounded-lg hover:border-sage-400 transition-colors text-center"
                    >
                      <div className="text-3xl mb-2">{broker.emoji}</div>
                      <div className="text-sm font-medium text-slate-700">{broker.name}</div>
                    </a>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <Button 
                  onClick={() => setStep(4)}
                  variant="outline"
                  className="flex-1"
                >
                  Back
                </Button>
                <Button 
                  onClick={handleFinish}
                  className="flex-1 bg-sage-800 hover:bg-sage-900 text-white"
                  size="lg"
                >
                  Finish Setup & Go to Dashboard
                </Button>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}