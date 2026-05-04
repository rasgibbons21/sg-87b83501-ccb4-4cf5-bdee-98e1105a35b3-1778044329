import { ExternalLink, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const brokers = [
  {
    name: "Fidelity",
    emoji: "🏛️",
    tagline: "Best for beginners. Zero fees.",
    rating: 4.9,
    isTopPick: true,
    perks: [
      "No account minimums",
      "Free stock & ETF trades",
      "Excellent research tools",
      "24/7 customer support"
    ],
    fees: ["$0 stocks", "$0 ETFs", "$0.65 options"],
    commission: "$50 bonus",
    url: "https://www.fidelity.com"
  },
  {
    name: "Charles Schwab",
    emoji: "💼",
    tagline: "Premium features, zero compromises.",
    rating: 4.8,
    isTopPick: false,
    perks: [
      "No account fees",
      "Free trades on stocks & ETFs",
      "Bank integration",
      "Award-winning platform"
    ],
    fees: ["$0 stocks", "$0 ETFs", "$0.65 options"],
    commission: "$100 bonus",
    url: "https://www.schwab.com"
  },
  {
    name: "Vanguard",
    emoji: "🎯",
    tagline: "Low-cost ETF pioneer.",
    rating: 4.7,
    isTopPick: false,
    perks: [
      "Lowest expense ratios",
      "Index fund experts",
      "Commission-free ETFs",
      "Investor-owned company"
    ],
    fees: ["$0 stocks", "$0 ETFs", "$1 options"],
    commission: "$75 bonus",
    url: "https://investor.vanguard.com"
  },
  {
    name: "Robinhood",
    emoji: "📱",
    tagline: "Mobile-first simplicity.",
    rating: 4.5,
    isTopPick: false,
    perks: [
      "Beautiful mobile app",
      "Fractional shares",
      "Instant deposits",
      "Crypto trading included"
    ],
    fees: ["$0 everything", "Gold $5/mo"],
    commission: "Free stock",
    url: "https://robinhood.com"
  },
  {
    name: "M1 Finance",
    emoji: "🥧",
    tagline: "Auto-investing done right.",
    rating: 4.6,
    isTopPick: false,
    perks: [
      "Create custom pies",
      "Auto-rebalancing",
      "Fractional shares",
      "Smart money feature"
    ],
    fees: ["$0 basic", "Plus $3/mo"],
    commission: "$30 bonus",
    url: "https://www.m1.com"
  },
  {
    name: "Acorns",
    emoji: "🌰",
    tagline: "Invest your spare change.",
    rating: 4.4,
    isTopPick: false,
    perks: [
      "Round-up investing",
      "Automatic transfers",
      "Portfolio recommendations",
      "Educational content"
    ],
    fees: ["$3-$9/mo subscription"],
    commission: "$20 bonus",
    url: "https://www.acorns.com"
  }
];

export function Brokers() {
  return (
    <section id="brokers" className="py-20 bg-ivory">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-serif font-semibold text-sage-900 mb-4">
            Where to open your account
          </h2>
          <p className="text-lg text-sage-600 max-w-2xl mx-auto">
            These are the brokers we recommend to Bloom members. All vetted. All trusted. Most offer signup bonuses.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {brokers.map((broker) => (
            <div
              key={broker.name}
              className={`bg-white rounded-xl border p-6 flex flex-col ${
                broker.isTopPick
                  ? "border-sage-800 shadow-xl ring-2 ring-sage-800"
                  : "border-sage-200 hover:shadow-lg transition-shadow"
              }`}
            >
              {broker.isTopPick && (
                <div className="absolute -top-3 left-6 bg-sage-800 text-white px-3 py-1 rounded-full text-xs font-semibold">
                  Top Pick
                </div>
              )}
              
              <div className="flex items-start gap-4 mb-4">
                <div className="text-4xl">{broker.emoji}</div>
                <div className="flex-1">
                  <h3 className="text-2xl font-serif font-semibold text-sage-900">
                    {broker.name}
                  </h3>
                  <p className="text-sm text-sage-600">{broker.tagline}</p>
                </div>
              </div>

              <div className="flex items-center gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span
                    key={i}
                    className={i < Math.floor(broker.rating) ? "text-champagne-400" : "text-sage-200"}
                  >
                    ★
                  </span>
                ))}
                <span className="text-sm text-sage-600 ml-2">{broker.rating}</span>
              </div>

              <ul className="space-y-2 mb-4 flex-1">
                {broker.perks.map((perk, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-sage-700">
                    <CheckCircle className="w-4 h-4 text-signal-buy mt-0.5 flex-shrink-0" />
                    <span>{perk}</span>
                  </li>
                ))}
              </ul>

              <div className="flex flex-wrap gap-2 mb-4">
                {broker.fees.map((fee, idx) => (
                  <span
                    key={idx}
                    className="text-xs px-2 py-1 bg-sage-50 text-sage-700 rounded font-mono"
                  >
                    {fee}
                  </span>
                ))}
              </div>

              <div className="bg-sage-800 text-white rounded-lg p-3 mb-4 text-center">
                <div className="text-xs uppercase tracking-wide mb-1">Our commission</div>
                <div className="font-semibold">{broker.commission}</div>
              </div>

              <Button
                asChild
                className={
                  broker.isTopPick
                    ? "w-full bg-sage-800 hover:bg-sage-900 text-white"
                    : "w-full bg-white hover:bg-sage-50 text-sage-800 border border-sage-300"
                }
              >
                <a href={broker.url} target="_blank" rel="noopener noreferrer">
                  Open Account
                  <ExternalLink className="w-4 h-4 ml-2" />
                </a>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}