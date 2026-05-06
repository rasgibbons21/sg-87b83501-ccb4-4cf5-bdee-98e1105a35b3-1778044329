import { useState, useEffect } from "react";
import { AppLayout } from "@/components/app/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { alertService, type PriceAlert } from "@/services/alertService";
import { Bell, BellOff, TrendingUp, TrendingDown, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AlertsPage() {
  const [userId, setUserId] = useState<string>("");
  const [activeAlerts, setActiveAlerts] = useState<PriceAlert[]>([]);
  const [triggeredAlerts, setTriggeredAlerts] = useState<PriceAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    const loadAlerts = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUserId(session.user.id);
        const [active, triggered] = await Promise.all([
          alertService.getUserAlerts(session.user.id),
          alertService.getTriggeredAlerts(session.user.id)
        ]);
        setActiveAlerts(active);
        setTriggeredAlerts(triggered);
      }
      setLoading(false);
    };

    loadAlerts();
  }, []);

  const handleDeleteAlert = async (alertId: string) => {
    try {
      await alertService.deleteAlert(alertId);
      setActiveAlerts(prev => prev.filter(a => a.id !== alertId));
      showToast("Alert deleted");
    } catch (error) {
      console.error("Delete alert error:", error);
      showToast("Failed to delete alert");
    }
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const getAlertTypeLabel = (type: string) => {
    switch (type) {
      case "above": return "Price Above";
      case "below": return "Price Below";
      case "target": return "Target Hit";
      case "stop": return "Stop Loss";
      default: return type;
    }
  };

  const getAlertTypeColor = (type: string) => {
    switch (type) {
      case "above":
      case "target":
        return "text-[#2D7A4A] bg-[#E8F5EE]";
      case "below":
      case "stop":
        return "text-[#C04040] bg-[#FDEAEA]";
      default:
        return "text-slate-600 bg-slate-100";
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-slate-200 rounded w-1/3"></div>
            <div className="h-24 bg-slate-200 rounded"></div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      {toastMessage && (
        <div className="fixed bottom-4 right-4 bg-sage-800 text-white px-6 py-3 rounded-lg shadow-lg z-50">
          {toastMessage}
        </div>
      )}

      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="font-serif text-3xl text-sage-800 mb-2">Price Alerts</h1>
          <p className="text-slate-600">Get notified when your picks hit target or stop prices.</p>
        </div>

        {/* Active Alerts */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Bell className="w-5 h-5 text-sage-600" />
            <h2 className="font-serif text-2xl text-sage-800">Active Alerts</h2>
            <span className="px-2 py-0.5 bg-sage-100 text-sage-700 text-sm font-medium rounded">
              {activeAlerts.length}
            </span>
          </div>

          {activeAlerts.length === 0 ? (
            <div className="bg-white rounded-xl border border-sage-200 p-12 text-center">
              <BellOff className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600 mb-4">No active price alerts</p>
              <p className="text-sm text-slate-500">
                Go to the Picks page to set alerts on your favorite investments
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {activeAlerts.map((alert) => (
                <div key={alert.id} className="bg-white rounded-xl border border-sage-200 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xl font-bold text-sage-800">{alert.ticker}</span>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${getAlertTypeColor(alert.alert_type)}`}>
                          {getAlertTypeLabel(alert.alert_type)}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600">{alert.name}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteAlert(alert.id)}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete alert"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Current Price</p>
                      <p className="font-mono text-lg font-semibold text-slate-700">
                        ${alert.current_price?.toFixed(2) || "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Alert Price</p>
                      <p className="font-mono text-lg font-semibold text-sage-800">
                        ${alert.alert_price.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 mt-4">
                    Created {new Date(alert.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Triggered Alerts */}
        {triggeredAlerts.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-champagne-500" />
              <h2 className="font-serif text-2xl text-sage-800">Recently Triggered</h2>
            </div>

            <div className="space-y-3">
              {triggeredAlerts.map((alert) => (
                <div key={alert.id} className="bg-sage-50 rounded-xl border border-sage-200 p-4 flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-mono text-lg font-bold text-sage-800">{alert.ticker}</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${getAlertTypeColor(alert.alert_type)}`}>
                        {getAlertTypeLabel(alert.alert_type)}
                      </span>
                      {alert.alert_type === "above" || alert.alert_type === "target" ? (
                        <TrendingUp className="w-4 h-4 text-[#2D7A4A]" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-[#C04040]" />
                      )}
                    </div>
                    <p className="text-sm text-slate-600">
                      Triggered at <span className="font-mono font-semibold">${alert.current_price?.toFixed(2)}</span> on{" "}
                      {alert.triggered_at && new Date(alert.triggered_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}