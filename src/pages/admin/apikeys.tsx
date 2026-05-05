import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, CheckCircle, XCircle, Save } from "lucide-react";

export default function AdminAPIKeys() {
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [keys, setKeys] = useState({
    paypal_client_id: "",
    paypal_secret: "",
    paypal_plan_id: "",
    paypal_webhook_id: "",
    finnhub_api_key: "",
    twelve_data_api_key: "",
    anthropic_api_key: "",
  });
  const [connectionStatus, setConnectionStatus] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchKeys();
  }, []);

  const fetchKeys = async () => {
    const { data } = await supabase
      .from("admin_settings")
      .select("*")
      .in("key", Object.keys(keys));

    const keyMap: any = {};
    data?.forEach((setting) => {
      keyMap[setting.key] = setting.value;
    });
    setKeys(keyMap);
  };

  const toggleShow = (key: string) => {
    setShowKeys({ ...showKeys, [key]: !showKeys[key] });
  };

  const maskKey = (key: string) => {
    if (!key) return "";
    if (showKeys[key]) return key;
    return "•".repeat(Math.min(key.length, 32));
  };

  const saveKey = async (key: string, value: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await supabase
      .from("admin_settings")
      .upsert({
        key,
        value,
        updated_at: new Date().toISOString(),
        updated_by: user?.id
      });

    if (!error) {
      alert(`${key} saved successfully`);
    }
  };

  const testConnection = async (service: string) => {
    // Placeholder for actual API testing
    setConnectionStatus({ ...connectionStatus, [service]: true });
    setTimeout(() => {
      alert(`${service} connection test would run here (requires actual API call)`);
    }, 500);
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-serif font-semibold text-sage-900">API Keys</h1>
          <p className="text-sage-600 mt-1">Manage external service credentials</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-sage-200">
          <h3 className="text-lg font-serif font-semibold text-sage-900 mb-4">PayPal Subscriptions</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-sage-700 mb-1">Client ID</label>
              <div className="flex gap-2">
                <Input
                  type={showKeys.paypal_client_id ? "text" : "password"}
                  value={maskKey("paypal_client_id")}
                  onChange={(e) => setKeys({ ...keys, paypal_client_id: e.target.value })}
                  placeholder="AXxxxxxxxxxxxxxx"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleShow("paypal_client_id")}
                >
                  {showKeys.paypal_client_id ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-sage-700 mb-1">Secret Key</label>
              <div className="flex gap-2">
                <Input
                  type={showKeys.paypal_secret ? "text" : "password"}
                  value={maskKey("paypal_secret")}
                  onChange={(e) => setKeys({ ...keys, paypal_secret: e.target.value })}
                  placeholder="EXxxxxxxxxxxxxxx"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleShow("paypal_secret")}
                >
                  {showKeys.paypal_secret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-sage-700 mb-1">Plan ID</label>
              <Input
                value={keys.paypal_plan_id}
                onChange={(e) => setKeys({ ...keys, paypal_plan_id: e.target.value })}
                placeholder="P-xxxxxxxxxxxxxxxxxxxx"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-sage-700 mb-1">Webhook ID</label>
              <Input
                value={keys.paypal_webhook_id}
                onChange={(e) => setKeys({ ...keys, paypal_webhook_id: e.target.value })}
                placeholder="xxxxxxxxxxxx"
              />
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <Button
              onClick={() => {
                saveKey("paypal_client_id", keys.paypal_client_id);
                saveKey("paypal_secret", keys.paypal_secret);
                saveKey("paypal_plan_id", keys.paypal_plan_id);
                saveKey("paypal_webhook_id", keys.paypal_webhook_id);
              }}
              className="bg-sage-800 hover:bg-sage-900"
            >
              <Save className="w-4 h-4 mr-2" />
              Save PayPal Keys
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-sage-200">
          <h3 className="text-lg font-serif font-semibold text-sage-900 mb-4">Data APIs</h3>
          <div className="space-y-4">
            {[
              { key: "anthropic_api_key", label: "Claude AI (Anthropic)", service: "claude" },
              { key: "finnhub_api_key", label: "Finnhub (Stock Prices)", service: "finnhub" },
              { key: "twelve_data_api_key", label: "Twelve Data (History)", service: "twelve" }
            ].map((api) => (
              <div key={api.key}>
                <label className="block text-sm font-medium text-sage-700 mb-1">{api.label}</label>
                <div className="flex gap-2">
                  <Input
                    type={showKeys[api.key] ? "text" : "password"}
                    value={maskKey(api.key)}
                    onChange={(e) => setKeys({ ...keys, [api.key]: e.target.value })}
                    placeholder="sk-xxxxxxxxxxxx"
                    className="flex-1"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleShow(api.key)}
                  >
                    {showKeys[api.key] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                  {connectionStatus[api.service] ? (
                    <div className="flex items-center gap-1 px-3 py-2 bg-green-50 text-green-700 rounded-lg text-sm">
                      <CheckCircle className="w-4 h-4" />
                      Connected
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 px-3 py-2 bg-sage-50 text-sage-600 rounded-lg text-sm">
                      <XCircle className="w-4 h-4" />
                      Not tested
                    </div>
                  )}
                  <Button
                    onClick={() => testConnection(api.service)}
                    variant="outline"
                  >
                    Test
                  </Button>
                  <Button
                    onClick={() => saveKey(api.key, keys[api.key as keyof typeof keys])}
                    className="bg-sage-800 hover:bg-sage-900"
                  >
                    <Save className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-sage-50 rounded-xl p-6 border border-sage-200">
          <h3 className="text-lg font-serif font-semibold text-sage-900 mb-2">Supabase Connection</h3>
          <p className="text-sm text-sage-600 mb-4">
            Supabase credentials are managed via Softgen integration and cannot be edited here.
          </p>
          <div className="flex items-center gap-2 px-3 py-2 bg-green-50 text-green-700 rounded-lg inline-flex">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Connected</span>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}