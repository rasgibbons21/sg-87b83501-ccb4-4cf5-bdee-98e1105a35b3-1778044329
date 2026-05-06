import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, CheckCircle, XCircle } from "lucide-react";

export default function APIKeys() {
  const [keys, setKeys] = useState({
    claudeKey: "",
    finnhubKey: "",
    twelveDataKey: "",
    paypalClientId: "",
    paypalSecret: "",
    paypalPlanId: "",
    supabaseUrl: "",
    supabaseAnonKey: "",
    supabaseServiceKey: ""
  });

  const [visibility, setVisibility] = useState({
    claudeKey: false,
    finnhubKey: false,
    twelveDataKey: false,
    paypalClientId: false,
    paypalSecret: false,
    paypalPlanId: false,
    supabaseUrl: false,
    supabaseAnonKey: false,
    supabaseServiceKey: false
  });

  const [status, setStatus] = useState({
    claude: false,
    finnhub: false,
    twelveData: false,
    paypal: false,
    supabase: true
  });

  const [toast, setToast] = useState("");

  useEffect(() => {
    loadKeys();
  }, []);

  const loadKeys = () => {
    setKeys({
      claudeKey: process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY || "",
      finnhubKey: process.env.NEXT_PUBLIC_FINNHUB_API_KEY || "",
      twelveDataKey: process.env.NEXT_PUBLIC_TWELVE_DATA_API_KEY || "",
      paypalClientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "",
      paypalSecret: "••••••••••••",
      paypalPlanId: process.env.NEXT_PUBLIC_PAYPAL_PLAN_ID || "",
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
      supabaseServiceKey: "••••••••••••"
    });
  };

  const toggleVisibility = (key: keyof typeof visibility) => {
    setVisibility(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const testConnections = async () => {
    showToast("Testing connections...");
    
    // Test each API
    const results = {
      claude: false,
      finnhub: false,
      twelveData: false,
      paypal: false,
      supabase: true
    };

    // Simulate API checks
    setTimeout(() => {
      setStatus(results);
      showToast("Connection test complete");
    }, 2000);
  };

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(""), 3000);
  };

  const maskValue = (value: string, visible: boolean) => {
    if (visible) return value;
    return "••••••••••••••••";
  };

  return (
    <AdminLayout>
      {toast && (
        <div className="fixed bottom-4 right-4 bg-sage-800 text-white px-6 py-3 rounded-lg shadow-lg z-50">
          {toast}
        </div>
      )}

      <div className="mb-8">
        <h1 className="font-serif text-4xl text-sage-800 mb-2">API Keys</h1>
        <p className="text-slate-600">Manage external service credentials</p>
      </div>

      <div className="space-y-6">
        {/* Data APIs */}
        <div className="bg-white rounded-xl border border-sage-200 p-8">
          <h2 className="font-serif text-2xl text-sage-800 mb-6">Data & AI APIs</h2>
          <div className="space-y-4">
            {[
              { label: "Claude API Key", key: "claudeKey", statusKey: "claude" },
              { label: "Finnhub API Key", key: "finnhubKey", statusKey: "finnhub" },
              { label: "Twelve Data API Key", key: "twelveDataKey", statusKey: "twelveData" }
            ].map((item) => (
              <div key={item.key}>
                <Label className="mb-2 block">{item.label}</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input 
                      type="text"
                      value={maskValue(keys[item.key as keyof typeof keys], visibility[item.key as keyof typeof visibility])}
                      readOnly
                      className="pr-10"
                    />
                    <button
                      onClick={() => toggleVisibility(item.key as keyof typeof visibility)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {visibility[item.key as keyof typeof visibility] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {status[item.statusKey as keyof typeof status] ? (
                    <CheckCircle className="w-10 h-10 text-green-600" />
                  ) : (
                    <XCircle className="w-10 h-10 text-red-600" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* PayPal */}
        <div className="bg-white rounded-xl border border-sage-200 p-8">
          <h2 className="font-serif text-2xl text-sage-800 mb-6">PayPal Subscriptions</h2>
          <div className="space-y-4">
            {[
              { label: "Client ID", key: "paypalClientId" },
              { label: "Secret Key", key: "paypalSecret" },
              { label: "Plan ID", key: "paypalPlanId" }
            ].map((item) => (
              <div key={item.key}>
                <Label className="mb-2 block">{item.label}</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input 
                      type="text"
                      value={maskValue(keys[item.key as keyof typeof keys], visibility[item.key as keyof typeof visibility])}
                      readOnly
                      className="pr-10"
                    />
                    <button
                      onClick={() => toggleVisibility(item.key as keyof typeof visibility)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {visibility[item.key as keyof typeof visibility] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {status.paypal ? (
                    <CheckCircle className="w-10 h-10 text-green-600" />
                  ) : (
                    <XCircle className="w-10 h-10 text-red-600" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Supabase */}
        <div className="bg-white rounded-xl border border-sage-200 p-8">
          <h2 className="font-serif text-2xl text-sage-800 mb-6">Supabase</h2>
          <div className="space-y-4">
            {[
              { label: "Project URL", key: "supabaseUrl" },
              { label: "Anon Key", key: "supabaseAnonKey" },
              { label: "Service Role Key", key: "supabaseServiceKey" }
            ].map((item) => (
              <div key={item.key}>
                <Label className="mb-2 block">{item.label}</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input 
                      type="text"
                      value={maskValue(keys[item.key as keyof typeof keys], visibility[item.key as keyof typeof visibility])}
                      readOnly
                      className="pr-10"
                    />
                    <button
                      onClick={() => toggleVisibility(item.key as keyof typeof visibility)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {visibility[item.key as keyof typeof visibility] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <Button onClick={testConnections} className="bg-sage-800 hover:bg-sage-900 text-white">
          Test All Connections
        </Button>
      </div>
    </AdminLayout>
  );
}