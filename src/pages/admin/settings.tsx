import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle } from "lucide-react";

export default function Settings() {
  const [toast, setToast] = useState("");
  const [pricing, setPricing] = useState({
    monthlyPrice: "9.99",
    trialDays: "14"
  });
  const [branding, setBranding] = useState({
    appName: "Bloom",
    tagline: "by Cinder Vault"
  });

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(""), 3000);
  };

  const handleSavePricing = async () => {
    try {
      await supabase.from("admin_settings").upsert([
        { key: "monthly_price", value: pricing.monthlyPrice, description: "Monthly subscription price" },
        { key: "trial_days", value: pricing.trialDays, description: "Free trial duration in days" }
      ]);
      showToast("Pricing settings saved");
    } catch (error) {
      console.error("Save pricing error:", error);
      showToast("Failed to save pricing");
    }
  };

  const handleSaveBranding = async () => {
    try {
      await supabase.from("admin_settings").upsert([
        { key: "app_name", value: branding.appName, description: "Application name" },
        { key: "tagline", value: branding.tagline, description: "Brand tagline" }
      ]);
      showToast("Branding settings saved");
    } catch (error) {
      console.error("Save branding error:", error);
      showToast("Failed to save branding");
    }
  };

  return (
    <AdminLayout>
      {toast && (
        <div className="fixed bottom-4 right-4 bg-sage-800 text-white px-6 py-3 rounded-lg shadow-lg z-50">
          {toast}
        </div>
      )}

      <div className="mb-8">
        <h1 className="font-serif text-4xl text-sage-800 mb-2">Settings</h1>
        <p className="text-slate-600">Configure platform settings and deployment</p>
      </div>

      <div className="space-y-6">
        {/* Subscription Pricing */}
        <div className="bg-white rounded-xl border border-sage-200 p-8">
          <h2 className="font-serif text-2xl text-sage-800 mb-6">Subscription Pricing</h2>
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <Label className="mb-2 block">Monthly Price ($)</Label>
              <Input 
                type="number" 
                step="0.01"
                value={pricing.monthlyPrice}
                onChange={(e) => setPricing({...pricing, monthlyPrice: e.target.value})}
              />
            </div>
            <div>
              <Label className="mb-2 block">Trial Period (days)</Label>
              <Input 
                type="number"
                value={pricing.trialDays}
                onChange={(e) => setPricing({...pricing, trialDays: e.target.value})}
              />
            </div>
          </div>
          <Button onClick={handleSavePricing} className="bg-sage-800 hover:bg-sage-900 text-white">
            Save Pricing
          </Button>
        </div>

        {/* App Branding */}
        <div className="bg-white rounded-xl border border-sage-200 p-8">
          <h2 className="font-serif text-2xl text-sage-800 mb-6">App Branding</h2>
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <Label className="mb-2 block">App Name</Label>
              <Input 
                value={branding.appName}
                onChange={(e) => setBranding({...branding, appName: e.target.value})}
              />
            </div>
            <div>
              <Label className="mb-2 block">Tagline</Label>
              <Input 
                value={branding.tagline}
                onChange={(e) => setBranding({...branding, tagline: e.target.value})}
              />
            </div>
          </div>
          <Button onClick={handleSaveBranding} className="bg-sage-800 hover:bg-sage-900 text-white">
            Save Branding
          </Button>
        </div>

        {/* Deployment Information */}
        <div className="bg-white rounded-xl border border-sage-200 p-8">
          <h2 className="font-serif text-2xl text-sage-800 mb-6">Deployment</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-sage-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-sage-600 mt-0.5" />
              <div>
                <div className="font-semibold text-sage-900 mb-1">GitHub Repository</div>
                <p className="text-sm text-slate-600">Connected and syncing automatically</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-sage-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-sage-600 mt-0.5" />
              <div>
                <div className="font-semibold text-sage-900 mb-1">Vercel Deployment</div>
                <p className="text-sm text-slate-600">Auto-deploys on push to main branch</p>
              </div>
            </div>
            <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
              <p className="text-sm text-amber-800">
                <strong>Note:</strong> Environment variables must be configured in Vercel dashboard for production deployment.
              </p>
            </div>
          </div>
        </div>

        {/* Database Panel */}
        <div className="bg-white rounded-xl border border-sage-200 p-8">
          <h2 className="font-serif text-2xl text-sage-800 mb-6">Database</h2>
          <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <div>
              <div className="font-semibold text-green-900 mb-1">Supabase Connected</div>
              <p className="text-sm text-green-700">Database, Auth, and Storage are operational</p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}