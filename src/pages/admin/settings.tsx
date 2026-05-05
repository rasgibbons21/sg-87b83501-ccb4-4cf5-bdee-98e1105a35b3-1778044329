import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Save, ExternalLink } from "lucide-react";

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    monthly_price: "9.99",
    trial_days: "14",
    app_name: "Bloom",
    tagline: "by Cinder Vault"
  });

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase
        .from("admin_settings")
        .select("*")
        .in("key", Object.keys(settings));

      const settingsMap: any = {};
      data?.forEach((s) => {
        settingsMap[s.key] = s.value;
      });
      setSettings({ ...settings, ...settingsMap });
    };
    fetchSettings();
  }, []);

  const saveSetting = async (key: string, value: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    await supabase
      .from("admin_settings")
      .upsert({
        key,
        value,
        updated_at: new Date().toISOString(),
        updated_by: user?.id
      });

    alert(`${key} saved successfully`);
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-serif font-semibold text-sage-900">Settings</h1>
          <p className="text-sage-600 mt-1">Configure pricing, branding, and deployment</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-sage-200">
          <h3 className="text-lg font-serif font-semibold text-sage-900 mb-4">Subscription Pricing</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-sage-700 mb-1">Monthly Price ($)</label>
              <Input
                type="number"
                step="0.01"
                value={settings.monthly_price}
                onChange={(e) => setSettings({ ...settings, monthly_price: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-sage-700 mb-1">Trial Period (days)</label>
              <Input
                type="number"
                value={settings.trial_days}
                onChange={(e) => setSettings({ ...settings, trial_days: e.target.value })}
              />
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <Button
              onClick={() => {
                saveSetting("monthly_price", settings.monthly_price);
                saveSetting("trial_days", settings.trial_days);
              }}
              className="bg-sage-800 hover:bg-sage-900"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Pricing
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-sage-200">
          <h3 className="text-lg font-serif font-semibold text-sage-900 mb-4">App Branding</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-sage-700 mb-1">App Name</label>
              <Input
                value={settings.app_name}
                onChange={(e) => setSettings({ ...settings, app_name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-sage-700 mb-1">Tagline</label>
              <Input
                value={settings.tagline}
                onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
              />
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <Button
              onClick={() => {
                saveSetting("app_name", settings.app_name);
                saveSetting("tagline", settings.tagline);
              }}
              className="bg-sage-800 hover:bg-sage-900"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Branding
            </Button>
          </div>
        </div>

        <div className="bg-sage-50 rounded-xl p-6 border border-sage-200">
          <h3 className="text-lg font-serif font-semibold text-sage-900 mb-4">Deployment Information</h3>
          
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-sage-800 mb-2">GitHub Repository</h4>
              <p className="text-sm text-sage-600 mb-2">
                Your project is connected to GitHub. Push changes to deploy automatically via Vercel.
              </p>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-sage-700 hover:text-sage-900"
              >
                View on GitHub
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>

            <div className="border-t border-sage-200 pt-4">
              <h4 className="text-sm font-medium text-sage-800 mb-2">Vercel Deployment</h4>
              <p className="text-sm text-sage-600 mb-2">
                Click the Publish button in Softgen to deploy your app to Vercel with one click.
              </p>
            </div>

            <div className="border-t border-sage-200 pt-4">
              <h4 className="text-sm font-medium text-sage-800 mb-2">Database</h4>
              <p className="text-sm text-sage-600">
                Supabase project is connected and ready. Manage tables, RLS policies, and auth settings in the Supabase dashboard.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}