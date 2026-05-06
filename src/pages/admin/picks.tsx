import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Sparkles } from "lucide-react";

export default function PicksEditor() {
  const [picks, setPicks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");
  
  const [formData, setFormData] = useState({
    ticker: "",
    name: "",
    type: "etf",
    signal: "buy",
    price: "",
    entry_display: "",
    target_display: "",
    stop_display: "",
    ret_1yr: "",
    ret_5yr: "",
    expense_ratio: "",
    dividend_yield: "",
    risk_level: "medium",
    advice: ""
  });

  useEffect(() => {
    fetchPicks();
  }, []);

  const fetchPicks = async () => {
    const { data } = await supabase.from("picks").select("*").order("created_at", { ascending: false });
    if (data) setPicks(data);
  };

  const handleGenerateAI = async () => {
    if (!formData.ticker || !formData.name) {
      showToast("Please fill in ticker and name first");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/claude/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticker: formData.ticker,
          name: formData.name,
          type: formData.type,
          price: parseFloat(formData.price) || 0,
          ret1yr: parseFloat(formData.ret_1yr) || 0,
          ret5yr: parseFloat(formData.ret_5yr) || 0,
          signal: formData.signal,
          expenseRatio: formData.expense_ratio,
          dividendYield: formData.dividend_yield
        })
      });

      const data = await response.json();
      if (data.rationale) {
        setFormData(prev => ({ ...prev, advice: data.rationale }));
        showToast("AI analysis generated!");
      }
    } catch (error) {
      console.error("AI generation error:", error);
      showToast("Failed to generate AI analysis");
    }
    setLoading(false);
  };

  const handlePublish = async () => {
    if (!formData.ticker || !formData.name || !formData.advice) {
      showToast("Please fill in all required fields");
      return;
    }

    try {
      const { error } = await supabase.from("picks").insert({
        ticker: formData.ticker.toUpperCase(),
        name: formData.name,
        type: formData.type,
        signal: formData.signal,
        price: parseFloat(formData.price) || 0,
        entry_display: formData.entry_display,
        target_display: formData.target_display,
        stop_display: formData.stop_display,
        ret_1yr: parseFloat(formData.ret_1yr) || 0,
        ret_5yr: parseFloat(formData.ret_5yr) || 0,
        expense_ratio: formData.expense_ratio,
        dividend_yield: formData.dividend_yield,
        risk_level: formData.risk_level,
        advice: formData.advice,
        is_active: true,
        published_at: new Date().toISOString()
      });

      if (error) throw error;

      showToast("Pick published successfully!");
      setFormData({
        ticker: "", name: "", type: "etf", signal: "buy", price: "", entry_display: "",
        target_display: "", stop_display: "", ret_1yr: "", ret_5yr: "", expense_ratio: "",
        dividend_yield: "", risk_level: "medium", advice: ""
      });
      fetchPicks();
    } catch (error) {
      console.error("Publish error:", error);
      showToast("Failed to publish pick");
    }
  };

  const handleRemove = async (id: string) => {
    try {
      await supabase.from("picks").update({ is_active: false }).eq("id", id);
      showToast("Pick removed");
      fetchPicks();
    } catch (error) {
      console.error("Remove error:", error);
      showToast("Failed to remove pick");
    }
  };

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(""), 3000);
  };

  return (
    <AdminLayout>
      {toast && (
        <div className="fixed bottom-4 right-4 bg-sage-800 text-white px-6 py-3 rounded-lg shadow-lg z-50">
          {toast}
        </div>
      )}

      <div className="mb-8">
        <h1 className="font-serif text-4xl text-sage-800 mb-2">Picks Editor</h1>
        <p className="text-slate-600">Create and manage investment picks</p>
      </div>

      <div className="bg-white rounded-xl border border-sage-200 p-8 mb-8">
        <h2 className="font-serif text-2xl text-sage-800 mb-6">Create New Pick</h2>
        
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div>
            <Label className="mb-2 block">Ticker Symbol</Label>
            <Input value={formData.ticker} onChange={(e) => setFormData({...formData, ticker: e.target.value.toUpperCase()})} placeholder="VTI" />
          </div>
          <div>
            <Label className="mb-2 block">Full Name</Label>
            <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="Vanguard Total Stock Market ETF" />
          </div>
          <div>
            <Label className="mb-2 block">Type</Label>
            <select className="w-full border border-slate-300 rounded-lg px-3 py-2" value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}>
              <option value="etf">ETF</option>
              <option value="stock">Stock</option>
              <option value="bond">Bond</option>
            </select>
          </div>
          <div>
            <Label className="mb-2 block">Signal</Label>
            <select className="w-full border border-slate-300 rounded-lg px-3 py-2" value={formData.signal} onChange={(e) => setFormData({...formData, signal: e.target.value})}>
              <option value="buy">Buy</option>
              <option value="hold">Hold</option>
              <option value="wait">Wait</option>
            </select>
          </div>
          <div>
            <Label className="mb-2 block">Current Price</Label>
            <Input type="number" step="0.01" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} placeholder="245.32" />
          </div>
          <div>
            <Label className="mb-2 block">Entry Range</Label>
            <Input value={formData.entry_display} onChange={(e) => setFormData({...formData, entry_display: e.target.value})} placeholder="$235-$242" />
          </div>
          <div>
            <Label className="mb-2 block">Target Price</Label>
            <Input value={formData.target_display} onChange={(e) => setFormData({...formData, target_display: e.target.value})} placeholder="$270" />
          </div>
          <div>
            <Label className="mb-2 block">Stop Loss</Label>
            <Input value={formData.stop_display} onChange={(e) => setFormData({...formData, stop_display: e.target.value})} placeholder="$218" />
          </div>
          <div>
            <Label className="mb-2 block">1-Year Return (%)</Label>
            <Input type="number" step="0.01" value={formData.ret_1yr} onChange={(e) => setFormData({...formData, ret_1yr: e.target.value})} placeholder="11.4" />
          </div>
          <div>
            <Label className="mb-2 block">5-Year Return (%)</Label>
            <Input type="number" step="0.01" value={formData.ret_5yr} onChange={(e) => setFormData({...formData, ret_5yr: e.target.value})} placeholder="14.2" />
          </div>
          <div>
            <Label className="mb-2 block">Expense Ratio</Label>
            <Input value={formData.expense_ratio} onChange={(e) => setFormData({...formData, expense_ratio: e.target.value})} placeholder="0.03%" />
          </div>
          <div>
            <Label className="mb-2 block">Dividend Yield</Label>
            <Input value={formData.dividend_yield} onChange={(e) => setFormData({...formData, dividend_yield: e.target.value})} placeholder="1.8%" />
          </div>
        </div>

        <div className="mb-6">
          <Label className="mb-2 block">Investment Rationale</Label>
          <Textarea 
            value={formData.advice} 
            onChange={(e) => setFormData({...formData, advice: e.target.value})}
            placeholder="Plain-English explanation for beginner investors..."
            rows={6}
            className="font-sans"
          />
        </div>

        <div className="flex gap-3">
          <Button onClick={handleGenerateAI} disabled={loading} variant="outline" className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            {loading ? "Generating..." : "Generate AI Analysis"}
          </Button>
          <Button onClick={handlePublish} className="bg-sage-800 hover:bg-sage-900 text-white">
            Publish Pick
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-sage-200 p-8">
        <h2 className="font-serif text-2xl text-sage-800 mb-6">Published Picks</h2>
        <div className="space-y-3">
          {picks.filter(p => p.is_active).map((pick) => (
            <div key={pick.id} className="flex items-center justify-between p-4 bg-sage-50 rounded-lg">
              <div className="flex items-center gap-4">
                <span className="font-mono text-lg font-bold text-sage-800">{pick.ticker}</span>
                <span className="text-sm text-slate-600">{pick.name}</span>
                <span className={`px-2 py-0.5 text-xs rounded uppercase ${
                  pick.signal === "buy" ? "bg-green-100 text-green-700" :
                  pick.signal === "hold" ? "bg-amber-100 text-amber-700" :
                  "bg-red-100 text-red-700"
                }`}>{pick.signal}</span>
                <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded uppercase">{pick.type}</span>
              </div>
              <button onClick={() => handleRemove(pick.id)} className="text-terracotta-600 hover:text-terracotta-700">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}