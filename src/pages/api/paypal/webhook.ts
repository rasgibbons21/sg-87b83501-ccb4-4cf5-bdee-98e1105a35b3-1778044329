import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/integrations/supabase/client";

const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
const PAYPAL_SECRET_KEY = process.env.PAYPAL_SECRET_KEY;
const PAYPAL_WEBHOOK_ID = process.env.PAYPAL_WEBHOOK_ID;

async function verifyWebhookSignature(req: NextApiRequest): Promise<boolean> {
  try {
    const authResponse = await fetch("https://api-m.paypal.com/v1/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET_KEY}`).toString("base64")}`
      },
      body: "grant_type=client_credentials"
    });

    const { access_token } = await authResponse.json();

    const verifyResponse = await fetch("https://api-m.paypal.com/v1/notifications/verify-webhook-signature", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`
      },
      body: JSON.stringify({
        transmission_id: req.headers["paypal-transmission-id"],
        transmission_time: req.headers["paypal-transmission-time"],
        cert_url: req.headers["paypal-cert-url"],
        auth_algo: req.headers["paypal-auth-algo"],
        transmission_sig: req.headers["paypal-transmission-sig"],
        webhook_id: PAYPAL_WEBHOOK_ID,
        webhook_event: req.body
      })
    });

    const { verification_status } = await verifyResponse.json();
    return verification_status === "SUCCESS";
  } catch (error) {
    console.error("Webhook verification error:", error);
    return false;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const isValid = await verifyWebhookSignature(req);

  if (!isValid) {
    return res.status(401).json({ error: "Invalid webhook signature" });
  }

  const { event_type, resource } = req.body;

  try {
    if (event_type === "BILLING.SUBSCRIPTION.ACTIVATED") {
      const subscriberEmail = resource.subscriber?.email_address;
      const paypalSubId = resource.id;

      if (subscriberEmail && paypalSubId) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("email", subscriberEmail)
          .single();

        if (profile) {
          await supabase
            .from("profiles")
            .update({ plan: "member", paypal_sub_id: paypalSubId })
            .eq("id", profile.id);

          await supabase
            .from("subscriptions")
            .insert({
              user_id: profile.id,
              paypal_sub_id: paypalSubId,
              plan_id: resource.plan_id,
              status: "active",
              amount: 9.99,
              billing_cycle: "monthly",
              started_at: new Date().toISOString(),
              next_billing: resource.billing_info?.next_billing_time
            });
        }
      }
    }

    if (event_type === "BILLING.SUBSCRIPTION.CANCELLED") {
      const paypalSubId = resource.id;

      if (paypalSubId) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("paypal_sub_id", paypalSubId)
          .single();

        if (profile) {
          await supabase
            .from("profiles")
            .update({ plan: "cancelled" })
            .eq("id", profile.id);

          await supabase
            .from("subscriptions")
            .update({ status: "cancelled", cancelled_at: new Date().toISOString() })
            .eq("paypal_sub_id", paypalSubId);
        }
      }
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    res.status(500).json({ error: "Failed to process webhook" });
  }
}