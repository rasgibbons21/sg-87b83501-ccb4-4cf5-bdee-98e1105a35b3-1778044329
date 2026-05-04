import { Button } from "@/components/ui/button";
import { Sparkles, Minus } from "lucide-react";

export function Pricing() {
  const features = {
    trial: [
      "14-day free trial",
      "Full platform access",
      "$50/month calculator",
      "9 curated picks",
      "Budget planner",
      "College fund projections",
      "PDF guides (separate purchase)",
      "No credit card required"
    ],
    member: [
      "All trial features",
      "Unlimited access forever",
      "Weekly market updates",
      "AI investment analysis",
      "Watchlist tracking",
      "Trade journal",
      "Priority support",
      "20% off all PDF guides"
    ]
  };

  return (
    <section id="pricing" className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-serif font-semibold text-sage-900 mb-4">
            Start learning today
          </h2>
          <p className="text-lg text-sage-600 max-w-2xl mx-auto">
            Try Bloom free for 14 days. No credit card. No gotchas. Cancel anytime.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="bg-white rounded-xl border-2 border-sage-200 p-8 flex flex-col">
            <h3 className="text-2xl font-serif font-semibold text-sage-900 mb-2">
              Free Trial
            </h3>
            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-5xl font-serif font-semibold text-sage-900">$0</span>
              <span className="text-sage-600">for 14 days</span>
            </div>

            <ul className="space-y-3 mb-8 flex-1">
              {features.trial.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-champagne-400 mt-0.5 flex-shrink-0" />
                  <span className="text-sage-700">{feature}</span>
                </li>
              ))}
            </ul>

            <Button className="w-full bg-white hover:bg-sage-50 text-sage-800 border-2 border-sage-800">
              Start Free Trial
            </Button>
          </div>

          <div className="bg-gradient-to-br from-sage-50 to-champagne-100 rounded-xl border-2 border-sage-800 p-8 flex flex-col relative shadow-xl">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-terracotta-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
              Most Popular
            </div>
            
            <h3 className="text-2xl font-serif font-semibold text-sage-900 mb-2">
              Bloom Member
            </h3>
            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-5xl font-serif font-semibold text-sage-900">$9.99</span>
              <span className="text-sage-600">per month</span>
            </div>

            <ul className="space-y-3 mb-8 flex-1">
              {features.member.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-sage-800 mt-0.5 flex-shrink-0" />
                  <span className="text-sage-900 font-medium">{feature}</span>
                </li>
              ))}
            </ul>

            <Button className="w-full bg-sage-800 hover:bg-sage-900 text-white text-lg h-12">
              Get Started Now
            </Button>
            
            <p className="text-xs text-sage-600 text-center mt-4">
              Billed monthly. Cancel anytime.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}