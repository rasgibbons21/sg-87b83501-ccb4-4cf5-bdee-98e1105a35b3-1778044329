import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Trash2, CheckCircle } from "lucide-react";

export default function AdminPicks() {
  const [picks, setPicks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  
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
    timeframe: "long-term",
    advice: ""
  });

  useEffect(() => {
    fetchPicks();
  }, []);

  const fetchPicks = async () => {
    const { data } = await supabase
      .from("picks")
      .select("*")
      .order("published_at", { ascending: false });
    setPicks(data || []);
  };

  const handleAnalyze = async () => {
    if (!formData.ticker || !formData.name) {
      alert("Please fill in ticker and name first");
      return;
    }

    setAnalyzing(true);
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

      const analysis = await response.json();
      
      setFormData(prev => ({
        ...prev,
        advice: analysis.rationale || "",
        signal: analysis.signal || prev.signal
      }));
    } catch (error) {
      console.error("Analysis error:", error);
      alert("Failed to generate AI analysis. Check your ANTHROPIC_API_KEY.");
    } finally {
      setAnalyzing(false);
    }
  };

  const handlePublish = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
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
        timeframe: formData.timeframe,
        advice: formData.advice,
        is_active: true,
        published_at: new Date().toISOString(),
        created_by: user?.id
      });

      if (error) throw error;

      alert("Pick published successfully!");
      setFormData({
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
        timeframe: "long-term",
        advice: ""
      });
      fetchPicks();
    } catch (error) {
      console.error("Publish error:", error);
      alert("Failed to publish pick");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (id: string) => {
    if (!confirm("Remove this pick from the active list?")) return;
    
    const { error } = await supabase
      .from("picks")
      .update({ is_active: false })
      .eq("id", id);

    if (!error) fetchPicks();
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-serif font-semibold text-sage-900">Picks Editor</h1>
          <p className="text-sage-600 mt-1">Create and publish investment picks with AI analysis</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-sage-200">
          <h3 className="text-lg font-serif font-semibold text-sage-900 mb-4">Create New Pick</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-sage-700 mb-1">Ticker Symbol</label>
              <Input
                placeholder="VTI"
                value={formData.ticker}
                onChange={(e) => setFormData({ ...formData, ticker: e.target.value.toUpperCase() })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-sage-700 mb-1">Full Name</label>
              <Input
                placeholder="Vanguard Total Stock Market ETF"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-sage-700 mb-1">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full h-10 px-3 border border-sage-200 rounded-lg"
              >
                <option value="etf">ETF</option>
                <option value="stock">Stock</option>
                <option value="bond">Bond</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-sage-700 mb-1">Signal</label>
              <select
                value={formData.signal}
                onChange={(e) => setFormData({ ...formData, signal: e.target.value })}
                className="w-full h-10 px-3 border border-sage-200 rounded-lg"
              >
                <option value="buy">Buy</option>
                <option value="hold">Hold</option>
                <option value="wait">Wait</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-sage-700 mb-1">Current Price</label>
              <Input
                type="number"
                step="0.01"
                placeholder="245.50"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-sage-700 mb-1">Entry Range</label>
              <Input
                placeholder="$240-$250"
                value={formData.entry_display}
                onChange={(e) => setFormData({ ...formData, entry_display: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-sage-700 mb-1">Target Price</label>
              <Input
                placeholder="$280"
                value={formData.target_display}
                onChange={(e) => setFormData({ ...formData, target_display: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-sage-700 mb-1">Stop Loss</label>
              <Input
                placeholder="$220"
                value={formData.stop_display}
                onChange={(e) => setFormData({ ...formData, stop_display: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-sage-700 mb-1">1-Year Return (%)</label>
              <Input
                type="number"
                step="0.1"
                placeholder="11.3"
                value={formData.ret_1yr}
                onChange={(e) => setFormData({ ...formData, ret_1yr: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-sage-700 mb-1">5-Year Return (%)</label>
              <Input
                type="number"
                step="0.1"
                placeholder="68.5"
                value={formData.ret_5yr}
                onChange={(e) => setFormData({ ...formData, ret_5yr: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-sage-700 mb-1">Expense Ratio</label>
              <Input
                placeholder="0.03%"
                value={formData.expense_ratio}
                onChange={(e) => setFormData({ ...formData, expense_ratio: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-sage-700 mb-1">Dividend Yield</label>
              <Input
                placeholder="1.4%"
                value={formData.dividend_yield}
                onChange={(e) => setFormData({ ...formData, dividend_yield: e.target.value })}
              />
            </div>
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-sage-700">Investment Rationale</label>
              <Button
                onClick={handleAnalyze}
                disabled={analyzing}
                size="sm"
                className="bg-terracotta-500 hover:bg-terracotta-600"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                {analyzing ? "Analyzing..." : "Generate AI Analysis"}
              </Button>
            </div>
            <Textarea
              rows={6}
              placeholder="Claude AI will generate a warm, educational explanation here..."
              value={formData.advice}
              onChange={(e) => setFormData({ ...formData, advice: e.target.value })}
              className="font-serif"
            />
          </div>

          <div className="flex justify-end mt-6">
            <Button
              onClick={handlePublish}
              disabled={loading || !formData.ticker || !formData.name}
              className="bg-sage-800 hover:bg-sage-900"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              {loading ? "Publishing..." : "Publish Pick"}
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-sage-200">
          <h3 className="text-lg font-serif font-semibold text-sage-900 mb-4">Published Picks</h3>
          
          <div className="space-y-3">
            {picks.filter(p => p.is_active).map((pick) => (
              <div key={pick.id} className="flex items-center justify-between p-4 border border-sage-100 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-sage-100 flex items-center justify-center">
                    <span className="font-mono font-semibold text-sage-800 text-sm">{pick.ticker}</span>
                  </div>
                  <div>
                    <p className="font-medium text-sage-900">{pick.name}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-sage-100 text-sage-700">
                        {pick.type}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        pick.signal === "buy" ? "bg-green-100 text-green-800" :
                        pick.signal === "hold" ? "bg-amber-100 text-amber-800" :
                        "bg-red-100 text-red-800"
                      }`}>
                        {pick.signal}
                      </span>
                      <span className="text-xs text-sage-500">
                        {new Date(pick.published_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <Button
                  onClick={() => handleRemove(pick.id)}
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}