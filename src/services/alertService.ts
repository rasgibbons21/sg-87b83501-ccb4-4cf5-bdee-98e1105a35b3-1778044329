import { supabase } from "@/integrations/supabase/client";

export interface PriceAlert {
  id: string;
  user_id: string;
  ticker: string;
  name: string;
  alert_type: "above" | "below" | "target" | "stop";
  alert_price: number;
  current_price: number | null;
  is_active: boolean;
  triggered_at: string | null;
  notified: boolean;
  created_at: string;
}

export const alertService = {
  async createAlert(
    userId: string,
    ticker: string,
    name: string,
    alertType: "above" | "below" | "target" | "stop",
    alertPrice: number,
    currentPrice: number
  ) {
    const { data, error } = await supabase
      .from("price_alerts")
      .insert({
        user_id: userId,
        ticker,
        name,
        alert_type: alertType,
        alert_price: alertPrice,
        current_price: currentPrice,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getUserAlerts(userId: string) {
    const { data, error } = await supabase
      .from("price_alerts")
      .select("*")
      .eq("user_id", userId)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data || []) as PriceAlert[];
  },

  async getTriggeredAlerts(userId: string) {
    const { data, error } = await supabase
      .from("price_alerts")
      .select("*")
      .eq("user_id", userId)
      .not("triggered_at", "is", null)
      .order("triggered_at", { ascending: false })
      .limit(20);

    if (error) throw error;
    return (data || []) as PriceAlert[];
  },

  async deleteAlert(alertId: string) {
    const { error } = await supabase
      .from("price_alerts")
      .delete()
      .eq("id", alertId);

    if (error) throw error;
  },

  async triggerAlert(alertId: string, currentPrice: number) {
    const { error } = await supabase
      .from("price_alerts")
      .update({
        is_active: false,
        triggered_at: new Date().toISOString(),
        current_price: currentPrice,
        notified: true,
        updated_at: new Date().toISOString()
      })
      .eq("id", alertId);

    if (error) throw error;
  },

  checkAlerts(alerts: PriceAlert[], currentPrices: Record<string, number>): PriceAlert[] {
    const triggered: PriceAlert[] = [];

    alerts.forEach(alert => {
      const currentPrice = currentPrices[alert.ticker];
      if (!currentPrice || !alert.is_active) return;

      let shouldTrigger = false;

      switch (alert.alert_type) {
        case "above":
          shouldTrigger = currentPrice >= alert.alert_price;
          break;
        case "below":
          shouldTrigger = currentPrice <= alert.alert_price;
          break;
        case "target":
          shouldTrigger = currentPrice >= alert.alert_price;
          break;
        case "stop":
          shouldTrigger = currentPrice <= alert.alert_price;
          break;
      }

      if (shouldTrigger) {
        triggered.push({ ...alert, current_price: currentPrice });
      }
    });

    return triggered;
  }
};
</alert_price: alertPrice,
        current_price: currentPrice,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getUserAlerts(userId: string) {
    const { data, error } = await supabase
      .from("price_alerts")
      .select("*")
      .eq("user_id", userId)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data || []) as PriceAlert[];
  },

  async getTriggeredAlerts(userId: string) {
    const { data, error } = await supabase
      .from("price_alerts")
      .select("*")
      .eq("user_id", userId)
      .not("triggered_at", "is", null)
      .order("triggered_at", { ascending: false })
      .limit(20);

    if (error) throw error;
    return (data || []) as PriceAlert[];
  },

  async deleteAlert(alertId: string) {
    const { error } = await supabase
      .from("price_alerts")
      .delete()
      .eq("id", alertId);

    if (error) throw error;
  },

  async triggerAlert(alertId: string, currentPrice: number) {
    const { error } = await supabase
      .from("price_alerts")
      .update({
        is_active: false,
        triggered_at: new Date().toISOString(),
        current_price: currentPrice,
        notified: true,
        updated_at: new Date().toISOString()
      })
      .eq("id", alertId);

    if (error) throw error;
  },

  checkAlerts(alerts: PriceAlert[], currentPrices: Record<string, number>): PriceAlert[] {
    const triggered: PriceAlert[] = [];

    alerts.forEach(alert => {
      const currentPrice = currentPrices[alert.ticker];
      if (!currentPrice || !alert.is_active) return;

      let shouldTrigger = false;

      switch (alert.alert_type) {
        case "above":
          shouldTrigger = currentPrice >= alert.alert_price;
          break;
        case "below":
          shouldTrigger = currentPrice <= alert.alert_price;
          break;
        case "target":
          shouldTrigger = currentPrice >= alert.alert_price;
          break;
        case "stop":
          shouldTrigger = currentPrice <= alert.alert_price;
          break;
      }

      if (shouldTrigger) {
        triggered.push({ ...alert, current_price: currentPrice });
      }
    });

    return triggered;
  }
};