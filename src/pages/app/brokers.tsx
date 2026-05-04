import { AppLayout } from "@/components/app/AppLayout";
import { Button } from "@/components/ui/button";
import { ExternalLink, CheckCircle, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const brokers = [
  {
    name: "Fidelity",
    icon: "🏦",
    tagline: "Best overall for new investors",
    rating: 5,
    perks: ["$0 commissions", "Excellent research tools", "Fractional shares", "24/7 customer support"],
    fees: ["$0 stock trades", "$0 account minimum"],
    commission: "$15 per new account",
    url: "https://www.fidelity.com",
    isTopPick: true
  },
  {
    name: "Charles Schwab",
    icon: "💼",
    tagline: "Great for hands-on investors",
    rating: 5,
    perks: ["$0 commissions", "Powerful trading platform", "Free financial planning", "Extensive branch network"],
    fees: ["$0 stock trades", "$0 account minimum"],
    commission: "$12 per new account",
    url: "https://www.schwab.com"
  },
  {
    name: "Vanguard",
    icon: "📊",
    tagline: "Best for low-cost ETFs",
    rating: 4,
    perks: ["Industry-low expense ratios", "Strong ETF selection", "Commission-free Vanguard ETFs", "Retirement focus"],
    fees: ["$0 Vanguard ETF trades", "$0 account minimum"],
    commission: "$10 per new account",
    url: "https://investor.vanguard.com"
  },
  {
    name: "Robinhood",
    icon: "📱",
    tagline: "Simple mobile-first experience",
    rating: 4,
    perks: ["Ultra simple interface", "Fractional shares", "Extended hours trading", "Instant deposits"],
    fees: ["$0 commissions", "$0 account minimum"],
    commission: "$8 per new account",
    url: "https://robinhood.com"
  },
  {
    name: "M1 Finance",
    icon: "🎯",
    tagline: "Automated portfolio management",
    rating: 4,
    perks: ["Auto-rebalancing", "Fractional shares", "Custom portfolios", "Smart money movement"],
    fees: ["$0 management fee", "$100 account minimum"],
    commission: "$10 per new account",
    url: "https://www.m1finance.com"
  },
  {
    name: "Acorns",
    icon: "🌰",
    tagline: "Best for automatic investing",
    rating: 4,
    perks: ["Round-up investing", "Auto-invest", "Educational content", "Retirement accounts"],
    fees: ["$3-5/month subscription", "$0 account minimum"],
    commission: "$5 per new subscriber",
    url: "https://www.acorns.com"
  }
];

export default function Brokers() {
  const handleAffiliateClick = async (brokerName: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    await supabase.from("affiliate_clicks").insert({
      user_id: session.user.id,
      broker_name: brokerName,
      click_type: "broker",
      clicked_at: new Date().toISOString()
    });
  };

  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-serif text-sage-900 mb-2">Broker Comparison</h1>
          <p className="text-sage-600">Choose the right brokerage for your investing journey.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {brokers.map((broker) => (
            <div 
              key={broker.name}
              className={`bg-white rounded-xl p-6 space-y-4 transition-all ${
                broker.isTopPick 
                  ? "border-2 border-sage-600 shadow-lg" 
                  : "border border-sage-200 hover:border-sage-300"
              }`}
            >
              {broker.isTopPick && (
                <div className="bg-sage-800 text-white px-3 py-1 rounded-full text-xs font-medium inline-block">
                  ⭐ Top Pick
                </div>
              )}

              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-4xl">{broker.icon}</div>
                  <div>
                    <h3 className="text-2xl font-serif text-sage-900">{broker.name}</h3>
                    <p className="text-sm text-sage-600">{broker.tagline}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {Array.from({ length: broker.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-champagne-600 text-champagne-600" />
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                {broker.perks.map((perk, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-sage-700">{perk}</span>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                {broker.fees.map((fee, i) => (
                  <div key={i} className="px-3 py-1 bg-sage-50 text-sage-700 rounded-full text-xs">
                    {fee}
                  </div>
                ))}
              </div>

              <div className="bg-sage-50 rounded-lg p-3 border border-sage-100">
                <div className="text-xs text-sage-600 mb-1">Affiliate Commission</div>
                <div className="text-sm font-medium text-sage-900">{broker.commission}</div>
              </div>

              <Button 
                className={`w-full ${
                  broker.isTopPick 
                    ? "bg-sage-800 hover:bg-sage-900 text-white" 
                    : "bg-white hover:bg-sage-50 text-sage-800 border border-sage-300"
                }`}
                onClick={() => {
                  handleAffiliateClick(broker.name);
                  window.open(broker.url, "_blank");
                }}
              >
                Open Account <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            </div>
          ))}
        </div>

        <div className="bg-champagne-50 border border-champagne-200 rounded-xl p-6">
          <h3 className="font-medium text-sage-900 mb-2">💡 Choosing Your Broker</h3>
          <p className="text-sm text-sage-700 leading-relaxed">
            All of these brokers offer $0 commission stock and ETF trades. Fidelity is our top pick for beginners due to excellent customer service and research tools. 
            If you want simplicity, try Robinhood or Acorns. For low-cost ETFs, Vanguard is hard to beat. You can open accounts with multiple brokers to compare.
          </p>
        </div>
      </div>
    </AppLayout>
  );
}